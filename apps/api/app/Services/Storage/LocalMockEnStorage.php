<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Mock implementation EnStorage — simpan ke disk private lokal.
 *
 * File disimpan di storage/app/private/enstorage/
 * Path yang dikembalikan ke DB adalah relatif: "enstorage/products/abc/file.zip"
 * Frontend resolve URL via endpoint /api/admin/files/{path} (Fase 4).
 */
class LocalMockEnStorage implements EnStorageClient
{
    private string $disk = 'local';

    private string $prefix = 'enstorage';

    public function upload(UploadedFile $file, string $destinationPath): string
    {
        $fullPath = trim($destinationPath, '/');
        $dir = dirname($fullPath);
        $filename = basename($fullPath);

        // Simpan via Storage facade ke disk 'local' di storage/app/private
        Storage::disk($this->disk)->putFileAs(
            $dir,
            $file,
            $filename
        );

        return $this->prefix . '/' . $fullPath;
    }

    public function delete(string $path): bool
    {
        $relative = $this->stripPrefix($path);
        if ($relative === null) {
            return false;
        }

        if (! Storage::disk($this->disk)->exists($relative)) {
            return false;
        }

        return Storage::disk($this->disk)->delete($relative);
    }

    public function exists(string $path): bool
    {
        $relative = $this->stripPrefix($path);
        if ($relative === null) {
            return false;
        }

        return Storage::disk($this->disk)->exists($relative);
    }

    public function url(string $path): string
    {
        // Untuk mock: return path relatif — frontend/admin perlu endpoint khusus
        // untuk stream file (diimplementasi di Fase 4 bersama /download/{token}).
        return '/storage/' . ltrim($path, '/');
    }

    /**
     * Hapus prefix "enstorage/" dari path DB dan return path relatif ke disk.
     */
    private function stripPrefix(string $path): ?string
    {
        $path = ltrim($path, '/');
        if (str_starts_with($path, $this->prefix . '/')) {
            return substr($path, strlen($this->prefix) + 1);
        }
        if ($path === $this->prefix) {
            return '';
        }

        // Path tanpa prefix — assume langsung relative
        return $path;
    }
}