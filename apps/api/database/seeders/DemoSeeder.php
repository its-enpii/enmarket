<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Realistic demo fixtures untuk runtime + e2e testing.
 *
 * Goals:
 * - Setidaknya 1 produk aktif agar buyer-flow e2e punya data untuk render.
 * - Setidaknya 1 post published untuk testing linked-posts UI.
 * - Setidaknya 1 produk bertipe `account_manual` agar admin provisioning
 *   page + dashboard tile punya data.
 *
 * Idempotent: aman re-run. Update kalau row sudah ada, skip kalau sudah link.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::firstOrCreate(
            ['slug' => 'studio'],
            ['nama' => 'Studio', 'deskripsi' => 'Karya studio enpii.'],
        );

        $product = Product::firstOrCreate(
            ['slug' => 'starter-pack-demo'],
            [
                'category_id' => $cat->id,
                'nama' => 'Starter Pack Demo',
                'deskripsi' => "Produk demo untuk testing.\nBaris 1 deskripsi.\nBaris 2 deskripsi.",
                'harga' => 25000,
                'tipe' => 'account_manual',
                'status' => 'aktif',
                'is_featured' => true,
                'download_expiry_days' => 7,
                'fitur' => ['Item 1', 'Item 2'],
                'preview_images' => [],
            ],
        );

        $post = Post::firstOrCreate(
            ['slug' => 'panduan-setup-akun'],
            [
                'title' => 'Panduan Setup Akun',
                'excerpt' => 'Cara setup akun setelah pembelian.',
                'content' => '<p>Berikut cara setup akun setelah checkout…</p>',
                'status' => 'published',
                'published_at' => now()->subDay(),
            ],
        );

        $warning = Post::firstOrCreate(
            ['slug' => 'warning-maintenance'],
            [
                'title' => 'Warning Maintenance',
                'excerpt' => 'Maintenance terjadwal tiap Minggu.',
                'content' => '<p>Maintenance Minggu 02:00-04:00 WIB.</p>',
                'status' => 'published',
                'published_at' => now()->subDay(),
            ],
        );

        // Attach posts ke produk kalau belum ter-link.
        $existingIds = $product->posts()->pluck('posts.id')->all();
        $toAttach = [];
        foreach ([$post->id, $warning->id] as $i => $postId) {
            if (! in_array($postId, $existingIds, true)) {
                $toAttach[$postId] = ['urutan' => $i];
            }
        }
        if ($toAttach !== []) {
            $product->posts()->attach($toAttach);
        }
    }
}