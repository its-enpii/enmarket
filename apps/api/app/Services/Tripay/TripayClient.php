<?php

namespace App\Services\Tripay;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Tripay API client (sandbox + production).
 *
 * Sandbox base: https://tripay-staging-api.orbit-access.dev/api-sandbox/v2
 * Prod base:    https://api.tripay.co.id/api/v2
 *
 * Signature: HMAC-SHA256 hex over raw JSON body → header X-Signature.
 * Callback:  HMAC-SHA256 hex over raw request body → header X-Callback-Signature.
 */
class TripayClient
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $privateKey,
        private readonly string $merchantCode,
        private readonly string $baseUrl,
        private readonly int $timeout = 15,
    ) {}

    /**
     * Buat transaksi baru di Tripay.
     *
     * @return array{reference:string, qr_string:string, qr_url:string, amount:int, status:string, merchant_ref:string, expired_at:?int}
     *
     * @throws TripayException
     */
    public function createTransaction(CreateTransactionDto $dto): array
    {
        $body = $dto->toArray();
        $body['signature'] = $this->signMerchant($this->merchantCode, $dto->merchantRef, $dto->amount);
        $json = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])
            ->timeout($this->timeout)
            ->withBody($json, 'application/json')
            ->post($this->baseUrl.'/transaction/create');

        return $this->parseResponse($response, 'transaction/create');
    }

    /**
     * Ambil detail transaksi by reference (untuk cron / Fase 4).
     *
     * @throws TripayException
     */
    public function getTransaction(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->apiKey,
            'Accept' => 'application/json',
        ])
            ->timeout($this->timeout)
            ->get($this->baseUrl.'/transaction/detail', ['reference' => $reference]);

        return $this->parseResponse($response, 'transaction/detail');
    }

    /**
     * Verifikasi signature callback dari Tripay.
     * Return parsed payload kalau valid, null kalau signature tidak cocok / JSON invalid.
     *
     * @return array<string,mixed>|null
     */
    public function verifyCallback(string $rawBody, ?string $signature): ?array
    {
        if (! $signature) {
            return null;
        }

        $expected = $this->sign($rawBody);
        if (! hash_equals($expected, $signature)) {
            Log::warning('Tripay callback: signature mismatch', [
                'expected_prefix' => substr($expected, 0, 8),
                'got_prefix' => substr($signature, 0, 8),
            ]);

            return null;
        }

        $payload = json_decode($rawBody, true);
        if (! is_array($payload)) {
            return null;
        }

        return $payload;
    }

    /**
     * HMAC-SHA256 hex dari body JSON. Dipakai untuk X-Callback-Signature / X-Signature.
     */
    public function sign(string $jsonBody): string
    {
        return hash_hmac('sha256', $jsonBody, $this->privateKey);
    }

    /**
     * Signature untuk body parameter "signature" di Tripay transaction create:
     * HMAC-SHA256 hex dari "{merchantCode}{merchantRef}{amount}".
     */
    public function signMerchant(string $merchantCode, string $merchantRef, int $amount): string
    {
        return hash_hmac('sha256', $merchantCode.$merchantRef.$amount, $this->privateKey);
    }

    public function merchantCode(): string
    {
        return $this->merchantCode;
    }

    /**
     * Parse HTTP response — expect success shape {success:true, data:...}.
     *
     * @throws TripayException
     */
    private function parseResponse(Response $response, string $endpoint): array
    {
        try {
            $response->throw();
        } catch (RequestException|ConnectionException $e) {
            Log::error("Tripay {$endpoint} HTTP error", [
                'status' => method_exists($e, 'response') ? $e->response?->status() : null,
                'body' => method_exists($e, 'response') ? $e->response?->body() : null,
            ]);
            throw new TripayException(
                "Tripay {$endpoint} gagal: ".$e->getMessage(),
                method_exists($e, 'response') ? $e->response?->status() ?? 0 : 0,
            );
        }

        $body = $response->json();
        if (! is_array($body) || ! ($body['success'] ?? false)) {
            $msg = $body['message'] ?? 'Unknown error';
            Log::error("Tripay {$endpoint} returned success=false", ['body' => $body]);
            throw new TripayException("Tripay {$endpoint}: {$msg}", 502);
        }

        return $body['data'];
    }
}
