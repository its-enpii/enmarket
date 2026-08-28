<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\Digiflazz\TopupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessGameTopupOrder implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120, 300];

    public function __construct(
        public Order $order,
    ) {}

    public function handle(TopupService $svc): void
    {
        $svc->process($this->order);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ProcessGameTopupOrder failed permanently', [
            'order_id' => $this->order->id,
            'kode_order' => $this->order->kode_order,
            'error' => $e->getMessage(),
        ]);

        $this->order->update(['topup_status' => 'failed']);
    }
}
