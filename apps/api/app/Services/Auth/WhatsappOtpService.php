<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\WhatsappOtp;
use Illuminate\Support\Facades\Hash;

class WhatsappOtpService
{
    public const MAX_REQUESTS_PER_WINDOW = 3;
    public const WINDOW_MINUTES = 10;
    public const OTP_EXPIRY_MINUTES = 5;
    public const MAX_ATTEMPTS = 5;

    public function __construct(
        private readonly WhatsappSender $sender,
    ) {}

    /**
     * Request pengiriman kode OTP ke nomor WhatsApp.
     *
     * Throttle: max 3 OTP per nomor per 10 menit.
     */
    public function requestOtp(string $phone, ?string $ip = null, ?string $locale = 'id'): array
    {
        $normalizedPhone = self::normalizePhone($phone);

        $windowStart = now()->subMinutes(self::WINDOW_MINUTES);
        $recentOtps = WhatsappOtp::where('phone', $normalizedPhone)
            ->where('created_at', '>=', $windowStart)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($recentOtps->count() >= self::MAX_REQUESTS_PER_WINDOW) {
            $oldestInWindow = $recentOtps->first();
            $cooldownRemaining = max(
                1,
                (self::WINDOW_MINUTES * 60) - (int) (now()->timestamp - $oldestInWindow->created_at->timestamp)
            );

            return [
                'success' => false,
                'cooldown_seconds' => $cooldownRemaining,
                'message' => 'Terlalu banyak permintaan OTP. Silakan tunggu beberapa saat.',
            ];
        }

        $code = WhatsappOtp::generateCode();

        WhatsappOtp::create([
            'phone' => $normalizedPhone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::OTP_EXPIRY_MINUTES),
            'attempts' => 0,
            'ip_address' => $ip,
        ]);

        $this->sender->sendOtp($normalizedPhone, $code);

        return [
            'success' => true,
            'cooldown_seconds' => 60,
            'message' => 'Kode OTP berhasil dikirim via WhatsApp.',
        ];
    }

    /**
     * Verifikasi kode OTP.
     */
    public function verifyOtp(string $phone, string $code): array
    {
        $normalizedPhone = self::normalizePhone($phone);

        $otp = WhatsappOtp::where('phone', $normalizedPhone)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if (! $otp) {
            return [
                'success' => false,
                'message' => 'Kode OTP tidak ditemukan atau sudah tidak berlaku.',
                'user' => null,
            ];
        }

        if ($otp->isExpired()) {
            return [
                'success' => false,
                'message' => 'Kode OTP telah kedaluwarsa.',
                'user' => null,
            ];
        }

        if ($otp->isMaxAttempts(self::MAX_ATTEMPTS)) {
            return [
                'success' => false,
                'message' => 'Batas percobaan kode OTP telah tercapai.',
                'user' => null,
            ];
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            return [
                'success' => false,
                'message' => 'Kode OTP salah.',
                'user' => null,
            ];
        }

        $otp->markVerified();

        $user = User::firstOrCreate(
            ['phone' => $normalizedPhone],
            [
                'name' => 'Pelanggan',
                'phone_verified_at' => now(),
                'last_login_at' => now(),
            ]
        );

        if ($user->wasRecentlyCreated === false) {
            $user->update([
                'phone_verified_at' => $user->phone_verified_at ?? now(),
                'last_login_at' => now(),
            ]);
        }

        return [
            'success' => true,
            'message' => 'Verifikasi berhasil.',
            'user' => $user->fresh(),
        ];
    }

    /**
     * Normalisasi nomor telepon: hapus karakter non-digit.
     */
    public static function normalizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?? $phone;
    }
}
