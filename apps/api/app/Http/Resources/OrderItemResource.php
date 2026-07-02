<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'nama_produk' => $this->nama_produk,
            'harga_saat_beli' => (string) $this->harga_saat_beli,
            'harga_saat_beli_formatted' => 'Rp ' . number_format((float) $this->harga_saat_beli, 0, ',', '.'),
            'tipe_produk' => $this->tipe_produk,
        ];
    }
}