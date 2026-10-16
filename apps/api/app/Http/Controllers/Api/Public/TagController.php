<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Daftar tag publik — agregasi frekuensi dari posts atau products.
 *
 * Agregasi dilakukan di PHP (bukan SQL JSON aggregate) agar portabel antara
 * MySQL 8 dan sqlite :memory: yang dipakai test.
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

        return response()->json(['data' => $data]);
    }
}
