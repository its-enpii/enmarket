<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Admin order management.
 *
 * GET /api/admin/orders
 *   Query: ?status=&q=&date_from=&date_to=&page=&per_page=
 *
 * GET /api/admin/orders/{kodeOrder}
 *   Detail + items + deliveries + nested license key.
 *
 * GET /api/admin/orders/stats
 *   Counts per status + revenue_month + paid_month.
 */
class OrderController extends Controller
{
    /**
     * GET /api/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = Order::query()
            ->withCount('items')
            ->latest('created_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->input('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('kode_order', 'like', "%{$q}%")
                    ->orWhere('nama_pembeli', 'like', "%{$q}%")
                    ->orWhere('email_pembeli', 'like', "%{$q}%");
            });
        }

        if ($from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        // Sort — whitelist field untuk cegah SQL injection via sort param
        $sort = $request->input('sort', 'created_at');
        $dir = strtolower((string) $request->input('dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['kode_order', 'nama_pembeli', 'total_harga', 'status', 'created_at', 'paid_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $dir);
        } else {
            $query->orderBy('created_at', 'desc');
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
     * GET /api/admin/orders/{kodeOrder}
     */
    public function show(string $kodeOrder): JsonResponse
    {
        $order = Order::where('kode_order', $kodeOrder)
            ->with(['items.delivery.licenseKey', 'items.product:id,nama,slug'])
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * GET /api/admin/orders/stats
     */
    public function stats(): JsonResponse
    {
        $byStatus = Order::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $monthStart = Carbon::now()->startOfMonth();
        $revenueMonth = (float) Order::query()
            ->where('status', 'paid')
            ->where('paid_at', '>=', $monthStart)
            ->sum('total_harga');
        $paidMonth = (int) Order::query()
            ->where('status', 'paid')
            ->where('paid_at', '>=', $monthStart)
            ->count();

        return response()->json([
            'data' => [
                'total' => (int) array_sum($byStatus->toArray()),
                'pending' => (int) ($byStatus['pending'] ?? 0),
                'paid' => (int) ($byStatus['paid'] ?? 0),
                'failed' => (int) ($byStatus['failed'] ?? 0),
                'expired' => (int) ($byStatus['expired'] ?? 0),
                'refunded' => (int) ($byStatus['refunded'] ?? 0),
                'revenue_month' => $revenueMonth,
                'paid_month' => $paidMonth,
            ],
        ]);
    }
}
