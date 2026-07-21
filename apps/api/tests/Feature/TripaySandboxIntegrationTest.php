<?php

namespace Tests\Feature;

use App\Services\Tripay\TripayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Integration test untuk Tripay SANDBOX API.
 *
 * !!! BUTUH KREDENSIAL SANDBOX VALID !!!
 * Default: pakai dari .env (TRIPAY_API_KEY + TRIPAY_PRIVATE_KEY + TRIPAY_MERCHANT_CODE).
 * Override via env: TRIPAY_INTEGRATION_API_KEY=... saat run.
 *
 * Untuk skip test ini di CI biasa: phpunit --exclude-group sandbox
 * Untuk run khusus: php artisan test --group sandbox
 *
 * Group: 'sandbox'
 *
 * @group sandbox
 */
class TripaySandboxIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private TripayClient $client;

    private string $baseUrl;
    private string $apiKey;
    private string $privateKey;
    private string $merchantCode;

    protected function setUp(): void
    {
        parent::setUp();

        // Pakai real client — bukan stub. Konstruktor baca config runtime.
        $this->client = app(TripayClient::class);

        $ref = new \ReflectionClass($this->client);
        $this->baseUrl = $ref->getProperty('baseUrl')->getValue($this->client);
        $this->apiKey = $ref->getProperty('apiKey')->getValue($this->client);
        $this->privateKey = $ref->getProperty('privateKey')->getValue($this->client);
        $this->merchantCode = $ref->getProperty('merchantCode')->getValue($this->client);

        if ($this->apiKey === '' || $this->privateKey === '' || $this->merchantCode === '') {
            $this->markTestSkipped(
                'Tripay sandbox credentials tidak ada di env. '.
                'Set TRIPAY_API_KEY + TRIPAY_PRIVATE_KEY + TRIPAY_MERCHANT_CODE.',
            );
        }
    }

    public function test_sandbox_channel_list_returns_success(): void
    {
        $response = Http::timeout(15)
            ->withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Accept' => 'application/json',
            ])
            ->get($this->baseUrl.'/merchant/payment-channel');

        $this->assertTrue($response->successful(), 'Channel list HTTP status: '.$response->status());
        $this->assertTrue($response->json('success'));
        $channels = $response->json('data');
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels, 'Sandbox harus return minimal 1 payment channel');

        $codes = collect($channels)->pluck('code')->all();
        $this->assertContains('QRIS2', $codes, 'QRIS2 wajib ada di sandbox');
    }

    public function test_fee_calculator_returns_estimated_fee(): void
    {
        $response = Http::timeout(15)
            ->withHeaders(['Authorization' => 'Bearer '.$this->apiKey])
            ->get($this->baseUrl.'/merchant/fee-calculator', [
                'amount' => 100000,
                'code' => 'QRIS2',
            ]);

        $this->assertTrue($response->successful(), 'Fee calculator status: '.$response->status());
        $this->assertTrue($response->json('success'));
        // Endpoint return array of channels dengan fee breakdown
        $fees = $response->json('data');
        $this->assertIsArray($fees);
        $this->assertNotEmpty($fees, 'Fee calculator harus return ≥1 channel');

        $qris2 = collect($fees)->firstWhere('code', 'QRIS2');
        $this->assertNotNull($qris2, 'QRIS2 harus ada di fee calculator response');
        $this->assertArrayHasKey('total_fee', $qris2);
    }

    public function test_create_transaction_returns_valid_qr(): void
    {
        $merchantRef = 'TEST-'.strtoupper(uniqid());
        $amount = 250000;

        // Signature = HMAC-SHA256 dari "{merchant}{merchantRef}{amount}"
        $signature = hash_hmac('sha256', $this->merchantCode.$merchantRef.$amount, $this->privateKey);

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->post($this->baseUrl.'/transaction/create', [
                'method' => 'QRIS2',
                'merchant_ref' => $merchantRef,
                'amount' => $amount,
                'customer_name' => 'Integration Test Buyer',
                'customer_email' => 'test@example.com',
                'customer_phone' => '081234567890',
                'order_items' => [
                    ['sku' => 'TEST-001', 'name' => 'Integration Test Product', 'price' => $amount, 'quantity' => 1],
                ],
                'expired_time' => time() + 3600,  // 1 hour
                'signature' => $signature,
            ]);

        $this->assertTrue($response->successful(), 'Create transaction status: '.$response->status());
        $body = $response->json();
        $this->assertTrue($body['success'] ?? false, 'Tripay response: '.json_encode($body));

        $data = $body['data'];
        $this->assertEquals($merchantRef, $data['merchant_ref']);
        // Tripay returns amount = amount + customer fee (sandbox QRIS2 = +750 flat + 0.7%)
        // Verify amount >= requested (fee ditambah di atas)
        $this->assertGreaterThanOrEqual($amount, $data['amount'], 'Amount return harus >= amount request (ada fee customer)');
        $this->assertEquals('UNPAID', $data['status']);
        $this->assertNotEmpty($data['reference'], 'reference harus dari Tripay');
        $this->assertNotEmpty($data['qr_string'], 'QR string harus ada untuk QRIS2');
        // Sandbox return 'SANDBOX MODE' string, production return EMVCo '00020101...'
        $isSandboxMode = str_starts_with($data['qr_string'], 'SANDBOX MODE')
            || str_contains($data['qr_string'], 'SANDBOX');
        $isEmvCo = str_starts_with($data['qr_string'], '00020101');
        $this->assertTrue(
            $isSandboxMode || $isEmvCo,
            'QR string harus SANDBOX marker atau EMVCo format, got: '.$data['qr_string'],
        );

        // Simpan reference untuk test berikutnya
        $this->tripayReference = $data['reference'];
    }

    public string $tripayReference = '';

    public function test_get_transaction_detail_returns_same_reference(): void
    {
        // Buat transaksi dulu
        $this->test_create_transaction_returns_valid_qr();
        if (! $this->tripayReference) {
            $this->markTestSkipped('No reference from previous test');
        }

        $response = Http::timeout(15)
            ->withHeaders(['Authorization' => 'Bearer '.$this->apiKey])
            ->get($this->baseUrl.'/transaction/detail', [
                'reference' => $this->tripayReference,
            ]);

        $this->assertTrue($response->successful(), 'Detail status: '.$response->status());
        $this->assertTrue($response->json('success'));
        $this->assertEquals($this->tripayReference, $response->json('data.reference'));
        $this->assertEquals('UNPAID', $response->json('data.status'));
    }

    public function test_create_transaction_with_invalid_signature_returns_error(): void
    {
        $response = Http::timeout(15)
            ->withHeaders(['Authorization' => 'Bearer '.$this->apiKey])
            ->post($this->baseUrl.'/transaction/create', [
                'method' => 'QRIS2',
                'merchant_ref' => 'TEST-BAD-'.uniqid(),
                'amount' => 100000,
                'customer_name' => 'Bad Sig',
                'customer_email' => 'bad@example.com',
                'customer_phone' => '08123456789',
                'order_items' => [
                    ['sku' => 'TEST-001', 'name' => 'Bad', 'price' => 100000, 'quantity' => 1],
                ],
                'expired_time' => time() + 3600,
                'signature' => 'deliberately-wrong-signature',
            ]);

        // Tripay return 400 + success=false untuk invalid signature
        $this->assertFalse($response->json('success'), 'Invalid signature harus return success=false');
        $this->assertNotEmpty($response->json('message'), 'Tripay harus return error message');
    }

    public function test_create_transaction_with_invalid_api_key_returns_401(): void
    {
        $response = Http::timeout(15)
            ->withHeaders(['Authorization' => 'Bearer INVALID-KEY-XXX'])
            ->post($this->baseUrl.'/transaction/create', []);

        // 401/403 tergantung Tripay. Assert bukan 200.
        $this->assertGreaterThanOrEqual(400, $response->status());
        $this->assertLessThan(500, $response->status());
    }
}