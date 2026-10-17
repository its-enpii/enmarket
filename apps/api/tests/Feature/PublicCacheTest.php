<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Support\PublicCache;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Lane D — cache lapisan API publik + header HTTP cache.
 */
class PublicCacheTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Guard: D3 mewajibkan preventLazyLoading aktif di test.
        $this->assertTrue(Model::preventsLazyLoading(), 'preventLazyLoading harus aktif di test.');
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'nama' => 'Cache '.uniqid(),
            'slug' => 'cache-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'is_featured' => true,
        ], $overrides));
    }

    // ───── 1. Query DB hanya sekali untuk 2 request berturut-turut ─────

    public function test_featured_endpoint_hits_database_only_once_for_two_requests(): void
    {
        $this->makeProduct();

        $queries = 0;
        DB::listen(function () use (&$queries) {
            $queries++;
        });

        $first = $this->getJson('/api/public/products/featured');
        $first->assertOk();
        $queriesAfterFirst = $queries;

        $second = $this->getJson('/api/public/products/featured');
        $second->assertOk();

        $this->assertGreaterThan(0, $queriesAfterFirst, 'Request pertama harus menyentuh DB.');
        $this->assertSame($queriesAfterFirst, $queries, 'Request kedua tidak boleh menyentuh DB (cache hit).');
        $this->assertTrue(Cache::has(PublicCache::PRODUCTS_FEATURED));
        $this->assertSame($first->json(), $second->json(), 'Bentuk respons harus identik.');
    }

    public function test_all_public_cacheable_endpoints_store_their_keys(): void
    {
        $this->makeProduct(['tags' => ['laravel']]);
        Category::create(['nama' => 'Kategori', 'slug' => 'kategori-cache']);
        SiteSetting::create(['key' => 'studio_name', 'value' => 'enpiistudio', 'type' => 'string']);

        $this->getJson('/api/public/site-config')->assertOk();
        $this->getJson('/api/public/categories')->assertOk();
        $this->getJson('/api/public/categories/slugs')->assertOk();
        $this->getJson('/api/public/tags?type=product')->assertOk();
        $this->getJson('/api/public/products/featured')->assertOk();
        $this->getJson('/api/public/products/latest')->assertOk();
        $this->getJson('/api/public/products/homepage')->assertOk();
        $this->getJson('/api/public/products/slugs')->assertOk();
        $this->getJson('/api/public/posts/latest')->assertOk();
        $this->getJson('/api/public/posts/slugs')->assertOk();

        foreach ([
            PublicCache::SITE_CONFIG,
            PublicCache::CATEGORIES,
            PublicCache::CATEGORIES_SLUGS,
            PublicCache::TAGS_PRODUCT,
            PublicCache::PRODUCTS_FEATURED,
            PublicCache::PRODUCTS_LATEST,
            PublicCache::homepageKey(6),
            PublicCache::PRODUCTS_SLUGS,
            PublicCache::POSTS_SLUGS,
        ] as $key) {
            $this->assertTrue(Cache::has($key), "Cache key {$key} harus terisi.");
        }
    }

    // ───── 2. Invalidasi saat Product disimpan ─────

    public function test_product_save_invalidates_featured_cache(): void
    {
        $this->makeProduct();
        $this->getJson('/api/public/products/featured')->assertOk();
        $this->assertTrue(Cache::has(PublicCache::PRODUCTS_FEATURED));

        $this->makeProduct(['nama' => '(mutasi: tidak ada invalidasi)']);

        $this->assertTrue(Cache::missing(PublicCache::PRODUCTS_FEATURED));
    }

    public function test_product_save_invalidates_product_related_caches(): void
    {
        foreach (PublicCache::productKeys() as $key) {
            Cache::put($key, ['data' => []], 300);
        }

        $product = $this->makeProduct();
        $product->update(['nama' => 'Diubah']);

        foreach (PublicCache::productKeys() as $key) {
            $this->assertTrue(Cache::missing($key), "Cache key {$key} harus terhapus setelah Product saved.");
        }
    }

    public function test_post_and_category_and_setting_save_invalidate_their_caches(): void
    {
        Cache::put(PublicCache::POSTS_SLUGS, ['data' => []], 300);
        Cache::put(PublicCache::POSTS_LATEST_PREFIX.'3:'.now()->format('YmdHi'), ['data' => []], 300);
        Cache::put(PublicCache::TAGS_POST, ['data' => []], 300);
        Cache::put(PublicCache::CATEGORIES, ['data' => []], 300);
        Cache::put(PublicCache::PRODUCTS_FEATURED, ['data' => []], 300);
        Cache::put(PublicCache::SITE_CONFIG, ['data' => []], 300);

        Post::create([
            'title' => 'Post Cache',
            'slug' => 'post-cache',
            'content' => 'isi',
            'status' => 'published',
            'published_at' => now(),
        ]);
        $this->assertTrue(Cache::missing(PublicCache::POSTS_SLUGS));
        // Varian key lama (menit berbeda) juga harus ikut terhapus.
        $this->assertTrue(Cache::missing(PublicCache::POSTS_LATEST_PREFIX.'3:'.Carbon::now()->utc()->subMinute()->format('YmdHi')));
        $this->assertTrue(Cache::missing(PublicCache::TAGS_POST));

        Category::create(['nama' => 'Kategori Cache', 'slug' => 'kategori-cache-2']);
        $this->assertTrue(Cache::missing(PublicCache::CATEGORIES));
        $this->assertTrue(Cache::missing(PublicCache::PRODUCTS_FEATURED));

        SiteSetting::create(['key' => 'tagline', 'value' => 'Baru', 'type' => 'string']);
        $this->assertTrue(Cache::missing(PublicCache::SITE_CONFIG));
    }

    // ───── 3. /api/cart tetap private ─────

    public function test_cart_endpoint_is_not_publicly_cacheable(): void
    {
        $response = $this->getJson('/api/cart');

        $response->assertOk();
        $this->assertStringContainsString('no-cache', (string) $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('private', (string) $response->headers->get('Cache-Control'));
        $this->assertStringNotContainsString('s-maxage', (string) $response->headers->get('Cache-Control'));
        $this->assertNull($response->headers->get('ETag'));
    }

    // ───── 4. Header cache HTTP + ETag/304 ─────

    public function test_cached_endpoint_sends_public_cache_headers_and_etag(): void
    {
        $this->makeProduct();

        $response = $this->getJson('/api/public/products/featured');
        $response->assertOk();
        $this->assertPublicCacheControl($response->headers->get('Cache-Control'));

        $etag = $response->headers->get('ETag');
        $this->assertNotNull($etag);

        $notModified = $this->getJson('/api/public/products/featured', ['If-None-Match' => $etag]);
        $notModified->assertStatus(304);
        $this->assertSame('', $notModified->getContent());
        $this->assertSame($etag, $notModified->headers->get('ETag'));
    }

    public function test_site_config_and_slugs_endpoints_send_public_cache_headers(): void
    {
        $this->assertPublicCacheControl(
            $this->getJson('/api/public/site-config')->assertOk()->headers->get('Cache-Control'),
        );

        $this->assertPublicCacheControl(
            $this->getJson('/api/public/products/slugs')->assertOk()->headers->get('Cache-Control'),
        );
    }

    /**
     * Symfony menyusun ulang urutan direktif Cache-Control (public di akhir);
     * yang diuji adalah set direktif & nilainya.
     */
    private function assertPublicCacheControl(?string $header): void
    {
        $directives = array_map('trim', explode(',', (string) $header));
        sort($directives);

        $expected = ['max-age=60', 'public', 's-maxage=300', 'stale-while-revalidate=60'];
        sort($expected);

        $this->assertSame($expected, $directives);
    }
}
