<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Services\SiteSettings;
use App\Services\Storage\EnStorageClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Test untuk SiteConfigController (public), SettingsController (admin),
 * dan SiteSettings service (cached k/v accessor).
 */
class SiteConfigTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token-abc';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    // ───── SiteConfigController (public) ─────

    public function test_public_site_config_returns_grouped_identity(): void
    {
        SiteSetting::create(['key' => 'studio_name', 'value' => 'enpiistudio', 'type' => 'string']);
        SiteSetting::create(['key' => 'tagline', 'value' => 'Discover, develop, display.', 'type' => 'string']);
        SiteSetting::create(['key' => 'logo_url', 'value' => 'https://example.com/logo.png', 'type' => 'string']);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $response->assertJsonPath('data.studio_name', 'enpiistudio');
        $response->assertJsonPath('data.tagline', 'Discover, develop, display.');
        $response->assertJsonPath('data.logo_url', 'https://example.com/logo.png');
    }

    public function test_public_site_config_never_exposes_payment_secrets(): void
    {
        SiteSetting::create(['key' => 'tripay_api_key', 'value' => 'super-secret-key', 'type' => 'secret']);
        SiteSetting::create(['key' => 'tripay_private_key', 'value' => 'super-private-key', 'type' => 'secret']);

        $response = $this->getJson('/api/public/site-config');

        $content = $response->getContent();
        $this->assertStringNotContainsString('super-secret-key', $content);
        $this->assertStringNotContainsString('super-private-key', $content);
    }

    public function test_public_site_config_returns_null_for_missing_keys(): void
    {
        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $this->assertNull($response->json('data.studio_name'));
        $this->assertNull($response->json('data.tagline'));
    }

    public function test_public_site_config_returns_social_links_array(): void
    {
        SiteSetting::create(['key' => 'social_instagram', 'value' => 'https://ig.com/x', 'type' => 'string']);
        SiteSetting::create(['key' => 'social_github', 'value' => 'https://gh.com/x', 'type' => 'string']);

        $response = $this->getJson('/api/public/site-config');
        $response->assertJsonPath('data.social.instagram', 'https://ig.com/x');
        $response->assertJsonPath('data.social.github', 'https://gh.com/x');
    }

    // ───── SettingsController (admin) ─────

    public function test_admin_settings_index_returns_grouped_payload(): void
    {
        SiteSetting::create(['key' => 'studio_name', 'value' => 'Test Studio', 'type' => 'string']);

        $response = $this->getJson('/api/admin/settings', ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'identity' => ['studio_name', 'tagline', 'logo_url'],
                'footer' => ['text'],
                'payment' => ['tripay_merchant', 'tripay_api_key_masked', 'tripay_private_key_masked', 'tripay_mode'],
                'channels' => ['qris', 'va', 'ewallet', 'convenience_store'],
            ],
        ]);
    }

    public function test_admin_settings_masks_payment_secrets(): void
    {
        SiteSetting::create(['key' => 'tripay_api_key', 'value' => 'real-api-key-12345', 'type' => 'secret']);

        $response = $this->getJson('/api/admin/settings', ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $this->assertEquals('••••••••', $response->json('data.payment.tripay_api_key_masked'));
        $this->assertStringNotContainsString('real-api-key-12345', $response->getContent());
    }

    public function test_admin_settings_update_validates_group_in_whitelist(): void
    {
        $response = $this->patchJson('/api/admin/settings', [
            'group' => 'invalid_group',
            'values' => ['x' => 1],
        ], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertStatus(422);
    }

    public function test_admin_settings_update_identity_persists_keys(): void
    {
        $response = $this->patchJson('/api/admin/settings', [
            'group' => 'identity',
            'values' => [
                'studio_name' => 'New Studio',
                'tagline' => 'New Tagline',
            ],
        ], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $this->assertEquals('New Studio', SiteSetting::where('key', 'studio_name')->value('value'));
        $this->assertEquals('New Tagline', SiteSetting::where('key', 'tagline')->value('value'));
    }

    public function test_admin_settings_update_secret_empty_does_not_overwrite(): void
    {
        SiteSetting::create(['key' => 'tripay_api_key', 'value' => 'existing-key', 'type' => 'secret']);

        $response = $this->patchJson('/api/admin/settings', [
            'group' => 'payment',
            'values' => [
                'tripay_merchant' => 'M-001',
                'tripay_api_key' => '',  // empty — skip overwrite
            ],
        ], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $this->assertEquals('existing-key', SiteSetting::where('key', 'tripay_api_key')->value('value'),
            'Empty secret TIDAK boleh overwrite');
        $this->assertEquals('M-001', SiteSetting::where('key', 'tripay_merchant')->value('value'));
    }

    public function test_admin_settings_update_channels_persists_booleans(): void
    {
        $response = $this->patchJson('/api/admin/settings', [
            'group' => 'channels',
            'values' => [
                'channel_qris' => true,
                'channel_va' => false,
                'channel_ewallet' => true,
                'channel_convenience_store' => false,
            ],
        ], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $this->assertEquals('1', SiteSetting::where('key', 'channel_qris')->value('value'));
        $this->assertEquals('0', SiteSetting::where('key', 'channel_va')->value('value'));
        $this->assertEquals('1', SiteSetting::where('key', 'channel_ewallet')->value('value'));
        $this->assertEquals('0', SiteSetting::where('key', 'channel_convenience_store')->value('value'));
    }

    public function test_admin_settings_update_social_stores_as_json_array(): void
    {
        $response = $this->patchJson('/api/admin/settings', [
            'group' => 'social',
            'values' => [
                'social_links' => [
                    ['label' => 'Instagram', 'url' => 'https://ig.com/x'],
                    ['label' => '  Github  ', 'url' => '  https://gh.com/x  '],
                    ['label' => '', 'url' => 'https://skip.com'],  // filter out empty label
                ],
            ],
        ], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $stored = json_decode(SiteSetting::where('key', 'social_links')->value('value'), true);
        $this->assertCount(2, $stored, 'Empty label harus difilter');
        $this->assertEquals('Github', $stored[1]['label'], 'Label harus di-trim');
        $this->assertEquals('https://gh.com/x', $stored[1]['url']);
    }

    public function test_admin_settings_logo_upload_validates_mime_and_size(): void
    {
        $file = UploadedFile::fake()->create('logo.gif', 100);  // gif not in whitelist
        $response = $this->postJson('/api/admin/settings/logo', ['file' => $file], ['Authorization' => 'Bearer '.self::TOKEN]);
        $response->assertStatus(422);

        $bigFile = UploadedFile::fake()->create('big.png', 3000);  // 3MB > 2MB limit
        $response2 = $this->postJson('/api/admin/settings/logo', ['file' => $bigFile], ['Authorization' => 'Bearer '.self::TOKEN]);
        $response2->assertStatus(422);
    }

    public function test_admin_settings_logo_upload_saves_url_to_site_setting(): void
    {
        // Mock storage client — supaya upload return predictable URL
        $this->app->bind(EnStorageClient::class, fn () => new class implements EnStorageClient
        {
            public function upload(\Illuminate\Http\UploadedFile $file, string $destinationPath): string
            {
                return 'enstorage/settings/uploaded-logo.png';
            }

            public function delete(string $path): bool
            {
                return true;
            }

            public function exists(string $path): bool
            {
                return true;
            }

            public function url(string $path): string
            {
                return '/storage/'.$path;
            }
        });

        $file = UploadedFile::fake()->image('logo.png', 200, 200);
        $response = $this->postJson('/api/admin/settings/logo', ['file' => $file], ['Authorization' => 'Bearer '.self::TOKEN]);

        $response->assertOk();
        $response->assertJsonPath('data.logo_url', 'enstorage/settings/uploaded-logo.png');
        $this->assertEquals('enstorage/settings/uploaded-logo.png', SiteSetting::where('key', 'logo_url')->value('value'));
    }

    // ───── SiteSettings service ─────

    public function test_service_get_returns_casted_value_by_type(): void
    {
        $settings = app(SiteSettings::class);

        SiteSetting::create(['key' => 'studio_name', 'value' => 'enpii', 'type' => 'string']);
        SiteSetting::create(['key' => 'flag_enabled', 'value' => '1', 'type' => 'boolean']);
        SiteSetting::create(['key' => 'social_links', 'value' => json_encode(['x' => 'y']), 'type' => 'json']);

        $this->assertEquals('enpii', $settings->get('studio_name'));
        $this->assertTrue($settings->get('flag_enabled'));
        $this->assertEquals(['x' => 'y'], $settings->get('social_links'));
    }

    public function test_service_set_forgets_cache_after_write(): void
    {
        SiteSetting::create(['key' => 'studio_name', 'value' => 'Old', 'type' => 'string']);

        $settings = app(SiteSettings::class);
        // Warm cache
        $this->assertEquals('Old', $settings->get('studio_name'));

        // Update
        $settings->set('studio_name', 'New', 'string');

        // Re-read — harus dapat new value (cache invalidated)
        $this->assertEquals('New', $settings->get('studio_name'));
    }

    public function test_service_set_boolean_stores_as_1_or_0(): void
    {
        app(SiteSettings::class)->set('flag_enabled', true, 'boolean');
        $this->assertEquals('1', SiteSetting::where('key', 'flag_enabled')->value('value'));

        app(SiteSettings::class)->set('flag_enabled', false, 'boolean');
        $this->assertEquals('0', SiteSetting::where('key', 'flag_enabled')->value('value'));
    }

    public function test_service_is_enabled_returns_boolean_for_truthy_values(): void
    {
        Cache::forget('site_settings:all');
        $settings = app(SiteSettings::class);

        $this->assertFalse($settings->isEnabled('nonexistent'));

        SiteSetting::create(['key' => 'enabled_flag', 'value' => '1', 'type' => 'boolean']);
        Cache::forget('site_settings:all');
        $this->assertTrue($settings->isEnabled('enabled_flag'));

        SiteSetting::where('key', 'enabled_flag')->update(['value' => '0']);
        Cache::forget('site_settings:all');
        $this->assertFalse($settings->isEnabled('enabled_flag'));
    }

    public function test_service_all_returns_map_of_casted_values(): void
    {
        SiteSetting::create(['key' => 'a', 'value' => '1', 'type' => 'string']);
        SiteSetting::create(['key' => 'b', 'value' => 'on', 'type' => 'boolean']);

        $all = app(SiteSettings::class)->all();

        $this->assertEquals('1', $all['a']);
        $this->assertTrue($all['b']);
    }
}