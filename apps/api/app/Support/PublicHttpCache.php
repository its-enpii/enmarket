<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PublicHttpCache — header cache HTTP + ETag untuk endpoint publik yang
 * payload-nya sudah di-cache di server (PublicCache).
 *
 * HANYA dipakai endpoint publik read-only. Endpoint sesi/tulis ditolak
 * (defense-in-depth) karena selalu memakai larangan header no-cache.
 */
class PublicHttpCache
{
    public const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=60';

    private const FORBIDDEN_PREFIXES = [
        'api/cart',
        'api/wishlist',
        'api/orders',
        'api/checkout',
    ];

    /**
     * Bangun JSON response dengan Cache-Control publik + ETag.
     * If-None-Match yang cocok → 304 tanpa body.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function json(Request $request, array $payload): JsonResponse
    {
        if (self::isForbiddenPath($request)) {
            return response()->json($payload);
        }

        $etag = '"'.sha1((string) json_encode($payload)).'"';

        if (self::etagMatches((string) $request->header('If-None-Match', ''), $etag)) {
            return response()->json(null, 304)
                ->header('Cache-Control', self::CACHE_CONTROL)
                ->header('ETag', $etag);
        }

        return response()->json($payload)
            ->header('Cache-Control', self::CACHE_CONTROL)
            ->header('ETag', $etag);
    }

    public static function isForbiddenPath(Request $request): bool
    {
        $path = ltrim($request->path(), '/');

        foreach (self::FORBIDDEN_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return true;
            }
        }

        return false;
    }

    private static function etagMatches(string $ifNoneMatch, string $etag): bool
    {
        if (trim($ifNoneMatch) === '') {
            return false;
        }

        foreach (explode(',', $ifNoneMatch) as $candidate) {
            $candidate = trim($candidate);
            if ($candidate === '*' || $candidate === $etag || $candidate === 'W/'.$etag) {
                return true;
            }
        }

        return false;
    }
}
