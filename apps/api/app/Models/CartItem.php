<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'product_id',
        'qty',
    ];

    protected $casts = [
        'qty' => 'integer',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Subtotal = harga * qty.
     */
    public function subtotal(): float
    {
        return (float) $this->product->harga * $this->qty;
    }
}
