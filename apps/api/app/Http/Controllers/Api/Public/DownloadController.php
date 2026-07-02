<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\OrderDelivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Public download endpoint — token-based (no auth).
 *
 * GET /api/download/{token}
 *
 * Token acts as a bearer credential. Validate:
 * - delivery exists
 * - token_expired_at in future
 * - download_url not empty
 *
 * Stream file from EnStorage (disk=local mock, or future Google Drive).
 *
 * Token rotation/expiry semantics: setelah expired_at, token invalid.
 * Regeneration untuk user token lama di-handle admin via Fase 5 UI.
 */
class DownloadController extends Controller
{
    public function show(Request $request, string $token): BinaryFileResponse|StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $delivery = OrderDelivery::where('download_token', $token)
            ->with(['orderItem', 'orderItem.order'])
            ->first();

        if (! $delivery) {
            return response()->json([
                'message' => 'Token download tidak valid.',
            ], 404);
        }

        if (! $delivery->isDownloadValid()) {
            return response()->json([
                'message' => 'Link download sudah kadaluarsa. Silakan minta admin untuk regenerate link.',
            ], 410);
        }

        $path = $delivery->download_url;
        if (empty($path)) {
            return response()->json([
                'message' => 'File tidak tersedia untuk item ini.',
            ], 404);
        }

        // Strip prefix kalau ada (file_url disimpan sebagai "enstorage/products/...")
        $relative = $this->stripEnstoragePrefix($path);

        if (! Storage::disk('local')->exists($relative)) {
            Log::warning('Download: file missing on disk', [
                'token_prefix' => substr($token, 0, 12),
                'path' => $path,
            ]);
            return response()->json([
                'message' => 'File tidak ditemukan di storage. Hubungi admin.',
            ], 500);
        }

        // Bangun nama file yang user-friendly dari product snapshot
        $productName = $delivery->orderItem?->nama_produk ?? 'produk';
        $filename = preg_replace('/[^a-zA-Z0-9._\- ]/', '_', $productName);
        if (! str_contains($filename, '.')) {
            // Tambah extension dari file asli kalau belum ada
            $ext = pathinfo($relative, PATHINFO_EXTENSION);
            if ($ext) {
                $filename .= '.' . $ext;
            }
        }

        return Storage::disk('local')->download($relative, $filename);
    }

    /**
     * Hapus prefix "enstorage/" dari path DB untuk ambil path di disk local.
     */
    private function stripEnstoragePrefix(string $path): string
    {
        $path = ltrim($path, '/');
        if (str_starts_with($path, 'enstorage/')) {
            return substr($path, strlen('enstorage/'));
        }
        return $path;
    }
}