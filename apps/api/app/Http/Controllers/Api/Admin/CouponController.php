<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    /**
     * GET /api/admin/coupons
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $status = $request->input('status');

        $query = Coupon::query()->latest();

        if ($status === 'active') {
            $query->where('active', true);
        } elseif ($status === 'inactive') {
            $query->where('active', false);
        } elseif ($status === 'expired') {
            $query->where('valid_until', '<', now());
        }

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where('code', 'like', "%".strtoupper($q)."%");
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => CouponResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/coupons/stats
     */
    public function stats(): JsonResponse
    {
        $total = Coupon::count();
        $active = Coupon::where('active', true)->count();
        $inactive = Coupon::where('active', false)->count();
        $expired = Coupon::where('valid_until', '<', now())->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'expired' => $expired,
            ],
        ]);
    }

    /**
     * POST /api/admin/coupons
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'string', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'active' => ['nullable', 'boolean'],
        ]);

        $coupon = Coupon::create($data);

        return response()->json([
            'data' => new CouponResource($coupon),
            'message' => 'Kupon berhasil dibuat.',
        ], 201);
    }

    /**
     * GET /api/admin/coupons/{id}
     */
    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'data' => new CouponResource($coupon),
        ]);
    }

    /**
     * PATCH /api/admin/coupons/{id}
     */
    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'type' => ['sometimes', 'required', 'string', 'in:percent,fixed'],
            'value' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'active' => ['nullable', 'boolean'],
        ]);

        $coupon->update($data);

        return response()->json([
            'data' => new CouponResource($coupon),
            'message' => 'Kupon berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/coupons/{id} — soft delete (set active = false)
     */
    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->update(['active' => false]);

        return response()->json([
            'message' => 'Kupon berhasil dinonaktifkan.',
        ]);
    }
}
