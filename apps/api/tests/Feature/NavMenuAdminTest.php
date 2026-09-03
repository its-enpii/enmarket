<?php

namespace Tests\Feature;

use App\Models\NavMenu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NavMenuAdminTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-admin-token-abc';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.admin_token' => self::TOKEN]);
    }

    public function test_admin_can_list_nav_menus_sorted(): void
    {
        NavMenu::factory()->create(['key' => 'discover', 'sort_order' => 20]);
        NavMenu::factory()->create(['key' => 'develop', 'sort_order' => 10]);

        $response = $this->getJson('/api/admin/nav-menus', $this->authHeaders());

        $response->assertOk();
        $response->assertJsonPath('data.0.key', 'develop');
        $response->assertJsonPath('data.1.key', 'discover');
    }

    public function test_admin_can_update_nav_menu(): void
    {
        $menu = NavMenu::factory()->create(['key' => 'topup']);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/admin/nav-menus/{$menu->id}", [
                'label' => 'Toko',
                'is_enabled' => false,
                'sort_order' => 75,
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.label', 'Toko');
        $response->assertJsonPath('data.is_enabled', false);
        $response->assertJsonPath('data.sort_order', 75);
        $this->assertSame('Toko', $menu->fresh()->label);
        $this->assertFalse($menu->fresh()->is_enabled);
        $this->assertSame(75, $menu->fresh()->sort_order);
    }

    public function test_admin_can_clear_label_override(): void
    {
        $menu = NavMenu::factory()->create([
            'key' => 'topup',
            'label' => 'Toko',
        ]);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/admin/nav-menus/{$menu->id}", [
                'label' => '',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.label', null);
        $this->assertNull($menu->fresh()->label);
    }

    public function test_admin_update_requires_valid_data(): void
    {
        $menu = NavMenu::factory()->create(['key' => 'topup']);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/admin/nav-menus/{$menu->id}", [
                'label' => str_repeat('x', 101),
                'is_enabled' => 'not-boolean',
                'sort_order' => -1,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['label', 'is_enabled', 'sort_order']);
    }

    public function test_admin_nav_menu_requires_admin_auth(): void
    {
        $menu = NavMenu::factory()->create(['key' => 'topup']);

        $response = $this->putJson("/api/admin/nav-menus/{$menu->id}", [
            'is_enabled' => false,
        ]);

        $response->assertUnauthorized();
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.self::TOKEN];
    }
}
