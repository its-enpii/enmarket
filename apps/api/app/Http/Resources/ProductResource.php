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
            'harga_formatted' => 'Rp '.number_format((float) $this->harga, 0, ',', '.'),
            'tipe' => $this->tipe,
            'file_url' => $this->file_url,
            'download_expiry_days' => $this->download_expiry_days,
            'preview_images' => $this->preview_images ?? [],
            'fitur' => $this->fitur ?? [],
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
            'needs_license_key' => $this->needsLicenseKey(),
            'has_downloadable_file' => $this->hasDownloadableFile(),
            'license_key_stats' => $this->whenLoaded('licenseKeys', function () {
                $all = $this->licenseKeys;

                return [
                    'total' => $all->count(),
                    'aktif' => $all->where('status', 'aktif')->count(),
                    'digunakan' => $all->where('status', 'digunakan')->count(),
                    'kadaluarsa' => $all->where('status', 'kadaluarsa')->count(),
                    'dicabut' => $all->where('status', 'dicabut')->count(),
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            // Blog posts yang di-link dari produk ini (panduan, warning, catatan).
            // Hanya expose data minimal yang aman untuk publik: id, slug, title,
            // excerpt, urutan tampil. Konten penuh (`content`) TIDAK di-expose —
            // buyer klik ke `/display/{slug}` untuk baca full.
            'linked_posts' => $this->whenLoaded('posts', fn () => $this->posts->map(fn ($p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'thumbnail' => $p->thumbnail,
                'urutan' => (int) ($p->pivot->urutan ?? 0),
            ])->all()),
        ];
    }
}
