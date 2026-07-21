<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }

    private function makeLog(string $subjectType = 'product', ?\Carbon\Carbon $createdAt = null): ActivityLog
    {
        return ActivityLog::create([
            'action' => 'created',
            'subject_type' => $subjectType,
            'subject_id' => 1,
            'subject_label' => 'Test',
            'actor' => 'admin',
            'created_at' => $createdAt ?? now(),
        ]);
    }

    public function test_index_returns_paginated_newest_first(): void
    {
        $this->makeLog();  // now
        $this->makeLog();  // now
        $this->makeLog();  // now

        $response = $this->getJson('/api/admin/activity', $this->authHeaders());

        $response->assertOk();
        $response->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_index_filters_by_subject_type(): void
    {
        $this->makeLog('product');
        $this->makeLog('post');
        $this->makeLog('maintenance');

        $response = $this->getJson('/api/admin/activity?subject_type=post', $this->authHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('post', $response->json('data.0.subject_type'));
    }

    public function test_index_filters_by_since_24h(): void
    {
        $this->makeLog('product', now()->subHours(2));
        $this->makeLog('product', now()->subDays(3));    // > 24h, exclude

        $response = $this->getJson('/api/admin/activity?since=24h', $this->authHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_index_filters_by_since_30m(): void
    {
        $this->makeLog('product', now()->subMinutes(15));
        $this->makeLog('product', now()->subHours(2));    // > 30m, exclude

        $response = $this->getJson('/api/admin/activity?since=30m', $this->authHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_index_filters_by_since_7d(): void
    {
        $this->makeLog('product', now()->subDays(2));
        $this->makeLog('product', now()->subDays(10));   // > 7d, exclude

        $response = $this->getJson('/api/admin/activity?since=7d', $this->authHeaders());

        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_index_clamps_per_page_to_max_100(): void
    {
        $response = $this->getJson('/api/admin/activity?per_page=99999', $this->authHeaders());
        $this->assertEquals(100, $response->json('meta.per_page'));
    }

    public function test_since_with_invalid_format_falls_through_no_filter(): void
    {
        $this->makeLog('product', now()->subDays(30));  // old but include karena invalid since

        $response = $this->getJson('/api/admin/activity?since=invalid', $this->authHeaders());

        // Invalid format → parseSince return null → no filter applied
        $this->assertEquals(1, $response->json('meta.total'));
    }
}