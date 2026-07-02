<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Cek status API + koneksi database.
     *
     * GET /api/health
     */
    public function index(Request $request): JsonResponse
    {
        $dbOk = false;
        $dbError = null;

        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable $e) {
            $dbError = $e->getMessage();
        }

        return response()->json([
            'status' => $dbOk ? 'ok' : 'degraded',
            'service' => config('app.name', 'enmarket-api'),
            'env' => config('app.env'),
            'time' => now()->toIso8601String(),
            'db' => [
                'connected' => $dbOk,
                'driver' => config('database.default'),
                'error' => $dbError,
            ],
        ], $dbOk ? 200 : 503);
    }
}
