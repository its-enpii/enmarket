<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomBuildRequest;
use App\Mail\CustomBuildRequestNotification;
use App\Models\CustomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CustomRequestController extends Controller
{
    /**
     * POST /api/custom-requests — submit form custom request build.
     */
    public function store(CustomBuildRequest $request): JsonResponse
    {
        $customRequest = CustomRequest::create($request->validated());

        try {
            $adminEmail = config('mail.from.address') ?: 'admin@enpiistudio.com';
            Mail::to($adminEmail)->send(new CustomBuildRequestNotification($customRequest));
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim email notifikasi custom request: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'request_id' => $customRequest->id,
            'message' => 'Permintaan kustom berhasil dikirim.',
        ], 201);
    }
}
