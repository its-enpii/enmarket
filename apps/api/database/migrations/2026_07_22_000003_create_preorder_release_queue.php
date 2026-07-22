<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ledger pre-order yang menunggu release.
 *
 * Row di-insert saat Tripay callback PAID untuk order pre-orderable (lihat
 * TripayCallbackController). Row tetap ada setelah release selesai —
 * `processed_at` di-set sebagai marker idempotency.
 *
 * Unique constraint di `order_id` — satu order = satu baris (INSERT or UPDATE
 * via firstOrCreate pattern). Kalau release_date di-update admin, queue row
 * di-update juga (lihat PreorderController::updateReleaseDate).
 *
 * Index (release_date, processed_at) untuk query admin list: "order awaiting
 * release" = WHERE release_date <= today AND processed_at IS NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preorder_release_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->date('release_date');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['release_date', 'processed_at'], 'preorder_queue_due_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preorder_release_queue');
    }
};
