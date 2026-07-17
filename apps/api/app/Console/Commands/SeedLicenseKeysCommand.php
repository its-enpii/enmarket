<?php

namespace App\Console\Commands;

use App\Models\LicenseKey;
use App\Models\Product;
use Illuminate\Console\Command;

/**
 * Bulk generate license keys untuk produk tertentu.
 *
 * Usage:
 *   php artisan enmarket:seed-license-keys {product_id} {count} [--prefix=ABC] [--batch-size=100]
 *
 * Default count=10, format key: PREFIX-XXXX-XXXX-XXXX-XXXX (4 groups of 4 uppercase alnum)
 *
 * Contoh:
 *   php artisan enmarket:seed-license-keys 1 50
 *   php artisan enmarket:seed-license-keys 2 100 --prefix=EPSPRO
 */
class SeedLicenseKeysCommand extends Command
{
    protected $signature = 'enmarket:seed-license-keys
        {product_id : ID produk yang akan di-generate keys-nya}
        {count=10 : Berapa banyak keys yang akan di-generate}
        {--prefix=EPS : Prefix key (4-8 char uppercase alnum)}
        {--batch-size=100 : Insert per batch (optimasi memory)}';

    protected $description = 'Generate bulk license keys untuk produk (untuk stock license pool)';

    public function handle(): int
    {
        $productId = (int) $this->argument('product_id');
        $count = max(1, (int) $this->argument('count'));
        $prefix = strtoupper((string) $this->option('prefix'));
        $batchSize = max(1, (int) $this->option('batch-size'));

        $product = Product::find($productId);
        if (! $product) {
            $this->error("Product #{$productId} tidak ditemukan.");

            return self::FAILURE;
        }

        $existingActive = LicenseKey::where('product_id', $productId)->where('status', 'aktif')->count();
        $this->info("Product: {$product->nama} (ID {$productId}, tipe {$product->tipe})");
        $this->info("Existing aktif: {$existingActive}");
        $this->info("Akan generate {$count} keys baru (prefix: {$prefix})...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $generated = 0;
        $batch = [];

        for ($i = 0; $i < $count; $i++) {
            $key = LicenseKey::generateKey($prefix);
            $batch[] = [
                'product_id' => $productId,
                'key' => $key,
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) >= $batchSize) {
                LicenseKey::insert($batch);
                $generated += count($batch);
                $batch = [];
                $bar->advance($batchSize);
            }
        }

        if (count($batch) > 0) {
            LicenseKey::insert($batch);
            $generated += count($batch);
            $bar->advance(count($batch));
        }

        $bar->finish();
        $this->newLine();
        $this->info("✓ {$generated} keys berhasil di-generate.");

        return self::SUCCESS;
    }
}
