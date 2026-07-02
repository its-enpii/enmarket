<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Services\Cart\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    /**
     * GET /api/cart — ambil cart by cookie cart_session.
     */
    public function index(Request $request): JsonResponse
    {
        $sessionId = $this->resolveSessionId($request);
        $cart = $this->cartService->getOrCreateCart($sessionId);
        $cart->load(['items.product' => fn ($q) => $q->where('status', 'aktif')]);

        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * POST /api/cart/items — tambah produk ke cart.
     */
    public function storeItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $sessionId = $this->resolveSessionId($request);

        // Cegah produk non-aktif masuk cart
        $product = \App\Models\Product::find($data['product_id']);
        if (! $product || $product->status !== 'aktif') {
            return response()->json([
                'message' => 'Produk ini sedang tidak dijual.',
            ], 422);
        }

        $cart = $this->cartService->addItem($sessionId, $data['product_id'], $data['qty'] ?? 1);
        $cart->load(['items.product']);

        return response()->json([
            'data' => new CartResource($cart),
            'message' => 'Produk ditambahkan ke keranjang.',
        ]);
    }

    /**
     * PATCH /api/cart/items/{productId} — update qty.
     */
    public function updateItem(Request $request, int $productId): JsonResponse
    {
        $data = $request->validate([
            'qty' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        $sessionId = $this->resolveSessionId($request);
        $cart = $this->cartService->updateQty($sessionId, $productId, $data['qty']);
        $cart->load(['items.product']);

        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * DELETE /api/cart/items/{productId} — hapus dari cart.
     */
    public function destroyItem(Request $request, int $productId): JsonResponse
    {
        $sessionId = $this->resolveSessionId($request);
        $cart = $this->cartService->removeItem($sessionId, $productId);
        $cart->load(['items.product']);

        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Ambil session_id dari cookie cart_session.
     * Generate baru kalau belum ada — return value juga di-set ke response.
     * Frontend wajib save ke cookies sebelum pakai cart.
     */
    private function resolveSessionId(Request $request): string
    {
        $existing = $request->cookie('cart_session');
        if ($existing && strlen($existing) >= 16 && strlen($existing) <= 64) {
            return $existing;
        }

        return (string) Str::uuid();
    }
}