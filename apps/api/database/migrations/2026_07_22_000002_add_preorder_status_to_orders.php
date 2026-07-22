<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Extend tabel orders untuk support pre-order.
 *
 * - status ENUM tambah `preorder_deposit_paid` — transisi setelah Tripay PAID
 *   untuk order pre-orderable. Bedanya dengan `paid`: license/file belum di-deliver.
 *   Admin trigger manual release (lihat PreorderReleaseService) untuk transisi ke `paid`.
 * - `is_preorder` snapshot saat checkout — kalau true, semua item adalah pre-order.
 *   Cart policy all-or-nothing (mixed → 422 cart_mixed_preorder) di-enforce di
 *   CheckoutController, jadi flag ini selalu konsisten di seluruh item order.
 * - `preorder_deposit_amount` amount yang dibayar sekarang (= Tripay amount).
 *   `preorder_remaining_amount` display only — model saat ini buyer tidak bayar
 *   kedua kali (DP = harga penuh, sisa adalah sisa harga yang "di-cover" DP).
 *
 * Index: (status, preorder_release_date) untuk query admin list "awaiting".
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tambah `preorder_deposit_paid` ke enum (MySQL pakai raw ALTER).
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','failed','expired','refunded','preorder_deposit_paid') NOT NULL DEFAULT 'pending'");
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_preorder')->default(false)->after('status');
            $table->date('preorder_release_date')->nullable()->after('is_preorder');
            $table->decimal('preorder_deposit_amount', 10, 2)->nullable()->after('preorder_release_date');
            $table->decimal('preorder_remaining_amount', 10, 2)->nullable()->after('preorder_deposit_amount');
            $table->timestamp('preorder_deposit_paid_at')->nullable()->after('preorder_remaining_amount');
            $table->timestamp('preorder_release_processed_at')->nullable()->after('preorder_deposit_paid_at');

            // Query utama: "order awaiting release" = preorder_deposit_paid + release_date <= today
            $table->index(['status', 'preorder_release_date'], 'orders_preorder_status_date_idx');
            $table->index('is_preorder', 'orders_is_preorder_idx');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_preorder_status_date_idx');
            $table->dropIndex('orders_is_preorder_idx');
            $table->dropColumn([
                'is_preorder',
                'preorder_release_date',
                'preorder_deposit_amount',
                'preorder_remaining_amount',
                'preorder_deposit_paid_at',
                'preorder_release_processed_at',
            ]);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','failed','expired','refunded') NOT NULL DEFAULT 'pending'");
        }
    }
};
