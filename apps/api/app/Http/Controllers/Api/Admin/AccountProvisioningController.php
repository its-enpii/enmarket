<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccountProvisioningRequest;
use App\Models\AccountProvisioning;
use App\Services\Delivery\AccountProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin provisioning queue management.
 *
 * GET    /api/admin/account-provisionings              — list + filter
 * GET    /api/admin/account-provisionings/stats        — count per status
 * GET    /api/admin/account-provisionings/{id}         — detail
 * POST   /api/admin/account-provisionings/{id}/mark-ready   — admin input kredensial
 * POST   /api/admin/account-provisionings/{id}/regenerate  — ganti kredensial
 * POST   /api/admin/account-provisionings/{id}/resend       — re-trigger notif buyer
 */
class AccountProvisioningController extends Controller
{
    public function __construct(
        private readonly AccountProvisioningService $service,
    ) {}

    /**
     * GET /api/admin/account-provisionings
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $query = AccountProvisioning::query()
            ->with([
                'orderItem:id,order_id,product_id,nama_produk,tipe_produk',
                'orderItem.order:id,kode_order,nama_pembeli,email_pembeli,status,paid_at',
            ])
            ->latest('id');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($kodeOrder = $request->input('kode_order')) {
            $query->whereHas('orderItem.order', function ($q) use ($kodeOrder) {
                $q->where('kode_order', $kodeOrder);
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/account-provisionings/stats
     * Count per status untuk dashboard tile.
     */
    public function stats(): JsonResponse
    {
        $counts = AccountProvisioning::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        return response()->json([
            'data' => [
                'menunggu_admin' => (int) ($counts['menunggu_admin'] ?? 0),
                'siap' => (int) ($counts['siap'] ?? 0),
                'gagal' => (int) ($counts['gagal'] ?? 0),
                'dibatalkan' => (int) ($counts['dibatalkan'] ?? 0),
                'total' => array_sum($counts),
            ],
        ]);
    }

    /**
     * GET /api/admin/account-provisionings/{id}
     */
    public function show(int $id): JsonResponse
    {
        $prov = AccountProvisioning::query()
            ->with([
                'orderItem:id,order_id,product_id,nama_produk,tipe_produk',
                'orderItem.order:id,kode_order,nama_pembeli,email_pembeli,wa_pembeli,status,paid_at',
            ])
            ->find($id);

        if (! $prov) {
            return response()->json([
                'message' => 'Provisioning tidak ditemukan.',
            ], 404);
        }

        return response()->json(['data' => $prov]);
    }

    /**
     * POST /api/admin/account-provisionings/{id}/mark-ready
     */
    public function markReady(AccountProvisioningRequest $request, int $id): JsonResponse
    {
        $prov = AccountProvisioning::find($id);
        if (! $prov) {
            return response()->json(['message' => 'Provisioning tidak ditemukan.'], 404);
        }

        if ($prov->isReady()) {
            return response()->json([
                'message' => 'Provisioning sudah siap. Pakai regenerate untuk ganti kredensial.',
            ], 422);
        }

        $credentials = $request->input('credentials');
        // Strip field null/kosong agar payload ke buyer ringkas
        $credentials = array_filter($credentials, fn ($v) => $v !== null && $v !== '');

        $prov = $this->service->markReady(
            $prov,
            $credentials,
            $request->input('catatan'),
            $this->adminLabel($request),
        );

        Log::info('Admin mark-ready account provisioning', [
            'provisioning_id' => $id,
            'order_item_id' => $prov->order_item_id,
        ]);

        return response()->json([
            'message' => 'Provisioning ditandai siap. Notifikasi email + WA akan dikirim ke buyer.',
            'data' => $prov->fresh()->load('orderItem.order:id,kode_order,nama_pembeli,email_pembeli,wa_pembeli,status,paid_at'),
        ]);
    }

    /**
     * POST /api/admin/account-provisionings/{id}/regenerate
     */
    public function regenerate(AccountProvisioningRequest $request, int $id): JsonResponse
    {
        $prov = AccountProvisioning::find($id);
        if (! $prov) {
            return response()->json(['message' => 'Provisioning tidak ditemukan.'], 404);
        }

        if (! $prov->isReady()) {
            return response()->json([
                'message' => 'Provisioning belum siap. Pakai mark-ready untuk pertama kali.',
            ], 422);
        }

        $credentials = $request->input('credentials');
        $credentials = array_filter($credentials, fn ($v) => $v !== null && $v !== '');

        $prov = $this->service->regenerate($prov, $credentials, $this->adminLabel($request));

        Log::info('Admin regenerate account provisioning', [
            'provisioning_id' => $id,
            'order_item_id' => $prov->order_item_id,
        ]);

        return response()->json([
            'message' => 'Kredensial diperbarui. Notifikasi baru terkirim ke buyer.',
            'data' => $prov->fresh()->load('orderItem.order:id,kode_order,nama_pembeli,email_pembeli,wa_pembeli,status,paid_at'),
        ]);
    }

    /**
     * POST /api/admin/account-provisionings/{id}/resend
     */
    public function resend(int $id): JsonResponse
    {
        $prov = AccountProvisioning::find($id);
        if (! $prov) {
            return response()->json(['message' => 'Provisioning tidak ditemukan.'], 404);
        }

        try {
            $this->service->resend($prov);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        Log::info('Admin resend account ready notification', [
            'provisioning_id' => $id,
        ]);

        return response()->json([
            'message' => 'Notifikasi sedang dikirim ulang.',
        ]);
    }

    /**
     * Repo enmarket tidak punya tabel admins — auth pakai static token.
     * Pakai suffix token sebagai audit trail identifier.
     */
    private function adminLabel(Request $request): string
    {
        $token = (string) $request->cookie('admin_token', '');
        if ($token === '') {
            $token = (string) $request->header('Authorization', '');
            $token = preg_replace('/^Bearer\s+/i', '', $token);
        }
        $token = trim($token);

        return $token !== '' ? 'admin:'.substr(hash('sha256', $token), 0, 8) : 'admin:unknown';
    }
}
