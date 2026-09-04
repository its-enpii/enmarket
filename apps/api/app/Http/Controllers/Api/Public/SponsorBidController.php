<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\Sponsor;
use App\Models\SponsorBid;
use App\Http\Resources\SponsorBidLeaderboardResource;
use App\Services\Duitku\CreateTransactionDto as DuitkuTransactionDto;
use App\Services\Duitku\DuitkuClient;
use App\Services\Duitku\DuitkuException;
use App\Services\Sponsor\MetadataFetcher;
use App\Services\Tripay\CreateTransactionDto as TripayTransactionDto;
use App\Services\Tripay\TripayClient;
use App\Services\Tripay\TripayException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SponsorBidController extends Controller
{
    public function __construct(
        private readonly TripayClient $tripay,
        private readonly DuitkuClient $duitku,
        private readonly MetadataFetcher $metadataFetcher,
    ) {}

    public function config(): JsonResponse
    {
        $raw = $this->siteSettings();

        return response()->json([
            'data' => [
                'min_bid' => (int) ($raw['sponsors_min_bid'] ?? 50000),
                'gateways' => $this->enabledPaymentGateways(),
            ],
        ]);
    }

    public function leaderboard(): JsonResponse
    {
        $leaderboard = SponsorBid::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->orderByDesc('bid_amount')
            ->orderBy('paid_at')
            ->limit(20)
            ->get();

        $leaderboard->each(fn (SponsorBid $bid, int $index) => $bid->rank = $index + 1);

        return response()->json([
            'data' => SponsorBidLeaderboardResource::collection($leaderboard)->resolve(),
        ]);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:255'],
        ]);

        $domain = strtolower(trim((string) $validated['domain']));
        $url = "https://{$domain}";

        if (! $this->metadataFetcher->isSafeUrl($url)) {
            return response()->json([
                'message' => 'Domain tidak aman atau tidak valid.',
                'code' => 'sponsor_domain_unsafe',
            ], 422);
        }

        $metadata = $this->metadataFetcher->fetch($domain);

        return response()->json([
            'data' => [
                'name' => $metadata['name'],
                'logo_url' => $metadata['logo_url'],
                'fetched_description' => $metadata['fetched_description'],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $minBid = $this->minBid();
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'contact_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'wa' => ['nullable', 'string', 'max:32'],
            'amount' => ['required', 'integer', 'min:'.$minBid],
            'payment_gateway' => ['required', 'string', 'in:tripay,duitku'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ]);

        if (! ($validated['email'] ?? null) && ! ($validated['wa'] ?? null)) {
            return response()->json([
                'message' => 'Email atau nomor WhatsApp harus diisi.',
                'errors' => ['email' => ['Email atau nomor WhatsApp harus diisi.']],
                'code' => 'sponsor_contact_required',
            ], 422);
        }

        $domain = strtolower(trim((string) $validated['domain']));
        $url = "https://{$domain}";

        if (! $this->metadataFetcher->isSafeUrl($url)) {
            return response()->json([
                'message' => 'Domain tidak aman atau tidak valid.',
                'code' => 'sponsor_domain_unsafe',
            ], 422);
        }

        if (Sponsor::where('domain', $domain)->where('is_active', true)->exists()) {
            return response()->json([
                'message' => 'Domain sponsor sudah aktif. Hubungi admin untuk menaikkan bid existing.',
                'code' => 'sponsor_domain_taken',
            ], 422);
        }

        $gateway = (string) $validated['payment_gateway'];
        $enabled = $this->enabledPaymentGateways();

        if (! in_array($gateway, $enabled, true)) {
            return response()->json([
                'message' => "Payment gateway '{$gateway}' tidak aktif di pengaturan admin.",
                'enabled' => $enabled,
                'code' => 'payment_gateway_disabled',
            ], 422);
        }

        $paymentMethod = (string) ($validated['payment_method'] ?? '');
        if ($paymentMethod === '') {
            $paymentMethod = $gateway === 'duitku'
                ? (string) config('services.duitku.default_method', 'SP')
                : 'QRIS2';
        }

        $amount = (int) $validated['amount'];
        $kodeOrder = $this->generateKodeOrder();
        $email = $validated['email'] ?? null;
        $wa = $validated['wa'] ?? null;

        try {
            $order = DB::transaction(function () use ($kodeOrder, $domain, $amount, $validated, $email, $wa, $gateway, $paymentMethod) {
                $order = Order::create([
                    'kode_order' => $kodeOrder,
                    'nama_pembeli' => $validated['contact_name'] ?? $validated['wa'] ?? $validated['email'] ?? $domain,
                    'email_pembeli' => $email,
                    'wa_pembeli' => $wa,
                    'total_harga' => $amount,
                    'status' => 'pending',
                    'is_sponsor_bid' => true,
                    'sponsor_domain' => $domain,
                    'sponsor_amount' => $amount,
                    'payment_gateway' => $gateway,
                    'payment_channel' => $paymentMethod,
                ]);

                SponsorBid::create([
                    'order_id' => $order->id,
                    'domain' => $domain,
                    'bid_amount' => $amount,
                    'name' => $validated['name'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'contact_name' => $validated['contact_name'] ?? null,
                    'status' => 'pending',
                ]);

                return $order;
            });

            if ($gateway === 'duitku') {
                $res = $this->createDuitkuTransaction($order, $amount, $paymentMethod, $email, $wa);

                return response()->json([
                    'data' => [
                        'kode_order' => $order->kode_order,
                        'gateway' => 'duitku',
                        'payment_url' => $res['paymentUrl'],
                        'payment_method' => $paymentMethod,
                        'qr_url' => $res['qrString'] ? $order->qr_url : null,
                        'qr_string' => $res['qrString'],
                        'expired_at' => $res['expiredAt'],
                        'redirect_url' => "/pembayaran/{$order->kode_order}",
                    ],
                    'message' => 'Sponsor bid created. Silakan lakukan pembayaran.',
                ], 201);
            }

            $res = $this->createTripayTransaction(
                $order,
                $amount,
                $validated['contact_name'] ?? $validated['wa'] ?? $validated['email'] ?? $domain,
                $email,
                $wa,
            );

            return response()->json([
                'data' => [
                    'kode_order' => $order->kode_order,
                    'gateway' => 'tripay',
                    'payment_method' => $paymentMethod,
                    'qr_url' => $res['qr_url'],
                    'qr_string' => $res['qr_string'],
                    'reference' => $res['reference'],
                    'expired_at' => (string) $res['expired_at'],
                    'redirect_url' => "/pembayaran/{$order->kode_order}",
                ],
                'message' => 'Sponsor bid created. Silakan lakukan pembayaran.',
            ], 201);
        } catch (TripayException $e) {
            return $this->gatewayErrorResponse('tripay', $e, $kodeOrder);
        } catch (DuitkuException $e) {
            return $this->gatewayErrorResponse('duitku', $e, $kodeOrder);
        } catch (\Throwable $e) {
            Log::error('Sponsor bid checkout error', [
                'order' => $kodeOrder,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Checkout gagal: '.$e->getMessage(),
                'code' => 'checkout_error',
            ], 500);
        }
    }

    private function createTripayTransaction(
        Order $order,
        int $amount,
        string $contactName,
        ?string $email,
        ?string $wa,
    ): array {
        $dto = new TripayTransactionDto(
            method: 'QRIS2',
            merchantRef: $order->kode_order,
            amount: $amount,
            customerName: $contactName,
            customerEmail: $email ?: 'sponsor@enpiistudio.com',
            customerPhone: $this->sanitizePhone($wa ?: '08000000000'),
            orderItems: [[
                'sku' => 'SPONSOR-BID',
                'name' => 'Sponsor '.$order->sponsor_domain,
                'price' => $amount,
                'quantity' => 1,
            ]],
            expiredTime: time() + 3600,
            callbackUrl: config('services.tripay.callback_url') ?: null,
        );

        $res = $this->tripay->createTransaction($dto);

        $order->update([
            'tripay_reference' => $res['reference'],
            'qr_string' => $res['qr_string'] ?? null,
            'qr_url' => $res['qr_url'] ?? null,
            'qr_expired_at' => now()->addSeconds(3600),
        ]);

        return [
            'reference' => $res['reference'],
            'qr_string' => $res['qr_string'] ?? null,
            'qr_url' => $res['qr_url'] ?? null,
            'expired_at' => time() + 3600,
        ];
    }

    private function createDuitkuTransaction(
        Order $order,
        int $amount,
        string $paymentMethod,
        ?string $email,
        ?string $wa,
    ): array {
        $expiryPeriod = (int) config('services.duitku.expiry_period', 1440);

        $dto = new DuitkuTransactionDto(
            paymentMethod: $paymentMethod,
            merchantOrderId: $order->kode_order,
            amount: $amount,
            productDetails: 'Sponsor '.$order->sponsor_domain,
            customerEmail: $email ?: 'sponsor@enpiistudio.com',
            customerName: $wa ?: (string) $order->nama_pembeli,
            callbackUrl: config('services.duitku.callback_url') ?: null,
            returnUrl: config('services.duitku.return_url') ?: null,
            expiryPeriod: $expiryPeriod,
        );

        $res = $this->duitku->createTransaction($dto);

        $order->update([
            'qr_url' => $res['paymentUrl'],
            'qr_string' => $res['qrString'] ?? null,
            'qr_expired_at' => $res['expiredAt'] ?? null,
        ]);

        return [
            'paymentUrl' => $res['paymentUrl'],
            'qrString' => $res['qrString'] ?? null,
            'expiredAt' => $res['expiredAt'] ?? null,
        ];
    }

    private function siteSettings(): array
    {
        return Cache::rememberForever('site_settings:all', function () {
            return SiteSetting::all()
                ->mapWithKeys(fn (SiteSetting $setting) => [$setting->key => $setting->value])
                ->all();
        });
    }

    private function minBid(): int
    {
        $value = $this->siteSettings()['sponsors_min_bid'] ?? 50000;

        if (is_string($value) && preg_match('/^\d+$/', $value) === 1) {
            return (int) $value;
        }

        if (is_int($value)) {
            return $value;
        }

        return 50000;
    }

    private function enabledPaymentGateways(): array
    {
        $value = $this->siteSettings()['payment_gateways'] ?? null;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : null;
        }

        $enabled = [];
        if (is_array($value)) {
            foreach (['tripay', 'duitku'] as $gateway) {
                if (! empty($value[$gateway]['enabled'])) {
                    $enabled[] = $gateway;
                }
            }
        }

        return $enabled === [] ? ['tripay'] : $enabled;
    }

    private function gatewayErrorResponse(string $gateway, \Throwable $e, string $kodeOrder): JsonResponse
    {
        Log::error("Sponsor bid checkout {$gateway} error", [
            'order' => $kodeOrder,
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => "Gagal membuat transaksi pembayaran ({$gateway}): {$e->getMessage()}",
            'code' => "{$gateway}_error",
        ], 502);
    }

    private function generateKodeOrder(): string
    {
        $date = now()->format('Ymd');
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $rand = '';
            for ($i = 0; $i < 5; $i++) {
                $rand .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code = "EPS-{$date}-{$rand}";
        } while (Order::where('kode_order', $code)->exists());

        return $code;
    }

    private function sanitizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?? $phone;
    }
}
