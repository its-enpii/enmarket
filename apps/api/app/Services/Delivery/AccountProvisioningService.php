<?php

namespace App\Services\Delivery;

use App\Models\AccountProvisioning;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrator untuk produk bertipe `account_manual` — kredensial harus
 * di-setup oleh admin sebelum bisa di-deliver ke buyer.
 *
 * Alur:
 *   1. Order paid → createForItem() → row 'menunggu_admin', NO notification
 *   2. Admin login → /admin/account-provisionings → markReady()
 *   3. markReady() → simpan credentials, dispatch notif email+WA
 *   4. regenerate() / resend() → escape hatch admin
 *
 * Idempotent: kalau sudah ada, skip. Reuse pattern dari OrderDeliveryService.
 */
class AccountProvisioningService
{
    public function __construct(
        private readonly NotificationDispatcher $notifier,
    ) {}

    /**
     * Buat antrian aktivasi untuk satu order_item. Idempotent.
     * Return existing row kalau sudah ada.
     */
    public function createForItem(OrderItem $item): AccountProvisioning
    {
        // Cek existence langsung via query — handle kasus relasi belum load
        // atau cache dari pemanggil pertama yang sudah stale (idempotent retry).
        $existing = AccountProvisioning::where('order_item_id', $item->id)->first();
        if ($existing) {
            return $existing;
        }

        $prov = AccountProvisioning::create([
            'order_item_id' => $item->id,
            'status' => 'menunggu_admin',
        ]);

        Log::info('AccountProvisioning: created waiting', [
            'order_item_id' => $item->id,
            'product_id' => $item->product_id,
        ]);

        return $prov;
    }

    /**
     * Admin input kredensial + mark siap. Dispatch notifikasi ke buyer.
     *
     * @param  array<string, mixed>  $credentials  fleksibel: {username, password, server, ...}
     */
    public function markReady(
        AccountProvisioning $prov,
        array $credentials,
        ?string $catatan,
        string $adminLabel,
    ): AccountProvisioning {
        $prov->loadMissing('orderItem.order');

        $prov->forceFill([
            'status' => 'siap',
            'credentials' => $credentials,
            'catatan_admin' => $catatan,
            'ready_by_admin' => $adminLabel,
            'ready_at' => now(),
            'email_sent_at' => null,
            'wa_sent_at' => null,
        ])->save();

        $this->notifier->dispatchAccountReady($prov);

        Log::info('AccountProvisioning: marked ready', [
            'order_item_id' => $prov->order_item_id,
            'order' => $prov->orderItem?->order?->kode_order,
            'admin' => $adminLabel,
        ]);

        return $prov;
    }

    /**
     * Admin ganti kredensial (mis. salah input) → mark siap ulang + notif baru.
     */
    public function regenerate(
        AccountProvisioning $prov,
        array $credentials,
        string $adminLabel,
    ): AccountProvisioning {
        return $this->markReady($prov, $credentials, $prov->catatan_admin, $adminLabel);
    }

    /**
     * Admin re-trigger notifikasi ke buyer (untuk kasus webhook n8n sempat down).
     */
    public function resend(AccountProvisioning $prov): void
    {
        $prov->loadMissing('orderItem.order');

        if (! $prov->isReady()) {
            throw new \RuntimeException('Provisioning belum siap. Mark ready dulu sebelum resend.');
        }

        $this->notifier->dispatchAccountReady($prov);
    }
}
