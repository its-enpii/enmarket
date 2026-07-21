<?php

namespace Tests\Feature;

use App\Models\LicenseKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk Admin\LicenseKeyController (CRUD + revoke + extend + generate).
 *
 * Endpoint protected oleh middleware admin token — test set Bearer di header.
 */
class LicenseKeyAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token-xyz';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    private function adminHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    // ───── index (list + filter + sort + pagination) ─────

    public function test_index_returns_paginated_response(): void
    {
        $productId = $this->makeProduct();
        $this->makeLicenseKey($productId, 'aktif', 'AAA-AAAA-AAAA-AAAA');
        $this->makeLicenseKey($productId, 'aktif', 'BBB-BBBB-BBBB-BBBB');

        $response = $this->getJson('/api/admin/license-keys', $this->adminHeaders());

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [['id', 'product_id', 'key', 'status', 'created_at']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_index_filters_by_status(): void
    {
        $productId = $this->makeProduct();
        $this->makeLicenseKey($productId, 'aktif');
        $this->makeLicenseKey($productId, 'digunakan');

        $response = $this->getJson('/api/admin/license-keys?status=aktif', $this->adminHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('aktif', $response->json('data.0.status'));
    }

    public function test_index_filters_by_product_id(): void
    {
        $p1 = $this->makeProduct();
        $p2 = $this->makeProduct();
        $this->makeLicenseKey($p1);
        $this->makeLicenseKey($p2);

        $response = $this->getJson("/api/admin/license-keys?product_id={$p2}", $this->adminHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals($p2, $response->json('data.0.product_id'));
    }

    public function test_index_search_by_key_substring(): void
    {
        $productId = $this->makeProduct();
        $this->makeLicenseKey($productId, 'aktif', 'PROD-ABCD-EFGH-IJKL');
        $this->makeLicenseKey($productId, 'aktif', 'TEST-WXYZ-MNOP-QRST');

        $response = $this->getJson('/api/admin/license-keys?q=ABCD', $this->adminHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertStringContainsString('ABCD', $response->json('data.0.key'));
    }

    public function test_index_rejects_invalid_sort_field_falls_back_to_id(): void
    {
        $productId = $this->makeProduct();
        $this->makeLicenseKey($productId);

        $response = $this->getJson('/api/admin/license-keys?sort=evil_column', $this->adminHeaders());
        $response->assertOk();
        // Tidak throw — fallback ke id DESC
    }

    public function test_index_clamps_per_page_to_max_100(): void
    {
        $productId = $this->makeProduct();
        $this->makeLicenseKey($productId);

        $response = $this->getJson('/api/admin/license-keys?per_page=99999', $this->adminHeaders());
        $this->assertEquals(100, $response->json('meta.per_page'));
    }

    // ───── show ─────

    public function test_show_returns_404_for_nonexistent_key(): void
    {
        $response = $this->getJson('/api/admin/license-keys/999999', $this->adminHeaders());
        $response->assertStatus(404);
    }

    public function test_show_includes_product_and_deliveries_eager_load(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId);

        $response = $this->getJson("/api/admin/license-keys/{$keyId}", $this->adminHeaders());

        $response->assertOk();
        $response->assertJsonPath('data.product.id', $productId);
    }

    // ───── store (batch insert) ─────

    public function test_store_validates_product_required_and_exists(): void
    {
        $response = $this->postJson('/api/admin/license-keys', [
            'count' => 5,
        ], $this->adminHeaders());

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_id']);
    }

    public function test_store_validates_count_range_1_to_500(): void
    {
        $productId = $this->makeProduct();

        $tooMany = $this->postJson('/api/admin/license-keys', [
            'product_id' => $productId, 'count' => 501,
        ], $this->adminHeaders());
        $tooMany->assertStatus(422);

        $zero = $this->postJson('/api/admin/license-keys', [
            'product_id' => $productId, 'count' => 0,
        ], $this->adminHeaders());
        $zero->assertStatus(422);
    }

    public function test_store_validates_prefix_format_uppercase_alnum(): void
    {
        $productId = $this->makeProduct();

        $lowercase = $this->postJson('/api/admin/license-keys', [
            'product_id' => $productId, 'count' => 1, 'prefix' => 'lowercase',
        ], $this->adminHeaders());
        $lowercase->assertStatus(422);

        $symbols = $this->postJson('/api/admin/license-keys', [
            'product_id' => $productId, 'count' => 1, 'prefix' => 'AA-BB',
        ], $this->adminHeaders());
        $symbols->assertStatus(422);
    }

    public function test_store_inserts_batch_with_correct_count_and_format(): void
    {
        $productId = $this->makeProduct();

        $response = $this->postJson('/api/admin/license-keys', [
            'product_id' => $productId, 'count' => 5, 'prefix' => 'TEST',
        ], $this->adminHeaders());

        $response->assertStatus(201);
        $response->assertJsonFragment(['count' => 5]);

        $rows = DB::table('license_keys')->where('product_id', $productId)->get();
        $this->assertCount(5, $rows);
        foreach ($rows as $r) {
            $this->assertEquals('aktif', $r->status);
            $this->assertStringStartsWith('TEST-', $r->key);
        }
    }

    // ───── revoke ─────

    public function test_revoke_returns_404_for_nonexistent_key(): void
    {
        $response = $this->postJson('/api/admin/license-keys/999999/revoke', [], $this->adminHeaders());
        $response->assertStatus(404);
    }

    public function test_revoke_sets_status_to_dicabut(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId, 'aktif');

        $response = $this->postJson("/api/admin/license-keys/{$keyId}/revoke", [], $this->adminHeaders());
        $response->assertOk();
        $this->assertEquals('dicabut', LicenseKey::find($keyId)->status);
    }

    public function test_revoke_is_idempotent_when_already_dicabut(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId, 'dicabut');

        $response = $this->postJson("/api/admin/license-keys/{$keyId}/revoke", [], $this->adminHeaders());
        $response->assertOk();
        $response->assertJsonFragment(['message' => 'License key sudah dicabut.']);
    }

    // ───── extend ─────

    public function test_extend_validates_days_required_and_range(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId);

        $missing = $this->postJson("/api/admin/license-keys/{$keyId}/extend", [], $this->adminHeaders());
        $missing->assertStatus(422);

        $tooMany = $this->postJson("/api/admin/license-keys/{$keyId}/extend", ['days' => 400], $this->adminHeaders());
        $tooMany->assertStatus(422);

        $zero = $this->postJson("/api/admin/license-keys/{$keyId}/extend", ['days' => 0], $this->adminHeaders());
        $zero->assertStatus(422);
    }

    public function test_extend_sets_expired_at_to_now_plus_days(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId);

        $response = $this->postJson(
            "/api/admin/license-keys/{$keyId}/extend",
            ['days' => 30],
            $this->adminHeaders(),
        );

        $response->assertOk();
        $newExpiry = LicenseKey::find($keyId)->expired_at;
        $this->assertGreaterThan(now()->addDays(29), $newExpiry);
        $this->assertLessThanOrEqual(now()->addDays(30), $newExpiry);
    }

    public function test_extend_replaces_existing_expiry_not_extends(): void
    {
        $productId = $this->makeProduct();
        $keyId = DB::table('license_keys')->insertGetId([
            'product_id' => $productId,
            'key' => 'TEST-1234-1234-1234-1234',
            'status' => 'aktif',
            'expired_at' => now()->addDays(100),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Extend 30 hari — replace dari 100 jadi 30 (bukan 130)
        $this->postJson(
            "/api/admin/license-keys/{$keyId}/extend",
            ['days' => 30],
            $this->adminHeaders(),
        )->assertOk();

        $newExpiry = LicenseKey::find($keyId)->expired_at;
        $this->assertLessThanOrEqual(now()->addDays(30), $newExpiry);
    }

    public function test_extend_returns_404_for_nonexistent_key(): void
    {
        $response = $this->postJson(
            '/api/admin/license-keys/999999/extend',
            ['days' => 30],
            $this->adminHeaders(),
        );
        $response->assertStatus(404);
    }

    // ───── helpers ─────

    private function makeProduct(int $harga = 100000, string $status = 'aktif', string $tipe = 'license'): int
    {
        return DB::table('products')->insertGetId([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => $harga,
            'tipe' => $tipe,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makeLicenseKey(int $productId, string $status = 'aktif', ?string $key = null): int
    {
        return DB::table('license_keys')->insertGetId([
            'product_id' => $productId,
            'key' => $key ?? LicenseKey::generateKey('TEST'),
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
