<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavMenu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavMenuController extends Controller
{
    public function index(): JsonResponse
    {
        $menus = NavMenu::query()
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get();

        return response()->json(['data' => $menus]);
    }

    public function update(Request $request, NavMenu $navMenu): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'is_enabled' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        if (array_key_exists('label', $validated)) {
            $validated['label'] = $validated['label'] ?: null;
        }

        $navMenu->update($validated);

        return response()->json([
            'data' => $navMenu->fresh(),
            'message' => 'Nav menu updated.',
        ]);
    }
}
