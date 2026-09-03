<?php

namespace Tests\Feature;

use App\Models\Sponsor;
use App\Services\NextRevalidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SponsorAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token';

    public array $revalidatedPaths = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);

        $this->app->bind(NextRevalidator::class, fn () => new class($this->revalidatedPaths) extends NextRevalidator
        {
            public function __construct(public array &$paths) {}
            public function revalidateHome(): void { $this->paths[] = 'home'; }
        });
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer ' . self::TOKEN];
    }

    public function test_index_lists_sponsors_ordered_by_amount_desc(): void
    {
        Sponsor::factory()->create(['name' => 'Low Sponsor', 'amount' => 100000, 'domain' => 'low.com']);
        Sponsor::factory()->create(['name' => 'High Sponsor', 'amount' => 500000, 'domain' => 'high.com']);
        Sponsor::factory()->create(['name' => 'Mid Sponsor', 'amount' => 250000, 'domain' => 'mid.com']);

        $response = $this->getJson('/api/admin/sponsors', $this->authHeaders());

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonPath('data.0.name', 'High Sponsor');
        $response->assertJsonPath('data.1.name', 'Mid Sponsor');
        $response->assertJsonPath('data.2.name', 'Low Sponsor');
    }

    public function test_index_filters_by_active_status_and_search_query(): void
    {
        Sponsor::factory()->create(['name' => 'Acme Corp', 'domain' => 'acme.com', 'is_active' => true, 'amount' => 100]);
        Sponsor::factory()->create(['name' => 'Beta Inc', 'domain' => 'beta.com', 'is_active' => false, 'amount' => 200]);

        $resActive = $this->getJson('/api/admin/sponsors?is_active=true', $this->authHeaders());
        $resActive->assertOk();
        $resActive->assertJsonCount(1, 'data');
        $resActive->assertJsonPath('data.0.name', 'Acme Corp');

        $resSearch = $this->getJson('/api/admin/sponsors?q=Beta', $this->authHeaders());
        $resSearch->assertOk();
        $resSearch->assertJsonCount(1, 'data');
        $resSearch->assertJsonPath('data.0.name', 'Beta Inc');
    }

    public function test_store_creates_sponsor_and_fetches_metadata(): void
    {
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>Awesome Tool</title>
    <meta property="og:title" content="Awesome Tool - Best Dev Tool">
    <meta property="og:description" content="A tool that simplifies development.">
    <meta property="og:image" content="/images/og.png">
</head>
<body></body>
</html>
HTML;

        Http::fake([
            'https://awesometool.io*' => Http::response($html, 200),
        ]);

        $payload = [
            'domain' => 'awesometool.io',
            'amount' => 1500000,
            'is_active' => true,
        ];

        $response = $this->postJson('/api/admin/sponsors', $payload, $this->authHeaders());

        $response->assertCreated();
        $response->assertJsonPath('data.domain', 'awesometool.io');
        $response->assertJsonPath('data.name', 'Awesome Tool - Best Dev Tool');
        $response->assertJsonPath('data.logo_url', 'https://awesometool.io/images/og.png');
        $response->assertJsonPath('data.fetched_description', 'A tool that simplifies development.');
        $response->assertJsonPath('data.amount', '1500000.00');

        $this->assertDatabaseHas('sponsors', [
            'domain' => 'awesometool.io',
            'name' => 'Awesome Tool - Best Dev Tool',
        ]);
        $this->assertContains('home', $this->revalidatedPaths);
    }

    public function test_store_validates_required_fields_and_unique_domain(): void
    {
        Sponsor::factory()->create(['domain' => 'duplicate.com']);

        $resEmpty = $this->postJson('/api/admin/sponsors', [], $this->authHeaders());
        $resEmpty->assertStatus(422);
        $resEmpty->assertJsonValidationErrors(['domain', 'amount']);

        $resDup = $this->postJson('/api/admin/sponsors', [
            'domain' => 'duplicate.com',
            'amount' => 50000,
        ], $this->authHeaders());
        $resDup->assertStatus(422);
        $resDup->assertJsonValidationErrors(['domain']);
    }

    public function test_store_handles_failed_http_fetch_gracefully(): void
    {
        Http::fake([
            '*' => Http::response('Server Error', 500),
        ]);

        $payload = [
            'domain' => 'failedsite.com',
            'amount' => 100000,
        ];

        $response = $this->postJson('/api/admin/sponsors', $payload, $this->authHeaders());

        $response->assertCreated();
        $response->assertJsonPath('data.domain', 'failedsite.com');
        $response->assertJsonPath('data.name', 'failedsite.com');
        $this->assertDatabaseHas('sponsors', [
            'domain' => 'failedsite.com',
        ]);
    }

    public function test_store_blocks_ssrf_and_creates_with_fallback(): void
    {
        $payload = [
            'domain' => '127.0.0.1',
            'amount' => 100000,
        ];

        $response = $this->postJson('/api/admin/sponsors', $payload, $this->authHeaders());

        $response->assertCreated();
        $response->assertJsonPath('data.domain', '127.0.0.1');
        $this->assertDatabaseHas('sponsors', ['domain' => '127.0.0.1']);
    }

    public function test_update_updates_sponsor_and_refetches_when_domain_changes(): void
    {
        $sponsor = Sponsor::factory()->create([
            'domain' => 'olddomain.com',
            'name' => 'Old Name',
            'amount' => 100000,
        ]);

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>Brand New Name</title>
    <meta name="description" content="New description here">
    <link rel="icon" href="/favicon.png">
</head>
<body></body>
</html>
HTML;

        Http::fake([
            'https://newdomain.com*' => Http::response($html, 200),
        ]);

        $response = $this->putJson("/api/admin/sponsors/{$sponsor->id}", [
            'domain' => 'newdomain.com',
            'amount' => 750000,
            'is_active' => false,
        ], $this->authHeaders());

        $response->assertOk();
        $response->assertJsonPath('data.domain', 'newdomain.com');
        $response->assertJsonPath('data.name', 'Brand New Name');
        $response->assertJsonPath('data.fetched_description', 'New description here');
        $response->assertJsonPath('data.logo_url', 'https://newdomain.com/favicon.png');
        $response->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('sponsors', [
            'id' => $sponsor->id,
            'domain' => 'newdomain.com',
            'name' => 'Brand New Name',
        ]);
    }

    public function test_destroy_deletes_sponsor(): void
    {
        $sponsor = Sponsor::factory()->create(['domain' => 'tobedeleted.com']);

        $response = $this->deleteJson("/api/admin/sponsors/{$sponsor->id}", [], $this->authHeaders());

        $response->assertOk();
        $this->assertDatabaseMissing('sponsors', ['id' => $sponsor->id]);
        $this->assertContains('home', $this->revalidatedPaths);
    }

    public function test_fetch_metadata_endpoint(): void
    {
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>Preview Title</title>
    <meta property="og:description" content="Preview Description">
</head>
<body></body>
</html>
HTML;

        Http::fake([
            'https://previewdomain.com*' => Http::response($html, 200),
        ]);

        $response = $this->postJson('/api/admin/sponsors/fetch-metadata', [
            'domain' => 'previewdomain.com',
        ], $this->authHeaders());

        $response->assertOk();
        $response->assertJsonPath('data.name', 'Preview Title');
        $response->assertJsonPath('data.fetched_description', 'Preview Description');
    }
}
