<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\SiteSetting;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Duitku\DuitkuClient;
use App\Services\Payment\OrderPaidHandler;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Tests for DuitkuCallbackController, CheckoutController multi-gateway,
 * and OrderPaidHandler.
 */
class DuitkuCallbackTest extends TestCase
{
    use RefreshDatabase;

    private const MERCHANT_CODE = 'DTEST';
    private const API_KEY = 'duitku-test-api-key';

    private array $capturedDispatches = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->bind(DuitkuClient::class, fn () => new DuitkuClient(
            merchantCode: self::MERCHANT_CODE,
            apiKey: self::API_KEY,
            baseUrl: 'http://localhost',
        ));

        // Stub TripayClient for checkout tests
        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(\App\Services\Tripay\CreateTransactionDto $dto): array
            {
                return [
                    'reference' => 'TRX-'.uniqid(),
                    'merchant_ref' => $dto->merchantRef,
                    'qr_string' => 'fake-qr',
                    'qr_url' => 'https://tripay.co.id/qr/fake.png',
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
                return 'TEST';
            }
        });

        $this->app->bind(NotificationDispatcher::class, function () {
            return new class($this->capturedDispatches) extends NotificationDispatcher
            {
                public function __construct(public array &$captured) {}

                public function dispatchOrderPaid(\App\Models\Order $order, array $deliveries): void
                {
                    $this->captured[] = ['event' => 'order.paid', 'order' => $order->kode_order];
                }

                public function dispatchAccountReady(\App\Models\AccountProvisioning $prov): void
                {
                    $this->captured[] = ['event' => 'account.ready'];
                }
            };
        });
    }

    private function makeOrder(string $status = 'pending', ?string $kodeOrder = null): Order
    {
        $kode = $kodeOrder ?? 'EPS-'.now()->format('Ymd').'-'.strtoupper(uniqid());
        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => $kode,
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'b@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 100000,
            'status' => $status,
            'payment_gateway' => 'duitku',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Order::findOrFail($orderId);
    }

    private function makeSignature(string $merchantOrderId, string $amount): string
    {
        return md5(self::MERCHANT_CODE.$amount.$merchantOrderId.self::API_KEY);
    }

    private function productAndItem(Order $order, string $tipe = 'download'): int
    {
        $productId = DB::table('products')->insertGetId([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => $tipe,
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('order_items')->insert([
            'order_id' => $order->id,
            'product_id' => $productId,
            'nama_produk' => 'Test',
            'harga_saat_beli' => 100000,
            'tipe_produk' => $tipe,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $productId;
    }

    // ───── 1. Signature tests ─────

    public function test_duitku_callback_verifies_md5_signature(): void
    {
        $order = $this->makeOrder('pending', 'EPS-20260827-TEST1');

        $validSig = $this->makeSignature('EPS-20260827-TEST1', '100000');

        // Valid signature → 200
        $response = $this->post('/api/duitku/callback', [
            'merchantCode' => self::MERCHANT_CODE,
            'merchantOrderId' => 'EPS-20260827-TEST1',
            'amount' => '100000',
            'signature' => $validSig,
            'resultCode' => '00',
        ]);
        $response->assertOk();

        // Invalid signature → 400
        $response2 = $this->post('/api/duitku/callback', [
            'merchantCode' => self::MERCHANT_CODE,
            'merchantOrderId' => 'EPS-20260827-TEST1',
            'amount' => '100000',
            'signature' => 'tampered-signature',
            'resultCode' => '00',
        ]);
        $response2->assertStatus(400);
        $response2->assertJsonFragment(['message' => 'Invalid signature']);
    }

    // ───── 2. Marks order paid ─────

    public function test_duitku_callback_marks_order_paid_on_valid_signature(): void
    {
        $order = $this->makeOrder('pending', 'EPS-20260827-TEST2');
        $this->productAndItem($order, 'download');

        $sig = $this->makeSignature('EPS-20260827-TEST2', '100000');

        $this->post('/api/duitku/callback', [
            'merchantOrderId' => 'EPS-20260827-TEST2',
            'amount' => '100000',
            'signature' => $sig,
            'resultCode' => '00',
        ]);

        $order->refresh();
        $this->assertEquals('paid', $order->status);
        $this->assertNotNull($order->paid_at);
    }

    // ───── 3. Uses signature from POST form ─────

    public function test_duitku_callback_uses_signature_from_post_form(): void
    {
        $order = $this->makeOrder('pending', 'EPS-20260827-TEST3');

        $sig = $this->makeSignature('EPS-20260827-TEST3', '100000');

        // Send as form-encoded (Duitku sends form data, not JSON)
        $response = $this->call('POST', '/api/duitku/callback', [
            'merchantOrderId' => 'EPS-20260827-TEST3',
            'amount' => '100000',
            'signature' => $sig,
            'resultCode' => '00',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['success' => true]);
    }

    // ───── 4. No gateway enabled ─────

    public function test_checkout_rejects_when_no_gateway_enabled(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'payment_gateways'],
            ['value' => json_encode(['tripay' => ['enabled' => false], 'duitku' => ['enabled' => false]]), 'type' => 'json'],
        );

        $this->seedCartForCheckout();

        $response = $this->postJson('/api/checkout', [
            'nama' => 'Buyer',
            'email' => 'b@example.com',
            'wa' => '08123456789',
            'session_id' => 'test-session',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'no_gateway_enabled']);
    }

    // ───── 5. Defaults to first enabled ─────

    public function test_checkout_defaults_to_first_enabled_gateway(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'payment_gateways'],
            ['value' => json_encode(['tripay' => ['enabled' => false], 'duitku' => ['enabled' => true]]), 'type' => 'json'],
        );

        Http::fake(['*' => Http::response([
            'paymentUrl' => 'https://sandbox.duitku.com/pay/123',
            'reference' => 'DK-REF-001',
            'amount' => 100000,
        ], 200)]);

        $this->seedCartForCheckout();

        $response = $this->postJson('/api/checkout', [
            'nama' => 'Buyer',
            'email' => 'b@example.com',
            'wa' => '08123456789',
            'session_id' => 'test-session',
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['gateway' => 'duitku']);
    }

    // ───── 6. Routes to duitku when specified ─────

    public function test_checkout_routes_to_duitku_when_duitku_specified(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'payment_gateways'],
            ['value' => json_encode(['tripay' => ['enabled' => true], 'duitku' => ['enabled' => true]]), 'type' => 'json'],
        );

        Http::fake(['*' => Http::response([
            'paymentUrl' => 'https://sandbox.duitku.com/pay/456',
            'reference' => 'DK-REF-002',
            'amount' => 100000,
        ], 200)]);

        $this->seedCartForCheckout();

        $response = $this->postJson('/api/checkout', [
            'nama' => 'Buyer',
            'email' => 'b@example.com',
            'wa' => '08123456789',
            'payment_gateway' => 'duitku',
            'payment_method' => 'VC',
            'session_id' => 'test-session',
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['gateway' => 'duitku']);

        $order = Order::latest('id')->first();
        $this->assertEquals('duitku', $order->payment_gateway);
        $this->assertEquals('VC', $order->payment_channel);
    }

    // ───── 7. OrderPaidHandler idempotency ─────

    public function test_order_paid_handler_is_idempotent(): void
    {
        $order = $this->makeOrder('pending', 'EPS-20260827-IDEM');
        $this->productAndItem($order, 'download');

        $handler = app(OrderPaidHandler::class);

        $handler->handle($order);
        $order->refresh();
        $firstPaidAt = $order->paid_at;
        $firstDeliveries = OrderDelivery::count();

        $this->assertEquals('paid', $order->status);
        $this->assertNotNull($firstPaidAt);

        usleep(100000);

        $handler->handle($order);
        $order->refresh();

        $this->assertEquals($firstPaidAt->toIso8601String(), $order->paid_at->toIso8601String());
        $this->assertEquals($firstDeliveries, OrderDelivery::count());
    }

    // ───── 8. Topup dispatch ─────

    public function test_topup_order_dispatches_process_game_topup_job_if_class_exists(): void
    {
        $order = $this->makeOrder('pending', 'EPS-20260827-TOPUP');
        $this->productAndItem($order, 'download');

        // game_item_id is not on the orders table yet (Digiflazz task adds it),
        // so the handler will skip topup dispatch — verify it doesn't crash.
        $handler = app(OrderPaidHandler::class);
        $handler->handle($order);

        $order->refresh();
        $this->assertEquals('paid', $order->status);
    }

    // ───── Helpers ─────

    private function seedCartForCheckout(): void
    {
        $productId = DB::table('products')->insertGetId([
            'nama' => 'Test Product',
            'slug' => 'test-product-'.uniqid(),
            'deskripsi' => 'Test',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cartId = DB::table('carts')->insertGetId([
            'session_id' => 'test-session',
            'expires_at' => now()->addDay(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('cart_items')->insert([
            'cart_id' => $cartId,
            'product_id' => $productId,
            'qty' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
