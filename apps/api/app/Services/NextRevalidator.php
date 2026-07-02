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
 */
class NextRevalidator
{
    public function __construct(
        private readonly string $webhookSecret,
        private readonly string $nextBaseUrl,
    ) {}

    /**
     * Revalidate halaman yang terpengaruh perubahan satu produk:
     *   - /                   (home — featured & latest grid)
     *   - /katalog            (catalog list)
     *   - /produk/{slug}      (detail page produk tsb)
     */
    public function revalidateProduct(string $slug): void
    {
        $this->call([
            '/',
            '/katalog',
            "/produk/{$slug}",
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
     * Kirim POST ke Next.js /api/revalidate dengan secret header.
     */
    private function call(array $paths): void
    {
        if ($this->nextBaseUrl === '') {
            Log::warning('NextRevalidator: NEXT_PUBLIC_SITE_URL kosong, skip revalidation.');
            return;
        }

        try {
            $response = Http::withHeaders([
                'X-Webhook-Secret' => $this->webhookSecret,
                'Accept' => 'application/json',
            ])
                ->timeout(3)
                ->post(rtrim($this->nextBaseUrl, '/') . '/api/revalidate', [
                    'paths' => $paths,
                ]);

            if (! $response->successful()) {
                Log::warning("NextRevalidator: webhook {$this->nextBaseUrl}/api/revalidate returned HTTP {$response->status()}");
            }
        } catch (Throwable $e) {
            Log::warning('NextRevalidator failed: ' . $e->getMessage());
        }
    }
}