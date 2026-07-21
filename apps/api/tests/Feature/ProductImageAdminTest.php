<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\Storage\EnStorageClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductImageAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);

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
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    private function makeProduct(): Product
    {
        return Product::create([
            'nama' => 'Test',
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'd',
            'harga' => 100000,
            'tipe' => 'license',
            'status' => 'aktif',
        ]);
    }

    // ───── store ─────

    public function test_store_requires_file(): void
    {
        $product = $this->makeProduct();

        $response = $this->postJson(
            "/api/admin/products/{$product->id}/preview-images",
            [],
            $this->authHeaders(),
        );

        $response->assertStatus(422);
    }

    public function test_store_appends_to_empty_preview_images(): void
    {
        $product = $this->makeProduct();
        $file = UploadedFile::fake()->create('preview.jpg', 50, 'image/jpeg');

        $response = $this->postJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['file' => $file],
            $this->authHeaders(),
        );

        $response->assertOk();
        $images = $product->fresh()->preview_images;
        $this->assertCount(1, $images);
        $this->assertStringStartsWith('enstorage/products/previews/', $images[0]);
    }

    public function test_store_appends_to_existing_preview_images(): void
    {
        $product = $this->makeProduct();
        $product->update(['preview_images' => ['enstorage/products/previews/existing1.jpg', 'enstorage/products/previews/existing2.jpg']]);

        $file = UploadedFile::fake()->create('new.jpg', 50, 'image/jpeg');
        $response = $this->postJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['file' => $file],
            $this->authHeaders(),
        );

        $response->assertOk();
        $images = $product->fresh()->preview_images;
        $this->assertCount(3, $images);
        $this->assertStringContainsString('existing1.jpg', $images[0]);
        $this->assertStringContainsString('existing2.jpg', $images[1]);
        $this->assertStringStartsWith('enstorage/products/previews/', $images[2]);
    }

    public function test_store_returns_422_when_at_max_5_images(): void
    {
        $product = $this->makeProduct();
        $existing = [];
        for ($i = 1; $i <= 5; $i++) {
            $existing[] = "enstorage/products/previews/existing{$i}.jpg";
        }
        $product->update(['preview_images' => $existing]);

        $file = UploadedFile::fake()->create('extra.jpg', 50, 'image/jpeg');
        $response = $this->postJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['file' => $file],
            $this->authHeaders(),
        );

        $response->assertStatus(422);
        $response->assertJsonFragment(['code' => 'preview_limit']);
        // Existing tidak berubah
        $this->assertCount(5, $product->fresh()->preview_images);
    }

    // ───── destroy ─────

    public function test_destroy_validates_required_index(): void
    {
        $product = $this->makeProduct();

        $response = $this->deleteJson(
            "/api/admin/products/{$product->id}/preview-images",
            [],
            $this->authHeaders(),
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['index']);
    }

    public function test_destroy_returns_404_for_out_of_range_index(): void
    {
        $product = $this->makeProduct();
        $product->update(['preview_images' => ['enstorage/img1.jpg']]);

        $response = $this->deleteJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['index' => 5],
            $this->authHeaders(),
        );

        $response->assertStatus(404);
        $response->assertJsonFragment(['code' => 'index_not_found']);
    }

    public function test_destroy_removes_image_and_reindexes(): void
    {
        $product = $this->makeProduct();
        $product->update(['preview_images' => [
            'enstorage/img1.jpg',
            'enstorage/img2.jpg',
            'enstorage/img3.jpg',
        ]]);

        $response = $this->deleteJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['index' => 1],  // hapus img2
            $this->authHeaders(),
        );

        $response->assertOk();
        $images = $product->fresh()->preview_images;
        $this->assertCount(2, $images);
        $this->assertEquals('enstorage/img1.jpg', $images[0]);
        $this->assertEquals('enstorage/img3.jpg', $images[1]);
        // Reindexed — bukan unset → indices [0, 1] bukan [0, 2]
        $this->assertArrayNotHasKey(2, $images);
    }

    public function test_destroy_at_index_zero_works(): void
    {
        $product = $this->makeProduct();
        $product->update(['preview_images' => ['enstorage/img1.jpg', 'enstorage/img2.jpg']]);

        $response = $this->deleteJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['index' => 0],
            $this->authHeaders(),
        );

        $response->assertOk();
        $this->assertCount(1, $product->fresh()->preview_images);
        $this->assertEquals('enstorage/img2.jpg', $product->fresh()->preview_images[0]);
    }

    public function test_destroy_on_empty_preview_images_returns_404(): void
    {
        $product = $this->makeProduct();

        $response = $this->deleteJson(
            "/api/admin/products/{$product->id}/preview-images",
            ['index' => 0],
            $this->authHeaders(),
        );

        $response->assertStatus(404);
    }
}