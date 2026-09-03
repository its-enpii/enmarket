<?php

namespace Database\Factories;

use App\Models\SponsorBid;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\SponsorBid>
 */
class SponsorBidFactory extends Factory
{
    protected $model = SponsorBid::class;

    public function definition(): array
    {
        $domain = $this->faker->unique()->domainName();

        return [
            'order_id' => null,
            'domain' => $domain,
            'bid_amount' => $this->faker->randomFloat(2, 50000, 5000000),
            'name' => $this->faker->company(),
            'description' => $this->faker->sentence(),
            'contact_name' => $this->faker->name(),
            'status' => 'pending',
            'paid_at' => null,
        ];
    }
}
