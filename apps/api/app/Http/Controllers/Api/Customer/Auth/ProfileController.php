<?php

namespace App\Http\Controllers\Api\Customer\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\WhatsappOtpService;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * PUT /api/customer/auth/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = [];

        if ($request->filled('name')) {
            $data['name'] = $request->validated('name');
        }

        if ($request->filled('email')) {
            $data['email'] = $request->validated('email');
        }

        if ($request->filled('phone')) {
            $newPhone = WhatsappOtpService::normalizePhone($request->validated('phone'));

            $exists = User::where('phone', $newPhone)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Nomor WhatsApp sudah digunakan oleh akun lain.',
                    'errors' => [
                        'phone' => ['Nomor WhatsApp sudah digunakan oleh akun lain.'],
                    ],
                ], 422);
            }

            $data['phone'] = $newPhone;
        }

        if (! empty($data)) {
            $user->update($data);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => new UserResource($user->fresh()),
        ]);
    }
}
