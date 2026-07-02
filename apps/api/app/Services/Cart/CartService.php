<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

/**
 * Cart service — manage guest cart by session_id (UUID from cookie).
 * Cart expires 24 jam setelah last update.
 */
class CartService
{
    public const EXPIRY_HOURS = 24;

    /**
     * Ambil cart by session_id, atau buat baru kalau belum ada / sudah expired.
     */
    public function getOrCreateCart(string $sessionId): Cart
    {
        $cart = Cart::where('session_id', $sessionId)->first();

        if ($cart && $cart->isExpired()) {
            // Cart expired — delete dan buat baru
            $cart->delete();
            $cart = null;
        }

        if (! $cart) {
            $cart = Cart::create([
                'session_id' => $sessionId,
                'expires_at' => now()->addHours(self::EXPIRY_HOURS),
            ]);
        }

        return $cart;
    }

    /**
     * Tambah produk ke cart. Kalau sudah ada, increment qty.
     */
    public function addItem(string $sessionId, int $productId, int $qty = 1): Cart
    {
        $cart = $this->getOrCreateCart($sessionId);
        $product = Product::find($productId);
        if (! $product) {
            throw new \InvalidArgumentException("Product {$productId} not found");
        }

        $existing = $cart->items()->where('product_id', $productId)->first();
        if ($existing) {
            $existing->increment('qty', $qty);
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'qty' => max(1, $qty),
            ]);
        }

        $this->touchExpiry($cart);

        return $cart->fresh(['items.product']);
    }

    /**
     * Update qty item. Kalau qty <= 0, hapus item.
     */
    public function updateQty(string $sessionId, int $productId, int $qty): ?Cart
    {
        $cart = $this->getOrCreateCart($sessionId);
        $item = $cart->items()->where('product_id', $productId)->first();

        if (! $item) {
            return $cart->fresh(['items.product']);
        }

        if ($qty <= 0) {
            $item->delete();
        } else {
            $item->update(['qty' => $qty]);
        }

        $this->touchExpiry($cart);

        return $cart->fresh(['items.product']);
    }

    /**
     * Hapus item dari cart.
     */
    public function removeItem(string $sessionId, int $productId): Cart
    {
        $cart = Cart::where('session_id', $sessionId)->first();
        if ($cart) {
            $cart->items()->where('product_id', $productId)->delete();
        }
        return $cart?->fresh(['items.product']) ?? $this->getOrCreateCart($sessionId);
    }

    /**
     * Kosongkan cart (dipakai setelah checkout success).
     */
    public function clear(string $sessionId): void
    {
        $cart = Cart::where('session_id', $sessionId)->first();
        if ($cart) {
            $cart->items()->delete();
            $cart->delete();
        }
    }

    /**
     * Refresh expiry timestamp.
     */
    private function touchExpiry(Cart $cart): void
    {
        $cart->update(['expires_at' => now()->addHours(self::EXPIRY_HOURS)]);
    }
}