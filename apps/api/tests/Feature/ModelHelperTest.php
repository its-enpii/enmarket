<?php

namespace Tests\Feature;

use App\Models\AccountProvisioning;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk helper predicates + scope + slug generator di Eloquent models.
 *
 * Pattern: DB::table()->insertGetId() raw untuk bypass Eloquent casting + SQLite
 * enum CHECK, sama dengan AccountProvisioningFlowTest.
 */
class ModelHelperTest extends TestCase
{
    use RefreshDatabase;

    // ───── Order helpers ─────

    public function test_order_is_paid_returns_true_only_for_paid_status(): void
    {
        $pendingId = $this->makeOrder('pending');
        $paidId = $this->makeOrder('paid');

        $this->assertFalse(Order::find($pendingId)->isPaid());
        $this->assertTrue(Order::find($paidId)->isPaid());
    }

    public function test_order_is_qris_valid_requires_status_pending_and_future_expiry(): void
    {
        $validId = $this->makeOrder('pending', ['qr_expired_at' => now()->addHour()]);
        $wrongStatusId = $this->makeOrder('paid', ['qr_expired_at' => now()->addHour()]);
        $expiredId = $this->makeOrder('pending', ['qr_expired_at' => now()->subHour()]);
        $nullExpiryId = $this->makeOrder('pending', ['qr_expired_at' => null]);

        $this->assertTrue(Order::find($validId)->isQrisValid());
        $this->assertFalse(Order::find($wrongStatusId)->isQrisValid(), 'Paid order bukan QRIS valid');
        $this->assertFalse(Order::find($expiredId)->isQrisValid(), 'QR expiry lewat harus invalid');
        $this->assertFalse(Order::find($nullExpiryId)->isQrisValid(), 'QR expiry null harus invalid');
    }

    // ───── OrderDelivery helpers ─────

    public function test_order_delivery_is_download_valid_requires_token_and_future_expiry(): void
    {
        $validId = $this->makeOrderDelivery(['download_token' => 'tok-'.uniqid(), 'token_expired_at' => now()->addDays(7)]);
        $noTokenId = $this->makeOrderDelivery(['download_token' => null, 'token_expired_at' => now()->addDays(7)]);
        $expiredId = $this->makeOrderDelivery(['download_token' => 'tok-'.uniqid(), 'token_expired_at' => now()->subDay()]);
        $nullExpiryId = $this->makeOrderDelivery(['download_token' => 'tok-'.uniqid(), 'token_expired_at' => null]);

        $this->assertTrue(OrderDelivery::find($validId)->isDownloadValid());
        $this->assertFalse(OrderDelivery::find($noTokenId)->isDownloadValid(), 'Token kosong harus invalid');
        $this->assertFalse(OrderDelivery::find($expiredId)->isDownloadValid(), 'Token expired harus invalid');
        $this->assertFalse(OrderDelivery::find($nullExpiryId)->isDownloadValid(), 'Expiry null harus invalid');
    }

    // ───── Cart helpers ─────

