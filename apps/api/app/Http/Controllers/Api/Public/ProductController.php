<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/public/products/featured
     * Halaman utama: hingga 6 produk unggulan (is_featured + aktif).
     */
    public function featured(): JsonResponse
    {
        $products = Product::active()
            ->featured()
            ->with('category:id,nama,slug')
            ->latest('updated_at')
            ->limit(6)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * GET /api/public/products/latest
     * Halaman utama: 8 produk aktif terbaru.
     */
    public function latest(): JsonResponse
    {
        $products = Product::active()
            ->with('category:id,nama,slug')
            ->latest('updated_at')
            ->limit(8)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * GET /api/public/products/homepage
     * Halaman utama butuh featured + latest digabung TANPA duplikat.
     * Single round-trip + server-side dedup.
     *
     * Strategi 2 query sederhana + merge di-collection (max 6+8 = 14 rows,
     * keyBy('id') O(n)). Untuk data kecil, klaritas > micro-optimasi.
     *
     * Alternatif SQL UNION lebih cepat tapi rentan index collision di
     * Eloquent. Untuk saat ini, simplicity wins.
     */
    public function homepage(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->input('per_page', 6), 1), 12);

        $featured = Product::active()
            ->featured()
            ->with('category:id,nama,slug')
            ->latest('updated_at')
            ->limit($limit) // upper bound — fill dari featured dulu
            ->get();

        // Ambil 'latest' yang BELUM ada di featured (keyBy → O(1) lookup).
        $featuredIds = $featured->pluck('id')->all();
        $latestExtra = Product::active()
            ->whereNotIn('id', $featuredIds)
            ->with('category:id,nama,slug')
            ->latest('updated_at')
            ->limit($limit) // ambil max $limit extra
            ->get();

        // featured di depan, latest di belakangnya — preserve featured-first sort.
        $merged = $featured->concat($latestExtra)->take($limit);

        return response()->json([
            'data' => ProductResource::collection($merged),
        ]);
    }

    /**
     * GET /api/public/products
     * Katalog publik: filter kategori (?category=slug) + search (?q=text) + pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 60);

        $query = Product::active()->with('category:id,nama,slug');

        if ($categorySlug = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $categorySlug));
        }

        if ($tipe = $request->input('tipe')) {
            if (in_array($tipe, ['download', 'license', 'bundle'], true)) {
                $query->where('tipe', $tipe);
            }
        }

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('deskripsi', 'like', "%{$q}%");
            });
        }

        $paginator = $query->latest('updated_at')->paginate($perPage);

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
     * GET /api/public/products/{slug}
     * Detail publik — 404 kalau produk tidak aktif atau tidak ada.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::active()
            ->with([
                'category:id,nama,slug',
                // Hanya post published yang relevan untuk publik — filter di
                // nested whereHas via scopePublished() lewat relasi posts().
                'posts' => fn ($q) => $q->where('status', 'published')
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now()),
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * GET /api/public/products-slugs
     * Untuk sitemap: ambil slug semua produk aktif.
     */
    public function slugs(): JsonResponse
    {
        return response()->json([
            'data' => Product::active()->orderBy('id')->pluck('slug'),
        ]);
    }
}
