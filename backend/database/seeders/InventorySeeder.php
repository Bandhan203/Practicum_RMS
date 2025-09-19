<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Inventory;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inventory = [
            [
                'name' => 'Tomatoes',
                'quantity' => 8.00,
                'unit' => 'kg',
                'category' => 'Vegetables',
                'threshold' => 10.00,
                'critical_level' => 5.00,
                'cost' => 85.00,
                'description' => 'Fresh red tomatoes for cooking',
                'supplier' => 'Local Farm',
            ],
            [
                'name' => 'Lettuce',
                'quantity' => 4.00,
                'unit' => 'kg',
                'category' => 'Vegetables',
                'threshold' => 8.00,
                'critical_level' => 3.00,
                'cost' => 120.00,
                'description' => 'Fresh iceberg lettuce',
                'supplier' => 'Green Valley Farm',
            ],
            [
                'name' => 'Chicken Breast',
                'quantity' => 12.00,
                'unit' => 'kg',
                'category' => 'Meat',
                'threshold' => 15.00,
                'critical_level' => 8.00,
                'cost' => 350.00,
                'description' => 'Fresh chicken breast fillets',
                'supplier' => 'City Meat Supply',
            ],
            [
                'name' => 'Mozzarella',
                'quantity' => 6.00,
                'unit' => 'kg',
                'category' => 'Dairy',
                'threshold' => 12.00,
                'critical_level' => 4.00,
                'cost' => 650.00,
                'description' => 'Fresh mozzarella cheese',
                'supplier' => 'Dairy Fresh Co.',
            ],
            [
                'name' => 'Salmon',
                'quantity' => 3.00,
                'unit' => 'kg',
                'category' => 'Fish',
                'threshold' => 6.00,
                'critical_level' => 2.00,
                'cost' => 1200.00,
                'description' => 'Fresh Atlantic salmon fillets',
                'supplier' => 'Ocean Fresh Seafood',
            ],
            [
                'name' => 'Basil',
                'quantity' => 0.80,
                'unit' => 'kg',
                'category' => 'Herbs',
                'threshold' => 2.00,
                'critical_level' => 0.50,
                'cost' => 800.00,
                'description' => 'Fresh basil leaves',
                'supplier' => 'Herb Garden',
            ],
            [
                'name' => 'Olive Oil',
                'quantity' => 15.00,
                'unit' => 'liters',
                'category' => 'Oils',
                'threshold' => 20.00,
                'critical_level' => 10.00,
                'cost' => 450.00,
                'description' => 'Extra virgin olive oil',
                'supplier' => 'Mediterranean Import',
            ],
            [
                'name' => 'Bell Peppers',
                'quantity' => 2.00,
                'unit' => 'kg',
                'category' => 'Vegetables',
                'threshold' => 5.00,
                'critical_level' => 1.00,
                'cost' => 180.00,
                'description' => 'Mixed colored bell peppers',
                'supplier' => 'Local Farm',
            ],
            [
                'name' => 'Flour',
                'quantity' => 25.00,
                'unit' => 'kg',
                'category' => 'Bakery',
                'threshold' => 30.00,
                'critical_level' => 15.00,
                'cost' => 60.00,
                'description' => 'All-purpose wheat flour',
                'supplier' => 'Grain Mill Co.',
            ],
            [
                'name' => 'Onions',
                'quantity' => 18.00,
                'unit' => 'kg',
                'category' => 'Vegetables',
                'threshold' => 25.00,
                'critical_level' => 12.00,
                'cost' => 55.00,
                'description' => 'Fresh yellow onions',
                'supplier' => 'Local Farm',
            ],
            [
                'name' => 'Basmati Rice',
                'quantity' => 40.00,
                'unit' => 'kg',
                'category' => 'Grains',
                'threshold' => 50.00,
                'critical_level' => 25.00,
                'cost' => 95.00,
                'description' => 'Premium basmati rice',
                'supplier' => 'Rice Traders Ltd.',
            ],
            [
                'name' => 'Parmesan Cheese',
                'quantity' => 1.20,
                'unit' => 'kg',
                'category' => 'Dairy',
                'threshold' => 3.00,
                'critical_level' => 1.00,
                'cost' => 1500.00,
                'description' => 'Aged parmesan cheese',
                'supplier' => 'Dairy Fresh Co.',
            ],
            [
                'name' => 'Coca Cola',
                'quantity' => 48.00,
                'unit' => 'bottles',
                'category' => 'Beverages',
                'threshold' => 60.00,
                'critical_level' => 24.00,
                'cost' => 50.00,
                'description' => '500ml Coca Cola bottles',
                'supplier' => 'Beverage Distributors',
                'expiry_date' => now()->addMonths(6),
            ],
            [
                'name' => 'Garlic',
                'quantity' => 2.50,
                'unit' => 'kg',
                'category' => 'Vegetables',
                'threshold' => 4.00,
                'critical_level' => 1.50,
                'cost' => 220.00,
                'description' => 'Fresh garlic bulbs',
                'supplier' => 'Local Farm',
            ],
            [
                'name' => 'Ground Black Pepper',
                'quantity' => 0.50,
                'unit' => 'kg',
                'category' => 'Spices',
                'threshold' => 1.00,
                'critical_level' => 0.25,
                'cost' => 2800.00,
                'description' => 'Freshly ground black pepper',
                'supplier' => 'Spice World',
            ]
        ];

        foreach ($inventory as $item) {
            Inventory::create($item);
        }
    }
}
