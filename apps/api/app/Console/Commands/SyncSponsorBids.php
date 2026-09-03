<?php

namespace App\Console\Commands;

use App\Models\SponsorBid;
use Illuminate\Console\Command;

class SyncSponsorBids extends Command
{
    protected $signature = 'sponsor-bids:sync';

    protected $description = 'Sync pending sponsor bids with expired or failed orders';

    public function handle(): int
    {
        $updated = SponsorBid::query()
            ->where('status', 'pending')
            ->whereHas('order', fn ($query) => $query->whereIn('status', ['expired', 'failed']))
            ->update([
                'status' => 'expired',
                'updated_at' => now(),
            ]);

        $this->info("Sponsor bids synced: {$updated}");

        return self::SUCCESS;
    }
}
