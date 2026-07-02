<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\NextRevalidator;
use App\Services\Storage\EnStorageClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(
        private readonly EnStorageClient $storage,
        private readonly NextRevalidator $revalidator,
    ) {
    }

    /**
     * GET /api/admin/products
     * Query: ?status=aktif&category_id=1&q=nama&page=1&per_page=10
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = Product::query()->with('category:id,nama,slug')->latest('updated_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/products/stats
     * Untuk dashboard home — count per status.
     */
    public function stats(): JsonResponse
    {
        $counts = Product::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'data' => [
                'total' => array_sum($counts->toArray()),
                'aktif' => $counts['aktif'] ?? 0,
                'draft' => $counts['draft'] ?? 0,
                'tidak_dijual' => $counts['tidak_dijual'] ?? 0,
            ],
        ]);
    }

    /**
     * POST /api/admin/products
     * Multipart: text fields + optional file (field "file")
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateProduct($request);

        // Upload file produk kalau ada
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $ext = $file->getClientOriginalExtension() ?: 'bin';
            $filename = Str::random(20) . '.' . $ext;
            $data['file_url'] = $this->storage->upload($file, "products/{$filename}");
        }

        // preview_images: array of URLs (biasanya dari upload terpisah, tapi
        // izinkan JSON string atau array)
        if (isset($data['preview_images']) && is_string($data['preview_images'])) {
            $decoded = json_decode($data['preview_images'], true);
            $data['preview_images'] = is_array($decoded) ? $decoded : [];
        }

        $product = Product::create($data);

        // Trigger ISR revalidation untuk halaman yang menampilkan produk ini
        $this->revalidator->revalidateProduct($product->slug);

        return response()->json([
            'data' => new ProductResource($product->load('category:id,nama,slug')),
            'message' => 'Produk berhasil dibuat.',
        ], 201);
    }

    /**
     * GET /api/admin/products/{id}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => new ProductResource($product->load('category:id,nama,slug')),
        ]);
    }

    /**
     * PUT /api/admin/products/{id}
     * Multipart dengan optional file_replace flag.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->validateProduct($request, $product);

        if ($request->hasFile('file')) {
            // Hapus file lama kalau ada
            if ($product->file_url) {
                $this->storage->delete($product->file_url);
            }
            $file = $request->file('file');
            $ext = $file->getClientOriginalExtension() ?: 'bin';
            $filename = Str::random(20) . '.' . $ext;
            $data['file_url'] = $this->storage->upload($file, "products/{$filename}");
        } elseif ($request->boolean('remove_file')) {
            if ($product->file_url) {
                $this->storage->delete($product->file_url);
            }
            $data['file_url'] = null;
        }

        if (isset($data['preview_images']) && is_string($data['preview_images'])) {
            $decoded = json_decode($data['preview_images'], true);
            $data['preview_images'] = is_array($decoded) ? $decoded : [];
        }

        $product->update($data);

        // Revalidate slug baru + (kalau slug berubah) slug lama
        $this->revalidator->revalidateProduct($product->slug);

        return response()->json([
            'data' => new ProductResource($product->load('category:id,nama,slug')),
            'message' => 'Produk berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/products/{id}
     * Tolak 409 jika sudah ada order_items.
     */
    public function destroy(Product $product): JsonResponse
    {
        $count = $product->orderItems()->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Produk tidak bisa dihapus — sudah ada {$count} order terkait.",
                'code' => 'product_has_orders',
            ], 409);
        }

        // Hapus file produk
        if ($product->file_url) {
            $this->storage->delete($product->file_url);
        }

        $slug = $product->slug;
        $product->delete();

        // Halaman /produk/{slug} sudah tidak ada — revalidate list
        $this->revalidator->revalidateProduct($slug);

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * Validation rules untuk store & update.
     */
    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $uniqueSlugRule = 'unique:products,slug';
        if ($product) {
            $uniqueSlugRule = 'unique:products,slug,' . $product->id;
        }

        return $request->validate([
            'nama' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220', 'regex:/^[a-z0-9-]+$/', $uniqueSlugRule],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'deskripsi' => ['required', 'string'],
            'harga' => ['required', 'numeric', 'min:0'],
            'tipe' => ['required', 'in:download,license,bundle'],
            'download_expiry_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'preview_images' => ['nullable'],
            'fitur' => ['nullable'],
            'status' => ['required', 'in:aktif,draft,tidak_dijual'],
            'is_featured' => ['nullable', 'boolean'],
            'file' => ['nullable', 'file', 'max:512000'], // 500MB max
            'remove_file' => ['nullable', 'boolean'],
        ]);
    }
}