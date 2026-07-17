<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * SiteSettings — cached key/value accessor untuk site-wide settings.
 *
 * Wrap Eloquent queries dengan Cache::rememberForever. set() auto-forget
 * cache key supaya next get() re-populate. TTL pakai forever karena
 * settings jarang berubah — invalidation explicit on write.
 *
 * Usage:
 *   $settings = app(SiteSettings::class);
 *   $studioName = $settings->get('studio_name', 'enpiistudio');
 *   $settings->set('studio_name', 'New Name');
 *
 * @method string|null get(string $key, string|null $default = null)
 * @method void set(string $key, mixed $value, string $type = 'string')
 * @method array all(): array<string, mixed>
 */
class SiteSettings
{
    private const CACHE_KEY = 'site_settings:all';

    /**
     * @return array<string, mixed> Map key => casted value.
     */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return SiteSetting::all()
                ->mapWithKeys(fn (SiteSetting $s) => [$s->key => $this->castValue($s->value, $s->type)])
                ->all();
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $all = $this->all();

        return $all[$key] ?? $default;
    }

    public function set(string $key, mixed $value, string $type = 'string'): void
    {
        $storedValue = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => is_string($value) ? $value : json_encode($value),
            default => is_scalar($value) ? (string) $value : json_encode($value),
        };

        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue, 'type' => $type],
        );

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Helper untuk cek boolean flag (default false).
     */
    public function isEnabled(string $key): bool
    {
        return (bool) $this->get($key, false);
    }

    /**
     * Cast raw string value ke tipe yang sesuai.
     */
    private function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => in_array($value, ['1', 'true', 'on'], true),
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
