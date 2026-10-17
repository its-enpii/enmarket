<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Product;
use App\Support\PublicCache;
use App\Support\PublicHttpCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Daftar tag publik — agregasi frekuensi dari posts atau products.
 *
 * Agregasi dilakukan di PHP (bukan SQL JSON aggregate) agar portabel antara
 * MySQL 8 dan sqlite :memory: yang dipakai test.
 *
 * Payload di-cache per `type` (public:tags:post|product, TTL 300) dan
 * di-invalidate oleh PublicCacheInvalidator saat Post/Product berubah.
 */
class TagController extends Controller
{
    private const MAX_TAGS = 50;

    /**
     * GET /api/public/tags?type=post|product
     */
    public function index(Request $request): JsonResponse
    {
        $type = $request->input('type', 'post') === 'product' ? 'product' : 'post';

        $cacheKey = $type === 'product' ? PublicCache::TAGS_PRODUCT : PublicCache::TAGS_POST;

        $payload = Cache::remember($cacheKey, PublicCache::TTL, fn () => [
            'data' => $this->aggregate($type),
        ]);

        return PublicHttpCache::json($request, $payload);
    }

    /**
     * @return array<int, array{tag: string, count: int}>
     */
    private function aggregate(string $type): array
    {
        $query = $type === 'product'
            ? Product::query()->active()
            : Post::query()->published();

        $counts = [];

        $query->select('tags')->chunk(500, function ($rows) use (&$counts) {
            foreach ($rows as $row) {
                $tags = $row->tags;
                if (! is_array($tags)) {
                    continue;
                }
                foreach ($tags as $tag) {
                    if (! is_string($tag) || $tag === '') {
                        continue;
                    }
                    $counts[$tag] = ($counts[$tag] ?? 0) + 1;
                }
            }
        });

        // Urut: count desc, lalu tag asc (deterministik).
        uksort($counts, function ($a, $b) use ($counts) {
            return $counts[$b] <=> $counts[$a] ?: strcmp($a, $b);
        });

        $data = [];
        foreach ($counts as $tag => $count) {
            $data[] = ['tag' => $tag, 'count' => $count];
            if (count($data) >= self::MAX_TAGS) {
                break;
            }
        }

        return $data;
    }
}
