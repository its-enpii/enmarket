<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameItemResource;
use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameItemController extends Controller
{
    public function index(Game $game): JsonResponse
    {
        $items = $game->items()->orderBy('sort_order')->get();

        return response()->json([
            'data' => GameItemResource::collection($items),
        ]);
    }

    public function store(Request $request, Game $game): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'harga' => ['required', 'numeric', 'min:0'],
            'digiflazz_sku' => ['required', 'string', 'max:255'],
            'digiflazz_category' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['integer'],
            'active' => ['boolean'],
        ]);

        $item = $game->items()->create($validated);

        return response()->json([
            'data' => new GameItemResource($item),
            'message' => 'Item berhasil dibuat.',
        ], 201);
    }

    public function show(GameItem $item): JsonResponse
    {
        return response()->json([
            'data' => new GameItemResource($item),
        ]);
    }

    public function update(Request $request, GameItem $item): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['sometimes', 'string', 'max:255'],
            'harga' => ['sometimes', 'numeric', 'min:0'],
            'digiflazz_sku' => ['sometimes', 'string', 'max:255'],
            'digiflazz_category' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['integer'],
            'active' => ['boolean'],
        ]);

        $item->update($validated);

        return response()->json([
            'data' => new GameItemResource($item),
            'message' => 'Item berhasil diperbarui.',
        ]);
    }

    public function destroy(GameItem $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus.',
        ]);
    }
}
