<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel site_settings — key/value JSON-flat store untuk semua konfigurasi
     * site yang sebelumnya hanya ada di .env atau hardcoded:
     *
     * - Identity: studio_name, tagline, logo_url
     * - Social: social_instagram, social_twitter, social_arena, social_github
     * - Footer: footer_text
     * - Payment: tripay_merchant, tripay_api_key, tripay_private_key, tripay_mode
     * - Channels: channel_qris, channel_va, channel_ewallet, channel_convenience_store
     * - Maintenance: maintenance_message (banner text)
     *
     * Mengapa key/value bukan table-wide columns? Agar tambah setting baru
     * tidak perlu migrate. Tipe disimpan di 'type' untuk boolean/json/string
     * cast yang konsisten.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('type', 20)->default('string'); // 'string' | 'boolean' | 'json' | 'secret'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
