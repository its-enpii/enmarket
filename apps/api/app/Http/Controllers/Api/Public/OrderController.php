<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /api/orders/{kode_order}/status — polling ringan.
     */
    public function status(Request $request, string $kodeOrder): JsonResponse
    {
        $order = Order::where('kode_order', $kodeOrder)->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => (new OrderResource($order))->additional([
                'public_view' => 'status',
            ])->resolve($request),
        ]);
    }

    /**
     * GET /api/orders/{kode_order}/public — full detail by kode_order only.
     *
     * kode_order adalah token effectively (32^5 combinations + 8 digit date).
     * Untuk halaman pembayaran/success di mana buyer langsung akses dari checkout flow.
     * Email verification tetap diperlukan di endpoint show() untuk "cek pesanan".
     */
    public function showPublic(Request $request, string $kodeOrder): JsonResponse
    {
        $order = Order::where('kode_order', $kodeOrder)->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        $order->load(['items.delivery.licenseKey']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * GET /api/orders/{kode_order} — detail lengkap (butuh email verification).
     * Pakai query param ?email=... untuk verifikasi.
     */
    public function show(Request $request, string $kodeOrder): JsonResponse
    {
        $email = $request->query('email', '');
        $order = Order::where('kode_order', $kodeOrder)->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        // Simple verification: kode_order + email harus match
        if (strtolower($order->email_pembeli) !== strtolower($email)) {
            return response()->json([
                'message' => 'Email tidak cocok dengan kode order.',
            ], 403);
        }

        $order->load(['items.delivery.licenseKey']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * POST /api/orders/check — verify + return order summary.
     */
    public function check(CheckOrderRequest $request): JsonResponse
    {
        $order = Order::where('kode_order', $request->kode_order)
            ->whereRaw('LOWER(email_pembeli) = ?', [strtolower($request->email)])
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Kode order atau email tidak cocok. Cek lagi.',
            ], 404);
        }

        $order->load(['items.delivery.licenseKey']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }
}