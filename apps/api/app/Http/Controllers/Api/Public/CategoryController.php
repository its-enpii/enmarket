<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\PublicCache;
use App\Support\PublicHttpCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * GET /api/public/categories
     * Hanya kategori yang punya minimal 1 produk aktif.
     */
    public function index(Request $request): JsonResponse
    {
        $payload = Cache::remember(PublicCache::CATEGORIES, PublicCache::TTL, function () {
            $categories = Category::query()
                ->withCount(['products' => fn ($q) => $q->where('status', 'aktif')])
                ->has('products')
                ->orderBy('nama')
                ->get();

            // Serialize di dalam closure → cache berisi array polos.
            return [
                'data' => CategoryResource::collection($categories)->resolve(),
            ];
        });

        return PublicHttpCache::json($request, $payload);
    }

    /**
     * GET /api/public/categories/slugs
     * Untuk sitemap.
     */
    public function slugs(Request $request): JsonResponse
    {
        $payload = Cache::remember(PublicCache::CATEGORIES_SLUGS, PublicCache::TTL, fn () => [
            'data' => Category::query()
                ->whereHas('products', fn ($q) => $q->where('status', 'aktif'))
                ->orderBy('id')
                ->pluck('slug')
                ->all(),
        ]);

        return PublicHttpCache::json($request, $payload);
    }
}
