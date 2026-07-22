<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Test untuk Api\Public\*Controller (Product catalog + Category + Post).
 *
 * Endpoint publik — read-only, no auth. Test fokus pada filter + scope.
 */
class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function makeCategory(string $nama = 'Default', ?string $slug = null): Category
    {
        return Category::create([
            'nama' => $nama,
            'slug' => $slug ?? 'cat-'.uniqid(),
        ]);
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'nama' => 'Test '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'test description',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'is_featured' => false,
        ], $overrides));
    }

    // ───── products featured ─────

    public function test_featured_returns_max_6_active_featured_products(): void
    {
        $this->makeProduct(['nama' => 'F1', 'is_featured' => true]);
        $this->makeProduct(['nama' => 'F2', 'is_featured' => true]);
        $this->makeProduct(['nama' => 'NotF', 'is_featured' => false]);

        $response = $this->getJson('/api/public/products/featured');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_featured_excludes_draft_products(): void
    {
        $this->makeProduct(['nama' => 'Aktif', 'is_featured' => true, 'status' => 'aktif']);
        $this->makeProduct(['nama' => 'Draft', 'is_featured' => true, 'status' => 'draft']);

        $response = $this->getJson('/api/public/products/featured');

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Aktif', $response->json('data.0.nama'));
    }

    // ───── products latest ─────

    public function test_latest_returns_max_8_active_products(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->makeProduct();
        }

        $response = $this->getJson('/api/public/products/latest');

        $response->assertOk();
        $this->assertCount(8, $response->json('data'));
    }

    // ───── products index (catalog with filter + search) ─────

    public function test_index_paginates_results(): void
    {
        for ($i = 0; $i < 15; $i++) {
            $this->makeProduct();
        }

        $response = $this->getJson('/api/public/products?per_page=10');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
        $this->assertEquals(15, $response->json('meta.total'));
    }

    public function test_index_clamps_per_page_to_max_60(): void
    {
        $response = $this->getJson('/api/public/products?per_page=999');
        $this->assertEquals(60, $response->json('meta.per_page'));
    }

    public function test_index_filters_by_category_slug(): void
    {
        $cat1 = $this->makeCategory('Game', 'game');
        $cat2 = $this->makeCategory('Buku', 'buku');
        $this->makeProduct(['nama' => 'Game1', 'category_id' => $cat1->id]);
        $this->makeProduct(['nama' => 'Buku1', 'category_id' => $cat2->id]);

        $response = $this->getJson('/api/public/products?category=game');
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Game1', $response->json('data.0.nama'));
    }

    public function test_index_filters_by_tipe_whitelist(): void
    {
        $this->makeProduct(['tipe' => 'download']);
        $this->makeProduct(['tipe' => 'license']);

        $response = $this->getJson('/api/public/products?tipe=license');
        $this->assertCount(1, $response->json('data'));

        // Tipe invalid di whitelist ditolak (no filter applied)
        $response2 = $this->getJson('/api/public/products?tipe=invalid_type');
        $this->assertCount(2, $response2->json('data'));
    }

    public function test_index_search_matches_name_or_description(): void
    {
        $this->makeProduct(['nama' => 'Adobe Photoshop', 'deskripsi' => 'Image editor']);
        $this->makeProduct(['nama' => 'Microsoft Word', 'deskripsi' => 'Document editor']);

        // Search by name
        $r1 = $this->getJson('/api/public/products?q=Adobe');
        $this->assertCount(1, $r1->json('data'));

        // Search by description
        $r2 = $this->getJson('/api/public/products?q=Document');
        $this->assertCount(1, $r2->json('data'));
        $this->assertEquals('Microsoft Word', $r2->json('data.0.nama'));
    }

    public function test_index_excludes_draft_and_tidak_dijual_products(): void
    {
        $this->makeProduct(['status' => 'aktif']);
        $this->makeProduct(['status' => 'draft']);
        $this->makeProduct(['status' => 'tidak_dijual']);

        $response = $this->getJson('/api/public/products');
        $this->assertCount(1, $response->json('data'));
    }

    // ───── products show ─────

    public function test_show_returns_404_for_draft_product(): void
    {
        $product = $this->makeProduct(['status' => 'draft']);

        $response = $this->getJson('/api/public/products/'.$product->slug);
        $response->assertStatus(404);
    }

    public function test_show_returns_404_for_nonexistent_slug(): void
    {
        $response = $this->getJson('/api/public/products/nonexistent-slug');
        $response->assertStatus(404);
    }

    public function test_show_returns_product_for_active_slug(): void
    {
        $product = $this->makeProduct(['nama' => 'Active Product']);

        $response = $this->getJson('/api/public/products/'.$product->slug);
        $response->assertOk();
        $this->assertEquals('Active Product', $response->json('data.nama'));
    }

    // ───── products slugs ─────

    public function test_slugs_returns_only_active_product_slugs(): void
    {
        $active = $this->makeProduct(['status' => 'aktif']);
        $draft = $this->makeProduct(['status' => 'draft']);

        $response = $this->getJson('/api/public/products/slugs');

        $response->assertOk();
        $slugs = $response->json('data');
        $this->assertContains($active->slug, $slugs);
        $this->assertNotContains($draft->slug, $slugs);
    }

    // ───── categories index ─────

    public function test_categories_index_returns_only_categories_with_active_products(): void
    {
        $empty = $this->makeCategory('Empty');
        $withProduct = $this->makeCategory('WithProd');
        $this->makeProduct(['category_id' => $withProduct->id]);

        $response = $this->getJson('/api/public/categories');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('nama')->all();
        $this->assertContains('WithProd', $names);
        $this->assertNotContains('Empty', $names);
    }

    public function test_categories_slugs_excludes_empty_categories(): void
    {
        $empty = $this->makeCategory('Empty');
        $withProduct = $this->makeCategory('WithProd');
        $this->makeProduct(['category_id' => $withProduct->id]);

        $response = $this->getJson('/api/public/categories/slugs');

        $response->assertOk();
        $slugs = $response->json('data');
        $this->assertContains($withProduct->slug, $slugs);
        $this->assertNotContains($empty->slug, $slugs);
    }

    // ───── posts ─────

    public function test_posts_index_only_published_with_past_date(): void
    {
        $this->makePost(['title' => 'Published', 'status' => 'published', 'published_at' => now()->subDay()]);
        $this->makePost(['title' => 'Draft', 'status' => 'draft']);
        $this->makePost(['title' => 'Future', 'status' => 'published', 'published_at' => now()->addDay()]);

        $response = $this->getJson('/api/public/posts');
        $titles = collect($response->json('data'))->pluck('title')->all();
        $this->assertContains('Published', $titles);
        $this->assertNotContains('Draft', $titles);
        $this->assertNotContains('Future', $titles);
    }

    public function test_posts_search_matches_title_or_excerpt(): void
    {
        $this->makePost(['title' => 'Belajar Laravel', 'excerpt' => 'Tutorial lengkap', 'status' => 'published', 'published_at' => now()->subDay()]);
        $this->makePost(['title' => 'Tips Desain', 'excerpt' => 'Belajar dari kasus nyata', 'status' => 'published', 'published_at' => now()->subDay()]);

        $r1 = $this->getJson('/api/public/posts?q=Laravel');
        $this->assertCount(1, $r1->json('data'));

        $r2 = $this->getJson('/api/public/posts?q=kasus');
        $this->assertCount(1, $r2->json('data'));
    }

    public function test_posts_latest_caps_at_max_12(): void
    {
        for ($i = 0; $i < 15; $i++) {
            $this->makePost(['title' => "Post $i", 'status' => 'published', 'published_at' => now()->subDay()]);
        }

        $response = $this->getJson('/api/public/posts/latest?limit=99');
        $this->assertCount(12, $response->json('data'));
    }

    public function test_posts_show_returns_404_for_draft(): void
    {
        $post = $this->makePost(['status' => 'draft', 'slug' => 'draft-post']);

        $response = $this->getJson('/api/public/posts/draft-post');
        $response->assertStatus(404);
    }

    public function test_posts_slugs_returns_only_published(): void
    {
        $pub = $this->makePost(['status' => 'published', 'published_at' => now()->subDay(), 'slug' => 'published-post']);
        $draft = $this->makePost(['status' => 'draft', 'slug' => 'draft-post']);

        $response = $this->getJson('/api/public/posts/slugs');

        $slugs = $response->json('data');
        $this->assertContains('published-post', $slugs);
        $this->assertNotContains('draft-post', $slugs);
    }

    // ───── helpers ─────

    private function makePost(array $overrides = []): Post
    {
        return Post::create(array_merge([
            'title' => 'Test '.uniqid(),
            'content' => '<p>body</p>',
            'status' => 'draft',
        ], $overrides));
    }

    // ───── homepage (featured + latest merged, deduped) ─────

    private function makeHomepageProduct(string $name, bool $featured, string $status = 'aktif'): Product
    {
        $p = new Product;
        $p->nama = $name;
        $p->slug = 'slug-'.uniqid();
        $p->deskripsi = 'desc';
        $p->harga = 10000;
        $p->tipe = 'download';
        $p->status = $status;
        $p->is_featured = $featured;
        $p->save();

        return $p;
    }

    public function test_homepage_returns_featured_first_then_latest(): void
    {
        $featured = $this->makeHomepageProduct('Featured One', true);
        $latest = $this->makeHomepageProduct('Latest Only', false);
        $featuredThenLatest = $this->makeHomepageProduct('Also Featured', true);

        $response = $this->getJson('/api/public/products/homepage');
        $response->assertOk();

        $data = $response->json('data');
        $ids = array_column($data, 'id');

        // Featured harus di depan.
        $this->assertSame($featured->id, $ids[0]);
        $this->assertSame($featuredThenLatest->id, $ids[1]);
        // Lalu latest (yang bukan featured).
        $this->assertSame($latest->id, $ids[2]);
    }

    public function test_homepage_dedupes_product_appearing_in_featured_and_latest(): void
    {
        // Produk featured saja — hanya muncul 1x meskipun eligible untuk 'latest'.
        $featured = $this->makeHomepageProduct('Star Product', true);

        $response = $this->getJson('/api/public/products/homepage');
        $response->assertOk();

        $data = $response->json('data');
        $ids = array_column($data, 'id');

        $this->assertSame(1, count(array_filter($ids, fn ($id) => $id === $featured->id)));
        $this->assertSame($featured->id, $ids[0]);
    }

    public function test_homepage_excludes_draft_and_tidak_dijual(): void
    {
        $this->makeHomepageProduct('Active', false, 'aktif');
        $this->makeHomepageProduct('Draft', false, 'draft');
        $this->makeHomepageProduct('Not For Sale', true, 'tidak_dijual');

        $response = $this->getJson('/api/public/products/homepage');
        $response->assertOk();

        $slugs = array_column($response->json('data'), 'slug');
        $this->assertCount(1, $slugs); // cuma 'Active' yang lolos
    }

    public function test_homepage_clamps_per_page_to_max_12(): void
    {
        // 20 produk aktif → request per_page=20 → harus clamp ke 12.
        for ($i = 0; $i < 20; $i++) {
            $this->makeHomepageProduct("Product {$i}", $i % 3 === 0);
        }

        $response = $this->getJson('/api/public/products/homepage?per_page=20');
        $response->assertOk();

        $this->assertCount(12, $response->json('data'));
    }

    public function test_homepage_respects_per_page_lower_bound(): void
    {
        $response = $this->getJson('/api/public/products/homepage?per_page=0');
        $response->assertOk();
        // per_page=0 di-clamp ke min 1 — return max 1 produk (atau 0 kalau kosong).
        $this->assertLessThanOrEqual(1, count($response->json('data')));
    }
}
