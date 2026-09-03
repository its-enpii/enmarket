<?php

namespace App\Services\Sponsor;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class MetadataFetcher
{
    /**
     * Fetch metadata from domain/url.
     *
     * Returns array with shape:
     * [
     *     'name' => string,
     *     'url' => string,
     *     'logo_url' => ?string,
     *     'fetched_description' => ?string,
     *     'fetched_at' => ?\Carbon\Carbon,
     * ]
     */
    public function fetch(string $domainOrUrl): array
    {
        $raw = trim($domainOrUrl);
        if ($raw === '') {
            return $this->fallback('', '');
        }

        // Normalize target URL
        $targetUrl = $this->normalizeUrl($raw);
        $domain = $this->extractDomain($targetUrl);

        if (! $this->isSafeUrl($targetUrl)) {
            Log::warning("MetadataFetcher: SSRF guard blocked URL: {$targetUrl}");
            return $this->fallback($domain, $targetUrl);
        }

        try {
            $response = Http::timeout(10)
                ->withUserAgent('Mozilla/5.0 (compatible; EnMarketBot/1.0; +https://enmarket.test)')
                ->get($targetUrl);

            if (! $response->successful()) {
                Log::info("MetadataFetcher: Request to {$targetUrl} failed with status {$response->status()}");
                return $this->fallback($domain, $targetUrl);
            }

            $html = $response->body();
            if (empty(trim($html))) {
                return $this->fallback($domain, $targetUrl);
            }

            return $this->parseHtml($html, $targetUrl, $domain);
        } catch (Throwable $e) {
            Log::info("MetadataFetcher: Failed fetching {$targetUrl}: " . $e->getMessage());
            return $this->fallback($domain, $targetUrl);
        }
    }

    private function normalizeUrl(string $input): string
    {
        if (preg_match('#^https?://#i', $input)) {
            return $input;
        }

        return 'https://' . ltrim($input, '/');
    }

    private function extractDomain(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST);
        if ($host) {
            return $host;
        }

