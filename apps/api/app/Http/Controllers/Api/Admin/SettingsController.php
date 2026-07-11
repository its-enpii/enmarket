<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\Storage\EnStorageClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * SettingsController — admin endpoint untuk site-wide settings.
 *
 * Endpoints:
 * - GET  /api/admin/settings → semua settings grouped
 * - PATCH /api/admin/settings → update 1 group (identity, social, footer, payment, channels)
 *
 * Return shape konsisten dengan frontend `SiteSettings` type di types.ts.
 * Payment secrets (api_key, private_key) di-mask on read — tidak pernah
 * expose nilai asli.
 */
class SettingsController extends Controller
{
    public function __construct(
        private readonly EnStorageClient $storage,
    ) {
    }

    /**
     * GET /api/admin/settings
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->buildGroupedSettings(),
        ]);
    }

    /**
     * PATCH /api/admin/settings
     * Body: { group: 'identity'|'social'|'footer'|'payment'|'channels', values: {...} }
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'group' => ['required', 'string', 'in:identity,social,footer,payment,channels'],
            'values' => ['required', 'array'],
        ]);

        // Special case: social group stores everything as JSON in single key.
        // Shape per row: { label, url } — fully free-form, user defines sendiri
        // platform name (Instagram, Twitter, custom, dll).
        if ($data['group'] === 'social') {
            $links = $data['values']['social_links'] ?? $data['values'];
            if (! is_array($links)) {
                $links = [];
            }
            // Filter: hanya row dengan label + url non-empty yang disimpan.
            $clean = array_values(array_filter($links, fn ($l) =>
                is_array($l) && ! empty($l['label']) && ! empty($l['url'])
            ));
            // Normalize: trim values.
            $clean = array_map(fn ($l) => [
                'label' => trim((string) $l['label']),
                'url' => trim((string) $l['url']),
            ], $clean);

            SiteSetting::updateOrCreate(
                ['key' => 'social_links'],
                ['value' => json_encode($clean), 'type' => 'json'],
            );

            return response()->json([
                'data' => $this->buildGroupedSettings(),
                'message' => 'Social links berhasil disimpan.',
            ]);
        }

        $keys = $this->keysForGroup($data['group']);
        foreach ($keys as $key => $type) {
            // Skip secret fields yang kosong — biarkan nilai existing (masked read)
            if ($type === 'secret' && empty($data['values'][$key])) {
                continue;
            }

            $value = $data['values'][$key] ?? null;

            // Booleans → '1'/'0' storage
            if ($type === 'boolean') {
                SiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value ? '1' : '0', 'type' => 'boolean'],
                );
            } else {
                SiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => is_scalar($value) ? (string) $value : null, 'type' => $type],
                );
            }
        }

        return response()->json([
            'data' => $this->buildGroupedSettings(),
            'message' => 'Pengaturan berhasil disimpan.',
        ]);
    }

    /**
     * POST /api/admin/settings/logo
     * Multipart upload logo studio → simpan ke EnStorage → return URL.
     * Field: 'file' (image/png, image/svg+xml, image/jpeg, image/webp, max 2MB).
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:png,svg,jpg,jpeg,webp', 'max:2048'],
        ]);

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $filename = 'logo-' . Str::random(16) . '.' . $ext;
        $url = $this->storage->upload($file, "settings/{$filename}");

        // Update logo_url di site_settings otomatis
        SiteSetting::updateOrCreate(
            ['key' => 'logo_url'],
            ['value' => $url, 'type' => 'string'],
        );

        return response()->json([
            'data' => ['logo_url' => $url],
            'message' => 'Logo berhasil di-upload.',
        ]);
    }

    /**
     * Group flat key/value ke nested shape yang dipakai frontend.
     * Payment secrets: tampilkan masked value (bukan raw).
     */
    private function buildGroupedSettings(): array
    {
        $flat = SiteSetting::all()->keyBy('key');

        $raw = fn (string $key) => $flat[$key]->value ?? null;
        $masked = fn (?string $value) => $value ? '••••••••' : null;

        // Social links: stored sebagai JSON array di single key 'social_links'.
        // User bisa tambah/hapus link rows di UI — link rows dinamis.
        $socialRaw = $raw('social_links');
        $socialLinks = $socialRaw ? json_decode($socialRaw, true) : null;
        if (! is_array($socialLinks)) {
            $socialLinks = [];
        }

        return [
            'identity' => [
                'studio_name' => $raw('studio_name'),
                'tagline' => $raw('tagline'),
                'logo_url' => $raw('logo_url'),
            ],
            'social' => $socialLinks,
            'footer' => [
                'text' => $raw('footer_text'),
            ],
            'payment' => [
                'tripay_merchant' => $raw('tripay_merchant'),
                'tripay_api_key_masked' => $masked($raw('tripay_api_key')),
                'tripay_private_key_masked' => $masked($raw('tripay_private_key')),
                'tripay_mode' => $raw('tripay_mode') ?? 'sandbox',
            ],
            'channels' => [
                'qris' => $this->parseBool($raw('channel_qris')),
                'va' => $this->parseBool($raw('channel_va')),
                'ewallet' => $this->parseBool($raw('channel_ewallet')),
                'convenience_store' => $this->parseBool($raw('channel_convenience_store')),
            ],
            'maintenance' => [
                'message' => $raw('maintenance_message'),
            ],
        ];
    }

    /**
     * Default social platforms — dipakai sebagai fallback kalau DB kosong.
     * Real list disimpan di site_settings key 'social_platforms' dan
     * bisa di-edit via admin UI (SocialSection di /admin/settings).
     */
    private function parseBool(?string $value): bool
    {
        return in_array($value, ['1', 'true', 'on'], true);
    }

    /**
     * Map group name → array of {key, type}.
     */
    private function keysForGroup(string $group): array
    {
        return match ($group) {
            'identity' => [
                'studio_name' => 'string',
                'tagline' => 'string',
                'logo_url' => 'string',
            ],
            // 'social' handled separately in update() — stored as JSON in
            // single 'social_links' key, not per-platform.
            'footer' => [
                'footer_text' => 'string',
            ],
            'payment' => [
                'tripay_merchant' => 'string',
                'tripay_api_key' => 'secret',
                'tripay_private_key' => 'secret',
                'tripay_mode' => 'string',
            ],
            'channels' => [
                'channel_qris' => 'boolean',
                'channel_va' => 'boolean',
                'channel_ewallet' => 'boolean',
                'channel_convenience_store' => 'boolean',
            ],
            default => [],
        };
    }
}
