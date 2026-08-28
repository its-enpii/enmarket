<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\TopupCheckoutRequest;
use App\Http\Requests\TopupPreviewRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Services\Tripay\CreateTransactionDto;
use App\Services\Tripay\TripayClient;
use App\Services\Tripay\TripayException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TopupController extends Controller
{
    public function __construct(
        private readonly TripayClient $tripay,
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
                'payment_gateways' => ['tripay'],
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

        $total = (int) $item->harga;
        $kodeOrder = $this->generateKodeOrder();

        $contactName = $request->contact_type === 'phone'
            ? 'Topup ' . $game->nama
            : $request->contact_value;

        try {
            $order = DB::transaction(function () use (
                $request, $game, $item, $total, $kodeOrder, $contactName
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
                    'payment_gateway' => $request->payment_gateway,
                ]);
            });

            $tripayItems = [[
                'sku' => $item->digiflazz_sku,
                'name' => $game->nama . ' - ' . $item->nama,
                'price' => $total,
                'quantity' => 1,
            ]];

            $dto = new CreateTransactionDto(
                method: 'QRIS2',
                merchantRef: $kodeOrder,
                amount: $total,
                customerName: $contactName,
                customerEmail: $request->contact_type === 'email' ? $request->contact_value : 'topup@enpiistudio.com',
                customerPhone: $request->contact_type === 'phone' ? $this->sanitizePhone($request->contact_value) : '08000000000',
                orderItems: $tripayItems,
                expiredTime: time() + 3600,
                callbackUrl: config('services.tripay.callback_url') ?: null,
            );

            $tripayRes = $this->tripay->createTransaction($dto);

            $order->update([
                'tripay_reference' => $tripayRes['reference'],
                'qr_string' => $tripayRes['qr_string'] ?? null,
                'qr_url' => $tripayRes['qr_url'] ?? null,
                'qr_expired_at' => now()->addSeconds(3600),
            ]);

            return response()->json([
                'data' => [
                    'kode_order' => $kodeOrder,
                    'redirect_url' => "/pembayaran/{$kodeOrder}",
                ],
                'message' => 'Top-up order created. Silakan lakukan pembayaran.',
            ], 201);
        } catch (TripayException $e) {
            Log::error('Topup checkout Tripay error', ['err' => $e->getMessage()]);

            return response()->json([
                'message' => 'Gagal membuat transaksi pembayaran: ' . $e->getMessage(),
                'code' => 'tripay_error',
            ], 502);
        } catch (\Throwable $e) {
            Log::error('Topup checkout error', ['err' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage(),
                'code' => 'checkout_error',
            ], 500);
        }
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
