<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

/**
 * SiteConfigController — public read-only site config.
 *
 * Return settings yang AMAN di-expose ke public storefront (identity,
 * social, footer). Payment credentials & maintenance secret TIDAK ikut.
 *
 * Catatan: saat ini belum ada consumer. Endpoint di-expose untuk fase
 * berikutnya saat footer/header public baca dari sini.
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

        return response()->json([
            'data' => [
                'studio_name' => $raw('studio_name'),
                'tagline' => $raw('tagline'),
                'logo_url' => $raw('logo_url'),
                'social' => [
                    'instagram' => $raw('social_instagram'),
                    'twitter' => $raw('social_twitter'),
                    'arena' => $raw('social_arena'),
                    'github' => $raw('social_github'),
                ],
                'footer' => [
                    'text' => $raw('footer_text'),
                ],
            ],
        ]);
    }
}
