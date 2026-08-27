<?php

namespace App\Services\WhatsApp;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp client — sends messages via enpiistudio webhook agent.
 *
 * Payload signed with HMAC-SHA256 in header x-webhook-signature.
 * Phone numbers normalised to international format 628xxx.
 */
class WhatsAppClient
{
    public function __construct(
        private readonly ?string $webhookUrl,
        private readonly string $webhookSecret,
        private readonly int $timeout = 15,
    ) {}

    /**
     * Send a plain text message.
     *
     * @return bool true when accepted (or dev-mode logged)
     */
    public function sendMessage(string $phone, string $content): bool
    {
        $payload = [
            'event' => 'send_message',
            'data' => [
                'phone_number' => $this->normalisePhone($phone),
                'content' => $content,
            ],
        ];

        return $this->post($payload);
    }

    /**
     * Send an image with caption.
     */
    public function sendImage(string $phone, string $caption, string $mediaUrl, string $fileName, string $mimeType = 'image/jpeg'): bool
    {
        $payload = [
            'event' => 'send_image',
            'data' => [
                'phone_number' => $this->normalisePhone($phone),
                'content' => $caption,
                'media' => [
                    'url' => $mediaUrl,
                    'name' => $fileName,
                    'type' => $mimeType,
                ],
            ],
        ];

        return $this->post($payload);
    }

    /**
     * POST signed payload to webhook.
     */
    private function post(array $payload): bool
    {
        if (! $this->webhookUrl) {
            Log::channel('stack')->info('WhatsAppClient [DEV MODE]', $payload);

            return true;
        }

        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $signature = 'hmac-sha256=' . hash_hmac('sha256', $json, $this->webhookSecret);

        try {
            $response = Http::withHeaders([
                'x-webhook-signature' => $signature,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->withBody($json, 'application/json')
                ->post($this->webhookUrl);

            $response->throw();

            Log::info('WhatsAppClient: message sent', [
                'event' => $payload['event'] ?? 'unknown',
                'phone' => $payload['data']['phone_number'] ?? '',
                'status' => $response->status(),
            ]);

            return true;
        } catch (RequestException|ConnectionException $e) {
            Log::error('WhatsAppClient: POST failed', [
                'event' => $payload['event'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Normalise phone to international Indonesian format 628xxx.
     * Accepts 08xxx, +628xxx, 628xxx — all map to 628xxx.
     */
    private function normalisePhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone) ?? '';

        if (str_starts_with($cleaned, '0')) {
            return '62' . substr($cleaned, 1);
        }

        if (! str_starts_with($cleaned, '62')) {
            return '62' . $cleaned;
        }

        return $cleaned;
    }
}
