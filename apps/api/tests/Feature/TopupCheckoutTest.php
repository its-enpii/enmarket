<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Services\Tripay\CreateTransactionDto;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TopupCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(CreateTransactionDto $dto): array
            {
                return [
                    'reference' => 'TRX-' . uniqid(),
                    'merchant_ref' => $dto->merchantRef,
                    'qr_string' => 'QRIS_MOCK_STRING',
                    'qr_url' => 'https://tripay.co.id/qr/mock.png',
                    'amount' => $dto->amount,
                    'status' => 'UNPAID',
                    'expired_at' => time() + 3600,
                ];
            }

            public function verifyCallback(string $rawBody, ?string $signature): ?array
            {
                return null;
            }

            public function merchantCode(): string
            {
                return 'TEST-MERCHANT';
            }
        });
    }

    private function createGameWithItem(bool $requiresServer = false, bool $active = true): array
    {
        $game = Game::create([
            'nama' => 'Mobile Legends',
            'slug' => 'mobile-legends',
            'requires_server_id' => $requiresServer,
            'active' => $active,
        ]);

        $item = GameItem::create([
            'game_id' => $game->id,
            'nama' => 'Diamond 100',
            'harga' => 25000,
            'digiflazz_sku' => 'ml-100',
            'active' => true,
        ]);

        return [$game, $item];
    }

    public function test_topup_preview_calculates_total(): void
    {
        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.total', 25000);
        $response->assertJsonPath('data.item', 'Diamond 100');
    }

    public function test_topup_preview_requires_user_id(): void
    {
        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('user_id');
    }

    public function test_topup_preview_requires_server_id_when_game_demands(): void
    {
        [$game, $item] = $this->createGameWithItem(requiresServer: true);

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Server ID', $response->json('message'));
    }

    public function test_topup_preview_requires_phone_or_email_contact(): void
    {
        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['contact_type', 'contact_value']);
    }

    public function test_topup_checkout_creates_order_with_topup_fields(): void
    {
        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'payment_gateway' => 'tripay',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['data' => ['kode_order', 'redirect_url']]);

        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $this->assertNotNull($order);
        $this->assertTrue($order->isTopupOrder());
        $this->assertEquals($game->id, $order->game_id);
        $this->assertEquals($item->id, $order->game_item_id);
        $this->assertEquals('123456', $order->game_user_id);
        $this->assertEquals('phone', $order->contact_type);
        $this->assertEquals('08123456789', $order->contact_value);
        $this->assertEquals('pending', $order->topup_status);
        $this->assertEquals('tripay', $order->payment_gateway);
    }

    public function test_topup_checkout_rejects_inactive_game_or_item(): void
    {
        [$game, $item] = $this->createGameWithItem(active: false);

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'payment_gateway' => 'tripay',
        ]);

        $response->assertStatus(422);
    }

    public function test_topup_route_does_not_use_cart(): void
    {
        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'email',
            'contact_value' => 'test@example.com',
            'payment_gateway' => 'tripay',
        ]);

        $response->assertCreated();

        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $this->assertNotNull($order);
        $this->assertTrue($order->isTopupOrder());
        $this->assertEmpty($order->items()->get());
    }
}
