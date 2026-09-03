<?php

namespace Database\Seeders;

use App\Models\NavMenu;
use Illuminate\Database\Seeder;

class NavMenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            ['key' => 'discover', 'sort_order' => 10],
            ['key' => 'develop', 'sort_order' => 20],
            ['key' => 'display', 'sort_order' => 30],
            ['key' => 'layanan', 'sort_order' => 40],
            ['key' => 'topup', 'sort_order' => 50],
        ];

        foreach ($menus as $menu) {
            NavMenu::updateOrCreate(
                ['key' => $menu['key']],
                [
                    'label' => null,
                    'is_enabled' => true,
                    'sort_order' => $menu['sort_order'],
                ],
            );
        }
    }
}
