<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private string $adminToken = 'test-admin-secret-token';
    private Product $product;
    private Order $order;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => $this->adminToken]);

        $category = Category::create([
            'nama' => 'Templates',
            'slug' => 'templates',
            'deskripsi' => 'Kategori template',
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'nama' => 'Next.js Starter Kit',
            'slug' => 'nextjs-starter-kit',
            'deskripsi' => 'Fullstack SaaS boilerplate',
            'harga' => 150000,
            'tipe' => 'download',
            'status' => 'aktif',
        ]);

        $this->user = User::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'email' => 'budi@example.com',
            'is_admin' => false,
        ]);

        $this->order = Order::create([
            'user_id' => $this->user->id,
            'kode_order' => 'EPS-20260827-ABCDE',
            'nama_pembeli' => 'Budi Santoso',
            'email_pembeli' => 'budi@example.com',
            'wa_pembeli' => '081234567890',
            'total_harga' => 150000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'nama_produk' => $this->product->nama,
            'harga_saat_beli' => $this->product->harga,
            'tipe_produk' => $this->product->tipe,
        ]);
    }

    public function test_buyer_can_submit_review_for_paid_order(): void
    {
        $response = $this->postJson('/api/reviews', [
            'kode_order' => $this->order->kode_order,
            'product_id' => $this->product->id,
            'email_or_phone' => 'budi@example.com',
            'rating' => 5,
            'comment' => 'Produk sangat berkualitas dan dokumentasinya jelas!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.comment', 'Produk sangat berkualitas dan dokumentasinya jelas!')
            ->assertJsonPath('data.buyer_name', 'Budi Santoso');

        $this->assertDatabaseHas('reviews', [
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'rating' => 5,
        ]);
    }

    public function test_cannot_review_unpaid_order(): void
    {
        $pendingOrder = Order::create([
            'kode_order' => 'EPS-20260827-PEND1',
            'nama_pembeli' => 'Ani',
            'email_pembeli' => 'ani@example.com',
            'wa_pembeli' => '08111222333',
            'total_harga' => 150000,
            'status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $pendingOrder->id,
            'product_id' => $this->product->id,
            'nama_produk' => $this->product->nama,
            'harga_saat_beli' => $this->product->harga,
            'tipe_produk' => $this->product->tipe,
        ]);

        $response = $this->postJson('/api/reviews', [
            'kode_order' => $pendingOrder->kode_order,
            'product_id' => $this->product->id,
            'email_or_phone' => 'ani@example.com',
            'rating' => 5,
            'comment' => 'Belum bayar tapi mau review',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('code', 'order_not_paid');
    }

    public function test_cannot_submit_duplicate_review_for_same_order_product(): void
    {
        Review::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'user_id' => $this->user->id,
            'rating' => 5,
            'comment' => 'First review',
            'buyer_name' => 'Budi',
            'is_published' => true,
        ]);

        $response = $this->postJson('/api/reviews', [
            'kode_order' => $this->order->kode_order,
            'product_id' => $this->product->id,
            'email_or_phone' => 'budi@example.com',
            'rating' => 4,
            'comment' => 'Second review',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('code', 'review_already_exists');
    }

    public function test_guest_with_wrong_email_or_phone_is_rejected(): void
    {
        $response = $this->postJson('/api/reviews', [
            'kode_order' => $this->order->kode_order,
            'product_id' => $this->product->id,
            'email_or_phone' => 'wrong@email.com',
            'rating' => 5,
            'comment' => 'Impersonating review',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('code', 'buyer_verification_failed');
    }

    public function test_public_product_reviews_endpoint_returns_published_reviews_and_summary(): void
    {
        Review::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'user_id' => $this->user->id,
            'rating' => 5,
            'comment' => 'Keren banget!',
            'buyer_name' => 'Budi Santoso',
            'is_published' => true,
        ]);

        $response = $this->getJson("/api/public/products/{$this->product->slug}/reviews");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('summary.average', 5)
            ->assertJsonPath('summary.count', 1)
            ->assertJsonPath('summary.distribution.5', 1);
    }

    public function test_admin_can_moderate_and_delete_reviews(): void
    {
        $review = Review::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'user_id' => $this->user->id,
            'rating' => 1,
            'comment' => 'Spam review',
            'buyer_name' => 'Spammer',
            'is_published' => true,
        ]);

        // Hide review
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->patchJson("/api/admin/reviews/{$review->id}", [
                'is_published' => false,
                'admin_notes' => 'Hidden due to spam',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_published', false);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'is_published' => false,
        ]);

        // Delete review
        $delResponse = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->deleteJson("/api/admin/reviews/{$review->id}");

        $delResponse->assertStatus(200);
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }
}
