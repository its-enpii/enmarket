<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\WhatsApp\MessageBuilder;
use App\Services\WhatsApp\WhatsAppClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Test untuk NotificationDispatcher — dev-mode log + direct Email/WA dispatch.
 *
 * Mail dan Http facades di-fake untuk isolate. Log::spy untuk verifikasi dev-mode output.
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

    private function makeDispatcherWithWa(): NotificationDispatcher
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $waClient = new WhatsAppClient(
            webhookUrl: 'https://wa.example.com/webhook',
            webhookSecret: 'test-secret',
        );
        $msgBuilder = new MessageBuilder(
            siteUrl: 'https://example.com',
            storeName: 'TestStore',
        );

        return new NotificationDispatcher(
            n8nWebhookUrl: null,
            waClient: $waClient,
            waMessageBuilder: $msgBuilder,
            siteUrl: 'https://example.com',
        );
    }

    // ————— dev mode (no webhook, no WA) —————

    public function test_dev_mode_marks_sent_when_webhook_url_null(): void
    {
        // Dev mode (tanpa WA client): mail driver=array dianggap terkirim;
        // WA client null → wa_sent_at tetap null (per-channel truthful).
        $dispatcher = new NotificationDispatcher(null);
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        $this->assertNotNull($delivery->fresh()->email_sent_at);
        $this->assertNull($delivery->fresh()->wa_sent_at);
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

    // ————— WhatsApp webhook —————

    public function test_wa_dispatch_sends_order_paid_message(): void
    {
        $dispatcher = $this->makeDispatcherWithWa();
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        Http::assertSent(function ($request) use ($order) {
            $body = json_decode($request->body(), true);

            return ($body['event'] ?? null) === 'send_message'
                && str_contains($body['data']['content'] ?? '', $order->kode_order)
                && str_starts_with($body['data']['phone_number'] ?? '', '62');
        });

        $this->assertNotNull($delivery->fresh()->wa_sent_at);
    }

    public function test_wa_dispatch_sends_account_ready_message(): void
    {
        $dispatcher = $this->makeDispatcherWithWa();
        $prov = $this->makeProvisioningReady();
        $prov->loadMissing('orderItem.order', 'orderItem.product');

        $dispatcher->dispatchAccountReady($prov);

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);

            return ($body['event'] ?? null) === 'send_message'
                && str_contains($body['data']['content'] ?? '', 'Netflix');
        });

        $this->assertNotNull($prov->fresh()->wa_sent_at);
    }

    // ————— account.ready edge case —————

    public function test_account_ready_skips_when_order_or_item_missing(): void
    {
        Http::fake(['*' => Http::response(['ok' => true], 200)]);

        $prov = new AccountProvisioning([
            'order_item_id' => 999999,
            'status' => 'siap',
            'credentials' => ['x' => 'y'],
        ]);
        $prov->id = 1;

        $dispatcher = new NotificationDispatcher(null);
        $dispatcher->dispatchAccountReady($prov);

        Http::assertNothingSent();
    }

    public function test_account_ready_dev_mode_marks_provisioning_sent(): void
    {
        // Dev mode (tanpa WA client): email via mailer array terkirim OK;
        // wa_sent_at tetap null (per-channel truthful).
        $dispatcher = new NotificationDispatcher(null);
        $prov = $this->makeProvisioningReady();

        $dispatcher->dispatchAccountReady($prov);

        $this->assertNotNull($prov->fresh()->email_sent_at);
        $this->assertNull($prov->fresh()->wa_sent_at);
    }

    // ————— WhatsApp message contains correct data —————

    public function test_wa_order_paid_message_includes_download_link(): void
    {
        // Produk fixture bertipe license (tanpa file) — WA message hanya menyertakan
        // link download kalau delivery punya download_url. Set manual supaya branch
        // download-link ter-eksis di message.
        $dispatcher = $this->makeDispatcherWithWa();
        [$order, $delivery] = $this->makeOrderWithDelivery();
        $delivery->forceFill(['download_url' => 'products/file.zip'])->save();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        Http::assertSent(function ($request) use ($delivery) {
            $body = json_decode($request->body(), true);
            $content = $body['data']['content'] ?? '';

            return str_contains($content, $delivery->download_token)
                && str_contains($content, 'Rp');
        });
    }

    public function test_wa_phone_normalised_to_62(): void
    {
        $dispatcher = $this->makeDispatcherWithWa();
        [$order, $delivery] = $this->makeOrderWithDelivery();

        $dispatcher->dispatchOrderPaid($order, [$delivery]);

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);

            return str_starts_with($body['data']['phone_number'] ?? '', '628');
        });
    }
}

/**
 * Helper — global DB facade.
 */
function DB(): \Illuminate\Database\Connection
{
    return \Illuminate\Support\Facades\DB::connection();
}
