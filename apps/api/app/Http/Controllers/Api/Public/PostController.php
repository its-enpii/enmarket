<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public endpoint untuk blog post.
 *
 * Hanya post published yang boleh diakses publik.
 * Endpoint `latest` dipakai homepage section Discover (ambil 2-3 post terbaru).
 * Endpoint `slugs` dipakai sitemap generator.
 */
class PostController extends Controller
{
    /**
     * GET /api/public/posts
     * Query: ?page=1&per_page=12&q=search
     * Return: paginated list post published, diurutkan published_at desc.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 60);

        $query = Post::query()->published();

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderBy('published_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => PostResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/public/posts/latest
     * Query: ?limit=3
     * Return: N post published terbaru (tanpa pagination).
     * Untuk homepage section Discover.
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->input('limit', 3), 1), 12);

        $posts = Post::query()
            ->published()
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => PostResource::collection($posts),
        ]);
    }

    /**
     * GET /api/public/posts/{slug}
     * 404 kalau post tidak published.
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::query()
            ->published()
            ->where('slug', $slug)
            ->first();

        if (! $post) {
            return response()->json(['message' => 'Catatan tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => new PostResource($post),
        ]);
    }

    /**
     * GET /api/public/posts/slugs
     * Untuk sitemap generator.
     */
    public function slugs(): JsonResponse
    {
        $slugs = Post::query()
            ->published()
            ->orderBy('id')
            ->pluck('slug');

        return response()->json([
            'data' => $slugs,
        ]);
    }
}
