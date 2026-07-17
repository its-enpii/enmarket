<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'qty' => $this->qty,
            'product' => $this->whenLoaded('product', fn () => new ProductResource($this->product)),
            'subtotal_formatted' => 'Rp '.number_format($this->product->harga * $this->qty, 0, ',', '.'),
            'subtotal' => (float) $this->product->harga * $this->qty,
        ];
    }
}
