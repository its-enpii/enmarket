<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tambah `free` ke enum orders.status.
 *
 * Status `free` menandakan order yang checkout-nya skip payment gateway
 * (cart berisi produk is_free). Mirip `paid` dari sisi delivery — license/file
 * tersedia — tapi berbeda provenance (tidak ada Tripay transaction).
 *
 * MySQL: pakai raw ALTER — Schema::change()->enum() unreliable untuk tambah
 * value ke existing enum column.
 * SQLite: skip — test env pakai SQLite yang menyimpan enum sebagai TEXT
 * tanpa CHECK constraint enforcement, jadi attribute 'free' sudah bisa di-insert
 * tanpa ALTER.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','failed','expired','refunded','preorder_deposit_paid','free') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','failed','expired','refunded','preorder_deposit_paid') NOT NULL DEFAULT 'pending'");
        }
    }
};