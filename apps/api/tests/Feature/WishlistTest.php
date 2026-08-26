<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    private const COOKIE = 'wishlist_session';

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create([
            'nama' => 'Templates',
            'slug' => 'templates',
            'deskripsi' => 'Kategori template',
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'nama' => 'Next.js SaaS Starter',
            'slug' => 'nextjs-saas-starter',
            'deskripsi' => 'Starter kit lengkap',
            'harga' => 250000,
            'tipe' => 'download',
            'status' => 'aktif',
        ]);
    }

    public function test_toggle_adds_product_to_wishlist_and_sets_cookie(): void
    {
        $response = $this->call(
            'POST',
            '/api/wishlist/toggle',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['product_id' => $this->product->id])
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertTrue($body['added']);
        $this->assertEquals(1, $body['count']);

        $this->assertDatabaseHas('wishlists', [
            'product_id' => $this->product->id,
        ]);
    }

    public function test_toggle_removes_existing_product_from_wishlist(): void
    {
        $sessionId = str_repeat('w', 32);
        Wishlist::create([
            'session_id' => $sessionId,
            'product_id' => $this->product->id,
        ]);

        $response = $this->call(
            'POST',
            '/api/wishlist/toggle',
            [],
            [self::COOKIE => $sessionId],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['product_id' => $this->product->id])
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertFalse($body['added']);
        $this->assertEquals(0, $body['count']);

        $this->assertDatabaseMissing('wishlists', [
            'session_id' => $sessionId,
            'product_id' => $this->product->id,
        ]);
    }

    public function test_get_wishlist_returns_items_with_product_resource(): void
    {
        $sessionId = str_repeat('w', 32);
        Wishlist::create([
            'session_id' => $sessionId,
            'product_id' => $this->product->id,
        ]);

        $response = $this->call(
            'GET',
            '/api/wishlist',
            [],
            [self::COOKIE => $sessionId]
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertEquals(1, $body['count']);
        $this->assertEquals($this->product->id, $body['data'][0]['product_id']);
        $this->assertEquals('Next.js SaaS Starter', $body['data'][0]['product']['nama']);
        $this->assertEquals('nextjs-saas-starter', $body['data'][0]['product']['slug']);
    }

    public function test_destroy_removes_item_from_wishlist(): void
    {
        $sessionId = str_repeat('w', 32);
        Wishlist::create([
            'session_id' => $sessionId,
            'product_id' => $this->product->id,
        ]);

        $response = $this->call(
            'DELETE',
            "/api/wishlist/{$this->product->id}",
            [],
            [self::COOKIE => $sessionId]
        );

        $this->assertEquals(200, $response->status());
        $body = json_decode($response->getContent(), true);
        $this->assertEquals(0, $body['count']);

        $this->assertDatabaseMissing('wishlists', [
            'session_id' => $sessionId,
            'product_id' => $this->product->id,
        ]);
    }

    public function test_cannot_add_inactive_product_to_wishlist(): void
    {
        $inactiveProduct = Product::create([
            'nama' => 'Draft Product',
            'slug' => 'draft-product',
            'deskripsi' => 'Draft',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'draft',
        ]);

        $response = $this->call(
            'POST',
            '/api/wishlist/toggle',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['product_id' => $inactiveProduct->id])
        );

        $this->assertEquals(422, $response->status());
    }
}
