<?php

namespace App\Http\Controllers\Api\Customer\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    /**
     * POST /api/customer/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ])->withoutCookie('customer_token');
    }
}
