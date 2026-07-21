<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk Api\Public\OrderController (status, showPublic, show, check).
 *
 * Buyer endpoints — semua pakai kode_order (efektif token). Email verification
 * untuk endpoint show() dan check().
 */
class PublicOrderControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrder(string $status = 'paid', string $kodeOrder = 'EPS-20260721-A3KX'): Order
    {
        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => $kodeOrder,
            'nama_pembeli' => 'Test Buyer',
            'email_pembeli' => 'buyer@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 100000,
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $product = Product::create([
            'nama' => 'Test Product',
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => 'license',
            'status' => 'aktif',
        ]);
        OrderItem::create([
            'order_id' => $orderId,
            'product_id' => $product->id,
            'nama_produk' => 'Test Product',
            'harga_saat_beli' => 100000,
            'tipe_produk' => 'license',
        ]);

        return Order::findOrFail($orderId);
    }

    // ───── status (light polling) ─────

    public function test_status_returns_404_for_unknown_kode(): void
    {
        $response = $this->getJson('/api/orders/EPS-20260721-XXXX/status');
        $response->assertStatus(404);
    }

    public function test_status_returns_polling_payload(): void
    {
        $this->makeOrder('paid');

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX/status');

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['kode_order', 'status', 'paid_at']]);
    }

    // ───── showPublic ─────

    public function test_show_public_returns_404_for_unknown_kode(): void
    {
        $response = $this->getJson('/api/orders/EPS-20260721-XXXX/public');
        $response->assertStatus(404);
    }

    public function test_show_public_returns_full_order_no_email_required(): void
    {
        $this->makeOrder();

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX/public');

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['kode_order', 'nama_pembeli', 'email_pembeli', 'items']]);
    }

    // ───── show (with email verification) ─────

    public function test_show_returns_403_when_email_mismatches(): void
    {
        $this->makeOrder();

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX?email=wrong@example.com');

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => 'Email tidak cocok dengan kode order.']);
    }

    public function test_show_returns_order_when_email_matches(): void
    {
        $this->makeOrder();

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX?email=buyer@example.com');

        $response->assertOk();
        $response->assertJsonPath('data.kode_order', 'EPS-20260721-A3KX');
    }

    public function test_show_returns_404_for_unknown_kode_with_email(): void
    {
        $response = $this->getJson('/api/orders/EPS-20260721-XXXX?email=buyer@example.com');
        $response->assertStatus(404);
    }

    public function test_show_email_match_is_case_insensitive(): void
    {
        $this->makeOrder();

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX?email=BUYER@EXAMPLE.COM');

        $response->assertOk();
    }

    // ───── check (POST with validation) ─────

    public function test_check_validates_required_fields(): void
    {
        $response = $this->postJson('/api/orders/check', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['kode_order', 'email']);
    }

    public function test_check_validates_kode_order_format(): void
    {
        $response = $this->postJson('/api/orders/check', [
            'kode_order' => 'INVALID-FORMAT',
            'email' => 'buyer@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['kode_order']);
    }

    public function test_check_returns_404_when_kode_does_not_match(): void
    {
        $response = $this->postJson('/api/orders/check', [
            'kode_order' => 'EPS-20260721-A3KX',
            'email' => 'wrong@example.com',
        ]);

        $response->assertStatus(404);
        $response->assertJsonFragment(['message' => 'Kode order atau email tidak cocok. Cek lagi.']);
    }

    public function test_check_returns_order_summary_on_valid_input(): void
    {
        $this->makeOrder();

        $response = $this->postJson('/api/orders/check', [
            'kode_order' => 'EPS-20260721-A3KX',
            'email' => 'buyer@example.com',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['kode_order', 'nama_pembeli']]);
    }

    public function test_check_email_match_is_case_insensitive(): void
    {
        $this->makeOrder();

        $response = $this->postJson('/api/orders/check', [
            'kode_order' => 'EPS-20260721-A3KX',
            'email' => 'BUYER@example.com',
        ]);

        $response->assertOk();
    }

    // ───── response shape (public_view=status) ─────

    public function test_status_response_is_lightweight_no_items_or_email(): void
    {
        $this->makeOrder('paid');

        $response = $this->getJson('/api/orders/EPS-20260721-A3KX/status');

        $response->assertOk();
        $payload = $response->json('data');
        $this->assertArrayNotHasKey('items', $payload, 'Status view harus lightweight');
        $this->assertArrayNotHasKey('wa_pembeli', $payload, 'Status view tidak expose WA');
    }
}