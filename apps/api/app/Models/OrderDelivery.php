<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDelivery extends Model
{
    use HasFactory;

    protected $table = 'order_deliveries';

    protected $fillable = [
        'order_item_id',
        'download_token',
        'download_url',
        'token_expired_at',
        'license_key_id',
        'email_sent_at',
        'wa_sent_at',
    ];

    protected $casts = [
        'token_expired_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'wa_sent_at' => 'datetime',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function licenseKey(): BelongsTo
    {
        return $this->belongsTo(LicenseKey::class);
    }

    /**
     * Apakah download token masih berlaku?
     */
    public function isDownloadValid(): bool
    {
        return $this->download_token !== null
            && $this->token_expired_at !== null
            && $this->token_expired_at->isFuture();
    }

    public function isEmailSent(): bool
    {
        return $this->email_sent_at !== null;
    }

    public function isWaSent(): bool
    {
        return $this->wa_sent_at !== null;
    }
}
