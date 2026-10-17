<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Panggil Next.js webhook untuk on-demand revalidation saat admin
 * memodifikasi produk/kategori. Kegagalan tidak menggagalkan mutasi
 * admin (cuma di-log warning) — supaya error transient di Next.js
 * tidak memblokir CRUD.
 *
 * Semua rute app Next berbentuk `/{locale}/...` (next-intl,
 * `localePrefix: 'always'` — lihat apps/web/i18n/routing.ts), jadi setiap
 * path WAJIB dikirim dengan prefiks locale. `revalidatePath('/katalog')`
 * tidak cocok dengan rute mana pun sehingga no-op.
 */
class NextRevalidator
{
    /**
     * Fallback daftar locale bila config `services.next.locales` tidak
     * tersedia (mis. instansiasi manual di test / konfigurasi lama).
     *
     * TODO: cocokkan dengan listLocale next-intl (apps/web/i18n/routing.ts
     * `routing.locales`); sumber utama adalah env NEXT_LOCALES.
     */
    private const DEFAULT_LOCALES = ['id', 'en'];

    /**
     * @var list<string>
     */
    private readonly array $locales;

    /**
     * @param  list<string>|null  $locales  Locale ber-prefiks URL Next; null = baca config.
     */
    public function __construct(
        private readonly string $webhookSecret,
        private readonly string $nextBaseUrl,
        ?array $locales = null,
    ) {
        $locales ??= (array) config('services.next.locales', []);
        $locales = array_values(array_filter(
            array_map(fn ($locale) => trim((string) $locale, '/ '), $locales),
            fn (string $locale) => $locale !== '',
        ));

        $this->locales = $locales !== [] ? $locales : self::DEFAULT_LOCALES;
    }

    /**
     * Revalidate halaman yang terpengaruh perubahan satu produk:
     *   - /                   (home — featured & latest grid)
     *   - /katalog            (legacy catalog list)
     *   - /develop            (new curated catalog list)
     *   - /develop/{slug}     (case study detail page)
     */
    public function revalidateProduct(string $slug): void
    {
        $this->call([
            '/',
            '/katalog',
            '/develop',
            "/develop/{$slug}",
        ]);
    }

    /**
     * Revalidate halaman yang terpengaruh perubahan satu kategori.
     */
    public function revalidateCategory(string $slug): void
    {
        $this->call([
            '/',
            '/katalog',
            "/c/{$slug}",
        ]);
    }

    /**
     * Revalidate semua halaman utama (fallback untuk perubahan massal).
     */
    public function revalidateHome(): void
    {
        $this->call(['/', '/katalog']);
    }

    /**
     * Revalidate halaman yang terpengaruh perubahan satu blog post:
     *   - /           (home — Discover section fetch post terbaru)
     *   - /display    (list post)
     *   - /display/{slug} (detail post tsb)
     */
    public function revalidatePost(string $slug): void
    {
        $this->call([
            '/',
            '/display',
            "/display/{$slug}",
        ]);
    }

    /**
     * Kirim POST ke Next.js /api/revalidate dengan secret header.
     *
     * Satu POST berisi seluruh path untuk semua locale (path × locale),
     * bukan satu POST per locale — jumlah request selalu 1.
     */
    private function call(array $paths): void
    {
        if ($this->nextBaseUrl === '') {
            Log::warning('NextRevalidator: APP_NEXT_INTERNAL_URL kosong, skip revalidation.');

            return;
        }

        try {
            $response = Http::withHeaders([
                'X-Webhook-Secret' => $this->webhookSecret,
                'Accept' => 'application/json',
            ])
                ->timeout(3)
                ->post(rtrim($this->nextBaseUrl, '/').'/api/revalidate', [
                    'paths' => $this->localizedPaths($paths),
                ]);

            if (! $response->successful()) {
                Log::warning("NextRevalidator: webhook {$this->nextBaseUrl}/api/revalidate returned HTTP {$response->status()}");
            }
        } catch (Throwable $e) {
            Log::warning('NextRevalidator failed: '.$e->getMessage());
        }
    }

    /**
     * Ubah path relatif menjadi path rute Next yang sebenarnya:
     * '/'        → '/id', '/en'
     * '/katalog' → '/id/katalog', '/en/katalog'
     *
     * @param  array<int, string>  $paths
     * @return list<string>
     */
    private function localizedPaths(array $paths): array
    {
        $localized = [];

        foreach ($paths as $path) {
            $suffix = '/'.ltrim((string) $path, '/');

            foreach ($this->locales as $locale) {
                $localized[] = "/{$locale}".rtrim($suffix, '/');
            }
        }

        return $localized;
    }
}