        $clean = preg_replace('#^https?://#i', '', $url);
        $parts = explode('/', $clean);
        return $parts[0] ?? $clean;
    }

    /**
     * SSRF guard: Check scheme, host, and resolved IP against private & reserved ranges.
     */
    public function isSafeUrl(string $url): bool
    {
        $parsed = parse_url($url);
        if (! $parsed || empty($parsed['scheme']) || empty($parsed['host'])) {
            return false;
        }

        $scheme = strtolower($parsed['scheme']);
        if (! in_array($scheme, ['http', 'https'], true)) {
            return false;
        }

        $host = strtolower($parsed['host']);

        // Check dangerous hostnames
        if (
            $host === 'localhost' ||
            $host === '127.0.0.1' ||
            $host === '::1' ||
            $host === '0.0.0.0' ||
            str_ends_with($host, '.localhost') ||
            str_ends_with($host, '.local') ||
            str_ends_with($host, '.internal') ||
            str_ends_with($host, '.lan') ||
            str_ends_with($host, '.home') ||
            str_ends_with($host, '.test') ||
            str_ends_with($host, '.example') ||
            str_ends_with($host, '.invalid')
        ) {
            return false;
        }

        // Direct IP checks
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return (bool) filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        }

        // String checks for common private CIDRs if hostname looks like IP
        if (
            preg_match('/^127\./', $host) ||
            preg_match('/^10\./', $host) ||
            preg_match('/^192\.168\./', $host) ||
            preg_match('/^172\.(1[6-9]|2[0-9]|3[0-1])\./', $host) ||
            preg_match('/^169\.254\./', $host)
        ) {
            return false;
        }

        // Check resolved IP if DNS resolves (with safety fallback)
        try {
            $ip = gethostbyname($host);
            if ($ip !== $host && filter_var($ip, FILTER_VALIDATE_IP)) {
                if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return false;
                }
            }
        } catch (Throwable) {
            // DNS resolution issue
        }

        return true;
    }

    private function parseHtml(string $html, string $baseUrl, string $domain): array
    {
        $dom = new DOMDocument();
        // Suppress warnings from invalid HTML5 entities
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($dom);

        // 1. Title / Name
        $ogTitle = $this->queryMeta($xpath, 'og:title');
        $htmlTitle = $xpath->query('//title')->item(0)?->textContent;
        $name = trim($ogTitle ?: $htmlTitle ?: $domain);
        if ($name === '') {
            $name = $domain;
        }

        // 2. Description
        $ogDesc = $this->queryMeta($xpath, 'og:description');
        $metaDesc = $this->queryMeta($xpath, 'description');
        $description = trim($ogDesc ?: $metaDesc ?: '') ?: null;

        // 3. Logo / Favicon
        $ogImage = $this->queryMeta($xpath, 'og:image');
        $appleIcon = $this->queryLinkRel($xpath, 'apple-touch-icon');
        $icon = $this->queryLinkRel($xpath, 'icon');

        $selectedImage = $ogImage ?: $appleIcon ?: $icon;
        $logoUrl = null;

        if ($selectedImage) {
            $resolved = $this->resolveUrl($selectedImage, $baseUrl);
            if ($resolved && $this->isValidImageScheme($resolved)) {
                $logoUrl = $resolved;
            }
        }

        // Fallback to /favicon.ico if no logo was found or resolved
        if (! $logoUrl) {
            $parsed = parse_url($baseUrl);
            $scheme = $parsed['scheme'] ?? 'https';
            $host = $parsed['host'] ?? $domain;
            $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
            $logoUrl = "{$scheme}://{$host}{$port}/favicon.ico";
        }

        return [
            'name' => $name,
            'url' => $baseUrl,
            'logo_url' => $logoUrl,
            'fetched_description' => $description,
            'fetched_at' => now(),
        ];
    }

    private function queryMeta(DOMXPath $xpath, string $nameOrProp): ?string
    {
        $queries = [
            "//meta[@property='{$nameOrProp}']/@content",
            "//meta[@name='{$nameOrProp}']/@content",
            "//meta[translate(@property, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='{$nameOrProp}']/@content",
            "//meta[translate(@name, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='{$nameOrProp}']/@content",
        ];

        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes && $nodes->length > 0) {
                $val = trim($nodes->item(0)->nodeValue ?? '');
                if ($val !== '') {
                    return $val;
                }
            }
        }

        return null;
    }

    private function queryLinkRel(DOMXPath $xpath, string $relKeyword): ?string
    {
        $query = "//link[contains(translate(@rel, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{$relKeyword}')]/@href";
        $nodes = $xpath->query($query);
        if ($nodes && $nodes->length > 0) {
            $val = trim($nodes->item(0)->nodeValue ?? '');
            if ($val !== '') {
                return $val;
            }
        }

        return null;
    }

    public function resolveUrl(string $relativeOrAbsolute, string $baseUrl): ?string
    {
        $rel = trim($relativeOrAbsolute);
        if ($rel === '') {
            return null;
        }

        // Already absolute with scheme
        if (preg_match('#^https?://#i', $rel)) {
            return $rel;
        }

        // Protocol-relative //example.com/logo.png
        if (str_starts_with($rel, '//')) {
            $baseScheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
            return $baseScheme . ':' . $rel;
        }

        $baseParts = parse_url($baseUrl);
        $scheme = $baseParts['scheme'] ?? 'https';
        $host = $baseParts['host'] ?? '';
        $port = isset($baseParts['port']) ? ':' . $baseParts['port'] : '';
        $origin = "{$scheme}://{$host}{$port}";

        // Root-relative /images/logo.png
        if (str_starts_with($rel, '/')) {
            return $origin . $rel;
        }

        // Relative path foo/bar.png against base path
        $path = $baseParts['path'] ?? '/';
        $dir = dirname($path);
        if ($dir === '.' || $dir === '\\') {
            $dir = '';
        }

        return $origin . rtrim($dir, '/') . '/' . ltrim($rel, '/');
    }

    private function isValidImageScheme(string $url): bool
    {
        $scheme = parse_url($url, PHP_URL_SCHEME);
        return in_array(strtolower($scheme ?: ''), ['http', 'https'], true);
    }

    private function fallback(string $domain, string $targetUrl): array
    {
        $name = $domain !== '' ? $domain : 'sponsor';
        $url = $targetUrl !== '' ? $targetUrl : "https://{$name}";

        return [
            'name' => $name,
            'url' => $url,
            'logo_url' => null,
            'fetched_description' => null,
            'fetched_at' => null,
        ];
    }
}
