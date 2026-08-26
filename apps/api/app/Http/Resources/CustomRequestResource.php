<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,
            'wa' => $this->wa,
            'jenis_proyek' => $this->jenis_proyek,
            'deskripsi' => $this->deskripsi,
            'budget_range' => $this->budget_range,
            'timeline' => $this->timeline,
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
