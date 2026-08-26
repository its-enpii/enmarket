<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    private string $adminToken = 'test-admin-token-secret';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => $this->adminToken]);

        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(\App\Services\Tripay\CreateTransactionDto $dto): array
            {
                return [
                    'reference' => 'TRX-'.uniqid(),
                    'merchant_ref' => $dto->merchantRef,
                    'qr_string' => '00020101021226660014ID.CO.QRIS.WWW01189370000000000000303UMI51440014ID.CO.QRIS.WWW0215ID20250000000000303UMI5204549953033605406'.$dto->amount.'5802ID5911ENPIISTUDIO6010Jakarta Ut61051234562070703A016304ABCD',
                    'qr_url' => 'https://tripay.co.id/qr/'.$dto->merchantRef.'.png',
                    'amount' => $dto->amount,
                    'status' => 'UNPAID',
                    'expired_at' => time() + 3600,
                ];
            }

            public function verifyCallback(string $rawBody, ?string $signature): ?array
            {
                return null;
            }

            public function merchantCode(): string
            {
                return 'TEST-MERCHANT';
            }
        });
    }

    public function test_admin_can_crud_coupons_and_view_stats(): void
    {
        // 1. Create coupon
        $createRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/admin/coupons', [
                'code' => 'hemat50',
                'type' => 'percent',
                'value' => 50,
                'min_order' => 100000,
                'max_uses' => 10,
                'active' => true,
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.code', 'HEMAT50')
            ->assertJsonPath('data.value', 50);

        $couponId = $createRes->json('data.id');

        // 2. Stats
        $statsRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/admin/coupons/stats');

        $statsRes->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.active', 1);

        // 3. Detail
        $detailRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson("/api/admin/coupons/{$couponId}");

        $detailRes->assertStatus(200)
            ->assertJsonPath('data.code', 'HEMAT50');

        // 4. Update
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->patchJson("/api/admin/coupons/{$couponId}", [
                'value' => 40,
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.value', 40);

        // 5. Soft delete (set active = false)
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->deleteJson("/api/admin/coupons/{$couponId}");

        $deleteRes->assertStatus(200);

        $this->assertDatabaseHas('coupons', [
            'id' => $couponId,
            'active' => false,
        ]);
    }

    public function test_public_apply_coupon_percentage_and_fixed(): void
    {
        Coupon::create([
            'code' => 'DISKON20',
            'type' => 'percent',
            'value' => 20,
            'min_order' => 50000,
            'active' => true,
        ]);

        Coupon::create([
            'code' => 'POTONGAN50RB',
            'type' => 'fixed',
            'value' => 50000,
            'min_order' => 100000,
            'active' => true,
        ]);

        // Percentage apply
        $res1 = $this->postJson('/api/checkout/apply-coupon', [
            'code' => 'diskon20',
            'cart_total' => 200000,
        ]);

        $res1->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'discount_amount' => 40000,
                'final_total' => 160000,
            ]);

        // Fixed apply
        $res2 = $this->postJson('/api/checkout/apply-coupon', [
            'code' => 'POTONGAN50RB',
            'cart_total' => 120000,
        ]);

        $res2->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'discount_amount' => 50000,
                'final_total' => 70000,
            ]);

        // Min order not met
        $res3 = $this->postJson('/api/checkout/apply-coupon', [
            'code' => 'POTONGAN50RB',
            'cart_total' => 30000,
        ]);

        $res3->assertStatus(200)
            ->assertJson([
                'valid' => false,
                'discount_amount' => 0,
                'final_total' => 30000,
            ]);
    }

    public function test_checkout_applies_coupon_and_increments_used_count(): void
    {
        $coupon = Coupon::create([
            'code' => 'HEMAT10',
            'type' => 'percent',
            'value' => 10,
            'active' => true,
        ]);

        $product = Product::create([
            'nama' => 'App Template',
            'slug' => 'app-template',
            'deskripsi' => 'Template',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
        ]);

        $sessionId = 'sess-checkout-coupon-1234';
        $cart = Cart::create(['session_id' => $sessionId, 'expires_at' => now()->addDay()]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'qty' => 1]);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [],
            ['cart_session' => $sessionId],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Budi Santoso',
                'email' => 'budi@example.com',
                'wa' => '08123456789',
                'coupon_code' => 'HEMAT10',
                'session_id' => $sessionId,
            ])
        );

        $this->assertEquals(201, $response->status());
        $this->assertEquals(1, $coupon->fresh()->used_count);
        $this->assertDatabaseHas('orders', [
            'email_pembeli' => 'budi@example.com',
            'total_harga' => 90000, // 100k - 10%
        ]);
    }
}
