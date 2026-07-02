<?php

namespace App\Services\Delivery;

use App\Models\Order;
use App\Models\OrderDelivery;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Dispatch notifikasi "order paid" ke n8n (email + WA).
 *
 * Mode dev (N8N_WEBHOOK_KIRIM_PRODUK kosong): log only + auto-mark email_sent_at / wa_sent_at.
 * Mode prod: POST payload ke n8n webhook, n8n yang kirim email & WA,
 *            n8n callback (TODO Fase 4.5) untuk set sent_at timestamps.
 *
 * n8n payload contract:
 * {
 *   "order": { kode_order, nama_pembeli, email_pembeli, wa_pembeli, total_harga, status, paid_at },
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
        $payload = $this->buildPayload($order, $deliveries);

        if (! $this->n8nWebhookUrl) {
            $this->logDevMode($payload);
            $this->markAllSent($deliveries);
            return;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->asJson()
                ->post($this->n8nWebhookUrl, $payload);

            $response->throw();

            // Asumsi n8n kirim ke 2 channel. Real ack callback akan lebih akurat (TODO).
            $this->markAllSent($deliveries);

            Log::info('NotificationDispatcher: n8n accepted payload', [
                'kode_order' => $order->kode_order,
                'status' => $response->status(),
            ]);
        } catch (RequestException|ConnectionException $e) {
            Log::error('NotificationDispatcher: n8n POST failed', [
                'kode_order' => $order->kode_order,
                'status' => method_exists($e, 'response') ? $e->response?->status() : null,
                'error' => $e->getMessage(),
            ]);
            // Jangan throw — delivery sudah sukses, notification bisa di-retry manual.
        }
    }

    /**
     * @param  array<int, OrderDelivery>  $deliveries
     * @return array<string, mixed>
     */
    private function buildPayload(Order $order, array $deliveries): array
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
    private function markAllSent(array $deliveries): void
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