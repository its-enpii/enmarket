<?php

namespace Tests\Feature;

use App\Models\NavMenu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavMenuPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_site_config_returns_enabled_menus_in_order(): void
    {
        NavMenu::factory()->create(['key' => 'discover', 'sort_order' => 30, 'is_enabled' => true]);
        NavMenu::factory()->create(['key' => 'develop', 'sort_order' => 20, 'is_enabled' => false]);
        NavMenu::factory()->create(['key' => 'display', 'sort_order' => 10, 'label' => 'Showcase', 'is_enabled' => true]);

        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $response->assertJsonPath('data.nav_menus.0.key', 'display');
        $response->assertJsonPath('data.nav_menus.0.label', 'Showcase');
        $response->assertJsonPath('data.nav_menus.0.href', '/display');
        $response->assertJsonPath('data.nav_menus.1.key', 'discover');
        $response->assertJsonCount(2, 'data.nav_menus');
    }

    public function test_public_site_config_returns_empty_nav_menus_when_table_is_empty(): void
    {
        $response = $this->getJson('/api/public/site-config');

        $response->assertOk();
        $response->assertJsonPath('data.nav_menus', []);
    }
}
