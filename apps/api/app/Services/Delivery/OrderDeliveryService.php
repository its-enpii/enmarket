<?php

namespace App\Services\Delivery;

use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Orchestrator untuk generate delivery setelah order paid.
 *
 * Untuk setiap OrderItem:
 * - Tipe account_manual → delegasi ke AccountProvisioningService
 * - Tipe download/license/bundle → buat download_token + license key
 *
 * Idempotent: kalau order_delivery sudah ada, skip.
 */
class OrderDeliveryService
{
    /** Default token expiry dalam hari (override via constructor kalau perlu). */
    public const TOKEN_EXPIRY_DAYS = 7;

    public function __construct(
        private readonly NotificationDispatcher $notifier,
        private readonly AccountProvisioningService $provisioningService,
    ) {}

    /**
     * Generate deliveries + provisioning untuk semua items dalam order.
     * Return array of created rows (OrderDelivery untuk license/download/bundle,
     * AccountProvisioning untuk account_manual).
     *
     * @param  string  $eventType  Event notifikasi ke n8n. Default 'paid' (order paid biasa).
     *                             'preorder_ready' untuk release pre-order (event berbeda).
     * @return array<int, mixed>
     */
    public function generateForOrder(Order $order, string $eventType = 'paid'): array
    {
        $order->loadMissing('items.product', 'items.delivery', 'items.accountProvisioning');

        $created = [];
        $deliveries = [];

        foreach ($order->items as $item) {
            // Branch: produk bertipe account_manual → provisioning manual, no auto-delivery
            if ($item->product?->requiresManualActivation()) {
                $created[] = $this->provisioningService->createForItem($item);

                continue;
            }

            if ($item->delivery) {
                // Sudah ada — idempotent skip
                $created[] = $item->delivery;
                $deliveries[] = $item->delivery;

                continue;
            }

            $delivery = DB::transaction(function () use ($item) {
                return $this->createDeliveryForItem($item);
            });
            $created[] = $delivery;
            $deliveries[] = $delivery;
        }

        // Fire notifications hanya untuk delivery rows (skip account_manual — admin yang handle).
        // Branch eventType: paid biasa vs preorder_ready (release manual dari antrian).
        if (! empty($deliveries)) {
            $this->dispatchNotifications($order, $deliveries, $eventType);
        }

        return $created;
    }

    /**
     * Kirim notifikasi saja (untuk admin resend). Delivery rows sudah ada.
     * Pakai eventType 'paid' — case ini selalu resend untuk order paid biasa
     * (admin resend tidak applicable untuk pre-order release flow).
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function notifyOnly(Order $order, array $deliveries): void
    {
        $this->dispatchNotifications($order, $deliveries, 'paid');
    }

    /**
     * Issue token baru + extend expiry 7 hari. Reset email_sent_at supaya
     * notifikasi ulang di-trigger. Idempotent: token baru selalu beda.
     */
    public function regenerateToken(OrderDelivery $delivery): OrderDelivery
    {
        $delivery->loadMissing('orderItem.order');

        $delivery->forceFill([
            'download_token' => $this->generateUniqueToken(),
            'token_expired_at' => now()->addDays(self::TOKEN_EXPIRY_DAYS),
            'email_sent_at' => null,
            'wa_sent_at' => null,
        ])->save();

        // Re-dispatch notifikasi email/WA untuk delivery ini saja (event paid — resend context)
        $this->dispatchNotifications($delivery->orderItem->order, [$delivery], 'paid');

        return $delivery;
    }

    /**
     * @param  array<int, OrderDelivery>  $deliveries
     */
    private function dispatchNotifications(Order $order, array $deliveries, string $eventType = 'paid'): void
    {
        if ($eventType === 'preorder_ready') {
            $this->notifier->dispatchPreorderReady($order, $deliveries);

            return;
        }

        $this->notifier->dispatchOrderPaid($order, $deliveries);
    }

    private function createDeliveryForItem(OrderItem $item): OrderDelivery
    {
        // Pakai Product::hasDownloadableFile() (cek file_url exist), bukan
        // OrderItem::hasDownloadableFile() (cuma cek tipe_produk). Tanpa ini,
        // bundle/download dengan file_url kosong akan tulis NULL ke delivery.
        $downloadUrl = $item->product?->hasDownloadableFile()
            ? $item->product->file_url
            : null;

        $delivery = new OrderDelivery([
            'order_item_id' => $item->id,
            'download_token' => $this->generateUniqueToken(),
            'download_url' => $downloadUrl,
            'token_expired_at' => now()->addDays(self::TOKEN_EXPIRY_DAYS),
        ]);

        if ($item->needsLicenseKey()) {
            $key = $this->claimLicenseKey($item->product_id);
            if ($key) {
                $delivery->license_key_id = $key->id;
            } else {
                // Pool kosong — log warning, jangan block delivery (bisa manual assign nanti)
                Log::warning('OrderDelivery: license pool empty', [
                    'order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                ]);
            }
        }

        $delivery->save();

        return $delivery;
    }

    /**
     * Klaim 1 license key dari pool (FIFO + lockForUpdate).
     * Return null kalau pool kosong.
     */
    private function claimLicenseKey(int $productId): ?LicenseKey
    {
        $key = LicenseKey::query()
            ->where('product_id', $productId)
            ->available()
            ->lockForUpdate()
            ->first();

        if (! $key) {
            return null;
        }

        $key->markUsed();

        return $key;
    }

    /**
     * Generate URL-safe unique download token.
     * Format: 48 char base62 (random_bytes + Str::random fallback).
     */
    private function generateUniqueToken(): string
    {
        // 32 byte random = 64 hex. Ambil 48 char substring cukup unik untuk collisions rare.
        return bin2hex(random_bytes(24));
    }
}
