<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomRequestResource;
use App\Models\CustomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomRequestController extends Controller
{
    /**
     * GET /api/admin/custom-requests
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $status = $request->input('status');

        $query = CustomRequest::query()->latest();

        if ($status && in_array($status, ['baru', 'diproses', 'selesai', 'dibatalkan'], true)) {
            $query->where('status', $status);
        }

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('wa', 'like', "%{$q}%")
                    ->orWhere('deskripsi', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => CustomRequestResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/custom-requests/stats
     */
    public function stats(): JsonResponse
    {
        $counts = CustomRequest::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        return response()->json([
            'data' => [
                'total' => array_sum($counts),
                'baru' => (int) ($counts['baru'] ?? 0),
                'diproses' => (int) ($counts['diproses'] ?? 0),
                'selesai' => (int) ($counts['selesai'] ?? 0),
                'dibatalkan' => (int) ($counts['dibatalkan'] ?? 0),
            ],
        ]);
    }

    /**
     * GET /api/admin/custom-requests/{id}
     */
    public function show(CustomRequest $customRequest): JsonResponse
    {
        return response()->json([
            'data' => new CustomRequestResource($customRequest),
        ]);
    }

    /**
     * PATCH /api/admin/custom-requests/{id}
     */
    public function update(Request $request, CustomRequest $customRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'required', 'string', 'in:baru,diproses,selesai,dibatalkan'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $customRequest->update($data);

        return response()->json([
            'data' => new CustomRequestResource($customRequest),
            'message' => 'Status permintaan berhasil diperbarui.',
        ]);
    }
}
