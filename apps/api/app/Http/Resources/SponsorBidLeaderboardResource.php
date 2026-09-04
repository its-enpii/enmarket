<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\SponsorBid */
class SponsorBidLeaderboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'rank' => $this->rank,
            'name' => $this->name ?: $this->domain,
            'domain' => $this->domain,
            'bid_amount' => (float) $this->bid_amount,
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
