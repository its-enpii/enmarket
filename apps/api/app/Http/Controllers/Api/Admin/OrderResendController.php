<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Delivery\OrderDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin manual trigger untuk re-deliver order yang notifikasi gagal.
 *
 * POST /api/admin/orders/{kodeOrder}/resend
 * Body: { "channel": "email" | "wa" | "all" } (default: all)
 *
 * Returns 200 kalau delivery rows ada & dispatched; 422 kalau order belum paid
 * atau belum ada delivery rows.
 */
class OrderResendController extends Controller
{
    public function __construct(
        private readonly OrderDeliveryService $deliveryService,
    ) {}

    public function resend(Request $request, string $kodeOrder): JsonResponse
    {
        $channel = $request->input('channel', 'all');

        if (! in_array($channel, ['email', 'wa', 'all'], true)) {
            return response()->json([
                'message' => 'Channel tidak valid. Pakai: email | wa | all.',
            ], 422);
        }

        $order = Order::where('kode_order', $kodeOrder)
            ->with(['items.delivery'])
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order tidak ditemukan.'], 404);
        }

        if ($order->status !== 'paid') {
            return response()->json([
                'message' => "Order belum paid (status: {$order->status}). Tidak bisa kirim notifikasi.",
            ], 422);
        }

        $deliveries = $order->items->pluck('delivery')->filter()->all();
        if (empty($deliveries)) {
            return response()->json([
                'message' => 'Belum ada delivery rows. Jalankan generate dulu (akan dibuat kalau order sudah paid).',
            ], 422);
        }

        // Reset sent_at timestamps untuk channel yang di-resend
        $resetFields = match ($channel) {
            'email' => ['email_sent_at' => null],
            'wa' => ['wa_sent_at' => null],
            'all' => ['email_sent_at' => null, 'wa_sent_at' => null],
        };
        foreach ($deliveries as $d) {
            $d->forceFill($resetFields)->save();
        }

        // Dispatch ulang via service (akan set timestamp lagi kalau sukses)
        $this->deliveryService->notifyOnly($order, $deliveries);

        Log::info("Admin resend notification for order {$kodeOrder}", [
            'channel' => $channel,
            'count' => count($deliveries),
        ]);

        return response()->json([
            'message' => 'Notifikasi sedang dikirim ulang.',
            'order' => $kodeOrder,
            'channel' => $channel,
            'deliveries' => count($deliveries),
        ]);
    }
}