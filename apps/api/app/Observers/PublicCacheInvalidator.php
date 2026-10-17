<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\NavMenu;
use App\Models\Post;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\Sponsor;
use App\Support\PublicCache;
use Illuminate\Database\Eloquent\Model;

/**
 * PublicCacheInvalidator — observer untuk cache endpoint publik (Lane D).
 *
 * Tertaut di saved (created/updated) & deleted: forget kunci publik yang
 * terdampak. Didaftarkan di AppServiceProvider::boot() via Model::observe(),
 * mengikuti pola ActivityLogger.
 */
class PublicCacheInvalidator
{
    public function saved(Model $model): void
    {
        $this->invalidate($model);
    }

    public function deleted(Model $model): void
    {
        $this->invalidate($model);
    }

    private function invalidate(Model $model): void
    {
        if ($model instanceof Product) {
            PublicCache::forgetMany(PublicCache::productKeys());
        } elseif ($model instanceof Post) {
            PublicCache::forgetMany(PublicCache::postKeys());
        } elseif ($model instanceof Category) {
            // Kategori ikut mengubah kategori-list + cache produk.
            PublicCache::forgetMany([
                PublicCache::CATEGORIES,
                PublicCache::CATEGORIES_SLUGS,
                ...PublicCache::productKeys(),
            ]);
        } elseif ($model instanceof SiteSetting || $model instanceof NavMenu || $model instanceof Sponsor) {
            // site-config juga memuat NavMenu + Sponsor.
            PublicCache::forgetMany([PublicCache::SITE_CONFIG]);
        }
    }
}
