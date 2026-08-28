<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DigiflazzWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_rejects_request_with_invalid_signature(): void
    {
        $response = $this->postJson('/api/digiflazz/webhook', [
            'data' => ['ref_id' => 'EPS-XYZ', 'status' => 'Sukses'],
        ], ['x-digiflazz-signature' => 'bogus']);

        $response->assertStatus(400);
    }

    public function test_webhook_accepts_request_with_valid_signature(): void
    {
        $secret = (string) config('services.digiflazz.webhook_secret');
        if (empty($secret)) {
            $this->markTestSkipped('DIGIFLAZZ_WEBHOOK_SECRET tidak di-set di .env.testing');
        }

        // Setup minimal: order + game + game item via factory
        $game = Game::factory()->create();
        $item = GameItem::factory()->create(['game_id' => $game->id]);
        $order = Order::factory()->create([
            'kode_order' => 'EPS-WEBHOOK-' . uniqid(),
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'topup_status' => 'processing',
        ]);

        $body = json_encode([
            'data' => [
                'trx_id' => 'DF-' . uniqid(),
                'ref_id' => $order->kode_order,
                'status' => 'Sukses',
                'sn' => 'SN-TEST-001',
                'message' => 'Top-up berhasil',
            ],
        ]);
        $sig = hash_hmac('sha256', $body, $secret);

        $response = $this->call(
            method: 'POST',
            uri: '/api/digiflazz/webhook',
            parameters: [],
            cookies: [],
            files: [],
            server: ['CONTENT_TYPE' => 'application/json', 'HTTP_X_DIGIFLAZZ_SIGNATURE' => $sig],
            content: $body,
        );

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'topup_status' => 'success',
        ]);
    }

    public function test_webhook_returns_404_for_unknown_ref_id(): void
    {
        $secret = (string) config('services.digiflazz.webhook_secret');
        if (empty($secret)) {
            $this->markTestSkipped('DIGIFLAZZ_WEBHOOK_SECRET tidak di-set di .env.testing');
        }

        $body = json_encode([
            'data' => [
                'trx_id' => 'DF-X',
                'ref_id' => 'EPS-DOES-NOT-EXIST',
                'status' => 'Sukses',
            ],
        ]);
        $sig = hash_hmac('sha256', $body, $secret);

        $response = $this->call(
            method: 'POST',
            uri: '/api/digiflazz/webhook',
            parameters: [],
            cookies: [],
            files: [],
            server: ['CONTENT_TYPE' => 'application/json', 'HTTP_X_DIGIFLAZZ_SIGNATURE' => $sig],
            content: $body,
        );

        $response->assertStatus(404);
    }
}
