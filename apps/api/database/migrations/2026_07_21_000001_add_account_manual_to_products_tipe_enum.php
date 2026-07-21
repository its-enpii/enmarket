<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tambah `account_manual` ke enum products.tipe.
 *
 * Produk dengan tipe ini butuh aktivasi manual oleh admin sebelum
 * bisa di-deliver ke buyer (use case: akun langganan, akun game,
 * kredensial API, dsb.). Delivery flow di-branch di OrderDeliveryService.
 *
 * MySQL: pakai raw ALTER — Schema::change()->enum() unreliable untuk
 * tambah value ke existing enum column.
 * SQLite: skip — test env pakai SQLite yang menyimpan enum sebagai TEXT
 * tanpa CHECK constraint enforcement, jadi attribute 'account_manual'
 * sudah bisa di-insert tanpa ALTER.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN tipe ENUM('download','license','bundle','account_manual') NOT NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN tipe ENUM('download','license','bundle') NOT NULL");
        }
    }
};
