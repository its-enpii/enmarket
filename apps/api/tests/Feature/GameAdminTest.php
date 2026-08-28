<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameAdminTest extends TestCase
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
        return ['Authorization' => 'Bearer ' . self::TOKEN];
    }

    public function test_admin_can_create_game_with_items(): void
    {
        $response = $this->postJson('/api/admin/games', [
            'nama' => 'Genshin Impact',
            'requires_server_id' => false,
            'active' => true,
            'digiflazz_category' => 'Games',
        ], $this->authHeaders());

        $response->assertCreated();
        $gameId = $response->json('data.id');

        $this->assertDatabaseHas('games', ['id' => $gameId, 'nama' => 'Genshin Impact']);

        $itemResponse = $this->postJson("/api/admin/games/{$gameId}/items", [
            'nama' => 'Genesis Crystal 60',
            'harga' => 16000,
            'digiflazz_sku' => 'gi-60',
        ], $this->authHeaders());

        $itemResponse->assertCreated();
        $this->assertDatabaseHas('game_items', ['game_id' => $gameId, 'digiflazz_sku' => 'gi-60']);
    }

    public function test_admin_can_update_game(): void
    {
        $game = Game::create([
            'nama' => 'Test Game',
            'slug' => 'test-game',
            'active' => true,
        ]);

        $response = $this->patchJson("/api/admin/games/{$game->id}", [
            'nama' => 'Updated Game',
            'active' => false,
        ], $this->authHeaders());

        $response->assertOk();
        $this->assertDatabaseHas('games', ['id' => $game->id, 'nama' => 'Updated Game', 'active' => false]);
    }

    public function test_admin_can_toggle_game_active(): void
    {
        $game = Game::create([
            'nama' => 'ML',
            'slug' => 'ml',
            'active' => true,
        ]);

        $response = $this->patchJson("/api/admin/games/{$game->id}", [
            'active' => false,
        ], $this->authHeaders());

        $response->assertOk();
        $game->refresh();
        $this->assertFalse($game->active);

        $response2 = $this->patchJson("/api/admin/games/{$game->id}", [
            'active' => true,
        ], $this->authHeaders());

        $response2->assertOk();
        $game->refresh();
        $this->assertTrue($game->active);
    }

    public function test_admin_can_manage_game_items(): void
    {
        $game = Game::create([
            'nama' => 'Test',
            'slug' => 'test',
            'active' => true,
        ]);

        $item = GameItem::create([
            'game_id' => $game->id,
            'nama' => 'Item A',
            'harga' => 10000,
            'digiflazz_sku' => 'item-a',
            'active' => true,
        ]);

        $listResponse = $this->getJson("/api/admin/games/{$game->id}/items", $this->authHeaders());
        $listResponse->assertOk();
        $this->assertCount(1, $listResponse->json('data'));

        $updateResponse = $this->patchJson("/api/admin/items/{$item->id}", [
            'nama' => 'Item A Updated',
            'harga' => 12000,
        ], $this->authHeaders());

        $updateResponse->assertOk();
        $this->assertDatabaseHas('game_items', ['id' => $item->id, 'nama' => 'Item A Updated']);

        $deleteResponse = $this->deleteJson("/api/admin/items/{$item->id}", [], $this->authHeaders());
        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('game_items', ['id' => $item->id]);
    }
}
