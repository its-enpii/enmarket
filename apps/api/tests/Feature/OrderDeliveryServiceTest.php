<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use App\Services\Delivery\AccountProvisioningService;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Delivery\OrderDeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk OrderDeliveryService — FIFO license claim + token generation
 * + regenerate token + delivery untuk license/download/bundle.
 *
 * NotificationDispatcher di-spy agar tidak benar-benar post ke n8n dan tidak
 * overwrite timestamps email_sent_at/wa_sent_at.
 */
class OrderDeliveryServiceTest extends TestCase
{
    use RefreshDatabase;

    private const SESSION = 'session-1234567890';

    protected function setUp(): void
    {
        parent::setUp();

        // Spy dispatcher yang TIDAK mark timestamps — supaya test bisa verify
        // service regenerateToken logic tanpa side-effect dispatcher override.
        $this->app->bind(NotificationDispatcher::class, fn () => new class extends NotificationDispatcher
        {
            public function __construct() {}

            public function dispatchOrderPaid(\App\Models\Order $order, array $deliveries): void
            {
                // no-op — test verifikasi behavior service, bukan dispatcher
            }

            public function dispatchAccountReady(\App\Models\AccountProvisioning $prov): void {}
        });
    }

    private function makeOrderWithItem(string $tipe, int $harga = 100000): Order
    {
        $productId = DB::table('products')->insertGetId([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => $harga,
            'tipe' => $tipe,
            'status' => 'aktif',
            'file_url' => $tipe === 'download' || $tipe === 'bundle' ? 'https://example.com/file.zip' : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => 'EPS-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'b@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => $harga,
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Raw insert — bypass SQLite enum check (account_manual di-skip di ALTER SQLite)
        DB::table('order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $productId,
            'nama_produk' => 'Test Product',
            'harga_saat_beli' => $harga,
            'tipe_produk' => $tipe,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Order::with('items.product', 'items.delivery', 'items.accountProvisioning')->findOrFail($orderId);
    }

    private function makeLicense(int $productId, string $status = 'aktif'): int
    {
        return DB::table('license_keys')->insertGetId([
            'product_id' => $productId,
            'key' => LicenseKey::generateKey('TEST'),
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // ───── generateForOrder — license FIFO ─────

    public function test_generate_for_order_license_type_claims_one_key_from_pool(): void
    {
        $order = $this->makeOrderWithItem('license');
        $keyId = $this->makeLicense($order->items->first()->product_id);

        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertCount(1, $rows);
        $this->assertInstanceOf(OrderDelivery::class, $rows[0]);

        $delivery = $rows[0];
        $this->assertEquals($keyId, $delivery->license_key_id);
        $this->assertNotNull($delivery->download_token);
        $this->assertNull($delivery->download_url, 'License-only harus null download_url');
        $this->assertEquals(LicenseKey::find($keyId)->key, $delivery->licenseKey->key);
    }

    public function test_generate_for_order_uses_fifo_when_multiple_license_keys(): void
    {
        $order = $this->makeOrderWithItem('license');
        $productId = $order->items->first()->product_id;

        $oldKey = $this->makeLicense($productId, 'aktif');    // id lebih kecil
        $newKey = $this->makeLicense($productId, 'aktif');
        $this->makeLicense($productId, 'digunakan');           // tidak eligible

        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertEquals($oldKey, $rows[0]->license_key_id, 'FIFO claim harus key id paling kecil');
    }

    public function test_generate_for_order_empty_license_pool_still_creates_delivery(): void
    {
        // Tidak seed license keys — pool kosong
        $order = $this->makeOrderWithItem('license');

        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertCount(1, $rows);
        $this->assertNull($rows[0]->license_key_id, 'license_key_id harus null kalau pool kosong');
    }

    public function test_generate_for_order_download_type_sets_url_from_product(): void
    {
        $order = $this->makeOrderWithItem('download', 50000);
        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertEquals('https://example.com/file.zip', $rows[0]->download_url);
        $this->assertNull($rows[0]->license_key_id, 'Download tidak boleh ada license_key');
    }

    public function test_generate_for_order_bundle_sets_both_url_and_license(): void
    {
        $order = $this->makeOrderWithItem('bundle');
        $keyId = $this->makeLicense($order->items->first()->product_id);

        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $delivery = $rows[0];
        $this->assertEquals('https://example.com/file.zip', $delivery->download_url);
        $this->assertEquals($keyId, $delivery->license_key_id);
    }

    public function test_generate_for_order_token_is_48_hex_chars_and_expires_in_7_days(): void
    {
        $order = $this->makeOrderWithItem('download');
        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertMatchesRegularExpression('/^[a-f0-9]{48}$/', $rows[0]->download_token);
        $this->assertGreaterThan(now()->addDays(6), $rows[0]->token_expired_at);
        $this->assertLessThanOrEqual(now()->addDays(7), $rows[0]->token_expired_at);
    }

    public function test_generate_for_order_idempotent_on_repeat_call(): void
    {
        $order = $this->makeOrderWithItem('download');
        $service = app(OrderDeliveryService::class);

        $rows1 = $service->generateForOrder($order);
        $this->assertCount(1, $rows1);

        // Refresh order dari DB — supaya relasi items.delivery fresh load
        $order = Order::with('items.product', 'items.delivery')->findOrFail($order->id);

        $rows2 = $service->generateForOrder($order);
        $this->assertCount(1, $rows2);
        $this->assertEquals($rows1[0]->id, $rows2[0]->id);
        $this->assertEquals(1, OrderDelivery::count(), 'DB cuma boleh ada 1 delivery row');
    }

    // ───── account_manual branch ─────

    public function test_generate_for_order_account_manual_skips_license_pool(): void
    {
        $order = $this->makeOrderWithItem('account_manual');
        $this->makeLicense($order->items->first()->product_id);  // punya pool tapi tidak di-claim

        $rows = app(OrderDeliveryService::class)->generateForOrder($order);

        $this->assertCount(1, $rows);
        $this->assertInstanceOf(AccountProvisioning::class, $rows[0]);
        $this->assertEquals('menunggu_admin', $rows[0]->status);
        $this->assertEquals(0, OrderDelivery::count());
    }

    // ───── regenerateToken ─────

    public function test_regenerate_token_issues_new_token_and_extends_expiry(): void
    {
        $order = $this->makeOrderWithItem('download');
        $rows = app(OrderDeliveryService::class)->generateForOrder($order);
        $delivery = $rows[0];
        $oldToken = $delivery->download_token;
        $oldExpiry = $delivery->token_expired_at;

        // Paksa expiry mundur
        DB::table('order_deliveries')->where('id', $delivery->id)
            ->update(['token_expired_at' => now()->subDay(), 'email_sent_at' => now(), 'wa_sent_at' => now()]);

        $updated = app(OrderDeliveryService::class)->regenerateToken($delivery->fresh());

        $this->assertNotEquals($oldToken, $updated->download_token);
        $this->assertTrue($updated->token_expired_at->isFuture());
        $this->assertGreaterThanOrEqual($oldExpiry, $updated->token_expired_at);
        $this->assertNull($updated->email_sent_at, 'email_sent_at harus di-reset agar notif re-fire');
        $this->assertNull($updated->wa_sent_at);
    }
}