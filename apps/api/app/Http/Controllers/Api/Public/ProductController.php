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
            ->with('category:id,nama,slug')
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