<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Delivery\OrderDeliveryService;
use App\Services\Tripay\TripayClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Callback Tripay — verify HMAC signature, update order status.
 *
 * Tripay mengirim POST dengan header X-Callback-Signature (HMAC-SHA256 hex
 * dari raw body). Mapping status Tripay → internal kita.
 */
class TripayCallbackController extends Controller
{
    public function __construct(
        private readonly TripayClient $tripay,
        private readonly OrderDeliveryService $deliveryService,
    ) {
    }

    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-Callback-Signature', '');

        if (! $signature) {
            Log::warning('Tripay callback: missing X-Callback-Signature header');
            return response()->json(['message' => 'Missing signature'], 400);
        }

        $payload = $this->tripay->verifyCallback($rawBody, $signature);
        if ($payload === null) {
            Log::warning('Tripay callback: invalid signature');
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $reference = $payload['reference'] ?? null;
        $status = strtoupper((string) ($payload['status'] ?? ''));

        if (! $reference || ! $status) {
            Log::warning('Tripay callback: missing reference or status', $payload);
            return response()->json(['message' => 'Missing fields'], 400);
        }

        $order = Order::where('tripay_reference', $reference)->first();
        if (! $order) {
            Log::warning("Tripay callback: order not found for ref {$reference}");
            return response()->json(['message' => 'Order not found'], 404);
        }

        $map = [
            'PAID' => 'paid',
            'UNPAID' => 'pending',
            'EXPIRED' => 'expired',
            'FAILED' => 'failed',
            'REFUND' => 'refunded',
        ];

        $newStatus = $map[$status] ?? null;
        if ($newStatus === null) {
            Log::warning("Tripay callback: unknown status '{$status}'");
            return response()->json(['message' => 'Unknown status'], 400);
        }

        // Update sesuai transisi status
        $update = ['status' => $newStatus];
        if ($newStatus === 'paid' && $order->status !== 'paid') {
            $update['paid_at'] = now();
            $order->update($update);

            // Trigger delivery generation (idempotent via OrderDeliveryService)
            try {
                $deliveries = $this->deliveryService->generateForOrder($order);
                Log::info("Order {$order->kode_order} paid — {$this->countDeliveries($deliveries)} deliveries created");
            } catch (\Throwable $e) {
                // Jangan fail callback kalau delivery gagal — bisa di-retry manual
                Log::error("Order {$order->kode_order} paid but delivery failed", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        } else {
            $order->update($update);
        }

        return response()->json(['success' => true]);
    }

    private function countDeliveries(array $deliveries): int
    {
        return count($deliveries);
    }
}