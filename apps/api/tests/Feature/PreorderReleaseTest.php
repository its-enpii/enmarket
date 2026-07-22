<?php

namespace Tests\Feature;

use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\PreorderReleaseQueue;
use App\Models\Product;
use App\Services\Delivery\PreorderReleaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test untuk PreorderReleaseService — release flow admin manual.
 *
 * Tidak hit Tripay (testing service layer, bukan HTTP callback).
 * LicenseKey::markUsed() dipanggil real — pattern pool existing dipakai.
 */
class PreorderReleaseTest extends TestCase
{
    use RefreshDatabase;

    private function makePreorderProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'nama' => 'Pre-Order Test',
            'slug' => 'preorder-test-'.uniqid(),
            'deskripsi' => 'Test deskripsi.',
            'harga' => 200000,
            'tipe' => 'license',
            'status' => 'aktif',
            'is_pre_order' => true,
            'release_date' => now()->addDays(7)->toDateString(),
            'preorder_deposit_percent' => 50,
        ], $overrides));
    }

    private function makeAwaitingOrder(Product $product): Order
    {
        $order = Order::create([
            'kode_order' => 'EPS-TEST-'.strtoupper(substr(uniqid(), -5)),
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'buyer@test.id',
            'wa_pembeli' => '08123456789',
            'total_harga' => $product->depositAmount(),
            'status' => 'preorder_deposit_paid',
            'is_preorder' => true,
            'preorder_release_date' => $product->release_date->toDateString(),
            'preorder_deposit_amount' => $product->depositAmount(),
            'preorder_remaining_amount' => $product->remainingAmount(),
            'paid_at' => now(),
            'preorder_deposit_paid_at' => now(),
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'nama_produk' => $product->nama,
            'harga_saat_beli' => $product->harga,
            'tipe_produk' => $product->tipe,
        ]);
        PreorderReleaseQueue::create([
            'order_id' => $order->id,
            'release_date' => $product->release_date->toDateString(),
        ]);

        return $order;
    }

    public function test_release_order_moves_to_paid_and_creates_delivery(): void
    {
        $product = $this->makePreorderProduct();
        LicenseKey::create([
            'product_id' => $product->id,
            'key' => 'TEST-AAAA-BBBB-CCCC-DDDD',
            'status' => 'aktif',
        ]);

        $order = $this->makeAwaitingOrder($product);

        $svc = app(PreorderReleaseService::class);
        $released = $svc->releaseOrder($order);

        $this->assertTrue($released);
        $order->refresh();

        // Status transition
        $this->assertSame('paid', $order->status);
        $this->assertNotNull($order->preorder_release_processed_at);
        $this->assertTrue($order->isPreorderFulfilled());

        // Queue processed
        $queue = PreorderReleaseQueue::where('order_id', $order->id)->first();
        $this->assertNotNull($queue->processed_at);

        // Delivery + license claimed
        $delivery = OrderDelivery::where('order_item_id', $order->items->first()->id)->first();
        $this->assertNotNull($delivery);
        $this->assertNotNull($delivery->license_key_id);

        // License marked used
        $license = LicenseKey::find($delivery->license_key_id);
        $this->assertSame('digunakan', $license->status);
        $this->assertSame('TEST-AAAA-BBBB-CCCC-DDDD', $license->key);
    }

    public function test_release_order_is_idempotent(): void
    {
        $product = $this->makePreorderProduct();
        LicenseKey::create([
            'product_id' => $product->id,
            'key' => 'TEST-AAAA-BBBB-CCCC-DDDD',
            'status' => 'aktif',
        ]);

        $order = $this->makeAwaitingOrder($product);
        $svc = app(PreorderReleaseService::class);

        // First release — should succeed
        $this->assertTrue($svc->releaseOrder($order));

        // Count deliveries after first release
        $firstDeliveryCount = OrderDelivery::where('order_item_id', $order->items->first()->id)->count();
        $this->assertSame(1, $firstDeliveryCount);

        // Second release — should no-op (idempotent)
        $this->assertFalse($svc->releaseOrder($order->fresh()));

        // No additional delivery created
        $secondDeliveryCount = OrderDelivery::where('order_item_id', $order->items->first()->id)->count();
        $this->assertSame(1, $secondDeliveryCount, 'Idempotency violated — duplicate delivery created');
    }

    public function test_release_skips_when_order_not_in_awaiting_status(): void
    {
        $product = $this->makePreorderProduct();
        $order = $this->makeAwaitingOrder($product);
        // Force order ke status selain preorder_deposit_paid
        $order->update(['status' => 'pending']);

        $svc = app(PreorderReleaseService::class);
        $this->assertFalse($svc->releaseOrder($order));
    }

    public function test_release_handles_empty_license_pool_gracefully(): void
    {
        $product = $this->makePreorderProduct();
        // TIDAK seed license key — pool kosong
        $order = $this->makeAwaitingOrder($product);

        $svc = app(PreorderReleaseService::class);
        $released = $svc->releaseOrder($order);

        // Tetap success, license null (admin bisa manual assign nanti)
        $this->assertTrue($released);
        $delivery = OrderDelivery::where('order_item_id', $order->items->first()->id)->first();
        $this->assertNotNull($delivery);
        $this->assertNull($delivery->license_key_id);
    }
}
