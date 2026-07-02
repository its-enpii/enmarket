<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;

/**
 * Abstraction untuk EnStorage (orchestrator Google Drive enpiistudio).
 *
 * Fase 1-3: pakai LocalMockEnStorage (simpan ke disk lokal).
 * Fase 4: swap ke GoogleDriveEnStorage dengan real API.
 *
 * Path yang dikembalikan harus URL-friendly dan bisa dipakai
 * sebagai referensi di DB (field file_url, preview_images[]).
 */
interface EnStorageClient
{
    /**
     * Upload file ke storage. Return path/URL yang bisa dipakai
     * untuk retrieve nanti.
     *
     * @param  UploadedFile  $file
     * @param  string  $destinationPath  Path relatif dalam bucket (mis. "products/abc/file.zip")
     */
    public function upload(UploadedFile $file, string $destinationPath): string;

    /**
     * Hapus file dari storage.
     */
    public function delete(string $path): bool;

    /**
     * Cek apakah file ada di storage.
     */
    public function exists(string $path): bool;

    /**
     * Ambil URL publik untuk akses/download file.
     * Untuk mock: route lokal ke /storage/enstorage/{path}
     * Untuk real: signed URL atau public URL dari Google Drive.
     */
    public function url(string $path): string;
}