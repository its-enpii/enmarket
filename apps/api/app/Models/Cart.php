<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $table = 'carts';

    protected $fillable = [
        'session_id',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Total harga cart (sum of product.harga * qty).
     */
    public function total(): float
    {
        return (float) $this->items()
            ->join('products', 'products.id', '=', 'cart_items.product_id')
            ->sum(\Illuminate\Support\Facades\DB::raw('products.harga * cart_items.qty'));
    }

    /**
     * Apakah cart sudah expired?
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}