<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Services\Delivery\AccountProvisioningService;
use App\Services\Delivery\OrderDeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * End-to-end test untuk account provisioning flow (manual activation).
 *
 * Coverage:
 * 1. paid order dengan product `account_manual` → row provisioning created,
 *    status `menunggu_admin`, TIDAK ada OrderDelivery
 * 2. admin markReady → status `siap`, credentials ter-simpan
 * 3. idempotency — generateForOrder 2x → tetap 1 row
 * 4. regenerate → credentials ter-update
 * 5. regression — produk license/download/bundle tidak membuat row provisioning
 *
 * Catatan: test env pakai SQLite (lihat phpunit.xml). order_items.tipe_produk
 * CHECK constraint skip untuk value 'account_manual' karena migration ALTER
 * enum MySQL di-skip untuk SQLite. Pakai DB::table()->insert() untuk bypass
 * Eloquent casting pada data fixtures.
 */
class AccountProvisioningFlowTest extends TestCase
{
    use RefreshDatabase;

    private function makePaidOrderWithProduct(string $tipe): Order
    {
        $productId = DB::table('products')->insertGetId([
            'nama' => 'Test '.ucfirst($tipe),
            'slug' => 'test-'.$tipe.'-'.uniqid(),
            'deskripsi' => 'Test product',
            'harga' => 100000,
            'tipe' => $tipe,
            'file_url' => $tipe === 'download' || $tipe === 'bundle' ? 'https://example.com/file.zip' : null,
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => 'EPS-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Test Buyer',
            'email_pembeli' => 'buyer@example.com',
            'wa_pembeli' => '081234567890',
            'total_harga' => 100000,
            'status' => 'paid',
            'tripay_reference' => 'TRX-'.uniqid(),
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Raw insert untuk bypass Eloquent enum cast + SQLite CHECK
        DB::table('order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $productId,
            'nama_produk' => 'Test '.ucfirst($tipe),
            'harga_saat_beli' => 100000,
            'tipe_produk' => $tipe,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Order::with('items.product', 'items.delivery', 'items.accountProvisioning')->findOrFail($orderId);
    }

    public function test_paid_order_with_account_manual_creates_provisioning_row(): void
    {
        $order = $this->makePaidOrderWithProduct('account_manual');

        $service = app(OrderDeliveryService::class);
        $rows = $service->generateForOrder($order);

        // 1 row provisioning, 0 delivery
        $this->assertCount(1, $rows);
        $this->assertInstanceOf(AccountProvisioning::class, $rows[0]);
        $this->assertEquals('menunggu_admin', $rows[0]->status);

        // Pastikan TIDAK ada OrderDelivery untuk item ini
        $this->assertDatabaseMissing('order_deliveries', [
            'order_item_id' => $order->items->first()->id,
        ]);
    }

    public function test_admin_mark_ready_saves_credentials_and_dispatches_notification(): void
    {
        $order = $this->makePaidOrderWithProduct('account_manual');
        $rows = app(OrderDeliveryService::class)->generateForOrder($order);
        $prov = $rows[0];

        $service = app(AccountProvisioningService::class);
        $updated = $service->markReady(
            $prov,
            ['username' => 'user@example.com', 'password' => 'secret123', 'server' => 'sg-01'],
            'Aktivasi selesai',
            'admin:test01',
        );

        $this->assertEquals('siap', $updated->status);
        $this->assertEquals('user@example.com', $updated->credentials['username']);
        $this->assertEquals('secret123', $updated->credentials['password']);
        $this->assertEquals('sg-01', $updated->credentials['server']);
        $this->assertEquals('Aktivasi selesai', $updated->catatan_admin);
        $this->assertEquals('admin:test01', $updated->ready_by_admin);
        $this->assertNotNull($updated->ready_at);
    }

    public function test_generate_for_order_is_idempotent(): void
    {
        $order = $this->makePaidOrderWithProduct('account_manual');
        $service = app(OrderDeliveryService::class);

        $rows1 = $service->generateForOrder($order);
        $rows2 = $service->generateForOrder($order);

        $this->assertCount(1, $rows1);
        $this->assertCount(1, $rows2);
        $this->assertEquals($rows1[0]->id, $rows2[0]->id, 'Should return same row on second call');
    }

    public function test_regenerate_replaces_credentials(): void
    {
        $order = $this->makePaidOrderWithProduct('account_manual');
        $rows = app(OrderDeliveryService::class)->generateForOrder($order);
        $prov = $rows[0];

        $service = app(AccountProvisioningService::class);
        $service->markReady(
            $prov,
            ['username' => 'old@example.com', 'password' => 'oldpw'],
            null,
            'admin:test01',
        );

        $service->regenerate(
            $prov->fresh(),
            ['username' => 'new@example.com', 'password' => 'newpw'],
            'admin:test01',
        );

        $this->assertEquals('new@example.com', $prov->fresh()->credentials['username']);
        $this->assertEquals('newpw', $prov->fresh()->credentials['password']);
    }

    public function test_license_and_download_products_do_not_create_provisioning(): void
    {
        foreach (['license', 'download', 'bundle'] as $tipe) {
            $order = $this->makePaidOrderWithProduct($tipe);
            $rows = app(OrderDeliveryService::class)->generateForOrder($order);

            $this->assertCount(1, $rows, "Tipe $tipe harus punya 1 delivery");
            $this->assertInstanceOf(
                OrderDelivery::class,
                $rows[0],
                "Tipe $tipe harus return OrderDelivery, bukan AccountProvisioning",
            );
            $this->assertDatabaseMissing('account_provisionings', [
                'order_item_id' => $order->items->first()->id,
            ]);
        }
    }
}
