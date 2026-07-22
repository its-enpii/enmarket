<?php

namespace App\Services\Delivery;

use App\Models\AccountProvisioning;
use App\Models\Order;
use App\Models\OrderDelivery;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Dispatch notifikasi ke n8n (email + WA).
 *
 * Tiga event yang di-dispatch:
 *   - order.paid        → delivery file/license siap di-download (order paid biasa)
 *   - account.ready     → admin sudah aktivasi akun, kredensial siap di-deliver
 *   - preorder.ready    → release pre-order: license/file siap (different event untuk n8n template)
 *
 * Mode dev (N8N_WEBHOOK_KIRIM_PRODUK kosong): log only + auto-mark email_sent_at / wa_sent_at.
 * Mode prod: POST payload ke n8n webhook, n8n yang kirim email & WA.
 *
 * n8n payload contract (order.paid / preorder.ready):
 * {
 *   "event": "order.paid" | "preorder.ready",
 *   "order": { kode_order, nama_pembeli, email_pembeli, wa_pembeli, total_harga, status,
 *              paid_at, release_date? },
 *   "deliveries": [
 *     { product: { nama, tipe }, download_url, download_token, token_expired_at,
 *       license_key (string|null) }
 *   ],
 *   "channels": ["email", "wa"]
 * }
 */
class NotificationDispatcher
{
    public function __construct(
        private readonly ?string $n8nWebhookUrl,
        private readonly int $timeout = 10,
    ) {}

    /**
     * Dispatch payload ke n8n (atau log kalau dev mode).
     * Update email_sent_at / wa_sent_at timestamps pada deliveries.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function dispatchOrderPaid(Order $order, array $deliveries): void
    {
        $payload = $this->buildOrderPaidPayload($order, $deliveries);

        $sent = $this->postToN8n($payload);

        if ($sent) {
            $this->markDeliveriesSent($deliveries);
        }
    }

    /**
     * Dispatch notifikasi "pre-order siap di-release" — di-trigger saat admin
     * manual click Release Now. Payload mirip order.paid tapi event=`preorder.ready`
     * supaya n8n bisa pakai template berbeda (announce-style, plus release_date context).
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function dispatchPreorderReady(Order $order, array $deliveries): void
    {
        $payload = $this->buildPreorderReadyPayload($order, $deliveries);

        $sent = $this->postToN8n($payload);

        if ($sent) {
            $this->markDeliveriesSent($deliveries);
        }
    }

    /**
     * Dispatch notifikasi "akun sudah siap" ke buyer.
     * Payload: order info + 1 item dengan kredensial.
     */
    public function dispatchAccountReady(AccountProvisioning $prov): void
    {
        $prov->loadMissing('orderItem.order', 'orderItem.product');
        $order = $prov->orderItem?->order;
        $item = $prov->orderItem;

        if (! $order || ! $item) {
            Log::error('NotificationDispatcher: missing order or item for account.ready', [
                'provisioning_id' => $prov->id,
            ]);

            return;
        }

        $payload = [
            'event' => 'account.ready',
            'order' => [
                'kode_order' => $order->kode_order,
                'nama_pembeli' => $order->nama_pembeli,
                'email_pembeli' => $order->email_pembeli,
                'wa_pembeli' => $order->wa_pembeli,
            ],
            'item' => [
                'product_nama' => $item->nama_produk,
                'credentials' => $prov->credentials,
                'catatan' => $prov->catatan_admin,
            ],
            'channels' => ['email', 'wa'],
        ];

        $sent = $this->postToN8n($payload);

        if ($sent) {
            $now = now();
            $prov->forceFill([
                'email_sent_at' => $prov->email_sent_at ?? $now,
                'wa_sent_at' => $prov->wa_sent_at ?? $now,
            ])->save();
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function postToN8n(array $payload): bool
    {
        if (! $this->n8nWebhookUrl) {
            $this->logDevMode($payload);

            return true;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->asJson()
                ->post($this->n8nWebhookUrl, $payload);

            $response->throw();

            Log::info('NotificationDispatcher: n8n accepted payload', [
                'event' => $payload['event'] ?? 'unknown',
                'status' => $response->status(),
            ]);

            return true;
        } catch (RequestException|ConnectionException $e) {
            Log::error('NotificationDispatcher: n8n POST failed', [
                'event' => $payload['event'] ?? 'unknown',
                'status' => method_exists($e, 'response') ? $e->response?->status() : null,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * @param  array<int, OrderDelivery>  $deliveries
     * @return array<string, mixed>
     */
    private function buildOrderPaidPayload(Order $order, array $deliveries): array
    {
        $items = [];
        foreach ($deliveries as $d) {
            $item = $d->orderItem;
            $items[] = [
                'product' => [
                    'nama' => $item->nama_produk,
                    'tipe' => $item->tipe_produk,
                ],
                'download_url' => $d->download_url,
                'download_token' => $d->download_token,
                'token_expired_at' => $d->token_expired_at?->toIso8601String(),
                'license_key' => $d->licenseKey?->key,
            ];
        }

        return [
            'event' => 'order.paid',
            'order' => [
                'kode_order' => $order->kode_order,
                'nama_pembeli' => $order->nama_pembeli,
                'email_pembeli' => $order->email_pembeli,
                'wa_pembeli' => $order->wa_pembeli,
                'total_harga' => (int) $order->total_harga,
                'status' => $order->status,
                'paid_at' => $order->paid_at?->toIso8601String(),
            ],
            'deliveries' => $items,
            'channels' => ['email', 'wa'],
        ];
    }

    /**
     * Payload untuk event preorder.ready — struktur mirip order.paid tapi event berbeda
     * (n8n template bisa announce "pre-order kamu sudah rilis!") plus release_date context.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     * @return array<string, mixed>
     */
    private function buildPreorderReadyPayload(Order $order, array $deliveries): array
    {
        $items = [];
        foreach ($deliveries as $d) {
            $item = $d->orderItem;
            $items[] = [
                'product' => [
                    'nama' => $item->nama_produk,
                    'tipe' => $item->tipe_produk,
                ],
                'download_url' => $d->download_url,
                'download_token' => $d->download_token,
                'token_expired_at' => $d->token_expired_at?->toIso8601String(),
                'license_key' => $d->licenseKey?->key,
            ];
        }

        return [
            'event' => 'preorder.ready',
            'order' => [
                'kode_order' => $order->kode_order,
                'nama_pembeli' => $order->nama_pembeli,
                'email_pembeli' => $order->email_pembeli,
                'wa_pembeli' => $order->wa_pembeli,
                'total_harga' => (int) $order->total_harga,
                'status' => $order->status,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'release_date' => $order->preorder_release_date?->toDateString(),
            ],
            'deliveries' => $items,
            'channels' => ['email', 'wa'],
        ];
    }

    /**
     * Dev fallback: log full payload supaya mudah di-trace.
     *
     * @param  array<string, mixed>  $payload
     */
    private function logDevMode(array $payload): void
    {
        Log::channel('stack')->info('NotificationDispatcher [DEV MODE]', $payload);
    }

    /**
     * Mark semua delivery rows sebagai sudah di-notify.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    private function markDeliveriesSent(array $deliveries): void
    {
        $now = now();
        foreach ($deliveries as $d) {
            $d->forceFill([
                'email_sent_at' => $d->email_sent_at ?? $now,
                'wa_sent_at' => $d->wa_sent_at ?? $now,
            ])->save();
        }
    }
}
