<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappOtp extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_otps';

    protected $fillable = [
        'phone',
        'code_hash',
        'expires_at',
        'attempts',
        'verified_at',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isMaxAttempts(int $max = 5): bool
    {
        return $this->attempts >= $max;
    }

    public function markVerified(): void
    {
        $this->update([
            'verified_at' => now(),
        ]);
    }

    public static function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
