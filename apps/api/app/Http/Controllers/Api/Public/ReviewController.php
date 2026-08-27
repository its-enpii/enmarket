<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * GET /api/public/products/{slug}/reviews
     * Menampilkan daftar review produk yang dipublikasikan + ringkasan rating.
     */
    public function index(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $perPage = min(max((int) $request->input('per_page', 10), 1), 50);
        $ratingFilter = $request->input('rating');

        $query = $product->reviews()
            ->where('is_published', true)
            ->latest();

        if ($ratingFilter && in_array((int) $ratingFilter, [1, 2, 3, 4, 5], true)) {
            $query->where('rating', (int) $ratingFilter);
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => ReviewResource::collection($paginator->items()),
            'summary' => $product->ratingSummary(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/orders/{kodeOrder}/reviews
     * Mengetahui review apa saja yang sudah dibuat pada suatu order.
     */
    public function byOrder(string $kodeOrder): JsonResponse
    {
        $order = Order::where('kode_order', $kodeOrder)->firstOrFail();
        $reviews = $order->reviews()->get();

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'reviewed_product_ids' => $reviews->pluck('product_id')->all(),
        ]);
    }

    /**
     * POST /api/reviews
     * Submit review baru untuk produk yang telah dibeli.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $kodeOrder = trim((string) $request->input('kode_order'));
        $productId = (int) $request->input('product_id');

        $order = Order::where('kode_order', $kodeOrder)->first();
        if (! $order) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
                'code' => 'order_not_found',
            ], 404);
        }

        // 1. Validasi status pembayaran order
        $allowedStatuses = ['paid', 'free', 'preorder_deposit_paid'];
        if (! in_array($order->status, $allowedStatuses, true)) {
            return response()->json([
                'message' => 'Hanya pesanan yang sudah lunas yang dapat memberikan ulasan.',
                'code' => 'order_not_paid',
            ], 422);
        }

        // 2. Validasi apakah produk benar-benar ada di dalam order
        $orderItem = $order->items()->where('product_id', $productId)->first();
        if (! $orderItem) {
            return response()->json([
                'message' => 'Produk tidak terdapat di dalam pesanan ini.',
                'code' => 'product_not_in_order',
            ], 422);
        }

        // 3. Validasi otorisasi pembeli (Sanctum User atau Email/Phone Verification)
        $authUser = $request->user('sanctum');
        if ($authUser) {
            // Logged in user: pastikan order milik user ATAU no hp/email cocok
            $phoneMatches = $authUser->phone && $this->cleanPhone($authUser->phone) === $this->cleanPhone($order->wa_pembeli);
            $emailMatches = $authUser->email && strtolower(trim($authUser->email)) === strtolower(trim($order->email_pembeli));
            $isOwner = $order->user_id === $authUser->id || $phoneMatches || $emailMatches;

            if (! $isOwner) {
                return response()->json([
                    'message' => 'Anda tidak memiliki hak akses untuk mengulas pesanan ini.',
                    'code' => 'unauthorized_order',
                ], 403);
            }
            $userId = $authUser->id;
        } else {
            // Guest verification: email atau nomor WhatsApp harus cocok
            $identifier = trim((string) $request->input('email_or_phone', ''));
            $cleanInput = $this->cleanPhone($identifier);
            $cleanWa = $this->cleanPhone($order->wa_pembeli);
            $emailMatches = strtolower($identifier) === strtolower(trim($order->email_pembeli));
            $phoneMatches = ! empty($cleanInput) && $cleanInput === $cleanWa;

            if (! $emailMatches && ! $phoneMatches) {
                return response()->json([
                    'message' => 'Verifikasi email atau nomor WhatsApp tidak sesuai dengan data pesanan.',
                    'code' => 'buyer_verification_failed',
                ], 403);
            }
            $userId = $order->user_id;
        }

        // 4. Cek duplikasi review
        $exists = Review::where('order_id', $order->id)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Anda sudah memberikan ulasan untuk produk ini pada pesanan ini.',
                'code' => 'review_already_exists',
            ], 422);
        }

        // 5. Simpan review
        $buyerName = trim((string) $request->input('buyer_name', ''));
        if (empty($buyerName)) {
            $buyerName = $authUser?->name ?: $order->nama_pembeli ?: 'Pembeli Terverifikasi';
        }

        $review = Review::create([
            'product_id' => $productId,
            'order_id' => $order->id,
            'user_id' => $userId,
            'rating' => (int) $request->input('rating'),
            'comment' => $request->input('comment'),
            'buyer_name' => $buyerName,
            'is_published' => true,
        ]);

        return response()->json([
            'data' => new ReviewResource($review),
            'message' => 'Terima kasih! Ulasan Anda berhasil disimpan.',
        ], 201);
    }

    private function cleanPhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone) ?? '';
        if (str_starts_with($cleaned, '62')) {
            return '0'.substr($cleaned, 2);
        }
        return $cleaned;
    }
}
