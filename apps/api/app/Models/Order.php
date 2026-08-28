<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'user_id',
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
        'is_topup_order',
        'game_id',
        'game_item_id',
        'game_user_id',
        'game_server_id',
        'contact_type',
        'contact_value',
        'topup_status',
        'digiflazz_trx_id',
        'digiflazz_response',
        'payment_gateway',
        'payment_channel',
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
        'is_topup_order' => 'boolean',
        'digiflazz_response' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function gameItem(): BelongsTo
    {
        return $this->belongsTo(GameItem::class);
    }

    /**
     * Apakah order ini sudah dibayar?
     *
     * Mencakup `paid` (Tripay callback) dan `free` (cart berisi produk is_free,
     * skip payment gateway) — keduanya end-state yang siap untuk delivery.
     */
    public function isPaid(): bool
    {
        return in_array($this->status, ['paid', 'free'], true);
    }

    /**
     * Apakah order ini free (checkout skip payment gateway)?
     *
     * Provenance berbeda dari `paid` (tidak ada Tripay reference), tapi delivery
     * flow-nya identik — license/file tersedia, notification terkirim.
     */
    public function isFree(): bool
    {
        return $this->status === 'free';
    }

    public function isQrisValid(): bool
    {
        return $this->status === 'pending'
            && $this->qr_expired_at !== null
            && $this->qr_expired_at->isFuture();
    }

    public function isPreorder(): bool
    {
        return (bool) $this->is_preorder;
    }

    public function isAwaitingRelease(): bool
    {
        return $this->isPreorder() && $this->status === 'preorder_deposit_paid';
    }

    public function isPreorderFulfilled(): bool
    {
        return $this->isPreorder()
            && $this->status === 'paid'
            && $this->preorder_release_processed_at !== null;
    }

    /**
     * Ulasan yang dibuat untuk produk dalam pesanan ini.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function isTopupOrder(): bool
    {
        return $this->game_item_id !== null;
    }
}
