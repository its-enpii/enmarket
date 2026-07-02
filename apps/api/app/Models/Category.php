<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'nama',
        'slug',
        'deskripsi',
    ];

    /**
     * Boot model — auto-generate slug dari nama kalau kosong.
     */
    protected static function booted(): void
    {
        static::saving(function (Category $category) {
            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug($category->nama, $category->id);
            }
        });
    }

    /**
     * Semua produk dalam kategori ini.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Generate slug unik berdasarkan nama, exclude current id (untuk update).
     */
    public static function generateUniqueSlug(string $nama, ?int $ignoreId = null): string
    {
        $base = Str::slug($nama);
        $slug = $base;
        $counter = 1;

        $query = static::query()->where('slug', $slug);
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = $base . '-' . $counter;
            $query = static::query()->where('slug', $slug);
            if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
            $counter++;
        }

        return $slug;
    }
}