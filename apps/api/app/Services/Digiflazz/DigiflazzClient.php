<?php

namespace App\Services\Digiflazz;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzClient
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $username,
        private readonly string $baseUrl,
        private readonly string $webhookSecret = '',
        private readonly int $timeout = 15,
    ) {}

    /**
     * Top-up via Digiflazz API.
     *
     * @return array{status:string, message:string, ref_id:string, sn?:string, rc?:string}
     *
     * @throws DigiflazzException
     */
    public function topup(string $buyerSkuCode, string $customerNo, string $refId): array
    {
        if (empty($this->apiKey)) {
            Log::info('DigiflazzClient [SANDBOX]: topup skipped (no API key)', [
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no' => $customerNo,
                'ref_id' => $refId,
            ]);

            return [
                'status' => 'Sukses',
                'message' => 'Sandbox mode — no API key configured',
                'ref_id' => $refId,
                'sn' => 'SN-SANDBOX-' . strtoupper(substr(md5($refId), 0, 8)),
            ];
        }

        $sign = md5($this->username . $this->apiKey . $refId);

        $payload = [
            'commands' => 'topup',
            'username' => $this->username,
            'sign' => $sign,
            'buyer_sku_code' => $buyerSkuCode,
            'customer_no' => $customerNo,
            'ref_id' => $refId,
        ];

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->asJson()
                ->post($this->baseUrl . '/v1/transaction', $payload);

            $data = $response->json('data', []);

            if (empty($data)) {
                throw new DigiflazzException(
                    'Digiflazz returned empty data. HTTP ' . $response->status()
                );
            }

            return [
                'status' => $data['status'] ?? 'Gagal',
                'message' => $data['message'] ?? '',
                'ref_id' => $data['ref_id'] ?? $refId,
                'sn' => $data['sn'] ?? null,
                'rc' => $data['rc'] ?? null,
            ];
        } catch (ConnectionException $e) {
            throw new DigiflazzException('Digiflazz connection failed: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Check Digiflazz deposit balance.
     *
     * @return array{deposit:int}
     */
    public function checkBalance(): array
    {
        if (empty($this->apiKey)) {
            return ['deposit' => 0];
        }

        $sign = md5($this->username . $this->apiKey . 'depo');

        $payload = [
            'cmd' => 'deposit',
            'username' => $this->username,
            'sign' => $sign,
        ];

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->asJson()
                ->post($this->baseUrl . '/v1/cek-saldo', $payload);

            return [
                'deposit' => (int) ($response->json('data.deposit') ?? 0),
            ];
        } catch (ConnectionException $e) {
            throw new DigiflazzException('Digiflazz balance check failed: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Verify HMAC-SHA256 signature pada webhook callback dari Digiflazz.
     *
     * Format header (per docs): `x-digiflazz-signature` containing
     * hex HMAC-SHA256(rawBody, webhookSecret).
     *
     * @return bool  true jika signature cocok, false jika tidak (atau secret belum di-set)
     */
    public function verifyWebhookSignature(string $rawBody, ?string $incomingSignature): bool
    {
        if (empty($this->webhookSecret) || empty($incomingSignature)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $this->webhookSecret);

        return hash_equals($expected, strtolower($incomingSignature));
    }

    public function webhookSecret(): string
    {
        return $this->webhookSecret;
    }
}
