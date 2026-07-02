<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verify admin token dari Authorization header atau cookie `admin_token`.
 *
 * Token cocok dengan `ADMIN_TOKEN` di .env (timing-safe compare).
 * Endpoint yang pakai middleware ini otomatis protected.
 */
class VerifyAdminToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('app.admin_token', '');

        if ($expected === '') {
            return response()->json([
                'message' => 'Admin token belum dikonfigurasi di server.',
                'code' => 'admin_token_missing',
            ], 503);
        }

        $token = $this->extractToken($request);

        if ($token === null || ! hash_equals($expected, $token)) {
            return response()->json([
                'message' => 'Tidak terautentikasi.',
                'code' => 'unauthenticated',
            ], 401);
        }

        return $next($request);
    }

    /**
     * Ambil token dari Authorization header (`Bearer xxx`) atau cookie `admin_token`.
     */
    private function extractToken(Request $request): ?string
    {
        $auth = $request->header('Authorization');
        if ($auth && str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }

        return $request->cookie('admin_token');
    }
}