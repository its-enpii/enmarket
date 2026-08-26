<?php

namespace App\Http\Controllers\Api\Customer;

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
     * GET /api/customer/wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Wishlist::where('user_id', $user->id)
            ->whereHas('product', fn ($q) => $q->active())
            ->with(['product.category:id,nama,slug'])
            ->latest('id')
            ->get();

        return response()->json([
            'data' => WishlistResource::collection($items),
            'count' => $items->count(),
        ]);
    }

    /**
     * POST /api/customer/wishlist/toggle
     */
    public function toggle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $product = Product::find($data['product_id']);
        if (! $product || $product->status !== 'aktif') {
            return response()->json([
                'message' => 'Produk tidak tersedia.',
            ], 422);
        }

        $user = $request->user();

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $added = false;
        } else {
            $sessionId = (string) ($request->cookie('wishlist_session') ?: Str::uuid());
            Wishlist::create([
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'product_id' => $product->id,
            ]);
            $added = true;
        }

        $count = Wishlist::where('user_id', $user->id)
            ->whereHas('product', fn ($q) => $q->active())
            ->count();

        return response()->json([
            'added' => $added,
            'count' => $count,
            'message' => $added ? 'Ditambahkan ke wishlist.' : 'Dihapus dari wishlist.',
        ]);
    }

    /**
     * DELETE /api/customer/wishlist/{productId}
     */
    public function destroy(Request $request, int $productId): JsonResponse
    {
        $user = $request->user();

        Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        $count = Wishlist::where('user_id', $user->id)
            ->whereHas('product', fn ($q) => $q->active())
            ->count();

        return response()->json([
            'message' => 'Produk dihapus dari wishlist.',
            'count' => $count,
        ]);
    }
}
