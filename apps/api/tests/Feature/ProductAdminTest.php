<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\Admin\ProductController;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\NextRevalidator;
use App\Services\Storage\EnStorageClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/**
 * Test untuk Api\Admin\ProductController (CRUD + file upload + slug auto).
 *
 * EnStorageClient dan NextRevalidator di-stub — keduanya external dependency
 * (network call ke EnStorage + webhook Next.js) yang harus di-isolasi.
 */
class ProductAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);

        // Stub storage — simpan URL predictable, tidak hit network.
        $this->app->bind(EnStorageClient::class, fn () => new class implements EnStorageClient
        {
            public function upload(UploadedFile $file, string $destinationPath): string
            {
                return 'enstorage/'.$destinationPath;
            }

            public function delete(string $path): bool
            {
                return true;
            }

            public function exists(string $path): bool
            {
                return true;
            }

            public function url(string $path): string
            {
                return '/storage/'.$path;
            }
        });

        // Stub revalidator — catat call, tidak hit webhook.
        $this->revalidatedPaths = [];
        $this->app->bind(NextRevalidator::class, fn () => new class($this->revalidatedPaths) extends NextRevalidator
        {
            public function __construct(public array &$paths) {}

            public function revalidateProduct(string $slug): void
            {
                $this->paths[] = "product:$slug";
            }

            public function revalidateHome(): void { $this->paths[] = 'home'; }
            public function revalidateCategory(string $slug): void { $this->paths[] = "category:$slug"; }
            public function revalidatePost(string $slug): void { $this->paths[] = "post:$slug"; }
        });
    }

    public array $revalidatedPaths = [];

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    private function makeCategory(): Category
    {
        return Category::create([
            'nama' => 'Test Cat',
            'slug' => 'cat-'.uniqid(),
        ]);
    }

    // ───── index ─────

    public function test_index_returns_paginated_list(): void
    {
        Product::create([
            'nama' => 'P1', 'slug' => 'p1-'.uniqid(), 'deskripsi' => 'd',
            'harga' => 100000, 'tipe' => 'license', 'status' => 'aktif',
        ]);

        $response = $this->getJson('/api/admin/products', $this->authHeaders());

        $response->assertOk();
        $response->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_index_filters_by_status(): void
    {
        Product::create(['nama' => 'A', 'slug' => 'a-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif']);
        Product::create(['nama' => 'D', 'slug' => 'd-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'draft']);

        $response = $this->getJson('/api/admin/products?status=draft', $this->authHeaders());
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_index_search_by_name_or_slug(): void
    {
        Product::create(['nama' => 'Adobe Photo', 'slug' => 'adobe-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif']);
        Product::create(['nama' => 'Microsoft Word', 'slug' => 'ms-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif']);

        $response = $this->getJson('/api/admin/products?q=Adobe', $this->authHeaders());
        $this->assertEquals(1, $response->json('meta.total'));
    }

    // ───── stats ─────

    public function test_stats_returns_count_per_status(): void
    {
        Product::create(['nama' => 'A1', 'slug' => 'a1-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif']);
        Product::create(['nama' => 'A2', 'slug' => 'a2-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif']);
        Product::create(['nama' => 'D1', 'slug' => 'd1-'.uniqid(), 'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'draft']);

        $response = $this->getJson('/api/admin/products/stats', $this->authHeaders());

        $response->assertOk();
        $this->assertEquals(3, $response->json('data.total'));
        $this->assertEquals(2, $response->json('data.aktif'));
        $this->assertEquals(1, $response->json('data.draft'));
        $this->assertEquals(0, $response->json('data.tidak_dijual'));
    }

    // ───── store ─────

    public function test_store_creates_product_with_auto_slug(): void
    {
        $category = $this->makeCategory();

        $response = $this->postJson('/api/admin/products', [
            'nama' => 'Buku Panduan Laravel',
            'deskripsi' => 'Tutorial lengkap',
            'harga' => 150000,
            'tipe' => 'license',
            'status' => 'aktif',
            'category_id' => $category->id,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['id', 'nama', 'slug'], 'message']);

        $product = Product::find($response->json('data.id'));
        $this->assertEquals('buku-panduan-laravel', $product->slug);
        $this->assertContains('product:buku-panduan-laravel', $this->revalidatedPaths);
    }

    public function test_store_download_tipe_requires_file_upload(): void
    {
        $response = $this->postJson('/api/admin/products', [
            'nama' => 'Test',
            'deskripsi' => 'd',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
        ], $this->authHeaders());

        $response->assertStatus(422);
    }

    public function test_store_license_tipe_works_without_file(): void
    {
        $response = $this->postJson('/api/admin/products', [
            'nama' => 'License Product',
            'deskripsi' => 'd',
            'harga' => 50000,
            'tipe' => 'license',
            'status' => 'aktif',
        ], $this->authHeaders());

        $response->assertStatus(201);
    }

    public function test_store_with_file_upload_sets_file_url(): void
    {
        $file = UploadedFile::fake()->create('app.zip', 1024);

        $response = $this->postJson('/api/admin/products', [
            'nama' => 'App',
            'deskripsi' => 'd',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'file' => $file,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $product = Product::find($response->json('data.id'));
        $this->assertStringStartsWith('enstorage/products/', $product->file_url);
    }

    // ───── show ─────

    public function test_show_returns_product_with_relations(): void
    {
        $product = Product::create([
            'nama' => 'Test', 'slug' => 't-'.uniqid(),
            'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif',
        ]);

        $response = $this->getJson('/api/admin/products/'.$product->id, $this->authHeaders());

        $response->assertOk();
        $response->assertJsonPath('data.id', $product->id);
    }

    // ───── update ─────

    public function test_update_changes_fields(): void
    {
        $product = Product::create([
            'nama' => 'Old', 'slug' => 'old-'.uniqid(),
            'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif',
        ]);

        $response = $this->putJson('/api/admin/products/'.$product->id, [
            'nama' => 'New Name',
            'deskripsi' => 'd',
            'harga' => 200000,
            'tipe' => 'license',
            'status' => 'aktif',
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertEquals('New Name', $product->fresh()->nama);
        $this->assertEquals(200000, (float) $product->fresh()->harga);
    }

    public function test_update_with_remove_file_deletes_old_url(): void
    {
        $product = Product::create([
            'nama' => 'Test', 'slug' => 't-'.uniqid(),
            'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'download', 'status' => 'aktif',
            'file_url' => 'enstorage/products/old.zip',
        ]);

        $response = $this->putJson('/api/admin/products/'.$product->id, [
            'nama' => 'Test',
            'deskripsi' => 'd',
            'harga' => 1,
            'tipe' => 'license',
            'status' => 'aktif',
            'remove_file' => true,
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertNull($product->fresh()->file_url);
    }

    // ───── destroy ─────

    public function test_destroy_returns_409_when_product_has_order_items(): void
    {
        $product = Product::create([
            'nama' => 'Test', 'slug' => 't-'.uniqid(),
            'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif',
        ]);
        $orderId = \DB::table('orders')->insertGetId([
            'kode_order' => 'EPS-'.uniqid(),
            'nama_pembeli' => 'B', 'email_pembeli' => 'b@x.com', 'wa_pembeli' => '08123456789',
            'total_harga' => 1, 'status' => 'paid',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        OrderItem::create([
            'order_id' => $orderId,
            'product_id' => $product->id,
            'nama_produk' => 'Test', 'harga_saat_beli' => 1, 'tipe_produk' => 'license',
        ]);

        $response = $this->deleteJson('/api/admin/products/'.$product->id, [], $this->authHeaders());

        $response->assertStatus(409);
        $response->assertJsonFragment(['code' => 'product_has_orders']);
    }

    public function test_destroy_deletes_product_when_no_orders(): void
    {
        $product = Product::create([
            'nama' => 'Test', 'slug' => 't-'.uniqid(),
            'deskripsi' => 'd', 'harga' => 1, 'tipe' => 'license', 'status' => 'aktif',
        ]);

        $response = $this->deleteJson('/api/admin/products/'.$product->id, [], $this->authHeaders());

        $response->assertOk();
        $this->assertNull(Product::find($product->id));
    }
}