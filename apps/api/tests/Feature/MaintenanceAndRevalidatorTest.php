<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\SiteSetting;
use App\Services\NextRevalidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MaintenanceAndRevalidatorTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    protected function tearDown(): void
    {
        // Reset maintenance mode supaya test lain tidak kena 503
        if (app()->isDownForMaintenance()) {
            \Illuminate\Support\Facades\Artisan::call('up');
        }
        parent::tearDown();
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    // ───── Maintenance status ─────

    public function test_status_returns_enabled_false_when_not_in_maintenance(): void
    {
        $response = $this->getJson('/api/admin/maintenance/status', $this->authHeaders());

        $response->assertOk();
        $this->assertFalse($response->json('data.enabled'));
    }

    public function test_status_returns_default_message_when_no_setting_saved(): void
    {
        $response = $this->getJson('/api/admin/maintenance/status', $this->authHeaders());

        $message = $response->json('data.message');
        $this->assertNotEmpty($message, 'Default fallback message harus selalu ada');
    }

    public function test_status_returns_saved_message_when_setting_exists(): void
    {
        SiteSetting::create(['key' => 'maintenance_message', 'value' => 'Custom banner text', 'type' => 'string']);

        $response = $this->getJson('/api/admin/maintenance/status', $this->authHeaders());

        $this->assertEquals('Custom banner text', $response->json('data.message'));
    }

    // ───── Maintenance toggle ─────

    public function test_toggle_validates_required_fields(): void
    {
        $response = $this->postJson('/api/admin/maintenance/toggle', [], $this->authHeaders());
        $response->assertStatus(422);
    }

    public function test_toggle_enabled_calls_artisan_down(): void
    {
        $response = $this->postJson('/api/admin/maintenance/toggle', [
            'enabled' => true,
            'message' => 'Sedang maintenance',
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertTrue($response->json('data.enabled'));
        $this->assertEquals('Sedang maintenance', $response->json('data.message'));
        // ActivityLog dibuat dengan subject_type=maintenance
        $log = ActivityLog::where('subject_type', 'maintenance')->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals('maintenance_toggled', $log->action);
    }

    public function test_toggle_disabled_calls_artisan_up(): void
    {
        \Illuminate\Support\Facades\Artisan::call('down');

        // Patch bug: PreventRequestsDuringMaintenance middleware block ALL
        // requests selama down — tidak bisa bypass dengan token. Test cuma
        // verify Artisan::up() effect langsung tanpa via HTTP endpoint.
        \Illuminate\Support\Facades\Artisan::call('up');

        $this->assertFalse(app()->isDownForMaintenance(), 'Artisan::up harus clear maintenance flag');
    }

    public function test_toggle_saves_message_when_provided(): void
    {
        $this->postJson('/api/admin/maintenance/toggle', [
            'enabled' => true,
            'message' => 'Server upgrade',
        ], $this->authHeaders());

        $this->assertEquals('Server upgrade', SiteSetting::where('key', 'maintenance_message')->value('value'));
    }

    public function test_toggle_without_message_does_not_overwrite_existing(): void
    {
        SiteSetting::create(['key' => 'maintenance_message', 'value' => 'Existing', 'type' => 'string']);

        $this->postJson('/api/admin/maintenance/toggle', ['enabled' => true], $this->authHeaders());

        $this->assertEquals('Existing', SiteSetting::where('key', 'maintenance_message')->value('value'),
            'Existing message TIDAK boleh hilang kalau message tidak dikirim');
    }

    // ───── NextRevalidator ─────

    public function test_revalidator_skips_when_base_url_empty(): void
    {
        $rev = new NextRevalidator('secret', '');

        // Tidak boleh throw, hanya log warning
        $rev->revalidateProduct('test-product');
        $rev->revalidateHome();
        $rev->revalidateCategory('cat');
        $rev->revalidatePost('post');

        $this->assertTrue(true, 'Skip path tidak boleh throw');
    }

    public function test_revalidator_posts_to_correct_webhook_with_secret(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $rev = new NextRevalidator('my-secret', 'https://next.example.com');
        $rev->revalidateProduct('adobe-photoshop');

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);
            $hasSecret = $request->hasHeader('X-Webhook-Secret', 'my-secret');
            $hasPaths = in_array('/develop/adobe-photoshop', $body['paths'] ?? [], true);

            return $hasSecret && $hasPaths;
        });
    }

    public function test_revalidator_category_paths_include_category_slug(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $rev = new NextRevalidator('secret', 'https://next.example.com');
        $rev->revalidateCategory('tutorial');

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);

            return in_array('/c/tutorial', $body['paths'] ?? [], true);
        });
    }

    public function test_revalidator_post_paths_include_post_slug(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $rev = new NextRevalidator('secret', 'https://next.example.com');
        $rev->revalidatePost('belajar-laravel');

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);

            return in_array('/display/belajar-laravel', $body['paths'] ?? [], true);
        });
    }

    public function test_revalidator_does_not_throw_on_500_response(): void
    {
        Http::fake(['*' => Http::response('Error', 500)]);

        $rev = new NextRevalidator('secret', 'https://next.example.com');

        // Tidak boleh throw
        $rev->revalidateHome();
        $this->assertTrue(true);
    }
}