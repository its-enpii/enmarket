<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPublic = $request->boolean('public_view');
        $publicView = $request->input('public_view') ?? ($this->additional['public_view'] ?? null);

        $arr = [
            'kode_order' => $this->kode_order,
            'nama_pembeli' => $this->nama_pembeli,
            'email_pembeli' => $this->email_pembeli,
            'wa_pembeli' => $this->wa_pembeli,
            'total_harga' => (string) $this->total_harga,
            'total_harga_formatted' => 'Rp '.number_format((float) $this->total_harga, 0, ',', '.'),
            'status' => $this->status,
            'tripay_reference' => $this->tripay_reference,
            'qr_string' => $isPublic ? null : $this->qr_string,
            'qr_url' => $this->qr_url,
            'qr_expired_at' => $this->qr_expired_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];

        // Untuk polling ringan — strip heavy fields dari view publik
        if ($publicView === 'status') {
            return [
                'kode_order' => $this->kode_order,
                'status' => $this->status,
                'paid_at' => $this->paid_at?->toIso8601String(),
                'qr_expired_at' => $this->qr_expired_at?->toIso8601String(),
                'total_harga_formatted' => 'Rp '.number_format((float) $this->total_harga, 0, ',', '.'),
                'item_count' => $this->whenLoaded('items', fn () => $this->items->count()),
            ];
        }

        return $arr;
    }
}
