<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use App\Services\Cart\CartService;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test untuk flow checkout produk gratis (is_free=true).
 *
 * Cart berisi produk is_free → checkout skip Tripay, order langsung berstatus
 * 'free' + paid_at populated, delivery di-trigger synchronously.
 *
 * NotificationDispatcher di-stub supaya bisa verify call tanpa n8n HTTP.
 * TripayClient di-stub supaya kalau ada bug branch (Tripay tetap dipanggil
 * untuk free order), test fail dengan assertion.
 */
class FreeProductCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private const COOKIE = 'cart_session';
    private const SESSION = 'fixed-free-session';

    private CartService $cartService;

    public static bool $tripayCreateCalled = false;
    public static ?string $notifEvent = null;
    public static ?string $notifStatus = null;

    protected function setUp(): void
    {
        parent::setUp();

        // Reset static spy state
        self::$tripayCreateCalled = false;
        self::$notifEvent = null;
        self::$notifStatus = null;

        // Tripay stub — kalau dipanggil untuk free order, tripayCreateCalled
        // menjadi true dan test bisa assert 'tripay NOT called'.
        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(\App\Services\Tripay\CreateTransactionDto $dto): array
            {
                FreeProductCheckoutTest::$tripayCreateCalled = true;

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

            public function verifyCallback(string $rawBody, ?string $signature): ?array
            {
                return null;
            }

            public function merchantCode(): string
            {
                return 'TEST';
            }
        });

        // NotificationDispatcher stub — capture event + order status.
        $this->app->bind(NotificationDispatcher::class, fn () => new class extends NotificationDispatcher
        {
            public function __construct() {}

            public function dispatchOrderPaid(Order $order, array $deliveries): void
            {
                FreeProductCheckoutTest::$notifEvent = 'order.paid';
                FreeProductCheckoutTest::$notifStatus = $order->status;
            }

            public function dispatchPreorderReady(Order $order, array $deliveries): void
            {
                FreeProductCheckoutTest::$notifEvent = 'preorder.ready';
                FreeProductCheckoutTest::$notifStatus = $order->status;
            }
        });

        $this->cartService = app(CartService::class);
    }

    // ───── happy path ─────

    public function test_free_checkout_skips_tripay_and_creates_order_with_status_free(): void
    {
        $productId = $this->makeFreeProduct('license');
        $this->cartService->addItem(self::SESSION, $productId);

        $response = $this->call(
            'POST',
            '/api/checkout',
            [], [self::COOKIE => self::SESSION], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nama' => 'Freebie Hunter',
                'email' => 'free@example.com',
                'wa' => '08123456789',
            ]),
        );

        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['kode_order', 'redirect_url']]);

        // Tripay TIDAK boleh dipanggil untuk free order
        $this->assertFalse(
            self::$tripayCreateCalled,
            'TripayClient::createTransaction() tidak boleh dipanggil untuk free order.'
        );

        $kodeOrder = $response->json('data.kode_order');

        $order = Order::where('kode_order', $kodeOrder)->first();
        $this->assertNotNull($order);
        $this->assertEquals('free', $order->status);
        $this->assertEquals(0, (float) $order->total_harga);
        $this->assertNotNull($order->paid_at, 'paid_at harus populated synchronously');
        $this->assertNull($order->tripay_reference, 'Free order tidak punya Tripay reference');
        $this->assertNull($order->qr_string);
        $this->assertNull($order->qr_url);
        $this->assertEquals('Freebie Hunter', $order->nama_pembeli);

        // OrderItems ter-create
        $this->assertEquals(1, OrderItem::where('order_id', $order->id)->count());
        $item = OrderItem::where('order_id', $order->id)->first();
        $this->assertEquals(0, (float) $item->harga_saat_beli);
        $this->assertEquals('license', $item->tipe_produk);

        // Delivery di-trigger untuk license tipe → OrderDelivery row tercipta
        $this->assertEquals(1, OrderDelivery::where('order_item_id', $item->id)->count());

        // Notifikasi dispatched dengan event=order.paid dan status=free
        $this->assertEquals('order.paid', self::$notifEvent);
        $this->assertEquals('free', self::$notifStatus);

        // Cart di-clear
        $this->assertNull(Cart::where('session_id', self::SESSION)->first());
    }

    public function test_free_checkout_with_account_manual_creates_provisioning(): void
    {
        $productId = $this->makeFreeProduct('account_manual');
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

        $response->assertStatus(201);
        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $item = OrderItem::where('order_id', $order->id)->first();

        // Account_manual → provisioning row, bukan OrderDelivery
        $this->assertEquals(0, OrderDelivery::where('order_item_id', $item->id)->count());
        $this->assertEquals(1, AccountProvisioning::where('order_item_id', $item->id)->count());
        $this->assertEquals('menunggu_admin', AccountProvisioning::where('order_item_id', $item->id)->first()->status);
    }

    public function test_free_checkout_with_bundle_creates_delivery(): void
    {
        $productId = $this->makeFreeProduct('bundle');
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

        $response->assertStatus(201);
        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $item = OrderItem::where('order_id', $order->id)->first();

        // Bundle → delivery row (bukan provisioning)
        $this->assertEquals(1, OrderDelivery::where('order_item_id', $item->id)->count());
    }

    // ───── rejection paths ─────

    public function test_checkout_rejects_mixed_free_and_paid_cart(): void
    {
        $freeId = $this->makeFreeProduct('license');
        $paidId = $this->makeProduct(50000, 'license');
        $this->cartService->addItem(self::SESSION, $freeId);
        $this->cartService->addItem(self::SESSION, $paidId);

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
        $response->assertJsonFragment(['code' => 'cart_free_mixed']);
        $this->assertFalse(self::$tripayCreateCalled);
    }

    // ───── admin rejection ─────

    public function test_admin_create_rejects_is_free_combined_with_is_pre_order(): void
    {
        config(['app.admin_token' => 'test-token']);
        $headers = ['Authorization' => 'Bearer test-token'];

        $response = $this->postJson('/api/admin/products', [
            'nama' => 'Conflicted',
            'deskripsi' => 'd',
            'harga' => 50000,
            'tipe' => 'license',
            'status' => 'aktif',
            'is_pre_order' => true,
            'release_date' => now()->addDays(7)->toDateString(),
            'preorder_deposit_percent' => 50,
            'is_free' => true,
        ], $headers);

        $response->assertStatus(422);
        $this->assertEquals(0, \DB::table('products')->where('nama', 'Conflicted')->count());
    }

    public function test_admin_create_with_is_free_and_any_price_auto_sets_harga_to_zero(): void
    {
        config(['app.admin_token' => 'test-token']);
        $headers = ['Authorization' => 'Bearer test-token'];

        // Stub EnStorage + NextRevalidator — sama seperti ProductAdminTest.
        // (Inline anonymous classes — lihat ProductAdminTest::setUp() untuk pattern.)
        $this->app->bind(\App\Services\Storage\EnStorageClient::class, fn () => new class implements \App\Services\Storage\EnStorageClient
        {
            public function upload(\Illuminate\Http\UploadedFile $file, string $destinationPath): string
            {
                return 'enstorage/'.$destinationPath;
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

        $this->app->bind(\App\Services\NextRevalidator::class, fn () => new class extends \App\Services\NextRevalidator
        {
            public function __construct() {}

            public function revalidateProduct(string $slug): void {}
            public function revalidateHome(): void {}
            public function revalidateCategory(string $slug): void {}
            public function revalidatePost(string $slug): void {}
        });

        $response = $this->postJson('/api/admin/products', [
            'nama' => 'Free Sample',
            'deskripsi' => 'd',
            'harga' => 99999,  // admin isi sembarang
            'tipe' => 'license',
            'status' => 'aktif',
            'is_free' => true,
        ], $headers);

        $response->assertStatus(201);
        $product = \App\Models\Product::where('nama', 'Free Sample')->first();
        $this->assertNotNull($product);
        $this->assertTrue((bool) $product->is_free);
        $this->assertEquals(0, (float) $product->harga, 'Single source of truth: is_free=true → harga=0');
    }

    // ───── helpers ─────

    private function makeProduct(int $harga, string $tipe = 'license'): int
    {
        return \DB::table('products')->insertGetId([
            'nama' => 'Paid '.uniqid(),
            'slug' => 'paid-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => $harga,
            'tipe' => $tipe,
            'status' => 'aktif',
            'is_free' => false,
            'is_pre_order' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makeFreeProduct(string $tipe = 'license'): int
    {
        return \DB::table('products')->insertGetId([
            'nama' => 'Free '.uniqid(),
            'slug' => 'free-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 0,
            'tipe' => $tipe,
            'status' => 'aktif',
            'is_free' => true,
            'is_pre_order' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}