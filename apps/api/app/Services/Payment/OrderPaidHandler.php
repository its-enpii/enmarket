<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\PreorderReleaseQueue;
use App\Services\Delivery\OrderDeliveryService;
use Illuminate\Support\Facades\Log;

/**
 * Shared handler for "order paid" events — used by both TripayCallbackController
 * and DuitkuCallbackController. Centralises paid-order processing:
 *
 * 1. Idempotency check (skip if already paid)
 * 2. Mark order paid + set paid_at + payment_channel
 * 3. Pre-order branch → enqueue for release
 * 4. Normal branch → trigger delivery generation
 * 5. If topup order → dispatch ProcessGameTopupOrder job (Digiflazz integration)
 */
class OrderPaidHandler
{
    public function __construct(
        private readonly OrderDeliveryService $deliveryService,
    ) {}

    public function handle(Order $order, ?string $paymentChannel = null): void
    {
        if ($order->status === 'paid' || $order->status === 'preorder_deposit_paid') {
            Log::info("OrderPaidHandler: order {$order->kode_order} already paid, skipping");

            return;
        }

        $now = now();

        if ($paymentChannel) {
            $order->payment_channel = $paymentChannel;
        }

        if ($order->isPreorder()) {
            $order->update([
                'status' => 'preorder_deposit_paid',
                'paid_at' => $now,
                'preorder_deposit_paid_at' => $now,
                'payment_channel' => $order->payment_channel,
            ]);

            PreorderReleaseQueue::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'release_date' => $order->preorder_release_date ?? $now->toDateString(),
                ],
            );

            Log::info("Pre-order deposit paid: order={$order->kode_order} (awaiting release on {$order->preorder_release_date?->toDateString()})");

            return;
        }

        $order->update([
            'status' => 'paid',
            'paid_at' => $now,
            'payment_channel' => $order->payment_channel,
        ]);

        try {
            $rows = $this->deliveryService->generateForOrder($order);
            $deliveries = collect($rows)->whereInstanceOf(\App\Models\OrderDelivery::class);
            $provisionings = collect($rows)->whereInstanceOf(\App\Models\AccountProvisioning::class);
            Log::info("Order {$order->kode_order} paid — {$deliveries->count()} deliveries, {$provisionings->count()} awaiting admin activation");
        } catch (\Throwable $e) {
            Log::error("Order {$order->kode_order} paid but delivery failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        $this->dispatchTopupIfApplicable($order);
    }

    private function dispatchTopupIfApplicable(Order $order): void
    {
        if (! $order->game_item_id) {
            return;
        }

        $jobClass = 'App\\Jobs\\ProcessGameTopupOrder';

        if (! class_exists($jobClass)) {
            Log::info("OrderPaidHandler: ProcessGameTopupOrder class not found, skipping topup dispatch for order {$order->kode_order}");

            return;
        }

        try {
            $job = app($jobClass, ['order' => $order]);
            dispatch($job);
            Log::info("OrderPaidHandler: dispatched ProcessGameTopupOrder for order {$order->kode_order}");
        } catch (\Throwable $e) {
            Log::error("OrderPaidHandler: failed to dispatch topup job for order {$order->kode_order}", [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
