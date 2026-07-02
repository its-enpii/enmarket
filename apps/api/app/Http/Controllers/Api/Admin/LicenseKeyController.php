<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LicenseKeyRequest;
use App\Http\Resources\LicenseKeyResource;
use App\Models\LicenseKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin license key pool management.
 *
 * GET    /api/admin/license-keys              — list + filter
 * GET    /api/admin/license-keys/{id}         — detail + product + recent deliveries
 * POST   /api/admin/license-keys              — insert manual batch
 * POST   /api/admin/license-keys/{id}/revoke  — set status=dicabut
 * POST   /api/admin/license-keys/{id}/extend  — extend expired_at
 */
class LicenseKeyController extends Controller
{
    /**
     * GET /api/admin/license-keys
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = LicenseKey::query()
            ->with('product:id,nama,slug')
            ->latest('id');

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->input('q')) {
            $query->where('key', 'like', "%{$q}%");
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => LicenseKeyResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/license-keys/{id}
     */
    public function show(int $id): JsonResponse
    {
        $key = LicenseKey::query()
            ->with([
                'product:id,nama,slug',
                'deliveries.orderItem.order:id,kode_order',
            ])
            ->find($id);

        if (! $key) {
            return response()->json([
                'message' => 'License key tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => new LicenseKeyResource($key),
        ]);
    }

    /**
     * POST /api/admin/license-keys
     * Insert manual batch. Generate pakai pattern yang sama dengan seeder.
     */
    public function store(LicenseKeyRequest $request): JsonResponse
    {
        $productId = $request->integer('product_id');
        $count = $request->integer('count');
        $prefix = strtoupper((string) $request->input('prefix', 'ADMIN'));

        $batch = [];
        $now = now();

        for ($i = 0; $i < $count; $i++) {
            $batch[] = [
                'product_id' => $productId,
                'key' => LicenseKey::generateKey($prefix),
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        LicenseKey::insert($batch);

        Log::info('Admin manual insert license keys', [
            'product_id' => $productId,
            'count' => $count,
            'prefix' => $prefix,
        ]);

        return response()->json([
            'message' => "{$count} license keys berhasil di-generate.",
            'count' => $count,
        ], 201);
    }

    /**
     * POST /api/admin/license-keys/{id}/revoke
     * Idempotent — kalau sudah dicabut, return 200 dengan status unchanged.
     */
    public function revoke(int $id): JsonResponse
    {
        $key = LicenseKey::find($id);
        if (! $key) {
            return response()->json([
                'message' => 'License key tidak ditemukan.',
            ], 404);
        }

        if ($key->status === 'dicabut') {
            return response()->json([
                'message' => 'License key sudah dicabut.',
                'license' => new LicenseKeyResource($key->load('product:id,nama,slug')),
            ]);
        }

        $key->update(['status' => 'dicabut']);
        $key->refresh();

        Log::info('Admin revoke license key', [
            'key_id' => $id,
            'product_id' => $key->product_id,
        ]);

        return response()->json([
            'message' => 'License key dicabut.',
            'license' => new LicenseKeyResource($key->load('product:id,nama,slug')),
        ]);
    }

    /**
     * POST /api/admin/license-keys/{id}/extend
     * Body: { days: int }
     * Set expired_at = now() + days (replace existing).
     */
    public function extend(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'days' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        $key = LicenseKey::find($id);
        if (! $key) {
            return response()->json([
                'message' => 'License key tidak ditemukan.',
            ], 404);
        }

        $newExpiry = now()->addDays($request->integer('days'));
        $key->update(['expired_at' => $newExpiry]);
        $key->refresh();

        Log::info('Admin extend license expiry', [
            'key_id' => $id,
            'days' => $request->integer('days'),
            'new_expired_at' => $newExpiry->toIso8601String(),
        ]);

        return response()->json([
            'message' => "Expiry diperpanjang {$request->integer('days')} hari.",
            'license' => new LicenseKeyResource($key->load('product:id,nama,slug')),
        ]);
    }
}
