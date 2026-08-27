<?php

namespace App\Mail;

use App\Models\AccountProvisioning;
use App\Models\Order;
use App\Models\OrderDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable for order invoice — covers order.paid, preorder.ready, and account.ready events.
 */
class OrderInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  string  $eventType  order_paid | preorder_ready | account_ready
     * @param  array<int, OrderDelivery>  $deliveries  For order_paid / preorder_ready
     */
    public function __construct(
        public readonly Order $order,
        public readonly string $eventType,
        public readonly array $deliveries = [],
        public readonly ?AccountProvisioning $provisioning = null,
        public readonly string $siteUrl = '',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'order_paid' => "Invoice Pesanan {$this->order->kode_order} — Produk Siap Diunduh",
            'preorder_ready' => "Pre-order {$this->order->kode_order} Sudah Rilis!",
            'account_ready' => "Akun Anda Siap — Pesanan {$this->order->kode_order}",
        ];

        return new Envelope(
            subject: $subjects[$this->eventType] ?? "Pesanan {$this->order->kode_order}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-invoice',
        );
    }
}
