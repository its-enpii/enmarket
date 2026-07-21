<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AccountProvisioning — antrian aktivasi akun manual per order_item.
 *
 * Lifecycle status:
 *   - menunggu_admin : order paid, menunggu admin input kredensial
 *   - siap           : admin sudah submit, notif email+WA terkirim ke buyer
 *   - gagal          : admin mark gagal (mis. stok kosong, tidak bisa setup)
 *   - dibatalkan     : order refunded, provisioning di-cancel
 *
 * credentials: JSON fleksibel — bentuknya ditentukan admin (username,
 * password, server, profile, dsb.). Hanya di-expose ke public setelah
 * status='siap' (lihat OrderItemResource).
 */
class AccountProvisioning extends Model
{
    use HasFactory;

    protected $table = 'account_provisionings';

    protected $fillable = [
        'order_item_id',
        'status',
        'credentials',
        'catatan_admin',
        'ready_by_admin',
        'ready_at',
        'email_sent_at',
        'wa_sent_at',
    ];

    protected $casts = [
        'credentials' => 'array',
        'ready_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'wa_sent_at' => 'datetime',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'menunggu_admin';
    }

    public function isReady(): bool
    {
        return $this->status === 'siap';
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
