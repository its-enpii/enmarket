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
            'id' => $this->id,
            'user_id' => $this->user_id,
            'kode_order' => $this->kode_order,
            'nama_pembeli' => $this->nama_pembeli,
            'email_pembeli' => $this->email_pembeli,
            'wa_pembeli' => $this->wa_pembeli,
            'total_harga' => (string) $this->total_harga,
            'total_harga_formatted' => 'Rp '.number_format((float) $this->total_harga, 0, ',', '.'),
            'status' => $this->status,
            // Pre-order fields. Null untuk non-preorder orders.
            'is_preorder' => $this->isPreorder(),
            'preorder_release_date' => $this->isPreorder() ? $this->preorder_release_date?->toDateString() : null,
            'preorder_deposit_amount' => $this->isPreorder() ? (string) $this->preorder_deposit_amount : null,
            'preorder_remaining_amount' => $this->isPreorder() ? (string) $this->preorder_remaining_amount : null,
            'preorder_deposit_paid_at' => $this->isPreorder() ? $this->preorder_deposit_paid_at?->toIso8601String() : null,
            'preorder_release_processed_at' => $this->isPreorder() ? $this->preorder_release_processed_at?->toIso8601String() : null,
            'tripay_reference' => $this->tripay_reference,
            'qr_string' => $isPublic ? null : $this->qr_string,
            'qr_url' => $this->qr_url,
            'qr_expired_at' => $this->qr_expired_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'is_topup_order' => $this->isTopupOrder(),
            'game_id' => $this->game_id,
            'game_item_id' => $this->game_item_id,
            'game_user_id' => $this->game_user_id,
            'game_server_id' => $this->game_server_id,
            'contact_type' => $this->contact_type,
            'contact_value' => $this->contact_value,
            'topup_status' => $this->topup_status,
            'digiflazz_trx_id' => $this->digiflazz_trx_id,
            'payment_gateway' => $this->payment_gateway,
            'game' => $this->whenLoaded('game', fn () => [
                'id' => $this->game->id,
                'nama' => $this->game->nama,
                'slug' => $this->game->slug,
                'icon_url' => $this->game->icon_url,
            ]),
            'game_item' => $this->whenLoaded('gameItem', fn () => [
                'id' => $this->gameItem->id,
                'nama' => $this->gameItem->nama,
                'harga' => (string) $this->gameItem->harga,
            ]),
        ];

        // Untuk polling ringan — strip heavy fields dari view publik.
        // Tetap expose flag pre-order + release_date karena UI butuh untuk
        // countdown banner saat status=preorder_deposit_paid.
        if ($publicView === 'status') {
            return [
                'kode_order' => $this->kode_order,
                'status' => $this->status,
                'paid_at' => $this->paid_at?->toIso8601String(),
                'qr_expired_at' => $this->qr_expired_at?->toIso8601String(),
                'total_harga_formatted' => 'Rp '.number_format((float) $this->total_harga, 0, ',', '.'),
                'is_preorder' => $this->isPreorder(),
                'preorder_release_date' => $this->isPreorder() ? $this->preorder_release_date?->toDateString() : null,
                'item_count' => $this->whenLoaded('items', fn () => $this->items->count()),
            ];
        }

        return $arr;
    }
}
