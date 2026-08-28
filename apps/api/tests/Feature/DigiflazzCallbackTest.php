<?php

namespace Tests\Feature;

use App\Jobs\ProcessGameTopupOrder;
use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Services\Delivery\NotificationDispatcher;
use App\Services\Digiflazz\DigiflazzClient;
use App\Services\Digiflazz\DigiflazzException;
use App\Services\Digiflazz\TopupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class DigiflazzCallbackTest extends TestCase
{
    use RefreshDatabase;

    private function makeTopupOrder(): Order
    {
        $game = Game::create([
            'nama' => 'Mobile Legends',
            'slug' => 'mobile-legends',
            'active' => true,
        ]);

        $item = GameItem::create([
            'game_id' => $game->id,
            'nama' => 'Diamond 100',
            'harga' => 25000,
            'digiflazz_sku' => 'ml-100',
            'active' => true,
        ]);

        return Order::create([
            'kode_order' => 'EPS-TEST-' . uniqid(),
            'nama_pembeli' => 'Topup Buyer',
            'total_harga' => 25000,
            'status' => 'paid',
            'is_topup_order' => true,
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'game_user_id' => '123456',
            'contact_type' => 'phone',
            'contact_value' => '08123456789',
            'topup_status' => 'pending',
            'payment_gateway' => 'tripay',
        ]);
    }

    public function test_process_game_topup_order_calls_digiflazz_client(): void
    {
        $order = $this->makeTopupOrder();

        $mockClient = $this->createMock(DigiflazzClient::class);
        $mockClient->expects($this->once())
            ->method('topup')
            ->with('ml-100', '123456', $order->kode_order)
            ->willReturn([
                'status' => 'Sukses',
                'message' => 'OK',
                'ref_id' => $order->kode_order,
                'sn' => 'SN-12345678',
            ]);

        $this->app->instance(DigiflazzClient::class, $mockClient);

        $notifier = $this->createMock(NotificationDispatcher::class);
        $notifier->expects($this->once())->method('notifyTopupResult');
        $this->app->instance(NotificationDispatcher::class, $notifier);

        $svc = app(TopupService::class);
        $result = $svc->process($order);

        $this->assertEquals('Sukses', $result['status']);
    }

    public function test_process_game_topup_order_marks_topup_success_on_response(): void
    {
        $order = $this->makeTopupOrder();

        $mockClient = $this->createMock(DigiflazzClient::class);
        $mockClient->method('topup')->willReturn([
            'status' => 'Sukses',
            'message' => 'OK',
            'ref_id' => $order->kode_order,
            'sn' => 'SN-ABCDEF',
        ]);

        $this->app->instance(DigiflazzClient::class, $mockClient);

        $notifier = $this->createMock(NotificationDispatcher::class);
        $this->app->instance(NotificationDispatcher::class, $notifier);

        $svc = app(TopupService::class);
        $svc->process($order);

        $order->refresh();
        $this->assertEquals('success', $order->topup_status);
        $this->assertNotNull($order->digiflazz_response);
        $this->assertEquals('SN-ABCDEF', $order->digiflazz_response['sn']);
    }

    public function test_process_game_topup_order_marks_topup_failed_on_response(): void
    {
        $order = $this->makeTopupOrder();

        $mockClient = $this->createMock(DigiflazzClient::class);
        $mockClient->method('topup')->willReturn([
            'status' => 'Gagal',
            'message' => 'Saldo tidak cukup',
            'ref_id' => $order->kode_order,
        ]);

        $this->app->instance(DigiflazzClient::class, $mockClient);

        $notifier = $this->createMock(NotificationDispatcher::class);
        $this->app->instance(NotificationDispatcher::class, $notifier);

        $svc = app(TopupService::class);
        $svc->process($order);

        $order->refresh();
        $this->assertEquals('failed', $order->topup_status);
    }

    public function test_process_game_topup_job_retries_on_failure(): void
    {
        $order = $this->makeTopupOrder();

        $job = new ProcessGameTopupOrder($order);

        $this->assertEquals(3, $job->tries);
        $this->assertEquals([30, 120, 300], $job->backoff);
    }
}
