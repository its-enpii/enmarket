<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\PreorderReleaseQueue;
use App\Services\Delivery\PreorderReleaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin pre-order release management.
 *
 * Endpoints:
 *   GET    /api/admin/preorders                            — list awaiting/released/all
 *   GET    /api/admin/preorders/stats                      — count per status untuk dashboard tile
 *   GET    /api/admin/preorders/{order}                    — order detail (kode_order)
 *   POST   /api/admin/preorders/{order}/release-now        — trigger release manual
 *   POST   /api/admin/preorders/{order}/update-release-date — postpone/prepone release
 */
class PreorderController extends Controller
{
    public function __construct(
        private readonly PreorderReleaseService $releaseService,
    ) {}

    /**
     * GET /api/admin/preorders?status=awaiting|released|all
     *
     * `awaiting` = status='preorder_deposit_paid' (default)
     * `released` = preorder_release_processed_at NOT NULL (status=paid)
     * `all`      = semua order preorder (is_preorder=1)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $status = $request->input('status', 'awaiting');

        $query = Order::query()
            ->where('is_preorder', true)
            ->with(['items:id,order_id,nama_produk,tipe_produk'])
            ->latest('preorder_release_date');

        if ($status === 'awaiting') {
            $query->where('status', 'preorder_deposit_paid');
        } elseif ($status === 'released') {
            $query->where('status', 'paid')
                ->whereNotNull('preorder_release_processed_at');
        }
        // 'all' → no extra filter

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('kode_order', 'like', "%{$q}%")
                    ->orWhere('nama_pembeli', 'like', "%{$q}%")
                    ->orWhere('email_pembeli', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => OrderResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/preorders/stats — count per status untuk dashboard tile.
     */
    public function stats(): JsonResponse
    {
        $counts = Order::query()
            ->where('is_preorder', true)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $awaiting = (int) ($counts['preorder_deposit_paid'] ?? 0);
        // "released" = status=paid + has preorder_release_processed_at
        $released = (int) Order::query()
            ->where('is_preorder', true)
            ->where('status', 'paid')
            ->whereNotNull('preorder_release_processed_at')
            ->count();

        return response()->json([
            'data' => [
                'awaiting' => $awaiting,
                'released' => $released,
                'total' => array_sum($counts),
            ],
        ]);
    }

    /**
     * GET /api/admin/preorders/{order}
     * `order` = kode_order (string format EPS-YYYYMMDD-XXXXX).
     */
    public function show(string $order): JsonResponse
    {
        $orderModel = Order::query()
            ->where('kode_order', $order)
            ->where('is_preorder', true)
            ->with(['items.product:id,nama,slug,tipe', 'items.delivery', 'items.accountProvisioning'])
            ->first();

        if (! $orderModel) {
            return response()->json([
                'message' => 'Pre-order tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => (new OrderResource($orderModel))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/preorders/{order}/release-now
     *
     * Trigger release pre-order: claim license dari pool, generate file delivery,
     * dispatch notifikasi (event preorder.ready ke n8n).
     * Idempotent — kalau sudah pernah diproses, return 200 dengan info no-op.
     */
    public function releaseNow(string $order): JsonResponse
    {
        $orderModel = Order::where('kode_order', $order)->first();
        if (! $orderModel || ! $orderModel->isPreorder()) {
            return response()->json([
                'message' => 'Pre-order tidak ditemukan.',
            ], 404);
        }

        if (! $orderModel->isAwaitingRelease()) {
            return response()->json([
                'message' => 'Order ini tidak dalam status menunggu release.',
                'code' => 'not_awaiting_release',
                'current_status' => $orderModel->status,
            ], 422);
        }

        try {
            $released = $this->releaseService->releaseOrder($orderModel);
        } catch (\Throwable $e) {
            Log::error('PreorderController: release failed', [
                'kode_order' => $order,
                'order_id' => $orderModel->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Release gagal diproses. Coba lagi atau cek log.',
                'code' => 'release_failed',
            ], 500);
        }

        if (! $released) {
            return response()->json([
                'message' => 'Pre-order sudah pernah di-release sebelumnya.',
                'code' => 'already_released',
                'processed_at' => $orderModel->preorder_release_processed_at?->toIso8601String(),
            ], 200);
        }

        Log::info('Admin release preorder', [
            'kode_order' => $order,
            'order_id' => $orderModel->id,
        ]);

        return response()->json([
            'message' => 'Pre-order berhasil di-release. Notifikasi buyer sudah dikirim.',
            'data' => (new OrderResource($orderModel->fresh()->load('items.delivery')))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/preorders/{order}/update-release-date
     * Body: { release_date: 'YYYY-MM-DD' }
     *
     * Admin boleh postpone/prepone tanggal rilis. Update order + queue row
     * supaya release trigger (saat admin click Release Now) tetap pakai tanggal baru.
     */
    public function updateReleaseDate(Request $request, string $order): JsonResponse
    {
        $data = $request->validate([
            'release_date' => ['required', 'date'],
        ]);

        $orderModel = Order::where('kode_order', $order)->first();
        if (! $orderModel || ! $orderModel->isPreorder()) {
            return response()->json(['message' => 'Pre-order tidak ditemukan.'], 404);
        }

        // Refuse update kalau sudah pernah di-release — release_date jadi tidak relevan.
        if ($orderModel->preorder_release_processed_at !== null) {
            return response()->json([
                'message' => 'Pre-order sudah di-release. Tidak bisa ubah tanggal.',
                'code' => 'already_released',
            ], 422);
        }

        $newDate = $data['release_date'];

        $orderModel->forceFill(['preorder_release_date' => $newDate])->save();

        // Sync queue row (kalau ada — order belum release berarti queue row processed_at masih NULL).
        $queueRow = PreorderReleaseQueue::query()->where('order_id', $orderModel->id)->first();
        if ($queueRow && $queueRow->processed_at === null) {
            $queueRow->forceFill(['release_date' => $newDate])->save();
        }

        return response()->json([
            'message' => 'Tanggal rilis diperbarui.',
            'data' => [
                'kode_order' => $orderModel->kode_order,
                'preorder_release_date' => $newDate,
            ],
        ]);
    }
}