<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Post — untuk endpoint publik dan admin.
 *
 * Shape publik (default): ringkas, tanpa content (HTML berat).
 * Admin context (`whenLoaded('admin')` flag) menyertakan `content` lengkap.
 */
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user() !== null || $request->is('api/admin/*');

        // Detail endpoint (posts/{slug}) selalu expose content agar halaman
        // /blog/[slug] bisa render artikel utuh. Listing endpoint (/posts)
        // tetap hide content untuk hemat payload — client cuma butuh excerpt.
        $isDetail = $request->is('api/public/posts/*');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'thumbnail' => $this->thumbnail,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
            'reading_time_minutes' => $this->readingTimeMinutes(),
            'content' => ($isAdmin || $isDetail)
                ? $this->content
                : $this->when($isAdmin, fn () => $this->content),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Estimasi waktu baca (menit) — 200 kata per menit.
     * Hitung dari plain text (strip_tags) untuk akurasi.
     */
    private function readingTimeMinutes(): int
    {
        $wordCount = str_word_count(strip_tags($this->content ?? ''));
        $minutes = (int) ceil($wordCount / 200);

        return max(1, $minutes);
    }
}
