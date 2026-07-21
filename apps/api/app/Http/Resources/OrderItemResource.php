<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $arr = [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'nama_produk' => $this->nama_produk,
            'harga_saat_beli' => (string) $this->harga_saat_beli,
            'harga_saat_beli_formatted' => 'Rp '.number_format((float) $this->harga_saat_beli, 0, ',', '.'),
            'tipe_produk' => $this->tipe_produk,
        ];

        // Delivery info (kalau order sudah paid & delivery row ada)
        if ($this->relationLoaded('delivery') && $this->delivery) {
            $delivery = $this->delivery;
            $apiBase = rtrim((string) config('app.url'), '/');
            $arr['delivery'] = [
                'has_download' => ! empty($delivery->download_url),
                'download_token' => $delivery->download_token,
                'download_url' => $delivery->isDownloadValid()
                    ? "{$apiBase}/api/download/{$delivery->download_token}"
                    : null,
                'token_expired_at' => $delivery->token_expired_at?->toIso8601String(),
                'license_key' => $delivery->licenseKey?->key,
                'email_sent_at' => $delivery->email_sent_at?->toIso8601String(),
                'wa_sent_at' => $delivery->wa_sent_at?->toIso8601String(),
            ];
        }

        // Account provisioning info (untuk produk bertipe account_manual).
        // Credentials hanya di-expose setelah status='siap' — saat masih
        // menunggu_admin, field null supaya buyer tidak dapat bocoran.
        if ($this->relationLoaded('accountProvisioning') && $this->accountProvisioning) {
            $prov = $this->accountProvisioning;
            $arr['account_provisioning'] = [
                'status' => $prov->status,
                'is_ready' => $prov->isReady(),
                'credentials' => $prov->isReady() ? $prov->credentials : null,
                'catatan' => $prov->catatan_admin,
                'ready_at' => $prov->ready_at?->toIso8601String(),
                'email_sent_at' => $prov->email_sent_at?->toIso8601String(),
                'wa_sent_at' => $prov->wa_sent_at?->toIso8601String(),
            ];
        }

        return $arr;
    }
}
