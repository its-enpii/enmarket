<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Services\Cart\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test CartService + CartController endpoints.
 *
 * Pattern: Cookie 'cart_session' jadi identitas utama. Tanpa cookie,
 * server generate UUID baru. DB::table raw insert untuk fixture (bypass
 * Eloquent casting SQLite enum).
 */
class CartFlowTest extends TestCase
{
    use RefreshDatabase;

    private const COOKIE = 'cart_session';

    private CartService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CartService::class);
    }

    // ───── CartService unit ─────

    public function test_get_or_create_cart_creates_new_when_session_id_unknown(): void
    {
        $sessionId = 'sess-'.uniqid();

        $cart = $this->service->getOrCreateCart($sessionId);

        $this->assertEquals($sessionId, $cart->session_id);
        $this->assertNotNull($cart->expires_at);
        // EXPIRY_HOURS = 24. Cek expiry di masa depan, bukan diff exact karena
        // sekarang sudah lewat beberapa ms sejak service call.
        $this->assertGreaterThan(now()->addHours(23), $cart->expires_at);
        $this->assertLessThanOrEqual(now()->addHours(24), $cart->expires_at);
    }

    public function test_get_or_create_cart_returns_existing_when_not_expired(): void
    {
        $sessionId = 'sess-'.uniqid();
        $first = $this->service->getOrCreateCart($sessionId);
        $first->update(['expires_at' => now()->addHour()]);

        $second = $this->service->getOrCreateCart($sessionId);

        $this->assertEquals($first->id, $second->id, 'ID harus sama kalau cart masih berlaku');
    }

    public function test_get_or_create_cart_replaces_expired(): void
    {
        $sessionId = 'sess-'.uniqid();
        $oldId = DB::table('carts')->insertGetId([
            'session_id' => $sessionId,
            'expires_at' => now()->subHour(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cart = $this->service->getOrCreateCart($sessionId);

        $this->assertNotEquals($oldId, $cart->id, 'Expired cart harus diganti');
        $this->assertNull(Cart::find($oldId), 'Old expired cart harus dihapus');
        $this->assertNotNull($cart->expires_at);
    }

    public function test_add_item_inserts_new_row_with_default_qty_1(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $sessionId = 'sess-'.uniqid();

        $cart = $this->service->addItem($sessionId, $productId);

        $item = $cart->items()->where('product_id', $productId)->first();
        $this->assertNotNull($item);
        $this->assertEquals(1, $item->qty);
    }

    public function test_add_item_increments_qty_when_product_already_in_cart(): void
    {
        $productId = $this->makeProduct(100000, 'aktif');
        $sessionId = 'sess-'.uniqid();

        $this->service->addItem($sessionId, $productId, 2);
        $cart = $this->service->addItem($sessionId, $productId, 3);

        $item = $cart->items()->where('product_id', $productId)->first();
        $this->assertEquals(5, $item->qty, 'Qty harus di-increment, bukan replace');
    }

    public function test_add_item_throws_for_nonexistent_product(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->addItem('sess-'.uniqid(), 999999);
    }

    public function test_update_qty_zero_deletes_item(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = 'sess-'.uniqid();
        $this->service->addItem($sessionId, $productId);

        $cart = $this->service->updateQty($sessionId, $productId, 0);

        $this->assertNull($cart->items()->where('product_id', $productId)->first());
    }

    public function test_update_qty_negative_also_deletes(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = 'sess-'.uniqid();
        $this->service->addItem($sessionId, $productId);

        $cart = $this->service->updateQty($sessionId, $productId, -5);

        $this->assertNull($cart->items()->where('product_id', $productId)->first());
    }

    public function test_update_qty_for_nonexistent_item_returns_cart_unchanged(): void
    {
        $sessionId = 'sess-'.uniqid();
        $productId = $this->makeProduct(50000, 'aktif');
        $cart = $this->service->addItem($sessionId, $productId);

        $result = $this->service->updateQty($sessionId, 999999, 5);

        // qty item yang ada TIDAK berubah
        $this->assertEquals(1, $cart->fresh()->items()->first()->qty);
    }

    public function test_remove_item_deletes_cart_item_row(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = 'sess-'.uniqid();
        $this->service->addItem($sessionId, $productId);

        $cart = $this->service->removeItem($sessionId, $productId);

        $this->assertNull($cart->items()->where('product_id', $productId)->first());
    }

    public function test_clear_deletes_cart_and_all_items(): void
    {
        $sessionId = 'sess-'.uniqid();
        $p1 = $this->makeProduct(10000, 'aktif');
        $p2 = $this->makeProduct(20000, 'aktif');
        $this->service->addItem($sessionId, $p1);
        $this->service->addItem($sessionId, $p2);

        $this->service->clear($sessionId);

        $this->assertNull(Cart::where('session_id', $sessionId)->first());
        $this->assertEquals(0, CartItem::whereIn('product_id', [$p1, $p2])->count());
    }

    public function test_each_cart_change_refreshes_expiry(): void
    {
        $sessionId = 'sess-'.uniqid();
        $cart = $this->service->getOrCreateCart($sessionId);

        // Paksa expiry mundur 5 menit (raw DB — bypass update hook yg reset expiry)
        DB::table('carts')->where('id', $cart->id)->update(['expires_at' => now()->subMinutes(5)]);

        $productId = $this->makeProduct(50000, 'aktif');
        $updated = $this->service->addItem($sessionId, $productId);

        // Service getOrCreateCart melihat expired → delete & recreate → ID baru
        // dengan expiry = now() + 24h. Yang penting: expiry baru di masa depan
        // (bukan past lagi).
        $this->assertTrue($updated->expires_at->isFuture(), 'Expiry harus di-refresh ke future');
        // Past-expiry state harus sudah hilang di DB.
        $this->assertNull(Cart::find($cart->id), 'Old expired cart row harus dihapus');
    }

    // ───── CartController HTTP ─────

    public function test_index_creates_new_cart_when_no_cookie(): void
    {
        $response = $this->getJson('/api/cart');

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['session_id', 'items', 'total']]);
        $this->assertEmpty($response->json('data.items'));
    }

    public function test_index_returns_same_cart_when_cookie_present(): void
    {
        // Cookie minimal 16 char (CartController::resolveSessionId check)
        $sessionId = str_repeat('a', 32);

        // Bypass Laravel EncryptCookies middleware dengan set Cookie header raw —
        // server-side cookie encryption tidak aktif untuk HTTP test request ini.
        $first = $this->call('GET', '/api/cart', [], [self::COOKIE => $sessionId]);
        $this->assertEquals(200, $first->status());
        $this->assertEquals($sessionId, json_decode($first->getContent(), true)['data']['session_id']);

        $second = $this->call('GET', '/api/cart', [], [self::COOKIE => $sessionId]);
        $this->assertEquals($sessionId, json_decode($second->getContent(), true)['data']['session_id']);
    }

    public function test_index_replaces_expired_cart_with_new_one(): void
    {
        $sessionId = str_repeat('e', 32);
        DB::table('carts')->insert([
            'session_id' => $sessionId,
            'expires_at' => now()->subHour(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->call('GET', '/api/cart', [], [self::COOKIE => $sessionId]);
        $this->assertEquals(200, $response->status());
        $carts = Cart::where('session_id', $sessionId)->get();
        $this->assertCount(1, $carts, 'Expired row harus dihapus, hanya 1 cart tersisa');
        // expires_at harus di masa depan (raw DB read bisa return raw datetime string,
        // bukan Carbon — re-parse untuk konsistensi assertion)
        $expiry = \Carbon\Carbon::parse($carts->first()->expires_at);
        $this->assertTrue($expiry->isFuture(), 'Expiry baru harus di masa depan');
    }

    public function test_store_item_validates_product_id_required(): void
    {
        $response = $this->postJson('/api/cart/items', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_id']);
    }

    public function test_store_item_validates_qty_range(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');

        $tooHigh = $this->postJson('/api/cart/items', ['product_id' => $productId, 'qty' => 100]);
        $tooHigh->assertStatus(422);

        $zero = $this->postJson('/api/cart/items', ['product_id' => $productId, 'qty' => 0]);
        $zero->assertStatus(422);
    }

    public function test_store_item_rejects_non_aktif_product(): void
    {
        $draft = $this->makeProduct(50000, 'draft');

        $response = $this->postJson('/api/cart/items', ['product_id' => $draft]);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Produk ini sedang tidak dijual.']);
    }

    public function test_store_item_rejects_nonexistent_product(): void
    {
        $response = $this->postJson('/api/cart/items', ['product_id' => 999999]);
        $response->assertStatus(422);
    }

    public function test_store_item_happy_path(): void
    {
        $productId = $this->makeProduct(75000, 'aktif');

        $response = $this->postJson('/api/cart/items', ['product_id' => $productId, 'qty' => 2]);
        $response->assertOk();
        $response->assertJsonStructure(['data' => ['items' => [['product_id', 'qty']]]]);

        $item = collect($response->json('data.items'))->firstWhere('product_id', $productId);
        $this->assertEquals(2, $item['qty']);
    }

    public function test_update_item_validates_qty_required(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = str_repeat('u', 32);

        $response = $this->call('PATCH', "/api/cart/items/{$productId}", [], [self::COOKIE => $sessionId], [], [], '{}');
        $this->assertEquals(422, $response->status());
    }

    public function test_update_item_happy_path(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = str_repeat('u', 32);
        $this->service->addItem($sessionId, $productId);

        $response = $this->call(
            'PATCH',
            "/api/cart/items/{$productId}",
            [],
            [self::COOKIE => $sessionId],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['qty' => 7]),
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $item = collect($body['data']['items'] ?? [])->firstWhere('product_id', $productId);
        $this->assertNotNull($item, 'Item harus ada di response items');
        $this->assertEquals(7, $item['qty']);
    }

    public function test_update_item_zero_removes_item(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = str_repeat('u', 32);
        $this->service->addItem($sessionId, $productId);

        $response = $this->call(
            'PATCH',
            "/api/cart/items/{$productId}",
            [],
            [self::COOKIE => $sessionId],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['qty' => 0]),
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertEmpty($body['data']['items']);
    }

    public function test_destroy_item_removes_from_cart(): void
    {
        $productId = $this->makeProduct(50000, 'aktif');
        $sessionId = str_repeat('u', 32);
        $this->service->addItem($sessionId, $productId);

        $response = $this->call('DELETE', "/api/cart/items/{$productId}", [], [self::COOKIE => $sessionId]);

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertEmpty($body['data']['items']);
    }

    // ───── helpers ─────

    private function makeProduct(int $harga, string $status): int
    {
        return DB::table('products')->insertGetId([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => $harga,
            'tipe' => 'download',
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
