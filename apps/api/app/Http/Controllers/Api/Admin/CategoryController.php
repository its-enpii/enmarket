<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\NextRevalidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(private readonly NextRevalidator $revalidator) {}

    /**
     * GET /api/admin/categories
     * List semua kategori, diurutkan berdasarkan nama.
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('nama')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * POST /api/admin/categories
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $category = Category::create($data);

        // Trigger ISR revalidation — slug mungkin baru dibuat
        $this->revalidator->revalidateCategory($category->slug);

        return response()->json([
            'data' => new CategoryResource($category->loadCount('products')),
            'message' => 'Kategori berhasil dibuat.',
        ], 201);
    }

    /**
     * GET /api/admin/categories/{id}
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'data' => new CategoryResource($category->loadCount('products')),
        ]);
    }

    /**
     * PUT /api/admin/categories/{id}
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update($data);

        // Slug bisa berubah — revalidate slug baru DAN lama (kalau beda)
        $this->revalidator->revalidateCategory($category->slug);

        return response()->json([
            'data' => new CategoryResource($category->loadCount('products')),
            'message' => 'Kategori berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/categories/{id}
     * Tolak 409 jika masih ada produk.
     */
    public function destroy(Category $category): JsonResponse
    {
        $count = $category->products()->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Kategori tidak bisa dihapus — masih ada {$count} produk di dalamnya.",
                'code' => 'category_has_products',
            ], 409);
        }

        $slug = $category->slug;
        $category->delete();

        // Halaman /c/{slug} sudah tidak relevan
        $this->revalidator->revalidateCategory($slug);

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
