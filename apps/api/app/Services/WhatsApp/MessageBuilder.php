<?php

namespace App\Services\WhatsApp;

use App\Models\AccountProvisioning;
use App\Models\Order;
use App\Models\OrderDelivery;

/**
 * Build formatted WhatsApp text messages for order notifications.
 */
class MessageBuilder
{
    public function __construct(
        private readonly string $siteUrl,
        private readonly string $storeName = 'Enmarket',
    ) {}

    /**
     * Message for order.paid — download/license delivery.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function orderPaid(Order $order, array $deliveries): string
    {
        $lines = [];
        $lines[] = "Halo {$order->nama_pembeli}! 👋";
        $lines[] = '';
        $lines[] = "Pembayaran pesanan *{$order->kode_order}* telah dikonfirmasi. ✅";
        $lines[] = "Total: *Rp " . number_format((int) $order->total_harga, 0, ',', '.') . "*";
        $lines[] = '';
        $lines[] = '📦 *Detail Produk:*';

        foreach ($deliveries as $i => $d) {
            $item = $d->orderItem;
            $num = $i + 1;
            $lines[] = "{$num}. *{$item->nama_produk}*";

            if ($d->licenseKey?->key) {
                $lines[] = "   🔑 License: `{$d->licenseKey->key}`";
            }

            if ($d->download_url && $d->download_token) {
                $downloadLink = rtrim($this->siteUrl, '/') . "/download/{$d->download_token}";
                $lines[] = "   📥 Download: {$downloadLink}";

                if ($d->token_expired_at) {
                    $lines[] = "   ⏰ Berlaku sampai: " . $d->token_expired_at->format('d M Y H:i') . ' WIB';
                }
            }
        }

        $lines[] = '';
        $lines[] = "Terima kasih sudah berbelanja di {$this->storeName}! 🙏";

        return implode("\n", $lines);
    }

    /**
     * Message for preorder.ready — pre-order release notification.
     *
     * @param  array<int, OrderDelivery>  $deliveries
     */
    public function preorderReady(Order $order, array $deliveries): string
    {
        $lines = [];
        $lines[] = "Halo {$order->nama_pembeli}! 🎉";
        $lines[] = '';
        $lines[] = "Pre-order kamu *{$order->kode_order}* sudah rilis!";
        $lines[] = '';
        $lines[] = '📦 *Produk yang siap diunduh:*';

        foreach ($deliveries as $i => $d) {
            $item = $d->orderItem;
            $num = $i + 1;
            $lines[] = "{$num}. *{$item->nama_produk}*";

            if ($d->licenseKey?->key) {
                $lines[] = "   🔑 License: `{$d->licenseKey->key}`";
            }

            if ($d->download_url && $d->download_token) {
                $downloadLink = rtrim($this->siteUrl, '/') . "/download/{$d->download_token}";
                $lines[] = "   📥 Download: {$downloadLink}";

                if ($d->token_expired_at) {
                    $lines[] = "   ⏰ Berlaku sampai: " . $d->token_expired_at->format('d M Y H:i') . ' WIB';
                }
            }
        }

        $lines[] = '';
        $lines[] = "Terima kasih sudah menunggu! 🙏";

        return implode("\n", $lines);
    }

    /**
     * Message for account.ready — manual account activation done.
     */
    public function accountReady(AccountProvisioning $prov): string
    {
        $prov->loadMissing('orderItem.order', 'orderItem.product');
        $order = $prov->orderItem?->order;
        $item = $prov->orderItem;

        $lines = [];
        $lines[] = "Halo {$order->nama_pembeli}! 👋";
        $lines[] = '';
        $lines[] = "Akun untuk produk *{$item->nama_produk}* sudah siap digunakan! ✅";
        $lines[] = "Pesanan: *{$order->kode_order}*";
        $lines[] = '';

        if (is_array($prov->credentials) && ! empty($prov->credentials)) {
            $lines[] = '🔐 *Kredensial Akun:*';
            foreach ($prov->credentials as $key => $value) {
                $label = ucfirst(str_replace('_', ' ', $key));
                $lines[] = "   {$label}: `{$value}`";
            }
            $lines[] = '';
        }

        if ($prov->catatan_admin) {
            $lines[] = "📝 *Catatan:* {$prov->catatan_admin}";
            $lines[] = '';
        }

        $lines[] = "Terima kasih sudah berbelanja di {$this->storeName}! 🙏";

        return implode("\n", $lines);
    }
}
