<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerTopupHistoryTest extends TestCase
{
    use RefreshDatabase;

    private function createUserWithTopupOrders(): User
    {
        $user = User::create([
            'name' => 'Test User',
            'phone' => '081234567890',
        ]);

        $game = Game::create([
            'nama' => 'ML',
            'slug' => 'ml',
            'active' => true,
        ]);

        $item = GameItem::create([
            'game_id' => $game->id,
            'nama' => 'Diamond 100',
            'harga' => 25000,
            'digiflazz_sku' => 'ml-100',
            'active' => true,
        ]);

        $order1 = Order::create([
            'user_id' => $user->id,
            'kode_order' => 'EPS-TOPUP-001',
            'nama_pembeli' => 'Test User',
            'total_harga' => 25000,
            'status' => 'paid',
            'is_topup_order' => true,
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'game_user_id' => '123',
            'contact_type' => 'phone',
            'contact_value' => '081234567890',
            'topup_status' => 'success',
        ]);
        $order1->created_at = now()->subDays(2);
        $order1->save();

        $order2 = Order::create([
            'user_id' => $user->id,
            'kode_order' => 'EPS-TOPUP-002',
            'nama_pembeli' => 'Test User',
            'total_harga' => 50000,
            'status' => 'paid',
            'is_topup_order' => true,
            'game_id' => $game->id,
            'game_item_id' => $item->id,
            'game_user_id' => '456',
            'contact_type' => 'email',
            'contact_value' => 'test@example.com',
            'topup_status' => 'success',
        ]);
        $order2->created_at = now();
        $order2->save();

        // Non-topup order (should not appear)
        Order::create([
            'user_id' => $user->id,
            'kode_order' => 'EPS-REGULAR-001',
            'nama_pembeli' => 'Test User',
            'total_harga' => 100000,
            'status' => 'paid',
        ]);

        return $user;
    }

    public function test_customer_topup_history_returns_only_own_topups(): void
    {
        $user = $this->createUserWithTopupOrders();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer/topups');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_customer_topup_history_orders_latest_first(): void
    {
        $user = $this->createUserWithTopupOrders();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer/topups');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals('EPS-TOPUP-002', $data[0]['kode_order']);
        $this->assertEquals('EPS-TOPUP-001', $data[1]['kode_order']);
    }
}
