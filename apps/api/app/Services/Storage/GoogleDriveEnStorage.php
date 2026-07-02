<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;

/**
 * Stub untuk implementasi EnStorage via Google Drive API.
 *
 * Diaktifkan di Fase 4 — saat ini hanya raise NotImplemented.
 */
class GoogleDriveEnStorage implements EnStorageClient
{
    public function upload(UploadedFile $file, string $destinationPath): string
    {
        throw new \RuntimeException(
            'GoogleDriveEnStorage belum diimplementasi — akan datang di Fase 4. ' .
            'Sementara pakai LocalMockEnStorage via ENSTORAGE_MOCK=true.'
        );
    }

    public function delete(string $path): bool
    {
        throw new \RuntimeException('GoogleDriveEnStorage belum diimplementasi.');
    }

    public function exists(string $path): bool
    {
        throw new \RuntimeException('GoogleDriveEnStorage belum diimplementasi.');
    }

    public function url(string $path): string
    {
        throw new \RuntimeException('GoogleDriveEnStorage belum diimplementasi.');
    }
}