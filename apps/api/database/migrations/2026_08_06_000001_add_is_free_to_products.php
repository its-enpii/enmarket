<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom `is_free` di tabel products.
 *
 * Produk dengan `is_free=true` otomatis di-render dengan label "Gratis" di
 * storefront dan melewati payment gateway di checkout. Backend ProductController
 * memaksa `harga=0` ketika `is_free=true` — single source of truth.
 *
 * Produk `is_free` dan `is_pre_order` mutually exclusive (di-validate di
 * controller, tidak di schema), karena kombinasi keduanya tidak make sense
 * (pre-order selalu punya DP > 0, free selalu Rp 0).
 *
 * Index untuk query storefront "produk gratis aktif".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_free')->default(false)->after('is_featured');
            $table->index(['is_free', 'status'], 'products_is_free_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_is_free_status_idx');
            $table->dropColumn('is_free');
        });
    }
};