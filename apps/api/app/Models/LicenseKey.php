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

    /**
     * Scope: hanya key yang berstatus aktif (siap diklaim).
     * Urutkan paling lama dibuat (FIFO claim).
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'aktif')->orderBy('id', 'asc');
    }

    /**
     * Claim key ini: set status, activated_at. Idempotent check sebelum update.
     */
    public function markUsed(): bool
    {
        if ($this->status !== 'aktif') {
            return false;
        }

        return (bool) $this->forceFill([
            'status' => 'digunakan',
            'activated_at' => now(),
        ])->save();
    }

    /**
     * Generate satu license key string.
     * Format: PREFIX-XXXX-XXXX-XXXX-XXXX (4 groups of 4 uppercase alnum, minus I/O/0/1).
     * Dipakai oleh seeder + admin manual insert.
     */
    public static function generateKey(string $prefix = 'EPS'): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude I, O, 0, 1
        $groups = [];

        for ($g = 0; $g < 4; $g++) {
            $group = '';
            for ($c = 0; $c < 4; $c++) {
                $group .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $groups[] = $group;
        }

        return $prefix . '-' . implode('-', $groups);
    }
}
