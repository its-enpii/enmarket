<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Game extends Model
{
    protected $table = 'games';

    protected $fillable = [
        'slug',
        'nama',
        'brand',
        'icon_url',
        'banner_url',
        'requires_server_id',
        'description',
        'sort_order',
        'active',
        'digiflazz_category',
    ];

    protected $casts = [
        'requires_server_id' => 'boolean',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (Game $game) {
            if (empty($game->slug)) {
                $game->slug = static::generateUniqueSlug($game->nama, $game->id);
            }
        });
    }

    public function items(): HasMany
    {
        return $this->hasMany(GameItem::class)->orderBy('sort_order');
    }

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
