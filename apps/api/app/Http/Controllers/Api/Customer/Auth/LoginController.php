<?php

namespace App\Http\Controllers\Api\Customer\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\RequestOtpRequest;
use App\Http\Requests\Customer\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Wishlist;
use App\Services\Auth\WhatsappOtpService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(
        private readonly WhatsappOtpService $otpService,
    ) {}

    /**
     * POST /api/customer/auth/request-otp
     */
    public function requestOtp(RequestOtpRequest $request): JsonResponse
    {
        $result = $this->otpService->requestOtp(
            phone: $request->validated('phone'),
            ip: $request->ip(),
            locale: $request->validated('locale', 'id')
        );

        if (! $result['success']) {
            return response()->json($result, 429);
        }

        return response()->json($result, 200);
    }

    /**
     * POST /api/customer/auth/verify-otp
     */
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $result = $this->otpService->verifyOtp(
            phone: $request->validated('phone'),
            code: $request->validated('code')
        );

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        $user = $result['user'];

        if ($request->filled('name') && ($user->name === 'Pelanggan' || empty($user->name))) {
            $user->update(['name' => $request->validated('name')]);
        }

        $token = $user->createToken('customer_auth')->plainTextToken;

        // 1. Merge session cart
        $sessionId = $request->validated('session_id') ?? $request->cookie('cart_session');
        if ($sessionId) {
            $this->mergeCart($user->id, $sessionId);
        }

        // 2. Merge session wishlist
        $wishlistSessionId = $request->validated('wishlist_session') ?? $request->cookie('wishlist_session');
        if ($wishlistSessionId) {
            $this->mergeWishlist($user->id, $wishlistSessionId);
        }

        // 3. Link past guest orders with matching phone
        $this->linkGuestOrders($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'expires_at' => null,
            'user' => new UserResource($user),
        ], 200)->withCookie(
            cookie(
                'customer_token',
                $token,
                60 * 24 * 30, // 30 days
                '/',
                null,
                false,
                false,
                false,
                'lax'
            )
        );
    }

    private function mergeCart(int $userId, string $sessionId): void
    {
        $guestCart = Cart::where('session_id', $sessionId)->with('items')->first();
        if (! $guestCart) {
            return;
        }

        $userCart = Cart::where('user_id', $userId)->with('items')->first();

        if (! $userCart) {
            $guestCart->update(['user_id' => $userId]);
            return;
        }

        foreach ($guestCart->items as $item) {
            $existing = $userCart->items()->where('product_id', $item->product_id)->first();
            if ($existing) {
                $existing->increment('qty', $item->qty);
            } else {
                $userCart->items()->create([
                    'product_id' => $item->product_id,
                    'qty' => $item->qty,
                ]);
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();
    }

    private function mergeWishlist(int $userId, string $wishlistSessionId): void
    {
        $guestItems = Wishlist::where('session_id', $wishlistSessionId)->get();

        foreach ($guestItems as $item) {
            $alreadyExists = Wishlist::where('user_id', $userId)
                ->where('product_id', $item->product_id)
                ->exists();

            if (! $alreadyExists) {
                $item->update(['user_id' => $userId]);
            } else {
                $item->delete();
            }
        }
    }

    private function linkGuestOrders($user): void
    {
        $normalizedPhone = WhatsappOtpService::normalizePhone($user->phone);

        Order::whereNull('user_id')
            ->where(function ($q) use ($user, $normalizedPhone) {
                $q->where('wa_pembeli', $user->phone)
                  ->orWhere('wa_pembeli', $normalizedPhone);
            })
            ->update(['user_id' => $user->id]);
    }
}
