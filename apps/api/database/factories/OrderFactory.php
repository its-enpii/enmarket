<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = \App\Models\Order::class;

    public function definition(): array
    {
        return [
            'kode_order' => 'EPS-' . now()->format('Ymd') . '-' . strtoupper($this->faker->bothify('??###')),
            'nama_pembeli' => $this->faker->name(),
            'email_pembeli' => $this->faker->safeEmail(),
            'wa_pembeli' => '081234567890',
            'total_harga' => $this->faker->numberBetween(50000, 500000),
            'status' => 'pending',
            'is_topup_order' => true,
            'game_id' => Game::factory(),
            'game_item_id' => GameItem::factory(),
            'topup_status' => 'processing',
        ];
    }

    public function topup(): static
    {
        return $this->state(fn () => [
            'is_topup_order' => true,
            'game_id' => Game::factory(),
            'game_item_id' => GameItem::factory(),
        ]);
    }
}
