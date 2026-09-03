<?php

namespace Database\Factories;

use App\Models\Sponsor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Sponsor>
 */
class SponsorFactory extends Factory
{
    protected $model = Sponsor::class;

    public function definition(): array
    {
        $domain = $this->faker->unique()->domainName();

        return [
            'domain' => $domain,
            'name' => $this->faker->company(),
            'url' => 'https://' . $domain,
            'logo_url' => $this->faker->imageUrl(128, 128),
            'description' => $this->faker->sentence(),
            'fetched_description' => $this->faker->sentence(),
            'amount' => $this->faker->randomFloat(2, 50000, 5000000),
            'is_active' => true,
            'fetched_at' => now(),
        ];
    }
}
