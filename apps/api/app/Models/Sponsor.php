<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasFactory;

    protected $table = 'sponsors';

    protected $fillable = [
        'domain',
        'name',
        'url',
        'logo_url',
        'description',
        'fetched_description',
        'amount',
        'is_active',
        'fetched_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
        'fetched_at' => 'datetime',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getEffectiveDescriptionAttribute(): ?string
    {
        return ! empty($this->description) ? $this->description : $this->fetched_description;
    }
}
