<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Services\NextRevalidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    public array $revalidatedPaths = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);

        $this->app->bind(NextRevalidator::class, fn () => new class($this->revalidatedPaths) extends NextRevalidator
        {
            public function __construct(public array &$paths) {}

            public function revalidateProduct(string $slug): void { $this->paths[] = "product:$slug"; }
            public function revalidateHome(): void { $this->paths[] = 'home'; }
            public function revalidateCategory(string $slug): void { $this->paths[] = "category:$slug"; }
            public function revalidatePost(string $slug): void { $this->paths[] = "post:$slug"; }
        });
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    public function test_index_returns_categories_with_products_count(): void
    {
        $cat = Category::create(['nama' => 'Game', 'slug' => 'game']);
        Product::create(['nama' => 'P1', 'slug' => 'p1', 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif', 'category_id' => $cat->id]);

        $response = $this->getJson('/api/admin/categories', $this->authHeaders());

        $response->assertOk();
        $response->assertJsonStructure(['data' => [['id', 'nama', 'slug', 'products_count']]]);
        $this->assertEquals(1, $response->json('data.0.products_count'));
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->postJson('/api/admin/categories', [], $this->authHeaders());
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nama']);
    }

    public function test_store_validates_slug_format(): void
    {
        $response = $this->postJson('/api/admin/categories', [
            'nama' => 'Test',
            'slug' => 'INVALID SLUG!',
        ], $this->authHeaders());

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['slug']);
    }

    public function test_store_creates_category_and_revalidates(): void
    {
        $response = $this->postJson('/api/admin/categories', [
            'nama' => 'Game',
            'deskripsi' => 'Video games',
        ], $this->authHeaders());

        $response->assertStatus(201);
        $this->assertEquals('game', $response->json('data.slug'));
        $this->assertContains('category:game', $this->revalidatedPaths);
    }

    public function test_show_returns_category(): void
    {
        $cat = Category::create(['nama' => 'Game', 'slug' => 'game']);

        $response = $this->getJson('/api/admin/categories/'.$cat->id, $this->authHeaders());

        $response->assertOk();
        $this->assertEquals('Game', $response->json('data.nama'));
    }

    public function test_update_changes_fields(): void
    {
        $cat = Category::create(['nama' => 'Old', 'slug' => 'old-cat']);

        $response = $this->putJson('/api/admin/categories/'.$cat->id, [
            'nama' => 'New Name',
            'slug' => 'new-cat',
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertEquals('New Name', $cat->fresh()->nama);
        $this->assertEquals('new-cat', $cat->fresh()->slug);
        $this->assertContains('category:new-cat', $this->revalidatedPaths);
    }

    public function test_destroy_returns_409_when_has_products(): void
    {
        $cat = Category::create(['nama' => 'WithProd', 'slug' => 'with-prod']);
        Product::create(['nama' => 'P', 'slug' => 'p', 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif', 'category_id' => $cat->id]);

        $response = $this->deleteJson('/api/admin/categories/'.$cat->id, [], $this->authHeaders());

        $response->assertStatus(409);
        $response->assertJsonFragment(['code' => 'category_has_products']);
    }

    public function test_destroy_deletes_when_no_products(): void
    {
        $cat = Category::create(['nama' => 'Empty', 'slug' => 'empty']);

        $response = $this->deleteJson('/api/admin/categories/'.$cat->id, [], $this->authHeaders());

        $response->assertOk();
        $this->assertNull(Category::find($cat->id));
        $this->assertContains('category:empty', $this->revalidatedPaths);
    }
}