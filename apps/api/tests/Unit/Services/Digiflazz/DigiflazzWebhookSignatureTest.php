<?php

namespace Tests\Unit\Services\Digiflazz;

use App\Services\Digiflazz\DigiflazzClient;
use App\Services\Digiflazz\DigiflazzException;
use Tests\TestCase;

class DigiflazzWebhookSignatureTest extends TestCase
{
    public function test_verify_webhook_signature_with_valid_hmac_returns_true(): void
    {
        $secret = 'test-webhook-secret';
        $body = '{"data":{"trx_id":"X1","ref_id":"EPS-TEST","status":"Sukses"}}';
        $sig = hash_hmac('sha256', $body, $secret);

        $client = new DigiflazzClient(apiKey: 'k', username: 'u', baseUrl: 'https://x', webhookSecret: $secret);

        $this->assertTrue($client->verifyWebhookSignature($body, $sig));
    }

    public function test_verify_webhook_signature_with_invalid_hmac_returns_false(): void
    {
        $client = new DigiflazzClient(
            apiKey: 'k',
            username: 'u',
            baseUrl: 'https://x',
            webhookSecret: 'real-secret'
        );

        $this->assertFalse($client->verifyWebhookSignature('body', 'wrong-signature'));
    }

    public function test_verify_webhook_signature_with_empty_secret_returns_false(): void
    {
        $client = new DigiflazzClient(
            apiKey: 'k',
            username: 'u',
            baseUrl: 'https://x',
            webhookSecret: ''
        );

        $this->assertFalse($client->verifyWebhookSignature('body', 'any-signature'));
    }

    public function test_verify_webhook_signature_with_empty_incoming_returns_false(): void
    {
        $client = new DigiflazzClient(
            apiKey: 'k',
            username: 'u',
            baseUrl: 'https://x',
            webhookSecret: 'real-secret'
        );

        $this->assertFalse($client->verifyWebhookSignature('body', null));
        $this->assertFalse($client->verifyWebhookSignature('body', ''));
    }
}
