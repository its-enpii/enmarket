<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $table = 'coupons';

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order',
        'max_uses',
        'used_count',
        'valid_from',
        'valid_until',
        'active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order' => 'decimal:2',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'active' => 'boolean',
    ];

    protected function code(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => $value !== null ? strtoupper(trim($value)) : null,
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('active', true);
    }

    public function scopeValid(Builder $query): Builder
    {
        return $query->active()
            ->where(function (Builder $q) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('max_uses')->orWhereRaw('used_count < max_uses');
            });
    }

    public function calculateDiscount(float $subtotal): int
    {
        if ($this->type === 'percent') {
            $discount = ($subtotal * (float) $this->value) / 100;
        } else {
            $discount = (float) $this->value;
        }

        return (int) min(round($discount), $subtotal);
    }

    public function isValid(): bool
    {
        if (! $this->active) {
            return false;
        }
        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }
        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }
}
