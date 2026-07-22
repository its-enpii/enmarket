<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom pre-order ke tabel products.
 *
 * Produk pre-orderable: buyer pesan sekarang dengan DP, fulfillment di-defer
 * sampai release_date. Saat release, admin trigger manual via
 * POST /admin/preorders/{id}/release-now (lihat PreorderReleaseService).
 *
 * - `is_pre_order` flag master. Bisa ON untuk tipe apapun (download/license/
 *   bundle/account_manual) — orthogonal dengan enum tipe.
 * - `release_date` tanggal buyer terima delivery (nullable kalau non-preorder).
 * - `preorder_deposit_percent` 1-100. NULL = non-preorder (bukan 100).
 *   Hitungan DP pakai (int) round($harga * $percent / 100) di Product::depositAmount().
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_pre_order')->default(false)->after('status');
            $table->date('release_date')->nullable()->after('is_pre_order');
            $table->unsignedTinyInteger('preorder_deposit_percent')->nullable()->after('release_date');

            // Query utama admin preorder list: WHERE is_pre_order=1 AND status='aktif'
            $table->index(['is_pre_order', 'status'], 'products_preorder_status_idx');
            // Query release: WHERE release_date <= today AND status='aktif'
            $table->index('release_date', 'products_release_date_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_preorder_status_idx');
            $table->dropIndex('products_release_date_idx');
            $table->dropColumn(['is_pre_order', 'release_date', 'preorder_deposit_percent']);
        });
    }
};