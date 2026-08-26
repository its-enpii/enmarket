<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Auth\WhatsappOtpService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * GET /api/customer/orders
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $normalizedPhone = WhatsappOtpService::normalizePhone($user->phone);

        $orders = Order::where(function ($query) use ($user, $normalizedPhone) {
            $query->where('user_id', $user->id)
                ->orWhere('wa_pembeli', $user->phone)
                ->orWhere('wa_pembeli', $normalizedPhone);
        })
            ->with(['items.product.category'])
            ->latest('id')
            ->paginate(10);

        return OrderResource::collection($orders);
    }
}
