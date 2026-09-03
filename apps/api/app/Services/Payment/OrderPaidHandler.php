<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\PreorderReleaseQueue;
use App\Models\Sponsor;
use App\Models\SponsorBid;
use App\Services\Sponsor\MetadataFetcher;
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
        private readonly MetadataFetcher $metadataFetcher,
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
        $this->activateSponsorBidIfApplicable($order);
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

    private function activateSponsorBidIfApplicable(Order $order): void
    {
        if (! $order->is_sponsor_bid) {
            return;
        }

        $bid = SponsorBid::where('order_id', $order->id)->first();

        if (! $bid) {
            Log::error("OrderPaidHandler: sponsor bid not found for order {$order->kode_order}");

            return;
        }

        if ($bid->status === 'paid') {
            Log::info("OrderPaidHandler: sponsor bid for order {$order->kode_order} already paid, skipping");

            return;
        }

        try {
            if (Sponsor::where('domain', $bid->domain)->where('is_active', true)->exists()) {
                $bid->update(['status' => 'expired']);
                Log::warning("OrderPaidHandler: active sponsor already exists for domain {$bid->domain}, order {$order->kode_order}");

                return;
            }

            $metadata = $this->metadataFetcher->fetch($bid->domain);

            Sponsor::updateOrCreate(
                ['domain' => $bid->domain],
                [
                    'name' => $bid->name ?: $metadata['name'],
                    'url' => $metadata['url'],
                    'logo_url' => $metadata['logo_url'] ?? null,
                    'description' => $bid->description,
                    'fetched_description' => $metadata['fetched_description'] ?? null,
                    'amount' => $order->sponsor_amount,
                    'is_active' => true,
                    'fetched_at' => $metadata['fetched_at'] ?? now(),
                ],
            );

            $bid->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            Log::info("OrderPaidHandler: activated sponsor {$bid->domain} from order {$order->kode_order}");
        } catch (\Throwable $e) {
            Log::error("OrderPaidHandler: failed activating sponsor bid for order {$order->kode_order}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
