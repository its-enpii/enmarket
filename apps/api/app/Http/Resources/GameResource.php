<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'nama' => $this->nama,
            'brand' => $this->brand,
            'icon_url' => $this->icon_url,
            'banner_url' => $this->banner_url,
            'requires_server_id' => $this->requires_server_id,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'digiflazz_category' => $this->digiflazz_category,
            'items' => GameItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
