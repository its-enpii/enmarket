<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SponsorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'domain' => $this->domain,
            'name' => $this->name,
            'url' => $this->url,
            'logo_url' => $this->logo_url,
            'description' => $this->description,
            'fetched_description' => $this->fetched_description,
            'amount' => (string) $this->amount,
            'is_active' => (bool) $this->is_active,
            'fetched_at' => $this->fetched_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
