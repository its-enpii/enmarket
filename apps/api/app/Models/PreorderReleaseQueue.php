<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property \Illuminate\Support\Carbon $release_date
 * @property \Illuminate\Support\Carbon|null $processed_at
 */
class PreorderReleaseQueue extends Model
{
    use HasFactory;

    protected $table = 'preorder_release_queue';

    protected $fillable = [
        'order_id',
        'release_date',
        'processed_at',
    ];

    protected $casts = [
        'release_date' => 'date',
        'processed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope: baris yang masih awaiting release (processed_at IS NULL
     * dan release_date <= hari ini).
     */
    public function scopeDue($query)
    {
        return $query->whereNull('processed_at')
            ->whereDate('release_date', '<=', today());
    }

    /**
     * Scope: baris yang masih awaiting release tanpa filter tanggal —
     * untuk admin list view.
     */
    public function scopeAwaiting($query)
    {
        return $query->whereNull('processed_at');
    }
}
