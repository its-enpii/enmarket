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
    ) {}

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
            $filename = Str::random(20).'.'.$ext;
            $data['file_url'] = $this->storage->upload($file, "products/{$filename}");
        }

        // Guard: kalau tipe download/bundle dan tidak ada file_url, reject.
        if (in_array($data['tipe'], ['download', 'bundle'], true) && empty($data['file_url'])) {
            abort(422, 'File produk wajib di-upload untuk tipe download atau bundle.');
        }

        // preview_images: array of URLs (biasanya dari upload terpisah, tapi
        // izinkan JSON string atau array)
        if (isset($data['preview_images']) && is_string($data['preview_images'])) {
            $decoded = json_decode($data['preview_images'], true);
            $data['preview_images'] = is_array($decoded) ? $decoded : [];
        }

        $product = Product::create($data);

        // Attach linked posts (opsional). `linked_posts` adalah array of post_id.
        // Urutan di-set sesuai index array — admin urutan via UI reorder.
        if ($request->has('linked_posts')) {
            $this->syncLinkedPosts($product, $request->input('linked_posts'));
        }

        // Trigger ISR revalidation untuk halaman yang menampilkan produk ini
        $this->revalidator->revalidateProduct($product->slug);

        return response()->json([
            'data' => new ProductResource($product->load(['category:id,nama,slug', 'licenseKeys', 'posts'])),
            'message' => 'Produk berhasil dibuat.',
        ], 201);
    }

    /**
     * GET /api/admin/products/{id}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => new ProductResource($product->load(['category:id,nama,slug', 'licenseKeys', 'posts'])),
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
            $filename = Str::random(20).'.'.$ext;
            $data['file_url'] = $this->storage->upload($file, "products/{$filename}");
        } elseif ($request->boolean('remove_file')) {
            if ($product->file_url) {
                $this->storage->delete($product->file_url);
            }
            $data['file_url'] = null;
        }

        // Guard: kalau tipe download/bundle dan tidak ada file_url setelah update,
        // reject — cegah bundle tanpa file lolos validasi.
        $effectiveTipe = $data['tipe'] ?? $product->tipe;
        if (in_array($effectiveTipe, ['download', 'bundle'], true) && empty($data['file_url']) && empty($product->file_url)) {
            abort(422, 'File produk wajib di-upload untuk tipe download atau bundle.');
        }

        if (isset($data['preview_images']) && is_string($data['preview_images'])) {
            $decoded = json_decode($data['preview_images'], true);
            $data['preview_images'] = is_array($decoded) ? $decoded : [];
        }

        $product->update($data);

        // Sync linked posts. Kalau field dikirim (meskipun array kosong) → sync.
        // Kalau TIDAK dikirim sama sekali → biarkan existing (partial update).
        if ($request->has('linked_posts')) {
            $this->syncLinkedPosts($product, $request->input('linked_posts'));
        }

        // Revalidate slug baru + (kalau slug berubah) slug lama
        $this->revalidator->revalidateProduct($product->slug);

        return response()->json([
            'data' => new ProductResource($product->load(['category:id,nama,slug', 'licenseKeys', 'posts'])),
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
            $uniqueSlugRule = 'unique:products,slug,'.$product->id;
        }

        return $request->validate([
            'nama' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220', 'regex:/^[a-z0-9-]+$/', $uniqueSlugRule],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'deskripsi' => ['required', 'string'],
            'harga' => ['required', 'numeric', 'min:0'],
            'tipe' => ['required', 'in:download,license,bundle,account_manual'],
            'download_expiry_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'preview_images' => ['nullable'],
            'fitur' => ['nullable'],
            'status' => ['required', 'in:aktif,draft,tidak_dijual'],
            'is_featured' => ['nullable', 'boolean'],
            // Pre-order fields. Uncontrolled checkbox submit value="1" kalau dicentang,
            // tidak ada field kalau tidak dicentang. `nullable + boolean` handle keduanya.
            // `required_if:is_pre_order,1,1` (Laravel pakai boolean coerce dari '1' string).
            'is_pre_order' => ['nullable', 'boolean'],
            'release_date' => ['nullable', 'date', 'after_or_equal:today', 'required_if:is_pre_order,1'],
            'preorder_deposit_percent' => ['nullable', 'integer', 'min:1', 'max:100', 'required_if:is_pre_order,1'],
            'file' => [
                'nullable',
                'file',
                'max:512000', // 500MB max
                'required_if:tipe,download,bundle', // tipe download/bundle wajib upload file
            ],
            'remove_file' => ['nullable', 'boolean'],
            // linked_posts: optional array of post_id. Boleh JSON string (untuk form multipart)
            // atau array langsung. Sync — kalau dikirim, replace semua existing.
            'linked_posts' => ['nullable'],
        ], [
            'file.required_if' => 'File produk wajib di-upload untuk tipe download atau bundle.',
            'release_date.required_if' => 'Tanggal rilis wajib diisi untuk produk pre-order.',
            'preorder_deposit_percent.required_if' => 'Persentase DP wajib diisi untuk produk pre-order.',
            'release_date.after_or_equal' => 'Tanggal rilis tidak boleh di masa lalu.',
            'preorder_deposit_percent.min' => 'Persentase DP minimal 1%.',
            'preorder_deposit_percent.max' => 'Persentase DP maksimal 100%.',
        ]);
    }

    /**
     * Sync pivot `product_post` dari input.
     *
     * Accept: array of post_id (urutan = index array),
     * atau array of {post_id, urutan}.
     * ID yang tidak exist di posts table → di-skip (jangan crash).
     */
    private function syncLinkedPosts(Product $product, mixed $input): void
    {
        if (is_string($input)) {
            $decoded = json_decode($input, true);
            $input = is_array($decoded) ? $decoded : [];
        }
        if (! is_array($input)) {
            return;
        }

        $sync = [];
        foreach ($input as $i => $entry) {
            if (is_int($entry) || (is_string($entry) && ctype_digit($entry))) {
                $postId = (int) $entry;
                $urutan = $i;
            } elseif (is_array($entry) && isset($entry['post_id'])) {
                $postId = (int) $entry['post_id'];
                $urutan = isset($entry['urutan']) ? (int) $entry['urutan'] : $i;
            } else {
                continue;
            }

            // Skip invalid post_id — tidak crash kalau admin input post_id
            // yang sudah dihapus.
            if ($postId <= 0 || ! \App\Models\Post::where('id', $postId)->exists()) {
                continue;
            }

            $sync[$postId] = ['urutan' => $urutan];
        }

        $product->posts()->sync($sync);
    }
}
