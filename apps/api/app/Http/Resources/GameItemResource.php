<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'nama' => $this->nama,
            'harga' => (string) $this->harga,
            'harga_formatted' => 'Rp ' . number_format((float) $this->harga, 0, ',', '.'),
            'digiflazz_sku' => $this->digiflazz_sku,
            'digiflazz_category' => $this->digiflazz_category,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
