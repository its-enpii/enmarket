<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\TopupCheckoutRequest;
use App\Http\Requests\TopupPreviewRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Services\Duitku\CreateTransactionDto as DuitkuTransactionDto;
use App\Services\Duitku\DuitkuClient;
use App\Services\Duitku\DuitkuException;
use App\Services\Tripay\CreateTransactionDto as TripayTransactionDto;
use App\Services\Tripay\TripayClient;
use App\Services\Tripay\TripayException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TopupController extends Controller
{
    public function __construct(
        private readonly TripayClient $tripay,
        private readonly DuitkuClient $duitku,
    ) {}

    public function games(): JsonResponse
    {
        $games = Game::where('active', true)
            ->with(['items' => fn ($q) => $q->where('active', true)])
            ->orderBy('sort_order')
            ->orderBy('nama')
            ->get();

        return response()->json([
            'data' => GameResource::collection($games),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $game = Game::where('slug', $slug)
            ->where('active', true)
            ->with(['items' => fn ($q) => $q->where('active', true)])
            ->first();

        if (! $game) {
            return response()->json(['message' => 'Game tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => new GameResource($game),
        ]);
    }

    public function preview(TopupPreviewRequest $request): JsonResponse
    {
        $game = Game::where('id', $request->game_id)->where('active', true)->first();
        if (! $game) {
            return response()->json(['message' => 'Game tidak aktif.'], 422);
        }

        if ($game->requires_server_id && empty($request->server_id)) {
            return response()->json([
                'message' => 'Server ID diperlukan untuk game ini.',
                'errors' => ['server_id' => ['Server ID diperlukan untuk game ini.']],
            ], 422);
        }

        $item = GameItem::where('id', $request->game_item_id)
            ->where('game_id', $request->game_id)
            ->where('active', true)
            ->first();

        if (! $item) {
            return response()->json(['message' => 'Item tidak aktif atau tidak valid.'], 422);
        }

        return response()->json([
            'data' => [
                'game' => $game->nama,
                'item' => $item->nama,
                'harga' => (string) $item->harga,
                'harga_formatted' => 'Rp ' . number_format((float) $item->harga, 0, ',', '.'),
                'total' => (int) $item->harga,
                'contact_type' => $request->contact_type,
                'contact_value' => $request->contact_value,
                'payment_gateways' => $this->enabledPaymentGateways(),
            ],
        ]);
    }

    public function checkout(TopupCheckoutRequest $request): JsonResponse
    {
        $game = Game::where('id', $request->game_id)->where('active', true)->first();
        if (! $game) {
            return response()->json(['message' => 'Game tidak aktif.'], 422);
        }

        if ($game->requires_server_id && empty($request->server_id)) {
            return response()->json([
                'message' => 'Server ID diperlukan untuk game ini.',
                'errors' => ['server_id' => ['Server ID diperlukan untuk game ini.']],
            ], 422);
        }

        $item = GameItem::where('id', $request->game_item_id)
            ->where('game_id', $request->game_id)
            ->where('active', true)
            ->first();

        if (! $item) {
            return response()->json(['message' => 'Item tidak aktif atau tidak valid.'], 422);
        }

        $gateway = (string) $request->payment_gateway;
        $enabled = $this->enabledPaymentGateways();

        if (! in_array($gateway, $enabled, true)) {
            return response()->json([
                'message' => "Payment gateway '{$gateway}' tidak aktif di pengaturan admin.",
                'enabled' => $enabled,
            ], 422);
        }

        // payment_method/channel resolution:
        // - Kalau admin set default di config (DUITKU_DEFAULT_METHOD=SP, Tripay pakai 'QRIS2'),
        //   dan customer tidak pilih, pakai default.
        $paymentMethod = $request->input('payment_method');
        if (empty($paymentMethod)) {
            $paymentMethod = $gateway === 'duitku'
                ? (string) config('services.duitku.default_method', 'SP')
                : 'QRIS2';
        }

        $total = (int) $item->harga;
        $kodeOrder = $this->generateKodeOrder();

        $contactName = $request->contact_type === 'phone'
            ? 'Topup ' . $game->nama
            : $request->contact_value;

        try {
            $order = DB::transaction(function () use (
                $request, $game, $item, $total, $kodeOrder, $contactName, $gateway, $paymentMethod
            ) {
                return Order::create([
                    'kode_order' => $kodeOrder,
                    'nama_pembeli' => $contactName,
                    'email_pembeli' => $request->contact_type === 'email' ? $request->contact_value : null,
                    'wa_pembeli' => $request->contact_type === 'phone' ? $request->contact_value : null,
                    'total_harga' => $total,
                    'status' => 'pending',
                    'is_topup_order' => true,
                    'game_id' => $game->id,
                    'game_item_id' => $item->id,
                    'game_user_id' => $request->user_id,
                    'game_server_id' => $request->server_id,
                    'contact_type' => $request->contact_type,
                    'contact_value' => $request->contact_value,
                    'topup_status' => 'pending',
                    'payment_gateway' => $gateway,
                    'payment_channel' => $paymentMethod,
                ]);
            });

            // Dispatch ke payment gateway sesuai setting admin
            if ($gateway === 'duitku') {
                $res = $this->createDuitkuTransaction($order, $game, $item, $total, $contactName, $request, $paymentMethod);
                return response()->json([
                    'data' => [
                        'kode_order' => $kodeOrder,
                        'gateway' => 'duitku',
                        'payment_url' => $res['paymentUrl'],
                        'payment_method' => $paymentMethod,
                        'expired_at' => $res['expiredAt'] ?? null,
                        'redirect_url' => "/topup/{$game->slug}?status=pending&kode={$kodeOrder}",
                    ],
                    'message' => 'Top-up order created. Silakan lakukan pembayaran.',
                ], 201);
            }

            // Default: Tripay
            $res = $this->createTripayTransaction($order, $game, $item, $total, $contactName, $request);
            return response()->json([
                'data' => [
                    'kode_order' => $kodeOrder,
                    'gateway' => 'tripay',
                    'payment_method' => $paymentMethod,
                    'qr_url' => $res['qr_url'] ?? null,
                    'qr_string' => $res['qr_string'] ?? null,
                    'reference' => $res['reference'] ?? null,
                    'expired_at' => isset($res['expired_at']) ? (string) $res['expired_at'] : null,
                    'redirect_url' => "/pembayaran/{$kodeOrder}",
                ],
                'message' => 'Top-up order created. Silakan lakukan pembayaran.',
            ], 201);
        } catch (TripayException $e) {
            Log::error('Topup checkout Tripay error', ['err' => $e->getMessage(), 'order' => $kodeOrder]);
            return $this->gatewayErrorResponse('tripay', $e, $kodeOrder);
        } catch (DuitkuException $e) {
            Log::error('Topup checkout Duitku error', ['err' => $e->getMessage(), 'order' => $kodeOrder]);
            return $this->gatewayErrorResponse('duitku', $e, $kodeOrder);
        } catch (\Throwable $e) {
            Log::error('Topup checkout error', ['err' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage(),
                'code' => 'checkout_error',
            ], 500);
        }
    }

    /**
     * Create Tripay transaction untuk top-up order.
     *
     * @return array{reference:string, qr_string:?string, qr_url:?string, expired_at:?int}
     */
    private function createTripayTransaction(
        Order $order,
        Game $game,
        GameItem $item,
        int $total,
        string $contactName,
        TopupCheckoutRequest $request,
    ): array {
        $dto = new TripayTransactionDto(
            method: 'QRIS2',
            merchantRef: $order->kode_order,
            amount: $total,
            customerName: $contactName,
            customerEmail: $request->contact_type === 'email' ? $request->contact_value : 'topup@enpiistudio.com',
            customerPhone: $request->contact_type === 'phone' ? $this->sanitizePhone($request->contact_value) : '08000000000',
            orderItems: [[
                'sku' => $item->digiflazz_sku,
                'name' => $game->nama . ' - ' . $item->nama,
                'price' => $total,
                'quantity' => 1,
            ]],
            expiredTime: time() + 3600,
            callbackUrl: config('services.tripay.callback_url') ?: null,
        );

        $res = $this->tripay->createTransaction($dto);

        $order->update([
            'tripay_reference' => $res['reference'],
            'qr_string' => $res['qr_string'] ?? null,
            'qr_url' => $res['qr_url'] ?? null,
            'qr_expired_at' => now()->addSeconds(3600),
        ]);

        return [
            'reference' => $res['reference'],
            'qr_string' => $res['qr_string'] ?? null,
            'qr_url' => $res['qr_url'] ?? null,
            'expired_at' => time() + 3600,
        ];
    }

    /**
     * Create Duitku transaction untuk top-up order.
     *
     * @return array{paymentUrl:string, qrString:?string, expiredAt:?string}
     */
    private function createDuitkuTransaction(
        Order $order,
        Game $game,
        GameItem $item,
        int $total,
        string $contactName,
        TopupCheckoutRequest $request,
        string $paymentMethod,
    ): array {
        $expiryPeriod = (int) config('services.duitku.expiry_period', 1440);

        $dto = new DuitkuTransactionDto(
            paymentMethod: $paymentMethod,
            merchantOrderId: $order->kode_order,
            amount: $total,
            productDetails: $game->nama . ' - ' . $item->nama,
            customerEmail: $request->contact_type === 'email' ? $request->contact_value : 'topup@enpiistudio.com',
            customerName: $contactName,
            callbackUrl: config('services.duitku.callback_url') ?: null,
            returnUrl: config('services.duitku.return_url') ?: null,
            expiryPeriod: $expiryPeriod,
        );

        $res = $this->duitku->createTransaction($dto);

        $order->update([
            'qr_url' => $res['paymentUrl'] ?? null,
            'qr_string' => $res['qrString'] ?? null,
            'qr_expired_at' => isset($res['expiredAt']) ? $res['expiredAt'] : null,
        ]);

        return [
            'paymentUrl' => $res['paymentUrl'],
            'qrString' => $res['qrString'] ?? null,
            'expiredAt' => $res['expiredAt'] ?? null,
        ];
    }

    /**
     * Ambil daftar payment gateway yang diaktifkan admin via SiteSetting.
     *
     * @return array<int, string>  e.g. ['tripay', 'duitku']
     */
    private function enabledPaymentGateways(): array
    {
        $raw = Cache::rememberForever('site_settings:all', function () {
            return SiteSetting::all()
                ->mapWithKeys(fn (SiteSetting $s) => [$s->key => $s->value])
                ->all();
        });

        $value = $raw['payment_gateways'] ?? null;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : null;
        }

        $enabled = [];
        if (is_array($value)) {
            foreach (['tripay', 'duitku'] as $gw) {
                if (! empty($value[$gw]['enabled'])) {
                    $enabled[] = $gw;
                }
            }
        }

        // Fallback kalau setting belum di-save: tripay default ON (back-compat)
        if (empty($enabled)) {
            $enabled = ['tripay'];
        }

        return $enabled;
    }

    private function gatewayErrorResponse(string $gateway, \Throwable $e, string $kodeOrder): JsonResponse
    {
        Log::error("Topup checkout {$gateway} error", [
            'order' => $kodeOrder,
            'err' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => "Gagal membuat transaksi pembayaran ({$gateway}): " . $e->getMessage(),
            'code' => "{$gateway}_error",
        ], 502);
    }

    private function generateKodeOrder(): string
    {
        $date = now()->format('Ymd');
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $rand = '';
            for ($i = 0; $i < 5; $i++) {
                $rand .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code = "EPS-{$date}-{$rand}";
        } while (Order::where('kode_order', $code)->exists());

        return $code;
    }

    private function sanitizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?? $phone;
    }
}
