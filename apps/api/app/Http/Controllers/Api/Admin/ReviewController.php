<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * GET /api/admin/reviews
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $status = $request->input('is_published');
        $rating = $request->input('rating');
        $productId = $request->input('product_id');

        $query = Review::with(['product', 'order'])->latest();

        if ($status !== null && $status !== '') {
            $query->where('is_published', filter_var($status, FILTER_VALIDATE_BOOLEAN));
        }

        if ($rating && in_array((int) $rating, [1, 2, 3, 4, 5], true)) {
            $query->where('rating', (int) $rating);
        }

        if ($productId) {
            $query->where('product_id', (int) $productId);
        }

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('buyer_name', 'like', "%{$q}%")
                    ->orWhere('comment', 'like', "%{$q}%")
                    ->orWhereHas('product', fn ($p) => $p->where('nama', 'like', "%{$q}%"))
                    ->orWhereHas('order', fn ($o) => $o->where('kode_order', 'like', "%{$q}%"));
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => ReviewResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/reviews/stats
     */
    public function stats(): JsonResponse
    {
        $total = Review::count();
        $published = Review::where('is_published', true)->count();
        $hidden = Review::where('is_published', false)->count();
        $avgRating = $total > 0 ? round(Review::avg('rating'), 1) : 0.0;

        return response()->json([
            'data' => [
                'total' => $total,
                'published' => $published,
                'hidden' => $hidden,
                'average_rating' => (float) $avgRating,
            ],
        ]);
    }

    /**
     * PATCH /api/admin/reviews/{id}
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        $data = $request->validate([
            'is_published' => ['sometimes', 'boolean'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $review->update($data);

        return response()->json([
            'data' => new ReviewResource($review->fresh(['product', 'order'])),
            'message' => 'Status ulasan berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/reviews/{id}
     */
    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'message' => 'Ulasan berhasil dihapus.',
        ]);
    }
}
