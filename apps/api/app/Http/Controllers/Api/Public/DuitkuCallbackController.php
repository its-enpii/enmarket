<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Duitku\DuitkuClient;
use App\Services\Payment\OrderPaidHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Callback Duitku — verify MD5 signature, delegate to OrderPaidHandler.
 *
 * Duitku sends POST form-encoded with fields: merchantCode, amount,
 * merchantOrderId, productDetail, additionalParam, paymentCode,
 * resultCode, merchantUserId, reference, signature, publisherOrderId.
 *
 * Signature = md5(merchantCode + amount + merchantOrderId + apiKey).
 */
class DuitkuCallbackController extends Controller
{
    public function __construct(
        private readonly DuitkuClient $duitku,
        private readonly OrderPaidHandler $paidHandler,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $merchantOrderId = (string) $request->input('merchantOrderId', '');
        $amount = (string) $request->input('amount', '');
        $signature = (string) $request->input('signature', '');
        $resultCode = (string) $request->input('resultCode', '');

        if (! $merchantOrderId || ! $amount || ! $signature) {
            Log::warning('Duitku callback: missing required fields', $request->all());

            return response()->json(['message' => 'Missing required fields'], 400);
        }

        $payload = $this->duitku->verifyCallback($merchantOrderId, $amount, $signature);

        if ($payload === null) {
            Log::warning('Duitku callback: invalid signature');

            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $order = Order::where('kode_order', $merchantOrderId)->first();

        if (! $order) {
            Log::warning("Duitku callback: order not found for merchantOrderId {$merchantOrderId}");

            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($resultCode === '00' || $resultCode === '0') {
            $this->paidHandler->handle($order, $request->input('paymentCode'));
        } elseif ($resultCode === '01') {
            if ($order->status === 'pending') {
                $order->update(['status' => 'failed']);
            }
        }

        return response()->json(['success' => true]);
    }
}
