<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\Sponsor;
use App\Services\Duitku\CreateTransactionDto as DuitkuDto;
use App\Services\Duitku\DuitkuClient;
use App\Services\Tripay\CreateTransactionDto as TripayDto;
use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SponsorBidCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->bind(TripayClient::class, fn () => new class extends TripayClient
        {
            public function __construct() {}

            public function createTransaction(TripayDto $dto): array
            {
                return [
                    'reference' => 'TRX-SPONSOR',
                    'qr_string' => 'QRIS_SPONSOR',
                    'qr_url' => 'https://tripay.co.id/qr/sponsor.png',
                    'amount' => $dto->amount,
                    'status' => 'UNPAID',
                    'expired_at' => time() + 3600,
                ];
            }
        });

        SiteSetting::updateOrCreate(
            ['key' => 'payment_gateways'],
            ['value' => json_encode([
                'tripay' => ['enabled' => true],
                'duitku' => ['enabled' => true],
            ]), 'type' => 'json'],
        );
    }

    public function test_config_returns_min_bid_and_enabled_gateways(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'sponsors_min_bid'],
            ['value' => '75000', 'type' => 'string'],
        );

        $response = $this->getJson('/api/public/sponsors/bid/config');

        $response->assertOk();
        $response->assertJsonPath('data.min_bid', 75000);
        $response->assertJsonPath('data.gateways.0', 'tripay');
        $response->assertJsonPath('data.gateways.1', 'duitku');
    }

    public function test_checkout_rejects_invalid_domain(): void
    {
        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'localhost',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'amount' => 75000,
            'payment_gateway' => 'tripay',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'sponsor_domain_unsafe');
    }

    public function test_checkout_rejects_amount_below_min_bid(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'sponsors_min_bid'],
            ['value' => '75000', 'type' => 'string'],
        );

        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'example.com',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'amount' => 50000,
            'payment_gateway' => 'tripay',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('amount');
    }

    public function test_checkout_rejects_active_sponsor_domain(): void
    {
        Sponsor::factory()->create([
            'domain' => 'example.com',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'example.com',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'amount' => 75000,
            'payment_gateway' => 'tripay',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'sponsor_domain_taken');
    }

    public function test_checkout_rejects_disabled_gateway(): void
    {
        SiteSetting::where('key', 'payment_gateways')->update([
            'value' => json_encode([
                'tripay' => ['enabled' => true],
                'duitku' => ['enabled' => false],
            ]),
        ]);

        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'example.com',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'amount' => 75000,
            'payment_gateway' => 'duitku',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'payment_gateway_disabled');
    }

    public function test_checkout_creates_tripay_order_and_bid(): void
    {
        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'example.com',
            'name' => 'Example Sponsor',
            'description' => 'Sponsor description',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'amount' => 125000,
            'payment_gateway' => 'tripay',
        ]);

        $response->assertCreated();
        $kodeOrder = $response->json('data.kode_order');
        $this->assertMatchesRegularExpression('/^EPS-\d{8}-[A-NP-Z2-9]{5}$/', $kodeOrder);
        $this->assertEquals("/pembayaran/{$kodeOrder}", $response->json('data.redirect_url'));
        $this->assertEquals('QRIS_SPONSOR', $response->json('data.qr_string'));

        $order = Order::where('kode_order', $kodeOrder)->first();
        $this->assertNotNull($order);
        $this->assertTrue($order->is_sponsor_bid);
        $this->assertEquals('example.com', $order->sponsor_domain);
        $this->assertEquals(125000, (float) $order->sponsor_amount);
        $this->assertEquals(125000, (float) $order->total_harga);
        $this->assertEquals('pending', $order->status);

        $bid = $order->sponsorBid;
        $this->assertNotNull($bid);
        $this->assertEquals('Example Sponsor', $bid->name);
        $this->assertEquals('Sponsor description', $bid->description);
        $this->assertEquals('pending', $bid->status);
    }

    public function test_checkout_creates_duitku_order_and_bid(): void
    {
        Http::fake([
            '*' => Http::response([
                'reference' => 'DSX-SPONSOR',
                'paymentUrl' => 'https://sandbox.duitku.com/pay/sponsor',
                'qrString' => null,
                'amount' => 125000,
                'expiryDate' => now()->addDay()->toIso8601String(),
            ], 200),
        ]);

        $this->app->bind(DuitkuClient::class, fn () => new class extends DuitkuClient
        {
            public function __construct() {}

            public function createTransaction(DuitkuDto $dto): array
            {
                return [
                    'reference' => 'DSX-SPONSOR',
                    'paymentUrl' => 'https://sandbox.duitku.com/pay/sponsor',
                    'qrString' => null,
                    'amount' => $dto->amount,
                    'expiredAt' => now()->addDay()->toIso8601String(),
                ];
            }
        });

        $response = $this->postJson('/api/public/sponsors/bid', [
            'domain' => 'example.com',
            'contact_name' => 'Jane Doe',
            'wa' => '08123456789',
            'amount' => 125000,
            'payment_gateway' => 'duitku',
            'payment_method' => 'SP',
        ]);

        $response->assertCreated();
        $this->assertEquals('duitku', $response->json('data.gateway'));
        $this->assertEquals('https://sandbox.duitku.com/pay/sponsor', $response->json('data.payment_url'));

        $order = Order::where('kode_order', $response->json('data.kode_order'))->first();
        $this->assertEquals('08123456789', $order->wa_pembeli);
        $this->assertEquals('SP', $order->payment_channel);
    }

    public function test_preview_fetches_metadata_without_saving_sponsor(): void
    {
        Http::fake([
            'example.com' => Http::response('<html><head><title>Example Title</title><meta name="description" content="Example description"></head></html>'),
        ]);

        $response = $this->postJson('/api/public/sponsors/bid/preview', [
            'domain' => 'example.com',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.name', 'Example Title');
        $response->assertJsonPath('data.fetched_description', 'Example description');
        $this->assertDatabaseCount('sponsors', 0);
    }
}
