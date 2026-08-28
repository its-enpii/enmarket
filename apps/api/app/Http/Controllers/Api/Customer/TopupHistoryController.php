<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TopupHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = $user->orders()
            ->whereNotNull('game_item_id')
            ->with(['game', 'gameItem'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
}
