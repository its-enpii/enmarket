<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'kode_order',
        'nama_pembeli',
        'email_pembeli',
        'wa_pembeli',
        'total_harga',
        'status',
        'tripay_reference',
        'qr_string',
        'qr_url',
        'qr_expired_at',
        'paid_at',
    ];

    protected $casts = [
        'total_harga' => 'decimal:2',
        'qr_expired_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Item-item dalam order ini.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Apakah order ini sudah dibayar?
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Apakah QR masih berlaku?
     */
    public function isQrisValid(): bool
    {
        return $this->status === 'pending'
            && $this->qr_expired_at !== null
            && $this->qr_expired_at->isFuture();
    }
}
