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
        'is_preorder',
        'preorder_release_date',
        'preorder_deposit_amount',
        'preorder_remaining_amount',
        'preorder_deposit_paid_at',
        'preorder_release_processed_at',
        'tripay_reference',
        'qr_string',
        'qr_url',
        'qr_expired_at',
        'paid_at',
    ];

    protected $casts = [
        'total_harga' => 'decimal:2',
        'is_preorder' => 'boolean',
        'preorder_release_date' => 'date',
        'preorder_deposit_amount' => 'decimal:2',
        'preorder_remaining_amount' => 'decimal:2',
        'preorder_deposit_paid_at' => 'datetime',
        'preorder_release_processed_at' => 'datetime',
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

    /**
     * Apakah order ini pre-order (DP dulu, fulfillment di-defer saat release)?
     * Snapshot dari cart saat checkout — cart policy all-or-nothing (mixed cart
     * ditolak 422), jadi flag ini konsisten di seluruh item order.
     */
    public function isPreorder(): bool
    {
        return (bool) $this->is_preorder;
    }

    /**
     * Order pre-order yang sudah bayar DP tapi belum release — menunggu admin
     * trigger manual via /admin/preorders/{id}/release-now.
     */
    public function isAwaitingRelease(): bool
    {
        return $this->isPreorder() && $this->status === 'preorder_deposit_paid';
    }

    /**
     * Order pre-order yang sudah selesai di-release — status sudah `paid` dan
     * `preorder_release_processed_at` populated. Tampil berbeda dari paid biasa
     * di UI success page (dengan release info header).
     */
    public function isPreorderFulfilled(): bool
    {
        return $this->isPreorder()
            && $this->status === 'paid'
            && $this->preorder_release_processed_at !== null;
    }
}
