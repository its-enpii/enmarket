<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SponsorBid extends Model
{
    use HasFactory;

    protected $table = 'sponsor_bids';

    protected $fillable = [
        'order_id',
        'domain',
        'bid_amount',
        'name',
        'description',
        'contact_name',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'bid_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
