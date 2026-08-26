<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\Product;

/**
 * Cart service — manage guest cart by session_id (UUID from cookie) or user_id.
 * Cart expires 24 jam setelah last update.
 */
class CartService
{
    public const EXPIRY_HOURS = 24;

    /**
     * Ambil cart by session_id / user_id, atau buat baru kalau belum ada / sudah expired.
     */
    public function getOrCreateCart(string $sessionId, ?int $userId = null): Cart
    {
        $cart = null;

        if ($userId !== null) {
            $cart = Cart::where('user_id', $userId)->first();
            if ($cart && $cart->isExpired()) {
                $cart->delete();
                $cart = null;
            }

            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)
                    ->where(function ($q) use ($userId) {
                        $q->whereNull('user_id')->orWhere('user_id', '!=', $userId);
                    })
                    ->first();

                if ($guestCart && ! $guestCart->isExpired()) {
                    if (! $cart) {
                        $guestCart->update(['user_id' => $userId]);
                        $cart = $guestCart;
                    } else {
                        foreach ($guestCart->items as $item) {
                            $existing = $cart->items()->where('product_id', $item->product_id)->first();
                            if ($existing) {
                                $existing->increment('qty', $item->qty);
                            } else {
                                $cart->items()->create([
                                    'product_id' => $item->product_id,
                                    'qty' => $item->qty,
                                ]);
                            }
                        }
                        $guestCart->items()->delete();
                        $guestCart->delete();
                    }
                }
            }
        }

        if (! $cart) {
            $cart = Cart::where('session_id', $sessionId)->first();
            if ($cart && $cart->isExpired()) {
                $cart->delete();
                $cart = null;
            }
        }

        if (! $cart) {
            $cart = Cart::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'expires_at' => now()->addHours(self::EXPIRY_HOURS),
            ]);
        }

        return $cart;
    }

    /**
     * Tambah produk ke cart. Kalau sudah ada, increment qty.
     */
    public function addItem(string $sessionId, int $productId, int $qty = 1, ?int $userId = null): Cart
    {
        $cart = $this->getOrCreateCart($sessionId, $userId);
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
    public function updateQty(string $sessionId, int $productId, int $qty, ?int $userId = null): ?Cart
    {
        $cart = $this->getOrCreateCart($sessionId, $userId);
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
    public function removeItem(string $sessionId, int $productId, ?int $userId = null): Cart
    {
        $cart = $userId !== null
            ? Cart::where('user_id', $userId)->first()
            : Cart::where('session_id', $sessionId)->first();

        if (! $cart && $userId !== null) {
            $cart = Cart::where('session_id', $sessionId)->first();
        }

        if ($cart) {
            $cart->items()->where('product_id', $productId)->delete();
        }

        return $cart?->fresh(['items.product']) ?? $this->getOrCreateCart($sessionId, $userId);
    }

    /**
     * Kosongkan cart (dipakai setelah checkout success).
     */
    public function clear(string $sessionId, ?int $userId = null): void
    {
        $carts = Cart::where('session_id', $sessionId);
        if ($userId !== null) {
            $carts = $carts->orWhere('user_id', $userId);
        }

        foreach ($carts->get() as $cart) {
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
