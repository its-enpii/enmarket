<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\Sponsor;
use App\Models\SponsorBid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SponsorPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsor_leaderboard_returns_paid_bids_ranked_by_amount_then_paid_time(): void
    {
        SponsorBid::factory()->create([
            'domain' => 'bronze.test',
            'name' => 'Bronze Sponsor',
            'bid_amount' => 100000,
            'status' => 'paid',
            'paid_at' => now()->subDays(3),
            'contact_name' => 'Hidden Contact',
        ]);
        SponsorBid::factory()->create([
            'domain' => 'gold.test',
            'name' => 'Gold Sponsor',
            'bid_amount' => 300000,
            'status' => 'paid',
            'paid_at' => now()->subDay(),
            'contact_name' => 'Hidden Contact',
        ]);
        SponsorBid::factory()->create([
            'domain' => 'silver.test',
            'name' => 'Silver Sponsor',
            'bid_amount' => 200000,
            'status' => 'paid',
            'paid_at' => now()->subDays(2),
            'contact_name' => 'Hidden Contact',
        ]);
        SponsorBid::factory()->create([
            'domain' => 'pending.test',
            'name' => 'Pending Sponsor',
            'bid_amount' => 999999,
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/public/sponsors/leaderboard');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonPath('data.0.rank', 1);
        $response->assertJsonPath('data.0.domain', 'gold.test');
        $response->assertJsonPath('data.1.domain', 'silver.test');
        $response->assertJsonPath('data.2.domain', 'bronze.test');
        $response->assertJsonMissing(['contact_name' => 'Hidden Contact']);
    }

    public function test_public_site_config_returns_top_sponsors_ordered_by_amount_desc(): void
    {
        Sponsor::factory()->create([
            'name' => 'Sponsor C',
            'amount' => 100000,
            'is_active' => true,
            'created_at' => now()->subMinutes(10),
        ]);
        Sponsor::factory()->create([
            'name' => 'Sponsor A',
            'amount' => 500000,
            'is_active' => true,
            'created_at' => now()->subMinutes(5),
        ]);
        Sponsor::factory()->create([
            'name' => 'Sponsor B',
            'amount' => 300000,
            'is_active' => true,
            'created_at' => now()->subMinutes(3),
        ]);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $sponsors = $response->json('data.sponsors');
        $this->assertCount(3, $sponsors);
        $this->assertEquals('Sponsor A', $sponsors[0]['name']);
        $this->assertEquals('Sponsor B', $sponsors[1]['name']);
        $this->assertEquals('Sponsor C', $sponsors[2]['name']);
    }

    public function test_inactive_sponsors_are_excluded_from_public_config(): void
    {
        Sponsor::factory()->create([
            'name' => 'Active Sponsor',
            'amount' => 100000,
            'is_active' => true,
        ]);
        Sponsor::factory()->create([
            'name' => 'Inactive Sponsor',
            'amount' => 999999,
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $sponsors = $response->json('data.sponsors');
        $this->assertCount(1, $sponsors);
        $this->assertEquals('Active Sponsor', $sponsors[0]['name']);
    }

    public function test_description_fallback_logic_in_public_config(): void
    {
        // 1. Manual description provided -> uses manual description
        $s1 = Sponsor::factory()->create([
            'name' => 'Manual Desc Sponsor',
            'description' => 'Manual description override',
            'fetched_description' => 'Fetched description',
            'amount' => 300,
            'is_active' => true,
        ]);

        // 2. Manual description null -> uses fetched_description
        $s2 = Sponsor::factory()->create([
            'name' => 'Fetched Desc Sponsor',
            'description' => null,
            'fetched_description' => 'Fetched description only',
            'amount' => 200,
            'is_active' => true,
        ]);

        // 3. Both null -> returns null
        $s3 = Sponsor::factory()->create([
            'name' => 'No Desc Sponsor',
            'description' => null,
            'fetched_description' => null,
            'amount' => 100,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $sponsors = $response->json('data.sponsors');
        $this->assertCount(3, $sponsors);
        $this->assertEquals('Manual description override', $sponsors[0]['description']);
        $this->assertEquals('Fetched description only', $sponsors[1]['description']);
        $this->assertNull($sponsors[2]['description']);
    }

    public function test_top_count_respects_sponsors_top_count_setting(): void
    {
        SiteSetting::create([
            'key' => 'sponsors_top_count',
            'value' => '2',
            'type' => 'string',
        ]);

        Sponsor::factory()->count(5)->sequence(
            ['name' => 'S1', 'amount' => 500, 'is_active' => true],
            ['name' => 'S2', 'amount' => 400, 'is_active' => true],
            ['name' => 'S3', 'amount' => 300, 'is_active' => true],
            ['name' => 'S4', 'amount' => 200, 'is_active' => true],
            ['name' => 'S5', 'amount' => 100, 'is_active' => true],
        )->create();

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $sponsors = $response->json('data.sponsors');
        $this->assertCount(2, $sponsors);
        $this->assertEquals('S1', $sponsors[0]['name']);
        $this->assertEquals('S2', $sponsors[1]['name']);
    }

    public function test_tie_breaking_order_by_created_at_asc(): void
    {
        $time = now()->subHours(5);
        Sponsor::factory()->create([
            'name' => 'Earlier Sponsor',
            'amount' => 500000,
            'is_active' => true,
            'created_at' => $time,
        ]);
        Sponsor::factory()->create([
            'name' => 'Later Sponsor',
            'amount' => 500000,
            'is_active' => true,
            'created_at' => $time->copy()->addMinutes(10),
        ]);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $sponsors = $response->json('data.sponsors');
        $this->assertCount(2, $sponsors);
        $this->assertEquals('Earlier Sponsor', $sponsors[0]['name']);
        $this->assertEquals('Later Sponsor', $sponsors[1]['name']);
    }
}
