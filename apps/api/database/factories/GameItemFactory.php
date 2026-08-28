<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\GameItem>
 */
class GameItemFactory extends Factory
{
    protected $model = GameItem::class;

    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'nama' => 'Diamond ' . $this->faker->randomElement([100, 300, 500, 1000]),
            'harga' => $this->faker->numberBetween(10000, 500000),
            'digiflazz_sku' => 'ML' . $this->faker->unique()->numberBetween(100, 9999),
            'digiflazz_category' => 'Games',
            'sort_order' => 0,
            'active' => true,
        ];
    }
}
