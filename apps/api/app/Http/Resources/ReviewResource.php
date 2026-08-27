<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'nama' => $this->product->nama,
                'slug' => $this->product->slug,
            ]),
            'order_id' => $this->order_id,
            'order_kode' => $this->order?->kode_order,
            'user_id' => $this->user_id,
            'buyer_name' => $this->buyer_name,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'is_published' => (bool) $this->is_published,
            'admin_notes' => $this->admin_notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
