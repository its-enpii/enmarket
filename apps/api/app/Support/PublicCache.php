<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * PublicCache — helper kunci cache + invalidation untuk endpoint publik
 * read-only (Lane D).
 *
 * Driver `database` TIDAK mendukung Cache::tags(), jadi invalidation memakai
 * daftar kunci eksplisit lewat forget() / forgetMany().
 */
class PublicCache
{
    /** TTL (detik) untuk semua entri endpoint publik panas. */
    public const TTL = 300;

    public const SITE_CONFIG = 'public:site-config';

    public const CATEGORIES = 'public:categories';

    public const CATEGORIES_SLUGS = 'public:categories:slugs';

    public const TAGS_POST = 'public:tags:post';

    public const TAGS_PRODUCT = 'public:tags:product';

    public const PRODUCTS_FEATURED = 'public:products:featured';

    public const PRODUCTS_LATEST = 'public:products:latest';

    public const PRODUCTS_HOMEPAGE = 'public:products:homepage';

    public const PRODUCTS_HOMEPAGE_PREFIX = 'public:products:homepage:';

    public const PRODUCTS_SLUGS = 'public:products:slugs';

    public const POSTS_LATEST_PREFIX = 'public:posts:latest:';

    public const POSTS_SLUGS = 'public:posts:slugs';

    /**
     * Semua kunci turunan produk (termasuk key ber-parameter).
     *
     * @return array<int, string>
     */
    public static function productKeys(): array
    {
        return [
            self::PRODUCTS_FEATURED,
            self::PRODUCTS_LATEST,
            self::PRODUCTS_HOMEPAGE,
            self::PRODUCTS_SLUGS,
            self::CATEGORIES,
            self::CATEGORIES_SLUGS,
            self::TAGS_PRODUCT,
        ];
    }

    /**
     * Semua kunci turunan post.
     *
     * @return array<int, string>
     */
    public static function postKeys(): array
    {
        return [
            self::POSTS_SLUGS,
            self::TAGS_POST,
        ];
    }

    /**
     * Forget banyak kunci sekaligus (dedupe + filter kosong).
     *
     * @param  array<int, string|null>  $keys
     */
    public static function forgetMany(array $keys): void
    {
        foreach (array_unique(array_filter($keys)) as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Kunci homepage — memuat `per_page` ternormalisasi (hanya if exists).
     */
    public static function homepageKey(int $limit): string
    {
        return self::PRODUCTS_HOMEPAGE_PREFIX.$limit;
    }

    /**
     * Kunci posts latest — memuat `limit` ternormalisasi + menit berjalan
     * (scope `published` bergantung pada `now()`, jadi entri kedaluwarsa
     * paling lambat 1 menit meski belum di-invalidate).
     */
    public static function postsLatestKey(int $limit): string
    {
        return self::POSTS_LATEST_PREFIX.$limit.':'.Carbon::now()->utc()->format('YmdHi');
    }
}
