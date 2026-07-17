<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Delivery\OrderDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin manual trigger untuk re-deliver order.
 *
 * POST /api/admin/orders/{kodeOrder}/resend
 *   Body: { "channel": "email" | "wa" | "all" } (default: all)
 *
 * POST /api/admin/orders/{kodeOrder}/regenerate-token
 *   Body: { "order_item_id": int }
 *   Issue token baru + extend 7 hari + re-email.
 *
 * POST /api/admin/orders/{kodeOrder}/generate-deliveries
 *   Re-trigger service generateForOrder (idempotent).
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

    /**
     * Issue token baru untuk satu order_item + extend 7 hari + re-dispatch email/WA.
     */
    public function regenerateToken(Request $request, string $kodeOrder): JsonResponse
    {
        $request->validate([
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
        ]);

        $item = OrderItem::with(['delivery', 'order'])
            ->find($request->integer('order_item_id'));

        if (! $item || $item->order->kode_order !== $kodeOrder) {
            return response()->json([
                'message' => 'Item tidak ditemukan di order ini.',
            ], 404);
        }

        if ($item->order->status !== 'paid') {
            return response()->json([
                'message' => 'Order belum paid.',
            ], 422);
        }

        if (! $item->delivery || ! $item->hasDownloadableFile()) {
            return response()->json([
                'message' => 'Item ini tidak punya download token.',
            ], 422);
        }

        $delivery = $this->deliveryService->regenerateToken($item->delivery);

        Log::info('Admin regenerate token', [
            'order' => $kodeOrder,
            'order_item_id' => $item->id,
            'new_token_prefix' => substr($delivery->download_token ?? '', 0, 8).'…',
        ]);

        return response()->json([
            'message' => 'Token baru telah dibuat.',
            'delivery' => [
                'order_item_id' => $item->id,
                'download_token' => $delivery->download_token,
                'token_expired_at' => $delivery->token_expired_at?->toIso8601String(),
                'is_valid' => $delivery->isDownloadValid(),
            ],
        ]);
    }

    /**
     * Re-trigger full delivery generation (untuk order paid tapi deliveries
     * belum/bermasalah di-generate).
     */
    public function generateDeliveries(string $kodeOrder): JsonResponse
    {
        $order = Order::where('kode_order', $kodeOrder)
            ->with(['items.product', 'items.delivery'])
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        if ($order->status !== 'paid') {
            return response()->json([
                'message' => "Order belum paid (status: {$order->status}).",
            ], 422);
        }

        $created = $this->deliveryService->generateForOrder($order);

        return response()->json([
            'message' => count($created).' delivery rows diproses.',
            'order' => $kodeOrder,
        ]);
    }
}
