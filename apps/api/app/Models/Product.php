<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'nama',
        'slug',
        'deskripsi',
        'harga',
        'tipe',
        'file_url',
        'download_expiry_days',
        'preview_images',
        'fitur',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'preview_images' => 'array',
        'fitur' => 'array',
        'download_expiry_days' => 'integer',
        'is_featured' => 'boolean',
    ];

    /**
     * Boot model — auto-generate slug dari nama kalau kosong.
     */
    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->nama, $product->id);
            }
        });
    }

    /**
     * Kategori produk (nullable — produk bisa tanpa kategori).
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * License keys yang tersedia/digunakan untuk produk ini.
     */
    public function licenseKeys(): HasMany
    {
        return $this->hasMany(LicenseKey::class);
    }

    /**
     * Order items yang merujuk produk ini.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope: hanya produk yang dijual ke publik.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope: hanya produk yang ditandai featured untuk halaman utama.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Generate slug unik berdasarkan nama, exclude current id (untuk update).
     */
    public static function generateUniqueSlug(string $nama, ?int $ignoreId = null): string
    {
        $base = Str::slug($nama) ?: 'produk';
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

    /**
     * Apakah produk butuh license key saat pengiriman?
     */
    public function needsLicenseKey(): bool
    {
        return in_array($this->tipe, ['license', 'bundle'], true);
    }

    /**
     * Apakah produk punya file untuk di-download?
     */
    public function hasDownloadableFile(): bool
    {
        return in_array($this->tipe, ['download', 'bundle'], true) && ! empty($this->file_url);
    }
}
