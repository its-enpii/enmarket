<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * SiteSetting — key/value store untuk konfigurasi site-wide.
 *
 * Sebaiknya diakses via SiteSettings service (cache-wrapped), bukan direct
 * Eloquent query. Service ensures consistency + cache invalidation.
 */
class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    public $timestamps = true;
}
