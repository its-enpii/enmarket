<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'is_pre_order',
        'release_date',
        'preorder_deposit_percent',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'preview_images' => 'array',
        'fitur' => 'array',
        'download_expiry_days' => 'integer',
        'is_featured' => 'boolean',
        'is_pre_order' => 'boolean',
        'release_date' => 'date',
        'preorder_deposit_percent' => 'integer',
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

            // Invariant pre-order: kalau is_pre_order=true, release_date & percent wajib.
            // release_date harus hari ini atau setelahnya (tidak boleh di masa lalu).
            // Validation rules di controller sudah handle ini untuk request HTTP;
            // invariant di sini catch direct ORM usage (factory, seeder, tinker).
            if ($product->is_pre_order) {
                if (empty($product->release_date)) {
                    throw new \InvalidArgumentException('release_date wajib diisi untuk produk pre-order.');
                }
                if ($product->release_date->lt(today()->startOfDay())) {
                    throw new \InvalidArgumentException('release_date tidak boleh di masa lalu untuk produk pre-order.');
                }
                if ($product->preorder_deposit_percent === null
                    || $product->preorder_deposit_percent < 1
                    || $product->preorder_deposit_percent > 100) {
                    throw new \InvalidArgumentException('preorder_deposit_percent harus 1-100 untuk produk pre-order.');
                }
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
     * Blog posts yang di-link dari produk ini (panduan, warning, catatan).
     * Sort by `urutan` asc + `id` asc sebagai tie-breaker — admin atur urutan
     * tampil di detail produk via pivot `urutan` column.
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'product_post')
            ->withPivot('urutan')
            ->orderBy('product_post.urutan')
            ->orderBy('product_post.id');
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

    /**
     * Apakah produk butuh aktivasi manual admin sebelum delivery?
     *
     * Produk bertipe `account_manual` (akun langganan, akun game,
     * kredensial API) — buyer tidak terima delivery otomatis. Order item
     * dibuat via AccountProvisioningService dengan status menunggu_admin.
     */
    public function requiresManualActivation(): bool
    {
        return $this->tipe === 'account_manual';
    }

    /**
     * Apakah produk dijual sebagai pre-order (DP dulu, fulfillment saat release)?
     * Alias guard untuk (bool) $this->is_pre_order — readable di view + service.
     */
    public function isPreOrderable(): bool
    {
        return (bool) $this->is_pre_order;
    }

    /**
     * Jumlah DP dalam rupiah (integer, hasil rounding agar Tripay amount integer).
     * Return 0 untuk produk non-pre-order — caller harus branch via isPreOrderable().
     */
    public function depositAmount(): int
    {
        if (! $this->isPreOrderable()) {
            return 0;
        }
        $harga = (int) round((float) $this->harga);
        $pct = (int) $this->preorder_deposit_percent;

        return (int) round($harga * $pct / 100);
    }

    /**
     * Sisa harga yang "tidak dibayar" DP. Display only — model saat ini
     * buyer tidak bayar kedua kali (DP = harga penuh), jadi ini untuk
     * transparansi di UI summary.
     */
    public function remainingAmount(): int
    {
        if (! $this->isPreOrderable()) {
            return 0;
        }
        $harga = (int) round((float) $this->harga);

        return $harga - $this->depositAmount();
    }
}
