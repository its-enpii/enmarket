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
 * - Buat download_token (7 hari expiry)
 * - Set download_url dari product.file_url (snapshot)
 * - Kalau tipe=license/bundle → klaim 1 license key dari pool
 *
 * Idempotent: kalau order_delivery sudah ada, skip.
 */
class OrderDeliveryService
{
    /** Default token expiry dalam hari (override via constructor kalau perlu). */
    public const TOKEN_EXPIRY_DAYS = 7;

    public function __construct(
        private readonly NotificationDispatcher $notifier,
    ) {}

    /**
     * Generate deliveries untuk semua items dalam order.
     * Return array of created OrderDelivery.
     *
     * @return array<int, OrderDelivery>
     */
    public function generateForOrder(Order $order): array
    {
        $order->loadMissing('items.product', 'items.delivery');

        $created = [];

        foreach ($order->items as $item) {
            if ($item->delivery) {
                // Sudah ada — idempotent skip
                $created[] = $item->delivery;
                continue;
            }

            $created[] = DB::transaction(function () use ($item) {
                return $this->createDeliveryForItem($item);
            });
        }

        // Fire notifications setelah semua delivery row siap
        $this->dispatchNotifications($order, $created);

        return $created;
    }

    /**
     * Kirim notifikasi saja (untuk admin resend). Delivery rows sudah ada.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function notifyOnly(Order $order, array $deliveries): void
    {
        $this->dispatchNotifications($order, $deliveries);
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

        // Re-dispatch notifikasi email/WA untuk delivery ini saja
        $this->dispatchNotifications($delivery->orderItem->order, [$delivery]);

        return $delivery;
    }

    /**
     * @param  array<int, OrderDelivery>  $deliveries
     */
    private function dispatchNotifications(Order $order, array $deliveries): void
    {
        $this->notifier->dispatchOrderPaid($order, $deliveries);
    }

    private function createDeliveryForItem(OrderItem $item): OrderDelivery
    {
        $delivery = new OrderDelivery([
            'order_item_id' => $item->id,
            'download_token' => $this->generateUniqueToken(),
            'download_url' => $item->hasDownloadableFile()
                ? ($item->product?->file_url)
                : null,
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