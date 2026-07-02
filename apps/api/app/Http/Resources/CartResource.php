<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items ?? collect();
        $total = $items->sum(fn ($i) => (float) $i->product->harga * $i->qty);

        return [
            'session_id' => $this->session_id,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'items' => CartItemResource::collection($items->load('product')),
            'total' => (float) $total,
            'total_formatted' => 'Rp ' . number_format($total, 0, ',', '.'),
            'item_count' => $items->sum('qty'),
        ];
    }
}