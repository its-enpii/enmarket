<?php

namespace Tests\Feature;

use App\Models\OrderDelivery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Test untuk DownloadController — token validation + expiry + file streaming.
 *
 * Storage di-fake via Storage::fake('local') untuk isolate dari filesystem asli.
 */
class DownloadControllerTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'abc123def4567890123456789012345678901234';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function makeDelivery(array $overrides = []): OrderDelivery
    {
        $orderId = DB::table('orders')->insertGetId([
            'kode_order' => 'EPS-DL-'.strtoupper(uniqid()),
            'nama_pembeli' => 'B',
            'email_pembeli' => 'b@x.com',
            'wa_pembeli' => '08123456789',
            'total_harga' => 100000,
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $productId = DB::table('products')->insertGetId([
            'nama' => $overrides['product_nama'] ?? 'Test Product',
            'slug' => 'test-'.uniqid(),
            'deskripsi' => 'desc',
            'harga' => 100000,
            'tipe' => 'download',
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $itemId = DB::table('order_items')->insertGetId([
            'order_id' => $orderId,
            'product_id' => $productId,
            'nama_produk' => $overrides['product_nama'] ?? 'Test Product',
            'harga_saat_beli' => 100000,
            'tipe_produk' => 'download',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return OrderDelivery::create(array_merge([
            'order_item_id' => $itemId,
            'download_token' => self::TOKEN,
            'download_url' => 'enstorage/products/file.zip',
            'token_expired_at' => now()->addDays(7),
        ], array_filter($overrides, fn ($k) => ! in_array($k, ['product_nama']), true)));
    }

    // ───── token validation ─────

    public function test_show_returns_404_for_unknown_token(): void
    {
        $response = $this->getJson('/api/download/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        $response->assertStatus(404);
        $response->assertJsonFragment(['message' => 'Token download tidak valid.']);
    }

    public function test_show_returns_410_for_expired_token(): void
    {
        $this->makeDelivery(['token_expired_at' => now()->subDay()]);
        Storage::disk('local')->put('products/file.zip', 'content');

        $response = $this->getJson('/api/download/'.self::TOKEN);
        $response->assertStatus(410);
        $response->assertJsonFragment(['message' => 'Link download sudah kadaluarsa. Silakan minta admin untuk regenerate link.']);
    }

    public function test_show_returns_404_for_delivery_without_download_url(): void
    {
        $this->makeDelivery(['download_url' => null]);

        $response = $this->getJson('/api/download/'.self::TOKEN);
        $response->assertStatus(404);
        $response->assertJsonFragment(['message' => 'File tidak tersedia untuk item ini.']);
    }

    public function test_show_returns_500_when_file_missing_on_disk(): void
    {
        $this->makeDelivery();
        // Tidak upload file ke Storage::fake — exists() = false

        $response = $this->getJson('/api/download/'.self::TOKEN);
        $response->assertStatus(500);
        $response->assertJsonFragment(['message' => 'File tidak ditemukan di storage. Hubungi admin.']);
    }

    // ───── happy path ─────

    public function test_show_returns_binary_response_with_correct_filename(): void
    {
        Storage::disk('local')->put('products/file.zip', 'dummy zip content');
        $this->makeDelivery(['product_nama' => 'Aplikasi Saya v1.0']);

        $response = $this->get('/api/download/'.self::TOKEN);

        $response->assertOk();
        $disposition = $response->headers->get('content-disposition');
        $this->assertStringContainsString('attachment', $disposition);
        // Filename harus muncul, karakter tidak aman di-strip — product punya dot
        // sudah di filename jadi ext tidak di-append
        $this->assertStringContainsString('Aplikasi Saya v1.0', $disposition);
    }

    public function test_show_sanitizes_unsafe_chars_in_filename(): void
    {
        Storage::disk('local')->put('products/file.zip', 'content');
        // Unicode + spasi + unsafe chars harus jadi underscore
        $this->makeDelivery(['product_nama' => 'File/Danger:Nama<>?*|']);

        $response = $this->get('/api/download/'.self::TOKEN);

        $response->assertOk();
        $disposition = $response->headers->get('content-disposition');
        // Tidak boleh ada path separator atau shell-unsafe chars
        $this->assertStringNotContainsString('/', explode('filename=', $disposition)[1] ?? '');
        $this->assertStringNotContainsString(':', explode('filename=', $disposition)[1] ?? '');
        $this->assertStringNotContainsString('<', explode('filename=', $disposition)[1] ?? '');
    }

    public function test_show_preserves_extension_from_disk_path_when_filename_has_no_extension(): void
    {
        Storage::disk('local')->put('products/file.pdf', 'pdf content');
        $this->makeDelivery([
            'product_nama' => 'Dokumen Penting',
            'download_url' => 'enstorage/products/file.pdf',
        ]);

        $response = $this->get('/api/download/'.self::TOKEN);

        $response->assertOk();
        $disposition = $response->headers->get('content-disposition');
        $this->assertStringContainsString('.pdf', $disposition);
    }

    public function test_show_strips_enstorage_prefix_from_path(): void
    {
        // File disimpan di products/file.zip (no enstorage prefix)
        Storage::disk('local')->put('products/file.zip', 'content');
        $delivery = $this->makeDelivery();
        $this->assertEquals('enstorage/products/file.zip', $delivery->download_url);

        $response = $this->get('/api/download/'.self::TOKEN);
        $response->assertOk();
    }

    public function test_show_handles_path_without_enstorage_prefix(): void
    {
        Storage::disk('local')->put('direct/file.zip', 'content');
        $this->makeDelivery(['download_url' => 'direct/file.zip']);

        $response = $this->get('/api/download/'.self::TOKEN);
        $response->assertOk();
    }
}