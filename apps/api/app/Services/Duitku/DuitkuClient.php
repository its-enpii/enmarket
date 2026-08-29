<?php

namespace App\Services\Duitku;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Duitku API client (sandbox + production).
 *
 * Sandbox base: https://api-sandbox.duitku.com/api/merchant
 * Prod base:    https://api-prod.duitku.com/api/merchant
 *
 * Signature: MD5 hash of merchantCode + merchantOrderId + paymentAmount + apiKey.
 * Callback:  MD5 hash of merchantCode + amount + merchantOrderId + apiKey.
 */
class DuitkuClient
{
    public function __construct(
        private readonly string $merchantCode,
        private readonly string $apiKey,
        private readonly string $baseUrl,
        private readonly int $timeout = 15,
    ) {}

    /**
     * Buat transaksi baru di Duitku (POST /v2/inquiry).
     *
     * @return array{reference:string, paymentUrl:string, qrString:?string, amount:int, expiredAt:?string}
     *
     * @throws DuitkuException
     */
    public function createTransaction(CreateTransactionDto $dto): array
    {
        $body = $dto->toArray();
        $body['merchantCode'] = $this->merchantCode;
        $body['signature'] = md5(
            $this->merchantCode.$dto->merchantOrderId.$dto->amount.$this->apiKey
        );

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->timeout($this->timeout)
                ->post($this->baseUrl.'/v2/inquiry', $body);

            $response->throw();
        } catch (RequestException|ConnectionException $e) {
            Log::error('Duitku inquiry HTTP error', [
                'status' => method_exists($e, 'response') ? $e->response?->status() : null,
                'body' => method_exists($e, 'response') ? $e->response?->body() : null,
            ]);
            throw new DuitkuException(
                'Duitku inquiry gagal: '.$e->getMessage(),
                method_exists($e, 'response') ? $e->response?->status() ?? 0 : 0,
            );
        }

        $json = $response->json();

        if (! is_array($json) || empty($json['paymentUrl'])) {
            $msg = $json['Message'] ?? $json['message'] ?? 'Unknown error';
            Log::error('Duitku inquiry returned unexpected response', ['body' => $json]);
            throw new DuitkuException("Duitku inquiry: {$msg}", 502);
        }

        return [
            'reference' => $json['reference'] ?? $dto->merchantOrderId,
            'paymentUrl' => $json['paymentUrl'],
            'qrString' => $json['qrString'] ?? null,
            'amount' => $json['amount'] ?? $dto->amount,
            'expiredAt' => $json['expiryDate'] ?? null,
        ];
    }

    /**
     * Verifikasi signature callback dari Duitku.
     * Duitku mengirim form-encoded POST dengan field `signature`.
     * Signature = md5(merchantCode + amount + merchantOrderId + apiKey).
     *
     * @return array<string,mixed>|null  parsed payload kalau valid, null kalau signature tidak cocok
     */
    public function verifyCallback(string $merchantOrderId, string $amount, string $incomingSignature): ?array
    {
        $expected = md5($this->merchantCode.$amount.$merchantOrderId.$this->apiKey);

        if (! hash_equals($expected, $incomingSignature)) {
            Log::warning('Duitku callback: signature mismatch', [
                'expected_prefix' => substr($expected, 0, 8),
                'got_prefix' => substr($incomingSignature, 0, 8),
            ]);

            return null;
        }

        return [
            'merchantOrderId' => $merchantOrderId,
            'amount' => $amount,
        ];
    }

    public function merchantCode(): string
    {
        return $this->merchantCode;
    }
}
