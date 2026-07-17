<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Remote EnStorage backend — panggil HTTP API EnStorage (orchestrator
 * Google Drive enpiistudio) untuk upload/download file.
 *
 * Dipakai kalau ENSTORAGE_BASE_URL terisi. Base URL + API key di-inject
 * via constructor oleh AppServiceProvider.
 *
 * Endpoint path disimpan sebagai konstanta di class ini — gampang di-update
 * saat spec API EnStorage final.
 *
 * Asumsi contract (placeholder, validasi setelah spec final):
 *   POST   {baseUrl}/files            multipart: path, file  → 201 { path: string }
 *   DELETE {baseUrl}/files/{path}     → 204
 *   HEAD   {baseUrl}/files/{path}     → 200 kalau ada, 404 kalau tidak
 *   GET    {baseUrl}/files/{path}     → stream binary (signed URL)
 */
class RemoteEnStorage implements EnStorageClient
{
    private const ENDPOINT_FILES = '/files';

    private const HTTP_TIMEOUT_SECONDS = 10;

    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey,
    ) {}

    public function upload(UploadedFile $file, string $destinationPath): string
    {
        $endpoint = rtrim($this->baseUrl, '/').self::ENDPOINT_FILES;

        $response = Http::withHeaders($this->authHeaders())
            ->timeout(self::HTTP_TIMEOUT_SECONDS)
            ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
            ->post($endpoint, [
                'path' => ltrim($destinationPath, '/'),
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(sprintf(
                'EnStorage upload gagal [%d] %s — %s',
                $response->status(),
                $endpoint,
                $response->body() ?: '(empty body)'
            ));
        }

        $payload = $response->json();
        $path = is_array($payload) ? ($payload['path'] ?? null) : null;
        if (! is_string($path) || $path === '') {
            throw new RuntimeException('EnStorage upload: response tidak mengandung field "path".');
        }

        return $path;
    }

    public function delete(string $path): bool
    {
        $endpoint = $this->fileEndpoint($path);

        try {
            $response = Http::withHeaders($this->authHeaders())
                ->timeout(self::HTTP_TIMEOUT_SECONDS)
                ->delete($endpoint);
        } catch (\Throwable $e) {
            // File mungkin sudah tidak ada — anggap sukses idempotent.
            return false;
        }

        return $response->status() === 204 || $response->successful();
    }

    public function exists(string $path): bool
    {
        $endpoint = $this->fileEndpoint($path);

        try {
            $response = Http::withHeaders($this->authHeaders())
                ->timeout(self::HTTP_TIMEOUT_SECONDS)
                ->head($endpoint);
        } catch (\Throwable $e) {
            return false;
        }

        return $response->status() === 200;
    }

    public function url(string $path): string
    {
        // Placeholder: kembalikan URL publik langsung. Saat spec final,
        // ganti ke signed URL (request terpisah ke endpoint signed-url).
        return rtrim($this->baseUrl, '/').self::ENDPOINT_FILES.'/'.ltrim($path, '/');
    }

    private function fileEndpoint(string $path): string
    {
        return rtrim($this->baseUrl, '/').self::ENDPOINT_FILES.'/'.ltrim($path, '/');
    }

    /**
     * @return array<string, string>
     */
    private function authHeaders(): array
    {
        $headers = ['Accept' => 'application/json'];
        if ($this->apiKey !== '') {
            $headers['Authorization'] = 'Bearer '.$this->apiKey;
        }

        return $headers;
    }
}
