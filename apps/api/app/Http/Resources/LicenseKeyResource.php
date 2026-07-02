<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenseKeyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn () => $this->product ? [
                'id' => $this->product->id,
                'nama' => $this->product->nama,
                'slug' => $this->product->slug,
            ] : null),
            'key' => $this->key,
            'status' => $this->status,
            'activated_at' => $this->activated_at?->toIso8601String(),
            'expired_at' => $this->expired_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deliveries_count' => $this->whenLoaded('deliveries', fn () => $this->deliveries->count()),
        ];
    }
}
