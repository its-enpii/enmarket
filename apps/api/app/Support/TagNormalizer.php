<?php

namespace App\Support;

/**
 * Normalizer untuk multi-tags (posts + products).
 *
 * Aturan: trim, lowercase (unicode-aware), rapikan spasi ganda, buang string
 * kosong, dedupe case-insensitive, potong maks 10 item. Dipakai di jalur tulis
 * admin (setelah validasi) dan filter publik (?tag=) agar lookup konsisten.
 */
class TagNormalizer
{
    public const MAX_TAGS = 10;

    /**
     * Normalisasi array tag → list unik, lowercase, rapi.
     *
     * @param  array<int, mixed>  $tags
     * @return array<int, string>
     */
    public static function normalize(array $tags): array
    {
        $out = [];
        $seen = [];

        foreach ($tags as $tag) {
            if (! is_string($tag)) {
                continue;
            }

            $normalized = self::normalizeOne($tag);
            if ($normalized === '') {
                continue;
            }

            $key = mb_strtolower($normalized);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $out[] = $normalized;

            if (count($out) >= self::MAX_TAGS) {
                break;
            }
        }

        return array_values($out);
    }

    /**
     * Normalisasi satu tag: trim + lowercase + rapikan spasi.
     */
    public static function normalizeOne(string $tag): string
    {
        $tag = trim($tag);
        $tag = preg_replace('/\s+/u', ' ', $tag) ?? $tag;
        $tag = mb_strtolower($tag);

        return $tag;
    }
}
