<?php

namespace Database\Factories;

use App\Models\NavMenu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\NavMenu>
 */
class NavMenuFactory extends Factory
{
    protected $model = NavMenu::class;

    public function definition(): array
    {
        return [
            'key' => fake()->unique()->randomElement([
                'discover', 'develop', 'display', 'layanan', 'topup',
            ]),
            'label' => null,
            'is_enabled' => true,
            'sort_order' => 0,
        ];
    }
}
