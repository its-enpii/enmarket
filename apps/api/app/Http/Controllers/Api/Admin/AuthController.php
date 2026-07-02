<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

/**
 * Admin auth — single user via static token dari ADMIN_TOKEN env.
 *
 * Flow:
 *  1. POST /api/admin/login { token } → cocokkan dengan env, set cookie
 *  2. POST /api/admin/logout → hapus cookie
 *  3. GET /api/admin/me → cek cookie/header, return info
 */
class AuthController extends Controller
{
    /**
     * Login admin — verifikasi token dan set cookie httpOnly.
     *
     * POST /api/admin/login
     * Body: { "token": "xxx" }
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $expected = (string) config('app.admin_token', '');

        if ($expected === '') {
            return response()->json([
                'message' => 'Admin token belum dikonfigurasi di server.',
                'code' => 'admin_token_missing',
            ], 503);
        }

        if (! hash_equals($expected, $data['token'])) {
            throw ValidationException::withMessages([
                'token' => 'Token salah.',
            ]);
        }

        // Set cookie httpOnly 7 hari — Next.js server forward via Authorization header
        $cookie = cookie(
            'admin_token',
            $data['token'],
            60 * 24 * 7, // 7 hari dalam menit
            '/',
            null,
            false, // secure (false untuk dev HTTP)
            true,  // httpOnly
            false, // raw
            'lax'  // sameSite
        );

        return response()
            ->json(['message' => 'Login berhasil.', 'authenticated' => true])
            ->withCookie($cookie);
    }

    /**
     * Logout — hapus cookie admin_token.
     *
     * POST /api/admin/logout
     */
    public function logout(): JsonResponse
    {
        $cookie = cookie()->forget('admin_token');

        return response()
            ->json(['message' => 'Logout berhasil.', 'authenticated' => false])
            ->withCookie($cookie);
    }

    /**
     * Cek apakah user authenticated. Dipakai untuk validasi session di frontend.
     *
     * GET /api/admin/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'authenticated' => true,
            'service' => config('app.name'),
            'env' => config('app.env'),
        ]);
    }
}