<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistResource;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WishlistController extends Controller
{
    /**
     * GET /api/wishlist — ambil list wishlist by cookie wishlist_session.
     */
    public function index(Request $request): JsonResponse
    {
        $sessionId = $this->resolveSessionId($request);

        $items = Wishlist::where('session_id', $sessionId)
            ->whereHas('product', fn ($q) => $q->active())
            ->with(['product.category:id,nama,slug'])
            ->latest()
            ->get();

        return $this->withCookie(
            response()->json([
                'data' => WishlistResource::collection($items),
                'count' => $items->count(),
            ]),
            $sessionId
        );
    }

    /**
     * POST /api/wishlist/toggle — toggle status wishlist produk.
     */
    public function toggle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'session_id' => ['nullable', 'string', 'max:64'],
        ]);

        $product = Product::find($data['product_id']);
        if (! $product || $product->status !== 'aktif') {
            return response()->json([
                'message' => 'Produk tidak tersedia.',
            ], 422);
        }

        $sessionId = $this->resolveSessionId($request);

        $existing = Wishlist::where('session_id', $sessionId)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $added = false;
        } else {
            Wishlist::create([
                'session_id' => $sessionId,
                'product_id' => $product->id,
            ]);
            $added = true;
        }

        $count = Wishlist::where('session_id', $sessionId)
            ->whereHas('product', fn ($q) => $q->active())
            ->count();

        return $this->withCookie(
            response()->json([
                'added' => $added,
                'count' => $count,
                'message' => $added ? 'Ditambahkan ke wishlist.' : 'Dihapus dari wishlist.',
            ]),
            $sessionId
        );
    }

    /**
     * DELETE /api/wishlist/{productId} — hapus dari wishlist.
     */
    public function destroy(Request $request, int $productId): JsonResponse
    {
        $sessionId = $this->resolveSessionId($request);

        Wishlist::where('session_id', $sessionId)
            ->where('product_id', $productId)
            ->delete();

        $count = Wishlist::where('session_id', $sessionId)
            ->whereHas('product', fn ($q) => $q->active())
            ->count();

        return $this->withCookie(
            response()->json([
                'message' => 'Produk dihapus dari wishlist.',
                'count' => $count,
            ]),
            $sessionId
        );
    }

    private function resolveSessionId(Request $request): string
    {
        $existing = $request->cookie('wishlist_session')
            ?? $request->header('X-Wishlist-Session')
            ?? $request->input('session_id');

        if ($existing && strlen($existing) >= 16 && strlen($existing) <= 64) {
            return $existing;
        }

        return (string) Str::uuid();
    }

    private function withCookie(JsonResponse $response, string $sessionId): JsonResponse
    {
        return $response->withCookie(
            cookie(
                'wishlist_session',
                $sessionId,
                60 * 24 * 30, // 30 days
                '/',
                null,
                false,
                false,
                false,
                'lax'
            )
        );
    }
}
