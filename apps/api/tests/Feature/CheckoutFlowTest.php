<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Cart\CartService;
use App\Services\Tripay\TripayClient;
use App\Services\Tripay\TripayException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Test untuk CheckoutController (preview + store).
 *
 * TripayClient di-rebind dengan stub yang return fake HTTP response supaya
 * test tidak hit real API. CartService dipakai real — testing integrasi
 * cart→checkout→order→tripay. DB::transaction di-rollback via RefreshDatabase.
 */
class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    private const COOKIE = 'cart_session';
    private const SESSION = 'fixed-session-1234567890';

    private CartService $cartService;

    protected function setUp(): void
    {
        parent::setUp();

        // Replace TripayClient dengan stub pure return — tidak call parent::createTransaction
        // karena itu akan hit real HTTP facade. Stub return shape sama dengan Tripay response.
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

        $this->cartService = app(CartService::class);
    }

    // ───── preview ─────

    public function test_preview_returns_cart_data(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call('GET', '/api/checkout', [], [self::COOKIE => self::SESSION]);

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['session_id', 'items', 'total']]);
        $this->assertCount(1, $response->json('data.items'));
    }

    public function test_preview_works_without_existing_cart(): void
    {
        $response = $this->call('GET', '/api/checkout');

        $response->assertOk();
        $this->assertEmpty($response->json('data.items'));
    }

    // ───── store validation ─────

    public function test_store_validates_required_fields(): void
    {
        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([]),
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nama', 'email', 'wa']);
    }

    public function test_store_validates_email_format(): void
    {
        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'not-an-email',
                'wa' => '08123456789',
                'session_id' => self::SESSION,
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_store_validates_wa_regex_only_digits_plus_dash(): void
    {
        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'b@example.com',
                'wa' => 'abc12345',  // huruf invalid
                'session_id' => self::SESSION,
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['wa']);
    }

    public function test_store_returns_422_when_no_cart_session(): void
    {
        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'b@example.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'cart_session_missing']);
    }

    public function test_store_returns_422_when_cart_empty(): void
    {
        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'b@example.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'cart_empty']);
    }

    public function test_store_returns_422_when_cart_total_below_100(): void
    {
        // Product 50 × 1 = 50 < 100
        $productId = $this->makeProduct(50, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'b@example.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'amount_too_small']);
    }

    public function test_store_returns_422_when_items_have_non_aktif_product(): void
    {
        // Race condition: produk non-aktif tapi somehow ada di cart.
        $productId = $this->makeProduct(50000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);
        // Raw update product jadi draft — bypass CartController validation
        \DB::table('products')->where('id', $productId)->update(['status' => 'draft']);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Buyer',
                'email' => 'b@example.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'cart_invalid_items']);
    }

    // ───── happy path ─────

    public function test_store_happy_path_creates_order_and_clears_cart(): void
    {
        $productId = $this->makeProduct(75000, 'aktif', 'license');
        $this->cartService->addItem(self::SESSION, $productId, 2);  // 150000

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test Buyer',
                'email' => 'buyer@example.com',
                'wa' => '+62 812-3456-7890',
            ]),
        );

        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['kode_order', 'redirect_url']]);

        $kodeOrder = $response->json('data.kode_order');

        // Order harus ada dengan status pending + tripay_reference ter-set
        $order = Order::where('kode_order', $kodeOrder)->first();
        $this->assertNotNull($order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(150000, $order->total_harga);
        $this->assertEquals('Test Buyer', $order->nama_pembeli);
        $this->assertNotNull($order->tripay_reference);
        $this->assertNotNull($order->qr_string);
        $this->assertNotNull($order->qr_url);
        $this->assertNotNull($order->qr_expired_at);

        // OrderItems harus punya 1 row dengan snapshot harga + tipe
        $this->assertEquals(1, OrderItem::where('order_id', $order->id)->count());
        $item = OrderItem::where('order_id', $order->id)->first();
        $this->assertEquals(75000, $item->harga_saat_beli);
        $this->assertEquals('license', $item->tipe_produk);

        // Cart harus di-clear
        $this->assertNull(Cart::where('session_id', self::SESSION)->first());
    }

    public function test_store_kode_order_format_is_eps_yyyymmdd_5_alphanumeric(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test',
                'email' => 't@x.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(201);
        $this->assertMatchesRegularExpression(
            '/^EPS-\d{8}-[A-NP-Z2-9]{5}$/',
            $response->json('data.kode_order'),
            'Exclude O/0/I/1 dari random chars',
        );
    }

    public function test_store_redirect_url_includes_kode_order(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test',
                'email' => 't@x.com',
                'wa' => '08123456789',
            ]),
        );

        $kode = $response->json('data.kode_order');
        $this->assertEquals("/pembayaran/{$kode}", $response->json('data.redirect_url'));
    }

    public function test_store_tripay_phone_sanitized_to_digits_only(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        CheckoutTripayStub::reset();
        $this->app->bind(TripayClient::class, fn () => new CheckoutTripayStub);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test',
                'email' => 't@x.com',
                'wa' => '+62 812 3456 7890',  // + digit space — valid per regex
            ]),
        );

        // sanitizePhone: hapus semua non-digit → '6281234567890'
        $this->assertEquals(
            '6281234567890',
            CheckoutTripayStub::$lastCustomerPhone,
            'Phone harus disanitasi jadi digits-only',
        );
    }

    // ───── Tripay failure ─────

    public function test_store_returns_502_when_tripay_fails(): void
    {
        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(\App\Services\Tripay\CreateTransactionDto $dto): array
            {
                throw new TripayException('Tripay connection timeout', 503);
            }
        });

        $productId = $this->makeProduct(100000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test',
                'email' => 't@x.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(502);
        $response->assertJsonFragment(['code' => 'tripay_error']);
        // Cart TIDAK di-clear saat Tripay gagal (order tidak terbuat)
        $this->assertNotNull(Cart::where('session_id', self::SESSION)->first());
    }

    // ───── session_id fallback ─────

    public function test_store_accepts_session_id_in_body_when_no_cookie(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Test',
                'email' => 't@x.com',
                'wa' => '08123456789',
                'session_id' => self::SESSION,
            ]),
        );

        $response->assertStatus(201);
    }

    // ───── helpers ─────

    private function makeProduct(int $harga, string $status, string $tipe = 'download'): int
    {
        return \DB::table('products')->insertGetId([
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
}

/**
 * Stub TripayClient dengan static capture untuk spy-test (sanitize phone).
 * Taruh di luar CheckoutFlowTest class agar bisa di-reference dari closure binding.
 */
class CheckoutTripayStub extends TripayClient
{
    public static ?string $lastCustomerPhone = null;

    public function __construct() {}

    public static function reset(): void
    {
        self::$lastCustomerPhone = null;
    }

    public function createTransaction(\App\Services\Tripay\CreateTransactionDto $dto): array
    {
        self::$lastCustomerPhone = $dto->customerPhone;

        return [
            'reference' => 'TRX-'.uniqid(),
            'merchant_ref' => $dto->merchantRef,
            'qr_string' => 'q',
            'qr_url' => 'u',
            'amount' => $dto->amount,
            'status' => 'UNPAID',
            'expired_at' => time() + 3600,
        ];
    }
}
