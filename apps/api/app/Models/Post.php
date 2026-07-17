<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Post — blog/notes entry untuk halaman publik /blog.
 *
 * Polanya persis Product: auto-slug dari title, scope Published untuk visibility.
 * Bedanya: tidak ada harga, tidak ada relasi ke Category/Order — murni konten editorial.
 */
class Post extends Model
{
    use HasFactory;

    protected $table = 'posts';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'thumbnail',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Boot model — auto-generate slug dari title kalau kosong.
     */
    protected static function booted(): void
    {
        static::saving(function (Post $post) {
            if (empty($post->slug)) {
                $post->slug = static::generateUniqueSlug($post->title, $post->id);
            }
        });
    }

    /**
     * Scope: hanya post yang published + published_at <= now.
     * Untuk endpoint publik.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Generate slug unik berdasarkan title, exclude current id (untuk update).
     */
    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'catatan';
        $slug = $base;
        $counter = 1;

        $query = static::query()->where('slug', $slug);
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = $base.'-'.$counter;
            $query = static::query()->where('slug', $slug);
            if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
            $counter++;
        }

        return $slug;
    }
}
