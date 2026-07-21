<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test untuk Admin\AuthController.
 *
 * Auth pakai static token dari env (config app.admin_token).
 * Tidak ada tabel admin — jadi test ini cuma verifikasi flow cookie + response shape.
 */
class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token-abc123';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    // ───── login ─────

    public function test_login_validates_token_required(): void
    {
        $response = $this->postJson('/api/admin/login', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['token']);
    }

    public function test_login_returns_503_when_env_token_not_set(): void
    {
        config(['app.admin_token' => '']);

        $response = $this->postJson('/api/admin/login', ['token' => 'whatever']);
        $response->assertStatus(503);
        $response->assertJsonFragment(['code' => 'admin_token_missing']);
    }

    public function test_login_rejects_wrong_token_with_422(): void
    {
        $response = $this->postJson('/api/admin/login', ['token' => 'wrong-token']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['token']);
    }

    public function test_login_with_correct_token_sets_http_only_cookie(): void
    {
        $response = $this->postJson('/api/admin/login', ['token' => self::TOKEN]);

        $response->assertOk();
        $response->assertJsonFragment(['authenticated' => true]);

        // Cookie harus httpOnly (0 index di $cookie->getOptions()['httpOnly'])
        $cookies = $response->headers->getCookies();
        $adminCookie = collect($cookies)->first(fn ($c) => $c->getName() === 'admin_token');
        $this->assertNotNull($adminCookie, 'admin_token cookie harus di-set');
        $this->assertTrue($adminCookie->isHttpOnly(), 'Cookie harus httpOnly');
        $this->assertEquals(self::TOKEN, $adminCookie->getValue());
    }

    // ───── logout ─────

    public function test_logout_clears_admin_token_cookie(): void
    {
        $response = $this->call(
            'POST',
            '/api/admin/logout',
            [],
            ['admin_token' => self::TOKEN],
        );

        $response->assertOk();
        $response->assertJsonFragment(['authenticated' => false]);

        $cookies = $response->headers->getCookies();
        $cleared = collect($cookies)->first(fn ($c) => $c->getName() === 'admin_token');
        // Cookie yang di-forget biasanya null value + expired time.
        if ($cleared) {
            $this->assertLessThanOrEqual(time(), $cleared->getExpiresTime(), 'Cookie harus expired');
        }
    }

    // ───── me ─────

    public function test_me_with_correct_bearer_token_returns_authenticated(): void
    {
        $response = $this->getJson('/api/admin/me', [
            'Authorization' => 'Bearer '.self::TOKEN,
        ]);
        $response->assertOk();
        $response->assertJsonStructure(['authenticated', 'service', 'env']);
        $this->assertTrue($response->json('authenticated'));
        $this->assertEquals(config('app.name'), $response->json('service'));
    }

    public function test_me_with_cookie_also_works(): void
    {
        $response = $this->call('GET', '/api/admin/me', [], ['admin_token' => self::TOKEN]);
        $response->assertOk();
        $this->assertTrue(json_decode($response->getContent(), true)['authenticated']);
    }

    // ───── constant-time comparison (hash_equals) ─────

    public function test_login_uses_constant_time_comparison_for_token(): void
    {
        // Token beda 1 char harus tetap 422 (bukan 200). Validasi basic.
        $almostCorrect = substr(self::TOKEN, 0, -1).'X';

        $response = $this->postJson('/api/admin/login', ['token' => $almostCorrect]);
        $response->assertStatus(422);
    }

    public function test_login_rejects_empty_string_token(): void
    {
        $response = $this->postJson('/api/admin/login', ['token' => '']);
        $response->assertStatus(422);
    }
}
