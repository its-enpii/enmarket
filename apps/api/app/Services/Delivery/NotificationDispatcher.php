<?php

namespace App\Services\Delivery;

use App\Mail\OrderInvoiceMail;
use App\Models\AccountProvisioning;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Services\WhatsApp\MessageBuilder;
use App\Services\WhatsApp\WhatsAppClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Dispatch notifikasi invoice ke pembeli via Email + WhatsApp.
 *
 * Tiga event yang di-dispatch:
 *   - order.paid        -> delivery file/license siap di-download
 *   - preorder.ready    -> release pre-order: license/file siap
 *   - account.ready     -> admin sudah aktivasi akun, kredensial siap
 *
 * Channels:
 *   - Email: Laravel Mail (SMTP/Postmark/etc) — kirim OrderInvoiceMail
 *   - WhatsApp: WhatsAppClient via enpiistudio webhook agent
 *
 * Dev mode: jika kedua channel tidak dikonfigurasi, log payload saja.
 */
class NotificationDispatcher
{
    public function __construct(
        private readonly ?string $n8nWebhookUrl,
        private readonly ?WhatsAppClient $waClient = null,
        private readonly ?MessageBuilder $waMessageBuilder = null,
        private readonly ?string $siteUrl = null,
        private readonly int $timeout = 10,
    ) {}

    /**
     * Dispatch notifikasi order paid ke buyer.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function dispatchOrderPaid(Order $order, array $deliveries): void
    {
        foreach ($deliveries as $d) {
            $d->loadMissing('orderItem', 'licenseKey');
        }

        $emailSent = $this->sendEmail($order, 'order_paid', $deliveries);
        $waSent = $this->sendWhatsApp(
            $order->wa_pembeli,
            fn () => $this->waMessageBuilder?->orderPaid($order, $deliveries),
        );

        if (! $emailSent && ! $waSent) {
            $this->logDevMode($this->buildOrderPaidPayload($order, $deliveries));
        }

        $this->markDeliveriesSent($deliveries, $emailSent, $waSent);
    }

    /**
     * Dispatch notifikasi preorder ready ke buyer.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function dispatchPreorderReady(Order $order, array $deliveries): void
    {
        foreach ($deliveries as $d) {
            $d->loadMissing('orderItem', 'licenseKey');
        }

        $emailSent = $this->sendEmail($order, 'preorder_ready', $deliveries);
        $waSent = $this->sendWhatsApp(
            $order->wa_pembeli,
            fn () => $this->waMessageBuilder?->preorderReady($order, $deliveries),
        );

        if (! $emailSent && ! $waSent) {
            $this->logDevMode($this->buildPreorderReadyPayload($order, $deliveries));
        }

        $this->markDeliveriesSent($deliveries, $emailSent, $waSent);
    }

    /**
     * Dispatch notifikasi account ready ke buyer.
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

        $emailSent = $this->sendEmail($order, 'account_ready', [], $prov);
        $waSent = $this->sendWhatsApp(
            $order->wa_pembeli,
            fn () => $this->waMessageBuilder?->accountReady($prov),
        );

        if (! $emailSent && ! $waSent) {
            $this->logDevMode([
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
            ]);
        }

        $now = now();
        $prov->forceFill([
            'email_sent_at' => $emailSent ? ($prov->email_sent_at ?? $now) : $prov->email_sent_at,
            'wa_sent_at' => $waSent ? ($prov->wa_sent_at ?? $now) : $prov->wa_sent_at,
        ])->save();
    }

    /**
     * Send email via Laravel Mail.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    private function sendEmail(
        Order $order,
        string $eventType,
        array $deliveries = [],
        ?AccountProvisioning $provisioning = null,
    ): bool {
        $to = $order->email_pembeli;
        if (! $to) {
            return false;
        }

        try {
            $mailer = config('mail.default', 'log');

            if ($mailer === 'log') {
                Log::info('NotificationDispatcher: email would be sent (mail driver=log)', [
                    'to' => $to,
                    'event' => $eventType,
                ]);

                return true;
            }

            Mail::to($to)->send(new OrderInvoiceMail(
                order: $order,
                eventType: $eventType,
                deliveries: $deliveries,
                provisioning: $provisioning,
                siteUrl: $this->siteUrl ?? config('services.next.public_url', ''),
            ));

            Log::info('NotificationDispatcher: email sent', [
                'to' => $to,
                'event' => $eventType,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('NotificationDispatcher: email failed', [
                'to' => $to,
                'event' => $eventType,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send WhatsApp message via WhatsAppClient.
     *
     * @param  callable(): ?string  $messageFactory
     */
    private function sendWhatsApp(?string $phone, callable $messageFactory): bool
    {
        if (! $phone || ! $this->waClient || ! $this->waMessageBuilder) {
            return false;
        }

        try {
            $message = $messageFactory();
            if (! $message) {
                return false;
            }

            return $this->waClient->sendMessage($phone, $message);
        } catch (\Throwable $e) {
            Log::error('NotificationDispatcher: WhatsApp failed', [
                'phone' => $phone,
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
    private function markDeliveriesSent(array $deliveries, bool $emailSent = true, bool $waSent = true): void
    {
        $now = now();
        foreach ($deliveries as $d) {
            $updates = [];
            if ($emailSent || (! $emailSent && ! $waSent)) {
                $updates['email_sent_at'] = $d->email_sent_at ?? $now;
            }
            if ($waSent || (! $emailSent && ! $waSent)) {
                $updates['wa_sent_at'] = $d->wa_sent_at ?? $now;
            }
            if (! empty($updates)) {
                $d->forceFill($updates)->save();
            }
        }
    }

    /**
     * Notify buyer tentang hasil top-up game (sukses/gagal).
     * Dispatch ke n8n webhook (atau log di dev mode).
     */
    public function notifyTopupResult(Order $order): void
    {
        $order->loadMissing('game', 'gameItem');

        $gameName = $order->game?->nama ?? 'Unknown Game';
        $itemName = $order->gameItem?->nama ?? 'Unknown Item';
        $status = $order->topup_status === 'success' ? 'berhasil' : 'gagal';
        $sn = $order->digiflazz_response['sn'] ?? '-';

        $payload = [
            'event' => 'topup.result',
            'order' => [
                'kode_order' => $order->kode_order,
                'contact_type' => $order->contact_type,
                'contact_value' => $order->contact_value,
                'total_harga' => (int) $order->total_harga,
            ],
            'topup' => [
                'game' => $gameName,
                'item' => $itemName,
                'status' => $status,
                'sn' => $sn,
                'game_user_id' => $order->game_user_id,
            ],
            'channels' => $order->contact_type === 'phone' ? ['wa'] : ['email'],
        ];

        $this->postToN8n($payload);
    }
}
