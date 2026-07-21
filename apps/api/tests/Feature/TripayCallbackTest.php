<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderDelivery;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk TripayCallbackController.
 *
 * Signature HMAC valid via TripayClient::sign — pakai TripayClient real (bukan stub)
 * untuk verify callback bekerja end-to-end. NotificationDispatcher di-spy agar
 * kita bisa verify side effect.
 */
class TripayCallbackTest extends TestCase
{
    use RefreshDatabase;

    private const PRIVATE_KEY = 'callback-test-private-key';
    private const REFERENCE = 'TRX-CALLBACK-TEST-001';

    private array $capturedDispatches = [];

    protected function setUp(): void
    {
        parent::setUp();

        // Real TripayClient dengan private key tetap — consistent sign untuk test body
        $this->app->bind(TripayClient::class, fn () => new TripayClient(
            apiKey: 'test',
            privateKey: self::PRIVATE_KEY,
            merchantCode: 'TEST',
            baseUrl: 'http://localhost',
        ));

        // Spy NotificationDispatcher untuk capture dispatch calls
        $this->app->bind(NotificationDispatcher::class, function ($app) {
            return new class($this->capturedDispatches) extends NotificationDispatcher
            {
                public function __construct(public array &$captured) {}

                public function dispatchOrderPaid(\App\Models\Order $order, array $deliveries): void
                {
                    $this->captured[] = ['event' => 'order.paid', 'order' => $order->kode_order, 'count' => count($deliveries)];
                }

                public function dispatchAccountReady(\App\Models\AccountProvisioning $prov): void
                {
                    $this->captured[] = ['event' => 'account.ready', 'order_item' => $prov->order_item_id];
                }
            };
        });
    }

    /**
     * Bangun raw body + signature valid untuk Tripay callback.
     */
    private function makeSignedBody(array $payload): array
    {
        $body = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $sig = hash_hmac('sha256', $body, self::PRIVATE_KEY);

        return [$body, $sig];
    }

    private function makeOrder(string $status = 'pending', ?string $reference = null): Order
    {
        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => 'EPS-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'b@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 100000,
            'status' => $status,
            'tripay_reference' => $reference ?? self::REFERENCE,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Order::findOrFail($orderId);
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

    // ───── signature + headers ─────

    public function test_callback_returns_400_when_signature_header_missing(): void
    {
        $response = $this->call('POST', '/api/tripay/callback', [], [], [], [], '{}');

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Missing signature']);
    }

    public function test_callback_returns_403_on_signature_mismatch(): void
    {
        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['reference' => 'X']),
        );
        // Add signature header raw
        $response->headers->set('X-Callback-Signature', 'tampered');

        $response2 = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_CALLBACK_SIGNATURE' => 'tampered',
            ],
            json_encode(['reference' => 'X']),
        );

        $response2->assertStatus(403);
        $response2->assertJsonFragment(['message' => 'Invalid signature']);
    }

    public function test_callback_returns_400_when_reference_or_status_missing(): void
    {
        [$body, $sig] = $this->makeSignedBody(['status' => 'PAID']);  // no reference

        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_CALLBACK_SIGNATURE' => $sig,
            ],
            $body,
        );

        $response->assertStatus(400);
    }

    public function test_callback_returns_404_when_reference_not_in_db(): void
    {
        [$body, $sig] = $this->makeSignedBody([
            'reference' => 'TRX-NOT-EXIST',
            'status' => 'PAID',
        ]);

        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_CALLBACK_SIGNATURE' => $sig,
            ],
            $body,
        );

        $response->assertStatus(404);
    }

    public function test_callback_returns_400_on_unknown_status(): void
    {
        $order = $this->makeOrder();
        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'UNKNOWN',
        ]);

        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_CALLBACK_SIGNATURE' => $sig,
            ],
            $body,
        );

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Unknown status']);
    }

    // ───── status mapping ─────

    public function test_callback_maps_unpaid_to_pending(): void
    {
        $order = $this->makeOrder('pending');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'UNPAID',
        ]);

        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $this->assertEquals('pending', Order::find($order->id)->status);
    }

    public function test_callback_maps_expired_to_expired(): void
    {
        $order = $this->makeOrder('pending');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'EXPIRED',
        ]);

        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $this->assertEquals('expired', Order::find($order->id)->status);
    }

    public function test_callback_maps_failed_to_failed(): void
    {
        $order = $this->makeOrder('pending');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'FAILED',
        ]);

        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $this->assertEquals('failed', Order::find($order->id)->status);
    }

    public function test_callback_maps_refund_to_refunded(): void
    {
        $order = $this->makeOrder('paid');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'REFUND',
        ]);

        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $this->assertEquals('refunded', Order::find($order->id)->status);
    }

    // ───── paid flow ─────

    public function test_callback_paid_first_time_triggers_delivery_and_notification(): void
    {
        $order = $this->makeOrder('pending');
        $this->productAndItem($order, 'download');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'PAID',
        ]);

        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $response->assertOk();

        $order = Order::find($order->id);
        $this->assertEquals('paid', $order->status);
        $this->assertNotNull($order->paid_at);

        // Delivery row ter-create
        $this->assertEquals(1, OrderDelivery::where('order_item_id', $order->items->first()->id)->count());

        // Notification dispatched
        $this->assertCount(1, $this->capturedDispatches);
        $this->assertEquals('order.paid', $this->capturedDispatches[0]['event']);
    }

    public function test_callback_paid_second_time_is_idempotent(): void
    {
        $order = $this->makeOrder('pending');
        $this->productAndItem($order, 'download');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'PAID',
        ]);

        // First callback
        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $firstPaidAt = Order::find($order->id)->paid_at;
        $firstDeliveries = OrderDelivery::count();

        // Sleep microsecond untuk beda paid_at
        usleep(100000);

        // Second callback (same payload)
        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $order2 = Order::find($order->id);
        $this->assertEquals($firstPaidAt, $order2->paid_at, 'paid_at TIDAK boleh di-overwrite');
        $this->assertEquals($firstDeliveries, OrderDelivery::count(), 'Delivery tidak boleh di-duplikasi');
    }

    public function test_callback_paid_for_account_manual_triggers_provisioning_no_delivery(): void
    {
        $order = $this->makeOrder('pending');
        $this->productAndItem($order, 'account_manual');

        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'PAID',
        ]);

        $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $this->assertEquals(0, OrderDelivery::count(), 'Account_manual tidak boleh ada delivery');
        $this->assertEquals(1, DB::table('account_provisionings')->count(), 'Provisioning row harus dibuat');

        // TIDAK boleh ada order.paid notification untuk account_manual
        $this->assertCount(0, $this->capturedDispatches);
    }

    // ───── success response ─────

    public function test_callback_returns_success_true_on_valid_request(): void
    {
        $order = $this->makeOrder();
        [$body, $sig] = $this->makeSignedBody([
            'reference' => self::REFERENCE,
            'status' => 'UNPAID',
        ]);

        $response = $this->call(
            'POST',
            '/api/tripay/callback',
            [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => $sig],
            $body,
        );

        $response->assertOk();
        $response->assertJsonFragment(['success' => true]);
    }
}