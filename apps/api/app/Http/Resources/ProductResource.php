<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'nama' => $this->category->nama,
                'slug' => $this->category->slug,
            ] : null),
            'nama' => $this->nama,
            'slug' => $this->slug,
            'deskripsi' => $this->deskripsi,
            'harga' => $this->harga,
            'harga_formatted' => 'Rp ' . number_format((float) $this->harga, 0, ',', '.'),
            'tipe' => $this->tipe,
            'file_url' => $this->file_url,
            'download_expiry_days' => $this->download_expiry_days,
            'preview_images' => $this->preview_images ?? [],
            'fitur' => $this->fitur ?? [],
            'status' => $this->status,
            'needs_license_key' => $this->needsLicenseKey(),
            'has_downloadable_file' => $this->hasDownloadableFile(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}