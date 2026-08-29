<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Services\Duitku\CreateTransactionDto as DuitkuDto;
use App\Services\Duitku\DuitkuClient;
use App\Services\Tripay\CreateTransactionDto;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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

    /**
     * Enable payment gateways via SiteSetting — mirip pattern DuitkuCallbackTest.
     */
    private function enableGateways(array $gateways): void
    {
        $value = json_encode([
            'tripay' => ['enabled' => in_array('tripay', $gateways, true)],
            'duitku' => ['enabled' => in_array('duitku', $gateways, true)],
        ]);
        SiteSetting::updateOrCreate(
            ['key' => 'payment_gateways'],
            ['value' => $value, 'type' => 'json'],
        );
    }

    /**
     * Reset payment_gateways setting (clear test isolation).
     */
    private function resetGatewaysSetting(): void
    {
        SiteSetting::where('key', 'payment_gateways')->delete();
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

    // ───── Multi-gateway support (admin settings) ─────

    public function test_topup_checkout_routes_to_duitku_when_enabled(): void
    {
        $this->enableGateways(['duitku']);
        Http::fake([
            '*' => Http::response([
                'reference' => 'DSX-TEST',
                'paymentUrl' => 'https://sandbox.duitku.com/pay/mock',
                'qrString' => null,
                'amount' => 25000,
                'expiryDate' => now()->addDay()->toIso8601String(),
            ], 200),
        ]);

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'payment_gateway' => 'duitku',
        ]);

        $response->assertCreated();
        $this->assertEquals('duitku', $response->json('data.gateway'));
        $this->assertEquals('https://sandbox.duitku.com/pay/mock', $response->json('data.payment_url'));

        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $this->assertEquals('duitku', $order->payment_gateway);
        $this->assertEquals('SP', $order->payment_channel); // DUITKU_DEFAULT_METHOD default

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/v2/inquiry');
        });
    }

    public function test_topup_checkout_rejects_disabled_gateway(): void
    {
        $this->enableGateways(['tripay']); // duitku TIDAK enabled

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'payment_gateway' => 'duitku',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('tidak aktif', strtolower((string) $response->json('message')));
    }

    public function test_topup_checkout_supports_both_gateways(): void
    {
        $this->enableGateways(['tripay', 'duitku']);
        Http::fake([
            '*' => Http::response([
                'reference' => 'DSX-MULTI',
                'paymentUrl' => 'https://sandbox.duitku.com/pay/multi',
                'amount' => 25000,
            ], 200),
        ]);

        [$game, $item] = $this->createGameWithItem();

        // Test both routes work
        foreach (['tripay', 'duitku'] as $gw) {
            $response = $this->postJson('/api/public/topup/checkout', [
                'game_id' => $game->id,
                'game_item_id' => $item->id,
                'user_id' => (string) rand(100000, 999999),
                'contact_type' => 'phone',
                'contact_value' => '08123456789',
                'payment_gateway' => $gw,
            ]);
            $response->assertCreated();
            $this->assertEquals($gw, $response->json('data.gateway'));
        }
    }

    public function test_topup_preview_lists_enabled_gateways(): void
    {
        $this->enableGateways(['tripay', 'duitku']);

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertOk();
        $gateways = $response->json('data.payment_gateways');
        $this->assertContains('tripay', $gateways);
        $this->assertContains('duitku', $gateways);
    }

    public function test_topup_preview_only_lists_duitku_when_tripay_disabled(): void
    {
        $this->enableGateways(['duitku']);

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertOk();
        $gateways = $response->json('data.payment_gateways');
        $this->assertEquals(['duitku'], $gateways);
    }

    public function test_topup_preview_falls_back_to_tripay_when_no_setting(): void
    {
        $this->resetGatewaysSetting(); // no setting exists

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/preview', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
        ]);

        $response->assertOk();
        $this->assertEquals(['tripay'], $response->json('data.payment_gateways'));
    }

    public function test_topup_checkout_uses_custom_payment_method_when_provided(): void
    {
        $this->enableGateways(['duitku']);
        Http::fake([
            '*' => Http::response([
                'reference' => 'DSX-CUSTOM',
                'paymentUrl' => 'https://sandbox.duitku.com/pay/custom',
                'amount' => 25000,
            ], 200),
        ]);

        [$game, $item] = $this->createGameWithItem();

        $response = $this->postJson('/api/public/topup/checkout', [
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'payment_gateway' => 'duitku',
            'payment_method' => 'VC', // Virtual Account Credit Card
        ]);

        $response->assertCreated();
        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $this->assertEquals('VC', $order->payment_channel);

        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);

            return ($body['paymentMethod'] ?? null) === 'VC';
        });
    }
}