    public function test_cart_total_sums_product_price_times_qty(): void
    {
        $product1 = $this->makeProduct(['harga' => 100000]);
        $product2 = $this->makeProduct(['harga' => 50000]);

        $cartId = DB::table('carts')->insertGetId([
            'session_id' => 'test-'.uniqid(),
            'expires_at' => now()->addDay(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('cart_items')->insert([
            ['cart_id' => $cartId, 'product_id' => $product1, 'qty' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['cart_id' => $cartId, 'product_id' => $product2, 'qty' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // total = 100000 * 2 + 50000 * 3 = 350000
        $this->assertEquals(350000.0, Cart::find($cartId)->total());
    }

    public function test_cart_is_expired_returns_true_for_past_expiry_and_false_for_null_or_future(): void
    {
        $pastId = DB::table('carts')->insertGetId([
            'session_id' => 'p-'.uniqid(), 'expires_at' => now()->subHour(),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $futureId = DB::table('carts')->insertGetId([
            'session_id' => 'f-'.uniqid(), 'expires_at' => now()->addDay(),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $nullId = DB::table('carts')->insertGetId([
            'session_id' => 'n-'.uniqid(), 'expires_at' => null,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->assertTrue(Cart::find($pastId)->isExpired());
        $this->assertFalse(Cart::find($futureId)->isExpired());
        $this->assertFalse(Cart::find($nullId)->isExpired(), 'expires_at=null bukan expired');
    }

    // ───── Post slug + scope ─────

    public function test_post_slug_auto_generated_from_title_with_collision_suffix(): void
    {
        // 'slug' sentinel key 'AUTO' = jangan insert, biarkan model booted generate
        $firstId = $this->makePostRaw(['title' => 'Belajar Laravel']);
        $this->assertEquals('belajar-laravel', Post::find($firstId)->slug);

        $secondId = $this->makePostRaw(['title' => 'Belajar Laravel']);
        $this->assertEquals('belajar-laravel-1', Post::find($secondId)->slug);

        $thirdId = $this->makePostRaw(['title' => 'Belajar Laravel']);
        $this->assertEquals('belajar-laravel-2', Post::find($thirdId)->slug);
    }

    public function test_post_update_keeps_existing_slug_when_title_changes(): void
    {
        $id = $this->makePost(['title' => 'Asli', 'slug' => 'slug-asli']);
        Post::find($id)->update(['title' => 'Berubah']);
        $this->assertEquals('slug-asli', Post::find($id)->slug);
    }

    public function test_post_scope_published_filters_by_status_and_past_published_at(): void
    {
        $publishedPast = $this->makePost([
            'title' => 'Live', 'status' => 'published', 'published_at' => now()->subDay(),
        ]);
        $publishedFuture = $this->makePost([
            'title' => 'Scheduled', 'status' => 'published', 'published_at' => now()->addDay(),
        ]);
        $draft = $this->makePost([
            'title' => 'Draft', 'status' => 'draft', 'published_at' => null,
        ]);
        $noPublishedAt = $this->makePost([
            'title' => 'NoDate', 'status' => 'published', 'published_at' => null,
        ]);
        $archived = $this->makePost([
            'title' => 'Old', 'status' => 'archived', 'published_at' => now()->subMonth(),
        ]);

        $result = Post::published()->pluck('id')->all();
        $this->assertContains($publishedPast, $result);
        $this->assertNotContains($publishedFuture, $result, 'published_at future harus excluded');
        $this->assertNotContains($draft, $result, 'status=draft harus excluded');
        $this->assertNotContains($noPublishedAt, $result, 'published_at null harus excluded');
        $this->assertNotContains($archived, $result, 'status=archived harus excluded');
    }

    // ───── LicenseKey helpers ─────

    public function test_license_key_generate_format_is_prefix_four_groups_of_four(): void
    {
        $key = LicenseKey::generateKey('TEST');
        $this->assertMatchesRegularExpression('/^TEST-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/', $key);
    }

    public function test_license_key_mark_used_idempotent_and_updates_timestamps(): void
    {
        $productId = $this->makeProduct();
        $keyId = $this->makeLicenseKey($productId, 'aktif');

        $key = LicenseKey::find($keyId);
        $this->assertTrue($key->markUsed());
        $this->assertEquals('digunakan', $key->fresh()->status);
        $this->assertNotNull($key->fresh()->activated_at);

        // Call kedua harus idempotent — return false
        $key2 = LicenseKey::find($keyId);
        $this->assertFalse($key2->markUsed(), 'markUsed pada status=digunakan harus return false');
    }

    public function test_license_key_mark_used_returns_false_for_non_aktif_status(): void
    {
        $productId = $this->makeProduct();
        $dicabutId = $this->makeLicenseKey($productId, 'dicabut');

        $this->assertFalse(LicenseKey::find($dicabutId)->markUsed());
    }

    public function test_license_key_scope_available_filters_and_orders_fifo(): void
    {
        $productId = $this->makeProduct();
        $a = $this->makeLicenseKey($productId, 'digunakan');  // tidak eligible
        $b = $this->makeLicenseKey($productId, 'kadaluarsa'); // tidak eligible
        $c = $this->makeLicenseKey($productId, 'aktif');      // eligible (FIFO position 1)
        $d = $this->makeLicenseKey($productId, 'aktif');      // eligible (FIFO position 2)

        $available = LicenseKey::available()->where('product_id', $productId)->pluck('id')->all();
        $this->assertEquals([$c, $d], $available, 'FIFO order by id asc');
    }

    // ───── AccountProvisioning helpers ─────

    public function test_account_provisioning_state_predicates(): void
    {
        $productId = $this->makeProduct();
        // Setiap provisioning butuh order_item_id unik (UNIQUE constraint di schema)
        $item1 = $this->makeOrderItem($productId);
        $item2 = $this->makeOrderItem($productId);
        $item3 = $this->makeOrderItem($productId);

        $pendingId = $this->makeProvisioning($item1, 'menunggu_admin');
        $siapId = $this->makeProvisioning($item2, 'siap');
        $emailedId = $this->makeProvisioning($item3, 'siap', [
            'email_sent_at' => now(), 'wa_sent_at' => now(),
        ]);

        $this->assertTrue(AccountProvisioning::find($pendingId)->isPending());
        $this->assertFalse(AccountProvisioning::find($pendingId)->isReady());

        $this->assertTrue(AccountProvisioning::find($siapId)->isReady());
        $this->assertFalse(AccountProvisioning::find($siapId)->isEmailSent());
        $this->assertFalse(AccountProvisioning::find($siapId)->isWaSent());

        $this->assertTrue(AccountProvisioning::find($emailedId)->isEmailSent());
        $this->assertTrue(AccountProvisioning::find($emailedId)->isWaSent());
    }

    // ───── helpers ─────

    private function makeProduct(array $overrides = []): int
    {
        return DB::table('products')->insertGetId(array_merge([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ], $overrides));
    }

    private function makeOrder(string $status, array $overrides = []): int
    {
        return DB::table('orders')->insertGetId(array_merge([
            'kode_order' => 'EPS-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'nama_pembeli' => 'Buyer',
            'email_pembeli' => 'b@example.com',
            'wa_pembeli' => '081234567890',
            'total_harga' => 100000,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ], $overrides));
    }

    private function makeOrderDelivery(array $overrides = []): int
    {
        // OrderDelivery butuh order_item_id via FK — skip kalau tidak ada.
        $itemId = DB::table('order_items')->insertGetId([
            'order_id' => $this->makeOrder('paid'),
            'product_id' => $this->makeProduct(),
            'nama_produk' => 'Test',
            'harga_saat_beli' => 100000,
            'tipe_produk' => 'download',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('order_deliveries')->insertGetId(array_merge([
            'order_item_id' => $itemId,
            'created_at' => now(),
            'updated_at' => now(),
        ], $overrides));
    }

    private function makeOrderItem(int $productId): int
    {
        return DB::table('order_items')->insertGetId([
            'order_id' => $this->makeOrder('paid'),
            'product_id' => $productId,
            'nama_produk' => 'Test',
            'harga_saat_beli' => 100000,
            'tipe_produk' => 'download',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makePost(array $overrides = []): int
    {
        // MySQL posts.slug NOT NULL — helper auto-inject slug default kalau caller
        // tidak pass slug. Untuk test slug auto-generation, pakai makePostRaw().
        if (! array_key_exists('slug', $overrides)) {
            $overrides['slug'] = 'post-'.uniqid();
        }
        $overrides['content'] = $overrides['content'] ?? '<p>body</p>';
        $overrides['status'] = $overrides['status'] ?? 'draft';
        $overrides['created_at'] = $overrides['created_at'] ?? now();
        $overrides['updated_at'] = $overrides['updated_at'] ?? now();

        return DB::table('posts')->insertGetId($overrides);
    }

    /**
     * Insert Post lewat Eloquent save — supaya booted hook trigger slug auto-gen.
     * Pakai untuk test scopePublished/slug generation yang butuh full model lifecycle.
     */
    private function makePostRaw(array $attrs = []): int
    {
        $post = new Post;
        $post->title = $attrs['title'] ?? 'Raw '.uniqid();
        $post->content = $attrs['content'] ?? '<p>body</p>';
        $post->status = $attrs['status'] ?? 'draft';
        if (isset($attrs['published_at'])) {
            $post->published_at = $attrs['published_at'];
        }
        $post->save();

        return $post->id;
    }

    private function makeLicenseKey(int $productId, string $status): int
    {
        return DB::table('license_keys')->insertGetId([
            'product_id' => $productId,
            'key' => 'TEST-'.strtoupper(uniqid()),
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makeProvisioning(int $itemId, string $status, array $overrides = []): int
    {
        return DB::table('account_provisionings')->insertGetId(array_merge([
            'order_item_id' => $itemId,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ], $overrides));
    }
}
