<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\PreorderReleaseQueue;
use App\Models\Product;
use App\Services\Cart\CartService;
use App\Services\Tripay\CreateTransactionDto;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test untuk CheckoutController dengan pre-order logic.
 *
 * Cart policy all-or-nothing: mixed cart (preorder + regular) ditolak 422.
 * Pure pre-order cart → amount = DP%, is_preorder=true, status='pending'.
 *
 * Tripay di-stub (lihat CheckoutFlowTest pattern).
 */
class CheckoutPreorderTest extends TestCase
{
    use RefreshDatabase;

    private const COOKIE = 'cart_session';

    private CartService $cartService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cartService = app(CartService::class);

        // Stub Tripay — record amount yang diminta supaya test bisa assert.
        $stubAmount = null;
        $this->app->bind(TripayClient::class, function () use (&$stubAmount) {
            return new class($stubAmount) extends TripayClient
            {
                public function __construct(private mixed &$capturedAmount) {}

                public function createTransaction(CreateTransactionDto $dto): array
                {
                    $this->capturedAmount = $dto->amount;

                    return [
                        'reference' => 'TRX-'.uniqid(),
                        'merchant_ref' => $dto->merchantRef,
                        'qr_string' => 'mock-qr',
                        'qr_url' => 'https://mock/qr.png',
                        'amount' => $dto->amount,
                        'status' => 'UNPAID',
                        'expired_at' => time() + 3600,
                    ];
                }
            };
        });
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'x',
            'harga' => 100000,
            'tipe' => 'license',
            'status' => 'aktif',
        ], $overrides));
    }

    private function postCheckout(string $sessionId): \Illuminate\Testing\TestResponse
    {
        $payload = json_encode([
            'nama' => 'Test Buyer',
            'email' => 'buyer@test.id',
            'wa' => '08123456789',
        ]);
        return $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => $sessionId], [],
            ['CONTENT_TYPE' => 'application/json'],
            $payload,
        );
    }

    public function test_pure_preorder_cart_uses_deposit_amount_for_tripay(): void
    {
        $product = $this->makeProduct([
            'is_pre_order' => true,
            'release_date' => now()->addDays(7)->toDateString(),
            'preorder_deposit_percent' => 50,
            'harga' => 200000,
        ]);

        $sessionId = 'preorder-pure-'.uniqid();
        $cart = $this->cartService->getOrCreateCart($sessionId);
        $cart->items()->create(['product_id' => $product->id, 'qty' => 1]);

        $response = $this->postCheckout($sessionId);

        $response->assertCreated();
        $kode = $response->json('data.kode_order');

        $order = Order::where('kode_order', $kode)->firstOrFail();
        $this->assertTrue((bool) $order->is_preorder);
        $this->assertSame('pending', $order->status);
        // Decimal cast → "100000.00". Pakai numeric compare.
        $this->assertEquals(100000, (float) $order->total_harga, 'Tripay amount harus = DP 50%');
        $this->assertEquals(100000, (float) $order->preorder_deposit_amount);
        $this->assertEquals(100000, (float) $order->preorder_remaining_amount);
        $this->assertNotNull($order->preorder_release_date);
    }

    public function test_mixed_cart_returns_422(): void
    {
        $preorderProduct = $this->makeProduct([
            'is_pre_order' => true,
            'release_date' => now()->addDays(7)->toDateString(),
            'preorder_deposit_percent' => 50,
        ]);
        $regularProduct = $this->makeProduct(['harga' => 50000]);

        $sessionId = 'mixed-'.uniqid();
        $cart = $this->cartService->getOrCreateCart($sessionId);
        $cart->items()->create(['product_id' => $preorderProduct->id, 'qty' => 1]);
        $cart->items()->create(['product_id' => $regularProduct->id, 'qty' => 1]);

        $response = $this->postCheckout($sessionId);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'cart_mixed_preorder');

        // Tidak ada order created
        $this->assertSame(0, Order::count());
    }

    public function test_pure_regular_cart_unaffected(): void
    {
        $product = $this->makeProduct(['harga' => 100000]); // non-preorder

        $sessionId = 'regular-'.uniqid();
        $cart = $this->cartService->getOrCreateCart($sessionId);
        $cart->items()->create(['product_id' => $product->id, 'qty' => 1]);

        $response = $this->postCheckout($sessionId);

        $response->assertCreated();
        $order = Order::latest('id')->first();
        $this->assertFalse((bool) $order->is_preorder);
        $this->assertEquals(100000, (float) $order->total_harga, 'Regular order pakai harga penuh');
    }
}
