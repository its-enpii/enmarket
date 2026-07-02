<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Storage\EnStorageClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Sub-resource untuk preview images produk.
 * Append gambar baru atau hapus berdasarkan index.
 *
 * POST   /api/admin/products/{product}/preview-images   (multipart: file)
 * DELETE /api/admin/products/{product}/preview-images   (body: { index })
 */
class ProductImageController extends Controller
{
    private const MAX_PREVIEW_IMAGES = 5;

    public function __construct(private readonly EnStorageClient $storage)
    {
    }

    /**
     * Upload satu preview image dan append ke array.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'max:10240'], // 10MB
        ]);

        $current = $product->preview_images ?? [];

        if (count($current) >= self::MAX_PREVIEW_IMAGES) {
            return response()->json([
                'message' => 'Maksimal ' . self::MAX_PREVIEW_IMAGES . ' preview image.',
                'code' => 'preview_limit',
            ], 422);
        }

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::random(20) . '.' . $ext;
        $path = $this->storage->upload($file, "products/previews/{$product->id}/{$filename}");

        $current[] = $path;
        $product->preview_images = $current;
        $product->save();

        return response()->json([
            'data' => new ProductResource($product->load('category:id,nama,slug')),
            'message' => 'Preview image ditambahkan.',
        ]);
    }

    /**
     * Hapus preview image berdasarkan index di body.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'index' => ['required', 'integer', 'min:0'],
        ]);

        $current = $product->preview_images ?? [];

        if (! isset($current[$data['index']])) {
            return response()->json([
                'message' => 'Index preview image tidak ditemukan.',
                'code' => 'index_not_found',
            ], 404);
        }

        $this->storage->delete($current[$data['index']]);

        unset($current[$data['index']]);
        $product->preview_images = array_values($current); // reindex
        $product->save();

        return response()->json([
            'data' => new ProductResource($product->load('category:id,nama,slug')),
            'message' => 'Preview image dihapus.',
        ]);
    }
}