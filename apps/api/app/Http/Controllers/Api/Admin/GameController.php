<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = Game::query()->with('items')->latest('updated_at');

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => GameResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'icon_url' => ['nullable', 'string', 'max:500'],
            'banner_url' => ['nullable', 'string', 'max:500'],
            'requires_server_id' => ['boolean'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['integer'],
            'active' => ['boolean'],
            'digiflazz_category' => ['nullable', 'string', 'max:255'],
        ]);

        $game = Game::create($validated);
        $game->load('items');

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Game berhasil dibuat.',
        ], 201);
    }

    public function show(Game $game): JsonResponse
    {
        $game->load('items');

        return response()->json([
            'data' => new GameResource($game),
        ]);
    }

    public function update(Request $request, Game $game): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'icon_url' => ['nullable', 'string', 'max:500'],
            'banner_url' => ['nullable', 'string', 'max:500'],
            'requires_server_id' => ['boolean'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['integer'],
            'active' => ['boolean'],
            'digiflazz_category' => ['nullable', 'string', 'max:255'],
        ]);

        $game->update($validated);
        $game->load('items');

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Game berhasil diperbarui.',
        ]);
    }

    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json([
            'message' => 'Game berhasil dihapus.',
        ]);
    }
}
