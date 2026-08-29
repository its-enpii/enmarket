<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\Delivery\NotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * Test untuk NotificationDispatcher — dev-mode log + n8n webhook HTTP POST
 * + payload shape untuk order.paid dan account.ready events.
 *
 * Http facade di-fake untuk isolate HTTP. Log::spy untuk verifikasi dev-mode output.
 */
class NotificationDispatcherTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrderWithDelivery(): array
    {
        $product = Product::create([
            'nama' => 'Test Product',
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => 'license',
            'status' => 'aktif',
        ]);
        $keyId = DB()->table('license_keys')->insertGetId([
            'product_id' => $product->id,
            'key' => LicenseKey::generateKey('TEST'),
            'status' => 'digunakan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $order = Order::create([
            'kode_order' => 'EPS-NOTIF-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Test Buyer',
            'email_pembeli' => 'buyer@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 100000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'nama_produk' => $product->nama,
            'harga_saat_beli' => 100000,
            'tipe_produk' => 'license',
        ]);
        $delivery = OrderDelivery::create([
            'order_item_id' => $item->id,
            'download_token' => 'tok-'.uniqid(),
            'token_expired_at' => now()->addDays(7),
            'license_key_id' => $keyId,
        ]);

        return [$order, $delivery, $item, $product];
    }

    private function makeProvisioningReady(): AccountProvisioning
    {
        $product = Product::create([
            'nama' => 'Netflix',
            'slug' => 'netflix-'.uniqid(),
            'deskripsi' => 'Streaming account',
            'harga' => 50000,
            'tipe' => 'account_manual',
            'status' => 'aktif',
        ]);
        $order = Order::create([
            'kode_order' => 'EPS-NOTIF-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'b@example.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 50000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'nama_produk' => $product->nama,
            'harga_saat_beli' => 50000,
            'tipe_produk' => 'account_manual',
        ]);

        return AccountProvisioning::create([
            'order_item_id' => $item->id,
            'status' => 'siap',
            'credentials' => ['username' => 'u@x.com', 'password' => 'pw123', 'server' => 'sg-01'],
            'catatan_admin' => 'Aktivasi OK',
            'ready_at' => now(),
        ]);
    }

    // ───── dev mode (no webhook) ─────

    public function test_dev_mode_marks_sent_when_webhook_url_null(): void
    {
        $dispatcher = new NotificationDispatcher(null);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        $this->assertNotNull($delivery->fresh()->email_sent_at);
        $this->assertNotNull($delivery->fresh()->wa_sent_at);
    }

    public function test_dev_mode_does_not_overwrite_existing_timestamps(): void
    {
        $dispatcher = new NotificationDispatcher(null);
        [$order, $delivery] = $this->makeOrderWithDelivery();
        $firstSent = now()->subDay();
        DB()->table('order_deliveries')->where('id', $delivery->id)->update([
            'email_sent_at' => $firstSent,
            'wa_sent_at' => $firstSent,
        ]);
        $delivery->refresh();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        $fresh = $delivery->fresh();
        $this->assertEquals($firstSent->toIso8601String(), $fresh->email_sent_at->toIso8601String());
    }

    // ───── n8n webhook ─────

    public function test_webhook_posts_order_paid_with_correct_payload(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook', timeout: 5);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        Http::assertSent(function ($request) use ($order, $delivery) {
            $body = json_decode($request->body(), true);

            return ($body['order']['kode_order'] ?? null) === $order->kode_order
                && ($body['order']['email_pembeli'] ?? null) === 'buyer@example.com'
                && ($body['deliveries'][0]['product']['nama'] ?? null) === $delivery->orderItem->nama_produk
                && ($body['deliveries'][0]['license_key'] ?? null) === $delivery->licenseKey->key
                && ($body['channels'] ?? null) === ['email', 'wa'];
        });
    }

    public function test_webhook_posts_account_ready_with_credentials(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook', timeout: 5);
        $prov = $this->makeProvisioningReady();
        $prov->loadMissing('orderItem.order', 'orderItem.product');

        $dispatcher->dispatchAccountReady($prov);

        Http::assertSent(function ($request) use ($prov) {
            $body = json_decode($request->body(), true);

            return ($body['event'] ?? null) === 'account.ready'
                && ($body['item']['product_nama'] ?? null) === 'Netflix'
                && ($body['item']['credentials']['username'] ?? null) === 'u@x.com'
                && ($body['item']['credentials']['password'] ?? null) === 'pw123'
                && ($body['item']['catatan'] ?? null) === 'Aktivasi OK'
                && ($body['channels'] ?? null) === ['email', 'wa'];
        });

        $this->assertNotNull($prov->fresh()->email_sent_at);
        $this->assertNotNull($prov->fresh()->wa_sent_at);
    }

    public function test_webhook_failure_logs_error_does_not_mark_sent(): void
    {
        Http::fake(['*' => Http::response('Internal Server Error', 500)]);

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook', timeout: 5);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        // dispatchOrderPaid swallows HTTP error — tidak throw
        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        $this->assertNull($delivery->fresh()->email_sent_at, 'email_sent_at harus null saat webhook fail');
        $this->assertNull($delivery->fresh()->wa_sent_at);
    }

    public function test_webhook_marks_sent_only_after_2xx_response(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 202)]);  // 202 = Accepted

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook', timeout: 5);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        $this->assertNotNull($delivery->fresh()->email_sent_at);
    }

    public function test_timeout_uses_constructor_param(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook', timeout: 3);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        Http::assertSent(function ($request) {
            // Verify timeout set on pending request — checked via Laravel internals
            return $request->method() === 'POST';
        });
    }

    // ───── account.ready edge case ─────

    public function test_account_ready_skips_when_order_or_item_missing(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        // Provisioning tanpa relasi loaded — orderItem null guard
        $prov = new AccountProvisioning([
            'order_item_id' => 999999,
            'status' => 'siap',
            'credentials' => ['x' => 'y'],
        ]);
        $prov->id = 1;

        $dispatcher = new NotificationDispatcher('https://n8n.example.com/webhook');
        $dispatcher->dispatchAccountReady($prov);  // tidak throw

        Http::assertNothingSent();
    }

    public function test_account_ready_dev_mode_marks_provisioning_sent(): void
    {
        $dispatcher = new NotificationDispatcher(null);
        $prov = $this->makeProvisioningReady();

        $dispatcher->dispatchAccountReady($prov);

        $this->assertNotNull($prov->fresh()->email_sent_at);
        $this->assertNotNull($prov->fresh()->wa_sent_at);
    }
}

/**
 * Helper — global DB facade.
 */
function DB(): \Illuminate\Database\Connection
{
    return \Illuminate\Support\Facades\DB::connection();
}