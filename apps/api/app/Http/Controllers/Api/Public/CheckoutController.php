<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\CartResource;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Auth\WhatsappOtpService;
use App\Services\Cart\CartService;
use App\Services\Delivery\OrderDeliveryService;
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
        private readonly OrderDeliveryService $deliveryService,
    ) {}

    /**
     * GET /api/checkout â€” preview cart (untuk sanity-check sebelum form).
     */
    public function preview(Request $request): JsonResponse
    {
        $sessionId = $request->cookie('cart_session') ?: (string) Str::uuid();
        $userId = $request->user('sanctum')?->id;
        $cart = $this->cartService->getOrCreateCart($sessionId, $userId);
        $cart->load(['items.product' => fn ($q) => $q->where('status', 'aktif')]);

        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * POST /api/checkout/apply-coupon â€” validasi kupon dan kalkulasi diskon.
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'cart_total' => ['required', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim((string) $request->input('code')));
        $cartTotal = (float) $request->input('cart_total');

        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Kode kupon tidak ditemukan.',
            ]);
        }

        if (! $coupon->active) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Kupon sudah tidak aktif.',
            ]);
        }

        if ($coupon->valid_from && $coupon->valid_from->isFuture()) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Kupon belum dapat digunakan.',
            ]);
        }

        if ($coupon->valid_until && $coupon->valid_until->isPast()) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Kupon sudah kadaluarsa.',
            ]);
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Batas pemakaian kupon telah habis.',
            ]);
        }

        if ($coupon->min_order !== null && $cartTotal < (float) $coupon->min_order) {
            return response()->json([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => (int) $cartTotal,
                'message' => 'Minimal belanja untuk kupon ini adalah Rp '.number_format((float) $coupon->min_order, 0, ',', '.').'.',
            ]);
        }

        $discount = $coupon->calculateDiscount($cartTotal);
        $finalTotal = max(0, (int) round($cartTotal - $discount));

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'discount_amount' => $discount,
            'final_total' => $finalTotal,
            'message' => 'Kupon berhasil diterapkan.',
        ]);
    }

    /**
     * POST /api/checkout â€” proses checkout, hit Tripay, return kode_order.
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

        $userId = $request->user('sanctum')?->id;
        if (! $userId && $request->wa) {
            $user = User::where('phone', $request->wa)
                ->orWhere('phone', WhatsappOtpService::normalizePhone($request->wa))
                ->first();
            $userId = $user?->id;
        }

        $cart = $this->cartService->getOrCreateCart($sessionId, $userId);
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

        // Free vs paid cart policy: all-or-nothing (seperti pre-order).
        // Cart campuran free + berbayar â†’ 422. Pembeli harus pisah cart jadi 2 order.
        // Checkout free skip payment gateway, jadi tidak bisa diproses sebagian.
        $hasFree = $items->contains(fn ($i) => $i->product?->isFree());
        $hasPaid = $items->contains(fn ($i) => $i->product && ! $i->product->isFree());

        if ($hasFree && $hasPaid) {
            return response()->json([
                'message' => 'Tidak boleh campur produk gratis dengan produk berbayar dalam satu pesanan.',
                'code' => 'cart_free_mixed',
            ], 422);
        }

        $fullTotal = (int) $items->sum(fn ($i) => $i->product->harga * $i->qty);

        // Pre-order handling: cart policy all-or-nothing. Mixed cart â†’ 422.
        // Kalau semua item pre-orderable, amount yang di-charge ke Tripay = DP%
        // (bukan harga penuh). Saat release admin trigger manual â€” see PreorderReleaseService.
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
        } elseif ($hasFree) {
            // Free cart: fullTotal == 0 (backend auto-set harga=0 saat is_free).
            // Skip Tripay â€” order langsung dibuat dengan status `free` + paid_at.
            // Delivery di-trigger synchronously di dalam transaction supaya buyer
            // langsung dapat download token saat landing di /pesanan-sukses.
            $total = 0;
            $preorderMeta = ['is_preorder' => false];
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

        // Coupon handling
        $appliedCoupon = null;
        if ($request->filled('coupon_code')) {
            $code = strtoupper(trim((string) $request->input('coupon_code')));
            $appliedCoupon = Coupon::where('code', $code)->first();

            if (! $appliedCoupon || ! $appliedCoupon->active) {
                return response()->json([
                    'message' => 'Kupon tidak valid atau tidak aktif.',
                    'code' => 'invalid_coupon',
                ], 422);
            }

            if (($appliedCoupon->valid_from && $appliedCoupon->valid_from->isFuture()) ||
                ($appliedCoupon->valid_until && $appliedCoupon->valid_until->isPast()) ||
                ($appliedCoupon->max_uses !== null && $appliedCoupon->used_count >= $appliedCoupon->max_uses) ||
                ($appliedCoupon->min_order !== null && $total < (float) $appliedCoupon->min_order)) {
                return response()->json([
                    'message' => 'Kupon tidak dapat digunakan untuk pesanan ini.',
                    'code' => 'coupon_conditions_not_met',
                ], 422);
            }

            $discount = $appliedCoupon->calculateDiscount($total);
            $total = max(100, $total - $discount);
        }

        $kodeOrder = $this->generateKodeOrder();

        try {
            $order = DB::transaction(function () use ($items, $request, $total, $kodeOrder, $preorderMeta, $appliedCoupon, $userId, $hasFree) {
                $initialStatus = $hasFree ? 'free' : 'pending';
                $orderData = [
                    'user_id' => $userId,
                    'kode_order' => $kodeOrder,
                    'nama_pembeli' => $request->nama,
                    'email_pembeli' => $request->email,
                    'wa_pembeli' => $request->wa,
                    'total_harga' => $total,
                    'status' => $initialStatus,
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

                if ($appliedCoupon) {
                    $appliedCoupon->increment('used_count');
                }

                // Free order: set paid_at synchronously + trigger delivery (idempotent
                // via OrderDeliveryService) sehingga buyer langsung punya download
                // token saat sampai di /pesanan-sukses. Tidak ada Tripay callback â€”
                // provenance berbeda dari order paid biasa.
                if ($hasFree) {
                    $now = now();
                    $order->forceFill([
                        'paid_at' => $now,
                    ])->save();

                    $this->deliveryService->generateForOrder($order->fresh(), 'paid');
                }

                return $order;
            });

            // Untuk Tripay items payload: pakai line full price sebagai informational.
            // Tripay signature validasi amount total â€” yang kita set ke DP untuk pre-order.
            $tripayItems = $items->map(fn ($i) => [
                'sku' => (string) $i->product_id,
                'name' => $i->product->nama,
                'price' => (int) $i->product->harga,
                'quantity' => $i->qty,
            ])->toArray();

            // Free order skip Tripay entirely â€” buyer langsung di-redirect ke payment
            // page yang akan auto-redirect lagi ke /pesanan-sukses (status sudah 'free'
            // yang diperlakukan sama dengan 'paid' oleh PaymentPoller).
            if ($hasFree) {
                $this->cartService->clear($sessionId);

                return response()->json([
                    'data' => [
                        'kode_order' => $kodeOrder,
                        'redirect_url' => "/pembayaran/{$kodeOrder}",
                    ],
                    'message' => 'Order gratis dibuat. Produk siap diunduh.',
                ], 201);
            }

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

            // Perbarui total_harga pesanan agar mencakup fee transaksi Tripay (total tagihan riil)
            $payableTotal = (int) ($tripayRes['amount_customer'] ?? ($tripayRes['amount'] + ($tripayRes['total_fee'] ?? $tripayRes['fee_customer'] ?? 0)));

            $order->update([
                'total_harga' => $payableTotal > 0 ? $payableTotal : $total,
                'tripay_reference' => $tripayRes['reference'],
                'qr_string' => $tripayRes['qr_string'] ?? null,
                'qr_url' => $tripayRes['qr_url'] ?? null,
                'qr_expired_at' => now()->addSeconds(3600),
            ]);

            // Clear cart setelah order berhasil
            $this->cartService->clear($sessionId, $userId);

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
     * Format kode: EPS-YYYYMMDD-XXXXX (5 char alphanumeric uppercase, tanpa O/0).
     */
    private function generateKodeOrder(): string
    {
        $date = now()->format('Ymd');
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude I/O/0/1 untuk keterbacaan
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
     * Sanitasi phone â€” Tripay butuh format seperti 08123456789 (no +, no spaces).
     */
    private function sanitizePhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone) ?? '';
        if (str_starts_with($cleaned, '628')) {
            return '0'.substr($cleaned, 2);
        }
        return $cleaned;
    }
}
