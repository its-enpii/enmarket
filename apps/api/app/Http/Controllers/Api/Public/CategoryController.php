<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/public/categories
     * Hanya kategori yang punya minimal 1 produk aktif.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['products' => fn ($q) => $q->where('status', 'aktif')])
            ->has('products')
            ->orderBy('nama')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * GET /api/public/categories/slugs
     * Untuk sitemap.
     */
    public function slugs(): JsonResponse
    {
        return response()->json([
            'data' => Category::query()
                ->whereHas('products', fn ($q) => $q->where('status', 'aktif'))
                ->orderBy('id')
                ->pluck('slug'),
        ]);
    }
}