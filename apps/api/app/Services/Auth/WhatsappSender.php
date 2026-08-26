<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappSender
{
    /**
     * Kirim pesan WhatsApp OTP melalui Evolution API.
     */
    public function sendOtp(string $phone, string $code): bool
    {
        $message = "[enpiistudio] Kode verifikasi Anda: {$code}\n"
            ."Berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.\n\n"
            ."[enpiistudio] Your verification code: {$code}\n"
            ."Valid for 5 minutes. Do not share this code with anyone.";

        $apiUrl = config('services.evolution.url');
        $apiKey = config('services.evolution.api_key');
        $instance = config('services.evolution.instance', 'enpiistudio');

        // Mode development / log jika URL belum dikonfigurasi
        if (empty($apiUrl)) {
            Log::info("WhatsApp OTP to {$phone}: {$code}");
            return true;
        }

        $destination = $this->formatDestination($phone);
        $endpoint = rtrim($apiUrl, '/')."/message/sendText/{$instance}";

        try {
            $response = Http::withHeaders([
                'apikey' => (string) $apiKey,
                'Authorization' => 'Bearer '.(string) $apiKey,
            ])->timeout(10)->post($endpoint, [
                'number' => $destination,
                'text' => $message,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Evolution API WhatsApp send failure', [
                'status' => $response->status(),
                'body' => $response->body(),
                'phone' => $phone,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Evolution API WhatsApp exception', [
                'error' => $e->getMessage(),
                'phone' => $phone,
            ]);

            return false;
        }
    }

    /**
     * Format nomor tujuan untuk Evolution API (standar 628xxx).
     */
    private function formatDestination(string $phone): string
    {
        $digits = preg_replace('/[^0-9]/', '', $phone) ?? '';

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }
}
