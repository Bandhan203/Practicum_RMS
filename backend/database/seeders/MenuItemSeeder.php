<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuItems = [
            [
                'name' => 'Chicken Biryani',
                'description' => 'Aromatic basmati rice with tender chicken pieces, cooked with traditional spices',
                'price' => 15.99,
                'category' => 'Main Course',
                'image' => 'menu-images/chicken-biryani.jpg', // Sample path
                'preparation_time' => 45,
                'available' => true,
                'featured' => true,
                'ingredients' => json_encode(['Chicken', 'Basmati Rice', 'Onion', 'Yogurt', 'Spices']),
                'calories' => 450,
                'rating' => 4.8
            ],
            [
                'name' => 'Margherita Pizza',
                'description' => 'Classic Italian pizza with fresh tomatoes, mozzarella cheese, and basil',
                'price' => 12.99,
                'category' => 'Pizza',
                'image' => 'menu-images/margherita-pizza.jpg', // Sample path
                'preparation_time' => 20,
                'available' => true,
                'featured' => false,
                'ingredients' => json_encode(['Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil']),
                'calories' => 320,
                'rating' => 4.5
            ],
            [
                'name' => 'Beef Burger',
                'description' => 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
                'price' => 9.99,
                'category' => 'Burgers',
                'image' => 'menu-images/beef-burger.jpg', // Sample path
                'preparation_time' => 15,
                'available' => true,
                'featured' => true,
                'ingredients' => json_encode(['Beef Patty', 'Lettuce', 'Tomato', 'Onion', 'Bun', 'Sauce']),
                'calories' => 520,
                'rating' => 4.6
            ],
            [
                'name' => 'Caesar Salad',
                'description' => 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing',
                'price' => 8.99,
                'category' => 'Salads',
                'image' => 'menu-images/caesar-salad.jpg', // Sample path
                'preparation_time' => 10,
                'available' => true,
                'featured' => false,
                'ingredients' => json_encode(['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing']),
                'calories' => 180,
                'rating' => 4.2
            ],
            [
                'name' => 'Chocolate Lava Cake',
                'description' => 'Warm chocolate cake with molten chocolate center, served with vanilla ice cream',
                'price' => 6.99,
                'category' => 'Desserts',
                'image' => 'menu-images/chocolate-lava-cake.jpg', // Sample path
                'preparation_time' => 25,
                'available' => true,
                'featured' => true,
                'ingredients' => json_encode(['Chocolate', 'Flour', 'Butter', 'Eggs', 'Vanilla Ice Cream']),
                'calories' => 380,
                'rating' => 4.9
            ],
            [
                'name' => 'Fresh Orange Juice',
                'description' => 'Freshly squeezed orange juice served chilled',
                'price' => 4.99,
                'category' => 'Beverages',
                'image' => 'menu-images/orange-juice.jpg', // Sample path
                'preparation_time' => 5,
                'available' => true,
                'featured' => false,
                'ingredients' => json_encode(['Fresh Oranges']),
                'calories' => 110,
                'rating' => 4.3
            ]
        ];

        foreach ($menuItems as $item) {
            MenuItem::create($item);
        }
    }
}
