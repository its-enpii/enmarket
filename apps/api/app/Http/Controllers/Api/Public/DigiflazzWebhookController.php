<?php

namespace App\Http\Controllers\Api\Public;

use App\Models\Order;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Digiflazz\DigiflazzClient;
use App\Services\Digiflazz\DigiflazzException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook callback dari Digiflazz untuk status update top-up (pending → success/gagal).
 *
 * Signature: HMAC-SHA256 hex of raw body using `DIGIFLAZZ_WEBHOOK_SECRET`,
 * dikirim di header `x-digiflazz-signature`.
 *
 * Payload (typical):
 * {
 *   "data": {
 *     "trx_id": "...",
 *     "ref_id": "EPS-XXXXXXXX",
 *     "buyer_sku_code": "ML100",
 *     "customer_no": "123456789",
 *     "status": "Sukses",   // or "Gagal" / "Pending"
 *     "rc": "00",
 *     "sn": "...",
 *     "message": "..."
 *   }
 * }
 */
class DigiflazzWebhookController
{
    public function __construct(
        private readonly DigiflazzClient $digiflazz,
        private readonly NotificationDispatcher $notifier,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-digiflazz-signature')
            ?? $request->header('X-Digiflazz-Signature');

        if (! $this->digiflazz->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('Digiflazz webhook: invalid signature', [
                'has_signature' => ! empty($signature),
                'body_prefix' => substr($rawBody, 0, 200),
            ]);

            return response()->json(['message' => 'invalid signature'], 400);
        }

        $payload = json_decode($rawBody, true);
        $data = $payload['data'] ?? null;

        if (! is_array($data) || empty($data['ref_id'])) {
            Log::warning('Digiflazz webhook: malformed payload', ['payload' => $payload]);

            return response()->json(['message' => 'malformed payload'], 422);
        }

        $refId = (string) $data['ref_id'];
        $order = Order::where('kode_order', $refId)->first();

        if (! $order || ! $order->isTopupOrder()) {
            Log::warning('Digiflazz webhook: order not found or not a top-up', ['ref_id' => $refId]);

            return response()->json(['message' => 'order not found'], 404);
        }

        $status = strtolower((string) ($data['status'] ?? ''));
        $topupStatus = match ($status) {
            'sukses' => 'success',
            'pending' => 'processing',
            'gagal' => 'failed',
            default => 'processing',
        };

        $order->update([
            'topup_status' => $topupStatus,
            'digiflazz_trx_id' => (string) ($data['trx_id'] ?? $order->digiflazz_trx_id),
            'digiflazz_response' => $data,
        ]);

        // Notify buyer kalau status terminal (success/fail)
        if (in_array($topupStatus, ['success', 'failed'], true)) {
            try {
                $this->notifier->notifyTopupResult($order);
            } catch (\Throwable $e) {
                Log::error('Digiflazz webhook notification failed', [
                    'order' => $order->kode_order,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json(['message' => 'ok'], 200);
    }
}
