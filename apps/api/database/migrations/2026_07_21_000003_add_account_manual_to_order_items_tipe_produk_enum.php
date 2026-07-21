<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tambah `account_manual` ke enum order_items.tipe_produk.
 *
 * order_items.tipe_produk adalah snapshot dari products.tipe saat order
 * dibuat, jadi schema harus support nilai yang sama dengan products.
 * MySQL: raw ALTER. SQLite: skip (test env tidak enforce enum CHECK,
 *        dan test insert via raw DB::table()->insert bypasses Eloquent).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE order_items MODIFY COLUMN tipe_produk ENUM('download','license','bundle','account_manual') NOT NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE order_items MODIFY COLUMN tipe_produk ENUM('download','license','bundle') NOT NULL");
        }
    }
};
