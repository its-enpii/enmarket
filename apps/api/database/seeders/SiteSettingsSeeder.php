<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

/**
 * Seed default site_settings — dipanggil dari DatabaseSeeder.
 *
 * Idempotent: pakai updateOrCreate, aman di-run berkali-kali.
 * Default values mirror hardcoded text existing di frontend supaya
 * transition dari "Coming soon" placeholder terlihat seamless.
 */
class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Identity
            ['key' => 'studio_name', 'value' => 'enpiistudio', 'type' => 'string'],
            ['key' => 'tagline', 'value' => 'Studio digital independen — discover, develop, display.', 'type' => 'string'],
            ['key' => 'logo_url', 'value' => null, 'type' => 'string'],

            // Social — stored sebagai JSON array di single key 'social_links'.
            // Shape: [{ label, url }, ...] — fully free-form. User ngetik sendiri
            // label platform (Instagram, Twitter, Are.na, Custom, dll) — tidak ada
            // dropdown predetermined.
            [
                'key' => 'social_links',
                'value' => json_encode([
                    ['label' => 'Instagram', 'url' => 'https://instagram.com/enpiistudio'],
                    ['label' => 'Twitter / X', 'url' => ''],
                    ['label' => 'Are.na', 'url' => ''],
                    ['label' => 'GitHub', 'url' => 'https://github.com/enpiistudio'],
                ]),
                'type' => 'json',
            ],

            // Catatan: daftar platform BUKAN settings — user definisi sendiri
            // di 'social_links' dengan ngetik label. Tidak ada predetermined list.

            // Footer
            ['key' => 'footer_text', 'value' => 'Karya tangan dari studio enpii. Setiap produk di sini dibuat dengan niat, bukan massal.', 'type' => 'string'],

            // Payment
            ['key' => 'tripay_merchant', 'value' => null, 'type' => 'string'],
            ['key' => 'tripay_api_key', 'value' => null, 'type' => 'secret'],
            ['key' => 'tripay_private_key', 'value' => null, 'type' => 'secret'],
            ['key' => 'tripay_mode', 'value' => 'sandbox', 'type' => 'string'],

            // Channels
            ['key' => 'channel_qris', 'value' => '1', 'type' => 'boolean'],
            ['key' => 'channel_va', 'value' => '1', 'type' => 'boolean'],
            ['key' => 'channel_ewallet', 'value' => '0', 'type' => 'boolean'],
            ['key' => 'channel_convenience_store', 'value' => '0', 'type' => 'boolean'],

            // Maintenance
            ['key' => 'maintenance_message', 'value' => 'Sedang dalam perbaikan. Coba lagi sebentar lagi ya.', 'type' => 'string'],
        ];

        // Hapus legacy social_* keys (dari versi sebelum social_links migration).
        SiteSetting::whereIn('key', [
            'social_instagram', 'social_twitter', 'social_arena', 'social_github',
            'social_platforms',
        ])->delete();

        foreach ($defaults as $row) {
            SiteSetting::updateOrCreate(
                ['key' => $row['key']],
                ['value' => $row['value'], 'type' => $row['type']],
            );
        }
    }
}
