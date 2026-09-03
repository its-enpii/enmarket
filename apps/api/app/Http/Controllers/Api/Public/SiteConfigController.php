<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\NavMenu;
use App\Models\SiteSetting;
use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;

/**
 * SiteConfigController — public read-only site config.
 *
 * Return settings yang AMAN di-expose ke public storefront (identity,
 * social, footer, sponsors). Payment credentials & maintenance secret TIDAK ikut.
 */
class SiteConfigController extends Controller
{
    /**
     * GET /api/public/site-config
     */
    public function show(): JsonResponse
    {
        $flat = SiteSetting::all()->keyBy('key');
        $raw = fn (string $key) => $flat[$key]->value ?? null;

        // Social links: {label, url}[] dari JSON. Shape sama dengan admin
        // endpoint — supaya frontend tinggal consume langsung tanpa mapping.
        $socialRaw = $raw('social_links');
        $socialLinks = $socialRaw ? json_decode($socialRaw, true) : [];
        if (! is_array($socialLinks)) {
            $socialLinks = [];
        }
        $socialLinks = array_values(array_filter(
            $socialLinks,
            fn ($l) => is_array($l) && ! empty($l['label']) && ! empty($l['url']),
        ));

        // Sponsors: top N active sponsors sorted by amount desc, created_at asc
        $topCountSetting = $raw('sponsors_top_count');
        $topCount = is_numeric($topCountSetting) ? max((int) $topCountSetting, 1) : 5;

        $sponsors = Sponsor::where('is_active', true)
            ->orderByDesc('amount')
            ->orderBy('created_at', 'asc')
            ->limit($topCount)
            ->get()
            ->map(fn (Sponsor $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'url' => $s->url,
                'logo_url' => $s->logo_url,
                'description' => ! empty($s->description) ? $s->description : $s->fetched_description,
            ])
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'studio_name' => $raw('studio_name'),
                'tagline' => $raw('tagline'),
                'logo_url' => $raw('logo_url'),
                'social' => $socialLinks,
                'footer' => [
                    'text' => $raw('footer_text'),
                ],
                'payment_gateways' => (function () use ($raw) {
                    $val = $raw('payment_gateways');
                    $decoded = $val ? json_decode($val, true) : null;
                    if (! is_array($decoded)) {
                        return ['tripay' => ['enabled' => true], 'duitku' => ['enabled' => false]];
                    }
                    return array_map(fn ($g) => ['enabled' => $g['enabled'] ?? false], $decoded);
                })(),
                'nav_menus' => NavMenu::query()
                    ->where('is_enabled', true)
                    ->orderBy('sort_order')
                    ->orderBy('key')
                    ->get()
                    ->map(fn (NavMenu $menu) => [
                        'key' => $menu->key,
                        'label' => $menu->label,
                        'href' => '/'.$menu->key,
                    ])
                    ->values()
                    ->all(),
                'sponsors' => $sponsors,
            ],
        ]);
    }
}
