<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\CartResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Cart\CartService;
use App\Services\Tripay\CreateTransactionDto;
use App\Services\Tripay\TripayClient;
use App\Services\Tripay\TripayException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly TripayClient $tripay,
    ) {}

    /**
     * GET /api/checkout — preview cart (untuk sanity-check sebelum form).
     */
    public function preview(Request $request): JsonResponse
    {
        $sessionId = $request->cookie('cart_session') ?: (string) Str::uuid();
        $cart = $this->cartService->getOrCreateCart($sessionId);
        $cart->load(['items.product' => fn ($q) => $q->where('status', 'aktif')]);

        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * POST /api/checkout — proses checkout, hit Tripay, return kode_order.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $sessionId = $request->cookie('cart_session') ?? $request->input('session_id');

        if (! $sessionId) {
            return response()->json([
                'message' => 'Sesi keranjang tidak ditemukan. Silakan tambahkan produk ke keranjang dulu.',
                'code' => 'cart_session_missing',
            ], 422);
        }

        $cart = $this->cartService->getOrCreateCart($sessionId);
        $items = $cart->items()->with(['product' => fn ($q) => $q->where('status', 'aktif')])->get();

        if ($items->isEmpty()) {
            return response()->json([
                'message' => 'Keranjang kosong.',
                'code' => 'cart_empty',
            ], 422);
        }

        // Tahan semua ada yang non-aktif / sudah dihapus (race condition)
        $allActive = $items->every(fn ($i) => $i->product && $i->product->status === 'aktif');
        if (! $allActive) {
            return response()->json([
                'message' => 'Beberapa produk sudah tidak tersedia. Hapus dari keranjang.',
                'code' => 'cart_invalid_items',
            ], 422);
        }

        $fullTotal = (int) $items->sum(fn ($i) => $i->product->harga * $i->qty);

        // Pre-order handling: cart policy all-or-nothing. Mixed cart → 422.
        // Kalau semua item pre-orderable, amount yang di-charge ke Tripay = DP%
        // (bukan harga penuh). Saat release admin trigger manual — see PreorderReleaseService.
        $hasPreorder = $items->contains(fn ($i) => $i->product?->isPreOrderable());
        $hasNonPreorder = $items->contains(fn ($i) => $i->product && ! $i->product->isPreOrderable());

        if ($hasPreorder && $hasNonPreorder) {
            return response()->json([
                'message' => 'Tidak boleh campur produk pre-order dengan produk biasa dalam satu pesanan.',
                'code' => 'cart_mixed_preorder',
            ], 422);
        }

        if ($hasPreorder) {
            // Hitung DP per item. release_date di-order = max(item.release_date).
            $depositTotal = 0;
            $remainingTotal = 0;
            $maxReleaseDate = null;

            foreach ($items as $item) {
                $product = $item->product;
                $lineFull = (int) $item->product->harga * $item->qty;
                $lineDeposit = $product->depositAmount() * $item->qty;
                $lineRemaining = $lineFull - $lineDeposit;

                $depositTotal += $lineDeposit;
                $remainingTotal += $lineRemaining;

                // Track max release date untuk order (semua item share release date biasanya,
                // tapi max aman kalau ada heterogeneity).
                $productRelease = $product->release_date?->toDateString();
                if ($productRelease && ($maxReleaseDate === null || $productRelease > $maxReleaseDate)) {
                    $maxReleaseDate = $productRelease;
                }
            }

            if ($depositTotal < 100) {
                return response()->json([
                    'message' => 'Total DP minimal Rp 100.',
                    'code' => 'amount_too_small',
                ], 422);
            }

            // Untuk Tripay: amount = DP. Items payload pakai harga item asli (informational,
            // Tripay validasi total via signature). Admin/admin system aware via order.
            $total = $depositTotal;
            $preorderMeta = [
                'is_preorder' => true,
                'preorder_release_date' => $maxReleaseDate,
                'preorder_deposit_amount' => $depositTotal,
                'preorder_remaining_amount' => $remainingTotal,
            ];
        } else {
            if ($fullTotal < 100) {
                return response()->json([
                    'message' => 'Total belanja minimal Rp 100.',
                    'code' => 'amount_too_small',
                ], 422);
            }
            $total = $fullTotal;
            $preorderMeta = ['is_preorder' => false];
        }

        $kodeOrder = $this->generateKodeOrder();

        try {
            $order = DB::transaction(function () use ($items, $request, $total, $kodeOrder, $preorderMeta) {
                $orderData = [
                    'kode_order' => $kodeOrder,
                    'nama_pembeli' => $request->nama,
                    'email_pembeli' => $request->email,
                    'wa_pembeli' => $request->wa,
                    'total_harga' => $total,
                    'status' => 'pending',
                ] + $preorderMeta;

                $order = Order::create($orderData);

                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'nama_produk' => $item->product->nama,
                        'harga_saat_beli' => $item->product->harga,
                        'tipe_produk' => $item->product->tipe,
                    ]);
                }

                return $order;
            });

            // Untuk Tripay items payload: pakai line full price sebagai informational.
            // Tripay signature validasi amount total — yang kita set ke DP untuk pre-order.
            $tripayItems = $items->map(fn ($i) => [
                'sku' => (string) $i->product_id,
                'name' => $i->product->nama,
                'price' => (int) $i->product->harga,
                'quantity' => $i->qty,
            ])->toArray();

            $dto = new CreateTransactionDto(
                method: 'QRIS2',
                merchantRef: $kodeOrder,
                amount: $total,
                customerName: $request->nama,
                customerEmail: $request->email,
                customerPhone: $this->sanitizePhone($request->wa),
                orderItems: $tripayItems,
                expiredTime: time() + 3600, // Unix timestamp = now + 1 hour
                callbackUrl: config('services.tripay.callback_url') ?: null,
            );

            $tripayRes = $this->tripay->createTransaction($dto);

            $order->update([
                'tripay_reference' => $tripayRes['reference'],
                'qr_string' => $tripayRes['qr_string'] ?? null,
                'qr_url' => $tripayRes['qr_url'] ?? null,
                'qr_expired_at' => now()->addSeconds(3600),
            ]);

            // Clear cart setelah order berhasil
            $this->cartService->clear($sessionId);

            return response()->json([
                'data' => [
                    'kode_order' => $kodeOrder,
                    'redirect_url' => "/pembayaran/{$kodeOrder}",
                ],
                'message' => 'Order dibuat. Silakan lakukan pembayaran.',
            ], 201);
        } catch (TripayException $e) {
            Log::error('Checkout Tripay error', ['err' => $e->getMessage()]);

            return response()->json([
                'message' => 'Gagal membuat transaksi pembayaran: '.$e->getMessage(),
                'code' => 'tripay_error',
            ], 502);
        } catch (\Throwable $e) {
            Log::error('Checkout error', ['err' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'message' => 'Checkout gagal: '.$e->getMessage(),
                'code' => 'checkout_error',
            ], 500);
        }
    }

    /**
     * Format kode: EPS-YYYYMMDD-XXXX (4 char alphanumeric uppercase).
     */
    private function generateKodeOrder(): string
    {
        $date = now()->format('Ymd');
        $chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // exclude O/0 untuk keterbacaan
        do {
            $rand = '';
            for ($i = 0; $i < 5; $i++) {
                $rand .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code = "EPS-{$date}-{$rand}";
        } while (Order::where('kode_order', $code)->exists());

        return $code;
    }

    /**
     * Sanitasi phone — Tripay butuh format seperti 08123456789 (no +, no spaces).
     */
    private function sanitizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?? $phone;
    }
}
