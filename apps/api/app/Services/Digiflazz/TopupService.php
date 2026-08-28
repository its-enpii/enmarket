<?php

namespace App\Services\Digiflazz;

use App\Models\Order;
use App\Services\Delivery\NotificationDispatcher;
use Illuminate\Support\Facades\Log;

class TopupService
{
    public function __construct(
        private readonly DigiflazzClient $client,
        private readonly NotificationDispatcher $notifier,
    ) {}

    /**
     * Process a top-up order via Digiflazz.
     *
     * @return array{status:string, message:string, sn?:string}
     *
     * @throws \InvalidArgumentException
     */
    public function process(Order $order): array
    {
        if (! $order->isTopupOrder()) {
            throw new \InvalidArgumentException("Order #{$order->id} is not a top-up order.");
        }

        if (empty($order->game_user_id)) {
            throw new \InvalidArgumentException("Order #{$order->id} missing game_user_id.");
        }

        if (empty($order->contact_value)) {
            throw new \InvalidArgumentException("Order #{$order->id} missing contact_value.");
        }

        $order->update(['topup_status' => 'processing']);

        $order->loadMissing('gameItem');

        $customerNo = $order->game_user_id;
        if (! empty($order->game_server_id)) {
            $customerNo .= $order->game_server_id;
        }

        try {
            $result = $this->client->topup(
                buyerSkuCode: $order->gameItem->digiflazz_sku,
                customerNo: $customerNo,
                refId: $order->kode_order,
            );

            if (($result['status'] ?? '') === 'Sukses') {
                $order->update([
                    'topup_status' => 'success',
                    'digiflazz_trx_id' => $result['ref_id'] ?? null,
                    'digiflazz_response' => $result,
                ]);
            } else {
                $order->update([
                    'topup_status' => 'failed',
                    'digiflazz_trx_id' => $result['ref_id'] ?? null,
                    'digiflazz_response' => $result,
                ]);

                Log::warning('Digiflazz topup failed', [
                    'order_id' => $order->id,
                    'kode_order' => $order->kode_order,
                    'result' => $result,
                ]);
            }

            $this->notifier->notifyTopupResult($order);

            return $result;
        } catch (DigiflazzException $e) {
            $order->update([
                'topup_status' => 'failed',
                'digiflazz_response' => ['error' => $e->getMessage()],
            ]);

            Log::error('Digiflazz topup exception', [
                'order_id' => $order->id,
                'kode_order' => $order->kode_order,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
