<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Sponsor;
use App\Models\SponsorBid;
use App\Services\Payment\OrderPaidHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SponsorBidActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_active_sponsor_with_paid_amount_and_metadata(): void
    {
        Http::fake([
            'example.com' => Http::response('<html><head><title>Example Title</title><meta name="description" content="Example description"></head></html>'),
        ]);

        $order = $this->createSponsorBidOrder();
        $handler = app(OrderPaidHandler::class);

        $handler->handle($order);

        $order->refresh();
        $sponsor = Sponsor::where('domain', 'example.com')->first();
        $this->assertNotNull($sponsor);
        $this->assertTrue($sponsor->is_active);
        $this->assertEquals('Example Sponsor', $sponsor->name);
        $this->assertEquals('Sponsor description', $sponsor->description);
        $this->assertEquals('Example description', $sponsor->fetched_description);
        $this->assertEquals('https://example.com', $sponsor->url);
        $this->assertEquals(125000, (float) $sponsor->amount);
        $this->assertEquals('paid', $order->status);

        $bid = $order->sponsorBid;
        $this->assertEquals('paid', $bid->status);
        $this->assertNotNull($bid->paid_at);
    }

    public function test_handle_is_idempotent_for_sponsor_orders(): void
    {
        Http::fake([
            'example.com' => Http::response('<html><head><title>Example Title</title></head></html>'),
        ]);

        $order = $this->createSponsorBidOrder();
        $handler = app(OrderPaidHandler::class);

        $handler->handle($order);
        $paidOrder = $order->refresh();
        $handler->handle($paidOrder);

        $this->assertEquals(1, Sponsor::where('domain', 'example.com')->count());
        $this->assertEquals(1, SponsorBid::where('order_id', $order->id)->count());
    }

    public function test_handle_marks_bid_expired_when_active_sponsor_exists(): void
    {
        Sponsor::factory()->create([
            'domain' => 'example.com',
            'is_active' => true,
        ]);

        $order = $this->createSponsorBidOrder();
        app(OrderPaidHandler::class)->handle($order);

        $order->refresh();
        $this->assertEquals(1, Sponsor::where('domain', 'example.com')->count());
        $this->assertEquals('expired', $order->sponsorBid->status);
    }

    private function createSponsorBidOrder(): Order
    {
        $order = Order::create([
            'kode_order' => 'EPS-'.now()->format('Ymd').'-ABC12',
            'nama_pembeli' => 'Jane Doe',
            'email_pembeli' => 'jane@example.com',
            'total_harga' => 125000,
            'status' => 'pending',
            'is_sponsor_bid' => true,
            'sponsor_domain' => 'example.com',
            'sponsor_amount' => 125000,
            'payment_gateway' => 'tripay',
        ]);

        SponsorBid::create([
            'order_id' => $order->id,
            'domain' => 'example.com',
            'bid_amount' => 125000,
            'name' => 'Example Sponsor',
            'description' => 'Sponsor description',
            'contact_name' => 'Jane Doe',
            'status' => 'pending',
        ]);

        return $order;
    }
}
