<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Coverage untuk relasi many-to-many Product ↔ Post lewat pivot `product_post`.
 * Use case: produk link ke blog post sebagai panduan, warning, atau catatan.
 */
class ProductLinkedPostsTest extends TestCase
{
    use RefreshDatabase;

    private string $adminToken = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();

        // Set env biar middleware admin pass — VerifyAdminToken baca config('app.admin_token').
        config(['app.admin_token' => $this->adminToken]);
    }

    private function adminHeaders(): array
    {
        return ['Authorization' => 'Bearer '.$this->adminToken];
    }

    private function makeProduct(): Product
    {
        $product = new Product;
        $product->nama = 'Netflix Premium';
        $product->slug = 'netflix-premium-'.uniqid();
        $product->deskripsi = 'Akun Netflix Premium 1 bulan.';
        $product->harga = 50000;
        $product->tipe = 'account_manual';
        $product->status = 'aktif';
        $product->save();

        return $product;
    }

    private function makePost(string $title, string $status = 'published'): Post
    {
        $post = new Post;
        $post->title = $title;
        $post->slug = \Illuminate\Support\Str::slug($title).'-'.uniqid();
        $post->excerpt = 'Excerpt of '.$title;
        $post->content = 'Body of '.$title;
        $post->status = $status;
        if ($status === 'published') {
            $post->published_at = now()->subDay();
        }
        $post->save();

        return $post;
    }

    public function test_product_can_have_multiple_linked_posts_with_order(): void
    {
        $product = $this->makeProduct();
        $p1 = $this->makePost('Panduan Setup');
        $p2 = $this->makePost('Warning Maintenance');
        $p3 = $this->makePost('Tips Tambahan');

        // Attach via relasi langsung dengan urutan eksplisit.
        $product->posts()->attach([
            $p1->id => ['urutan' => 0],
            $p2->id => ['urutan' => 1],
            $p3->id => ['urutan' => 2],
        ]);

        $loaded = Product::find($product->id);
        $posts = $loaded->posts;

        $this->assertCount(3, $posts);
        // Urutan sesuai pivot.urutan asc.
        $this->assertSame('Panduan Setup', $posts[0]->title);
        $this->assertSame('Warning Maintenance', $posts[1]->title);
        $this->assertSame('Tips Tambahan', $posts[2]->title);
    }

    public function test_post_can_be_linked_to_multiple_products(): void
    {
        $p1 = $this->makeProduct();
        $p2 = $this->makeProduct();
        $post = $this->makePost('Panduan Netflix');

        $p1->posts()->attach($post->id);
        $p2->posts()->attach($post->id);

        $this->assertCount(1, $p1->fresh()->posts);
        $this->assertCount(1, $p2->fresh()->posts);
        $this->assertCount(2, $post->fresh()->products);
    }

    public function test_deleting_product_cascades_to_pivot(): void
    {
        $product = $this->makeProduct();
        $post = $this->makePost('Cleanup Test');
        $product->posts()->attach($post->id);

        $this->assertDatabaseHas('product_post', [
            'product_id' => $product->id,
            'post_id' => $post->id,
        ]);

        $product->delete();

        $this->assertDatabaseMissing('product_post', [
            'product_id' => $product->id,
        ]);
        // Post masih ada — pivot cascade only.
        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }

    public function test_detach_removes_pivot_but_keeps_both_entities(): void
    {
        $product = $this->makeProduct();
        $post = $this->makePost('Detach Test');
        $product->posts()->attach($post->id);

        $product->posts()->detach($post->id);

        $this->assertCount(0, $product->fresh()->posts);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }

    public function test_unique_pair_constraint_prevents_duplicate_link(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        $product = $this->makeProduct();
        $post = $this->makePost('Duplicate Test');
        $product->posts()->attach($post->id);
        // Attaching lagi harus throw karena unique(product_id, post_id).
        $product->posts()->attach($post->id);
    }

    public function test_admin_can_sync_linked_posts_via_update(): void
    {
        $product = $this->makeProduct();
        $p1 = $this->makePost('Setup Guide');
        $p2 = $this->makePost('FAQ');
        $p3 = $this->makePost('Refund Policy');

        $response = $this->call(
            'PUT',
            "/api/admin/products/{$product->id}",
            [
                'nama' => $product->nama,
                'slug' => $product->slug,
                'deskripsi' => $product->deskripsi,
                'harga' => $product->harga,
                'tipe' => 'account_manual',
                'status' => 'aktif',
                'linked_posts' => [$p1->id, $p2->id, $p3->id],
            ],
            [],
            [],
            $this->serverWithAdminToken(),
        );

        $response->assertOk();

        $reloaded = Product::find($product->id);
        $ids = $reloaded->posts->pluck('id')->all();
        $this->assertEqualsCanonicalizing([$p1->id, $p2->id, $p3->id], $ids);
    }

    public function test_admin_sync_replaces_existing_links(): void
    {
        $product = $this->makeProduct();
        $p1 = $this->makePost('Old1');
        $p2 = $this->makePost('Old2');
        $pNew = $this->makePost('New');

        $product->posts()->attach([$p1->id, $p2->id]);

        // Send only pNew → p1 & p2 should be detached.
        $response = $this->call(
            'PUT',
            "/api/admin/products/{$product->id}",
            [
                'nama' => $product->nama,
                'slug' => $product->slug,
                'deskripsi' => $product->deskripsi,
                'harga' => $product->harga,
                'tipe' => 'account_manual',
                'status' => 'aktif',
                'linked_posts' => [$pNew->id],
            ],
            [],
            [],
            $this->serverWithAdminToken(),
        );

        $response->assertOk();

        $ids = Product::find($product->id)->posts->pluck('id')->all();
        $this->assertSame([$pNew->id], $ids);
    }

    public function test_invalid_post_id_in_sync_is_skipped_not_throw(): void
    {
        $product = $this->makeProduct();
        $valid = $this->makePost('Valid');

        $response = $this->call(
            'PUT',
            "/api/admin/products/{$product->id}",
            [
                'nama' => $product->nama,
                'slug' => $product->slug,
                'deskripsi' => $product->deskripsi,
                'harga' => $product->harga,
                'tipe' => 'account_manual',
                'status' => 'aktif',
                'linked_posts' => [$valid->id, 99999, -1],
            ],
            [],
            [],
            $this->serverWithAdminToken(),
        );

        $response->assertOk();

        $ids = Product::find($product->id)->posts->pluck('id')->all();
        $this->assertSame([$valid->id], $ids);
    }

    public function test_public_detail_only_returns_published_linked_posts(): void
    {
        $product = $this->makeProduct();
        $published = $this->makePost('Published Guide', 'published');
        $draft = $this->makePost('Draft Note', 'draft');

        $product->posts()->attach([$published->id, $draft->id]);

        $response = $this->getJson("/api/public/products/{$product->slug}");
        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data['linked_posts']);
        $slugs = array_column($data['linked_posts'], 'slug');
        $this->assertContains($published->slug, $slugs);
        $this->assertNotContains($draft->slug, $slugs);
    }

    public function test_admin_show_includes_linked_posts_in_response(): void
    {
        $product = $this->makeProduct();
        $post = $this->makePost('Show Test');
        $product->posts()->attach($post->id);

        $response = $this->call(
            'GET',
            "/api/admin/products/{$product->id}",
            [],
            [],
            [],
            $this->serverWithAdminToken(),
        );

        $response->assertOk();

        $linked = $response->json('data.linked_posts');
        $this->assertIsArray($linked);
        $this->assertCount(1, $linked);
        $this->assertSame($post->slug, $linked[0]['slug']);
        $this->assertArrayHasKey('urutan', $linked[0]);
    }

    /**
     * Helper untuk inject Authorization header ke $this->call() ServerVars.
     */
    private function serverWithAdminToken(): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer '.$this->adminToken];
    }
}