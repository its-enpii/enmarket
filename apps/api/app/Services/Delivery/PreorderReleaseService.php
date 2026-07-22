<?php

namespace App\Services\Delivery;

use App\Models\Order;
use App\Models\PreorderReleaseQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrator untuk release pre-order.
 *
 * Flow:
 *   1. Admin click "Release Now" via PreorderController::releaseNow.
 *   2. Service guard idempotency (preorder_release_processed_at sudah di-set → no-op).
 *   3. DB transaction:
 *      - Order: status 'preorder_deposit_paid' → 'paid',
 *               paid_at = preorder_deposit_paid_at (reuse paid_at column),
 *               preorder_release_processed_at = now()
 *      - Queue row: processed_at = now()
 *      - Trigger OrderDeliveryService::generateForOrder($order, 'preorder_ready')
 *   4. Notifications di-dispatch sync ke n8n (event preorder.ready).
 *
 * Tidak ada cron/Laravel scheduler — release trigger semuanya manual via admin UI.
 */
class PreorderReleaseService
{
    public function __construct(
        private readonly OrderDeliveryService $deliveryService,
    ) {}

    /**
     * Process release satu order. Idempotent — kalau sudah pernah diproses
     * (preorder_release_processed_at populated), return false no-op.
     *
     * Return true kalau release sukses di-trigger.
     */
    public function releaseOrder(Order $order): bool
    {
        if (! $order->isAwaitingRelease()) {
            Log::info('PreorderReleaseService: skip — not awaiting release', [
                'order_id' => $order->id,
                'status' => $order->status,
                'is_preorder' => $order->isPreorder(),
            ]);

            return false;
        }

        if ($order->preorder_release_processed_at !== null) {
            Log::info('PreorderReleaseService: skip — already processed', [
                'order_id' => $order->id,
                'processed_at' => $order->preorder_release_processed_at->toIso8601String(),
            ]);

            return false;
        }

        $processedAt = now();

        DB::transaction(function () use ($order, $processedAt) {
            $order->forceFill([
                'status' => 'paid',
                // Reuse paid_at column — semantically: kapan buyer "fully paid" (untuk preorder = DP paid).
                // preorder_deposit_paid_at tetap disimpan terpisah untuk audit trail.
                'paid_at' => $order->preorder_deposit_paid_at ?? $order->paid_at ?? $processedAt,
                'preorder_release_processed_at' => $processedAt,
            ])->save();

            PreorderReleaseQueue::query()
                ->where('order_id', $order->id)
                ->whereNull('processed_at')
                ->update(['processed_at' => $processedAt]);
        });

        // Trigger delivery generation + notification (event preorder_ready).
        // Diluar transaction supaya kalau notifikasi gagal, transaction tetap commit.
        // Kegagalan delivery/notif di-log; admin retry via endpoint yang sama (idempotent).
        try {
            $this->deliveryService->generateForOrder($order->fresh(), 'preorder_ready');
        } catch (\Throwable $e) {
            Log::error('PreorderReleaseService: delivery generation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Re-throw agar caller tahu ada masalah — admin bisa retry.
            // Tapi status order sudah 'paid' + processed_at sudah di-set, jadi retry
            // berikutnya tidak akan re-process (idempotent guard). Untuk re-trigger
            // delivery, admin perlu `POST /admin/orders/{kode}/generate-deliveries`.
            throw $e;
        }

        return true;
    }
}