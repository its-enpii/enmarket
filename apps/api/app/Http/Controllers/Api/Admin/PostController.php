<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\NextRevalidator;
use App\Services\Storage\EnStorageClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin CRUD untuk blog post.
 *
 * Pattern: persis ProductController — multipart, upload thumbnail via EnStorage,
 * slug auto-generate, revalidate Next.js on write.
 */
class PostController extends Controller
{
    public function __construct(
        private readonly EnStorageClient $storage,
        private readonly NextRevalidator $revalidator,
    ) {
    }

    /**
     * GET /api/admin/posts
     * Query: ?status=draft|published|archived&q=title&page=1&per_page=10
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = Post::query()->latest('updated_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

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
     * GET /api/admin/posts/stats
     */
    public function stats(): JsonResponse
    {
        $counts = Post::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'data' => [
                'total' => array_sum($counts->toArray()),
                'draft' => $counts['draft'] ?? 0,
                'published' => $counts['published'] ?? 0,
                'archived' => $counts['archived'] ?? 0,
            ],
        ]);
    }

    /**
     * GET /api/admin/posts/{id}
     */
    public function show(Post $post): JsonResponse
    {
        return response()->json([
            'data' => new PostResource($post),
        ]);
    }

    /**
     * POST /api/admin/posts
     * Multipart: title, slug?, excerpt?, content, status, published_at?, thumbnail?
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePost($request);

        // Status published tapi published_at kosong → set ke now()
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        // Upload thumbnail kalau ada — pakai id post untuk path
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = Str::random(20) . '.' . $ext;
            $path = $this->storage->upload($file, "posts/thumbnails/{$post->id}/{$filename}");
            $post->thumbnail = $path;
            $post->save();
        }

        // Revalidate kalau published
        if ($post->status === 'published') {
            $this->revalidator->revalidatePost($post->slug);
        }

        return response()->json([
            'data' => new PostResource($post->refresh()),
            'message' => 'Catatan berhasil dibuat.',
        ], 201);
    }

    /**
     * PUT /api/admin/posts/{id}
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $wasPublished = $post->status === 'published';
        $oldSlug = $post->slug;

        $data = $this->validatePost($request, $post);

        // Auto-set published_at saat transisi draft → published
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post->update($data);

        // Handle thumbnail upload (replace)
        if ($request->hasFile('thumbnail')) {
            if ($post->thumbnail) {
                $this->storage->delete($post->thumbnail);
            }
            $file = $request->file('thumbnail');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = Str::random(20) . '.' . $ext;
            $path = $this->storage->upload($file, "posts/thumbnails/{$post->id}/{$filename}");
            $post->thumbnail = $path;
            $post->save();
        } elseif ($request->boolean('remove_thumbnail')) {
            if ($post->thumbnail) {
                $this->storage->delete($post->thumbnail);
            }
            $post->thumbnail = null;
            $post->save();
        }

        // Revalidate kalau status publish berubah ATAU slug berubah
        $isPublished = $post->status === 'published';
        if ($isPublished) {
            $this->revalidator->revalidatePost($post->slug);
            if ($oldSlug !== $post->slug) {
                // Slug lama juga perlu revalidate (URL 404)
                $this->revalidator->revalidatePost($oldSlug);
            }
        } elseif ($wasPublished) {
            // Dulu published, sekarang tidak — slug lama jadi 404
            $this->revalidator->revalidatePost($oldSlug);
        }

        return response()->json([
            'data' => new PostResource($post->refresh()),
            'message' => 'Catatan berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/posts/{id}
     * Hapus thumbnail di storage dulu.
     */
    public function destroy(Post $post): JsonResponse
    {
        $slug = $post->slug;
        $wasPublished = $post->status === 'published';

        if ($post->thumbnail) {
            $this->storage->delete($post->thumbnail);
        }

        $post->delete();

        if ($wasPublished) {
            $this->revalidator->revalidatePost($slug);
        }

        return response()->json([
            'message' => 'Catatan berhasil dihapus.',
        ]);
    }

    /**
     * Validation rules untuk store & update.
     */
    private function validatePost(Request $request, ?Post $post = null): array
    {
        $uniqueSlugRule = 'unique:posts,slug';
        if ($post) {
            $uniqueSlugRule = 'unique:posts,slug,' . $post->id;
        }

        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220', 'regex:/^[a-z0-9-]+$/', $uniqueSlugRule],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'published_at' => ['nullable', 'date'],
            'thumbnail' => ['nullable', 'image', 'max:10240'], // 10MB
            'remove_thumbnail' => ['nullable', 'boolean'],
        ]);
    }
}
