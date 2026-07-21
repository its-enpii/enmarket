<?php

namespace Tests\Feature;

use App\Services\Storage\LocalMockEnStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EnStorageTest extends TestCase
{
    use RefreshDatabase;

    private LocalMockEnStorage $storage;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->storage = new LocalMockEnStorage;
    }

    public function test_upload_returns_enstorage_prefix_path(): void
    {
        $file = UploadedFile::fake()->create('file.zip', 100);
        $path = $this->storage->upload($file, 'products/abc/file.zip');

        $this->assertEquals('enstorage/products/abc/file.zip', $path);
        $this->assertTrue(Storage::disk('local')->exists('products/abc/file.zip'));
    }

    public function test_upload_strips_leading_slash_from_destination(): void
    {
        $file = UploadedFile::fake()->create('data.json', 50);
        $path = $this->storage->upload($file, '/data/snapshot.json');

        $this->assertEquals('enstorage/data/snapshot.json', $path);
    }

    public function test_delete_removes_existing_file(): void
    {
        Storage::disk('local')->put('products/file.zip', 'content');

        $result = $this->storage->delete('enstorage/products/file.zip');

        $this->assertTrue($result);
        $this->assertFalse(Storage::disk('local')->exists('products/file.zip'));
    }

    public function test_delete_returns_false_for_nonexistent_file(): void
    {
        $result = $this->storage->delete('enstorage/products/missing.zip');

        $this->assertFalse($result);
    }

    public function test_delete_returns_false_for_unparseable_path(): void
    {
        // Path cuma prefix tanpa file — stripPrefix return empty
        $result = $this->storage->delete('enstorage');
        // 'enstorage' → strip to '' — exists returns false → delete returns false
        $this->assertFalse($result);
    }

    public function test_exists_returns_true_for_uploaded_file(): void
    {
        Storage::disk('local')->put('products/file.zip', 'content');

        $this->assertTrue($this->storage->exists('enstorage/products/file.zip'));
    }

    public function test_exists_returns_false_for_missing_file(): void
    {
        $this->assertFalse($this->storage->exists('enstorage/products/missing.zip'));
    }

    public function test_url_returns_path_with_leading_slash(): void
    {
        $url = $this->storage->url('enstorage/products/file.zip');
        $this->assertEquals('/storage/enstorage/products/file.zip', $url);
    }

    public function test_url_handles_path_without_prefix(): void
    {
        $url = $this->storage->url('direct/path/file.zip');
        $this->assertEquals('/storage/direct/path/file.zip', $url);
    }
}