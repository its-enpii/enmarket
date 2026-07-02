<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\Delivery\NotificationDispatcher;
use Illuminate\Console\Command;

/**
 * Test delivery payload generation untuk satu order.
 * Pakai NotificationDispatcher (mode DEV) untuk dump payload + auto-mark sent_at.
 *
 * Usage:
 *   php artisan enmarket:test-delivery                          # order paid terbaru
 *   php artisan enmarket:test-delivery --kode=EPS-20260702-AB12 # specific order
 *
 * Berguna untuk verifikasi payload structure tanpa kirim real.
 */
class TestDeliveryCommand extends Command
{
    protected $signature = 'enmarket:test-delivery {--kode= : Specific kode_order (default: paid terbaru)}';

    protected $description = 'Test delivery dispatch untuk order (DEV mode: dump payload ke log + auto-mark sent_at)';

    public function handle(NotificationDispatcher $dispatcher): int
    {
        $kode = $this->option('kode');

        $order = $kode
            ? Order::where('kode_order', $kode)->with(['items.delivery'])->first()
            : Order::where('status', 'paid')->with(['items.delivery'])->latest()->first();

        if (! $order) {
            $this->error("Order tidak ditemukan" . ($kode ? " (kode: {$kode})" : ' (tidak ada order paid)'));
            return self::FAILURE;
        }

        $deliveries = $order->items->pluck('delivery')->filter()->all();
        if (empty($deliveries)) {
            $this->warn("Order {$order->kode_order} belum ada delivery rows.");
            $this->warn("Generate dulu: POST /api/admin/orders/{$order->kode_order}/generate-deliveries");
            return self::FAILURE;
        }

        $this->info("Order: {$order->kode_order} ({$order->nama_pembeli})");
        $this->info("Items: {$order->items->count()}, deliveries: " . count($deliveries));

        $dispatcher->dispatchOrderPaid($order, $deliveries);

        $this->info("✓ Dispatched. Cek storage/logs/laravel.log untuk payload detail.");
        return self::SUCCESS;
    }
}