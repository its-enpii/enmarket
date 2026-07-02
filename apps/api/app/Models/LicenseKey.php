<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LicenseKey extends Model
{
    use HasFactory;

    protected $table = 'license_keys';

    protected $fillable = [
        'product_id',
        'key',
        'status',
        'activated_at',
        'expired_at',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(OrderDelivery::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'aktif';
    }
}
