<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test filter tag publik (?tag=) untuk posts + products dan endpoint /api/public/tags.
 */
class PublicTagFilterTest extends TestCase
{
    use RefreshDatabase;

    private function makePost(array $overrides = []): Post
    {
        return Post::create(array_merge([
            'title' => 'Post '.uniqid(),
            'slug' => 'post-'.uniqid(),
            'content' => '<p>x</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ], $overrides));
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'nama' => 'Product '.uniqid(),
            'slug' => 'product-'.uniqid(),
            'deskripsi' => 'd',
            'harga' => 100000,
            'tipe' => 'license',
            'status' => 'aktif',
        ], $overrides));
    }

    public function test_posts_filter_by_tag_returns_only_matching_slug(): void
    {
        $this->makePost(['slug' => 'with-laravel', 'tags' => ['laravel', 'php']]);
        $this->makePost(['slug' => 'with-vue', 'tags' => ['vue']]);

        $response = $this->getJson('/api/public/posts?tag=laravel');

        $response->assertOk();
        $slugs = array_column($response->json('data'), 'slug');
        $this->assertEquals(['with-laravel'], $slugs);
    }

    public function test_posts_filter_by_tag_is_case_insensitive(): void
    {
        $this->makePost(['slug' => 'ci-post', 'tags' => ['laravel']]);
        $this->makePost(['slug' => 'other-post', 'tags' => ['vue']]);

        $response = $this->getJson('/api/public/posts?tag=Laravel');

        $slugs = array_column($response->json('data'), 'slug');
        $this->assertEquals(['ci-post'], $slugs);
    }

    public function test_products_filter_by_tag_returns_only_matching_slug(): void
    {
        $this->makeProduct(['slug' => 'prod-laravel', 'tags' => ['laravel']]);
        $this->makeProduct(['slug' => 'prod-vue', 'tags' => ['vue']]);

        $response = $this->getJson('/api/public/products?tag=laravel');

        $response->assertOk();
        $slugs = array_column($response->json('data'), 'slug');
        $this->assertEquals(['prod-laravel'], $slugs);
    }

    public function test_tags_endpoint_counts_post_tags(): void
    {
        $this->makePost(['tags' => ['laravel', 'php']]);
        $this->makePost(['tags' => ['laravel']]);
        $this->makePost(['tags' => ['vue']]);

        $response = $this->getJson('/api/public/tags?type=post');

        $response->assertOk();
        $byTag = collect($response->json('data'))->pluck('count', 'tag')->all();
        $this->assertEquals(2, $byTag['laravel']);
        $this->assertEquals(1, $byTag['php']);
        $this->assertEquals(1, $byTag['vue']);
    }

    public function test_tags_endpoint_defaults_to_posts(): void
    {
        $this->makePost(['tags' => ['laravel']]);
        $this->makeProduct(['tags' => ['produk-tag']]);

        $response = $this->getJson('/api/public/tags');

        $response->assertOk();
        $tags = array_column($response->json('data'), 'tag');
        $this->assertContains('laravel', $tags);
        $this->assertNotContains('produk-tag', $tags);
    }

    public function test_post_resource_exposes_tags_array(): void
    {
        $this->makePost(['slug' => 'res-post', 'tags' => ['laravel', 'php']]);

        $response = $this->getJson('/api/public/posts/res-post');

        $response->assertOk();
        $response->assertJsonPath('data.tags', ['laravel', 'php']);
    }
}
