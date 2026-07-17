<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ActivityController — list recent activity untuk dashboard admin.
 *
 * Append-only log. Filter sederhana (subject_type, since). Pagination pakai
 * shape yang sama dengan List* endpoints frontend (current_page, last_page,
 * per_page, total).
 */
class ActivityController extends Controller
{
    /**
     * GET /api/admin/activity
     * Query: ?subject_type=&since=24h&per_page=20&page=1
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        $query = ActivityLog::query()->latest('created_at');

        if ($type = $request->input('subject_type')) {
            $query->where('subject_type', $type);
        }

        if ($since = $request->input('since')) {
            // Parse "24h" / "7d" / "30m" → seconds
            $seconds = $this->parseSince($since);
            if ($seconds !== null) {
                $query->where('created_at', '>=', now()->subSeconds($seconds));
            }
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
     * Parse "24h" / "7d" / "30m" / "60s" → seconds (used via Carbon::subSeconds).
     */
    private function parseSince(string $value): ?int
    {
        if (! preg_match('/^(\d+)([smhd])$/', $value, $m)) {
            return null;
        }
        $n = (int) $m[1];

        return match ($m[2]) {
            's' => $n,
            'm' => $n * 60,
            'h' => $n * 3600,
            'd' => $n * 86400,
            default => null,
        };
    }
}
