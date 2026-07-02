<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    protected $fillable = [
        'order_id',
        'product_id',
        'nama_produk',     // snapshot
        'harga_saat_beli', // snapshot
        'tipe_produk',     // snapshot
    ];

    protected $casts = [
        'harga_saat_beli' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Satu delivery record per order_item.
     */
    public function delivery(): HasOne
    {
        return $this->hasOne(OrderDelivery::class);
    }

    public function needsLicenseKey(): bool
    {
        return in_array($this->tipe_produk, ['license', 'bundle'], true);
    }

    public function hasDownloadableFile(): bool
    {
        return in_array($this->tipe_produk, ['download', 'bundle'], true);
    }
}
