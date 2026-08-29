<?php

namespace Database\Factories;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Game>
 */
class GameFactory extends Factory
{
    protected $model = Game::class;

    public function definition(): array
    {
        $nama = $this->faker->unique()->words(2, true);

        return [
            'nama' => ucwords($nama),
            'slug' => Str::slug($nama) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'brand' => $this->faker->randomElement(['miHoYo', 'Moonton', 'Garena', 'Riot']),
            'icon_url' => null,
            'banner_url' => null,
            'requires_server_id' => false,
            'description' => $this->faker->sentence(),
            'sort_order' => 0,
            'active' => true,
            'digiflazz_category' => 'Games',
        ];
    }
}
