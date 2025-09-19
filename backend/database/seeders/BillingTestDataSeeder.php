<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Hash;

class BillingTestDataSeeder extends Seeder
{
    /**
     * Seed test data for billing system
     */
    public function run(): void
    {
        // Create test users
        $user = User::firstOrCreate([
            'email' => 'admin@smartdine.com'
        ], [
            'name' => 'Restaurant Admin',
            'email' => 'admin@smartdine.com',
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $waiter = User::firstOrCreate([
            'email' => 'waiter@smartdine.com'
        ], [
            'name' => 'John Waiter',
            'email' => 'waiter@smartdine.com',
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test menu items
        $menuItems = [
            [
                'name' => 'Margherita Pizza',
                'description' => 'Classic pizza with tomato sauce, mozzarella, and basil',
                'price' => 15.99,
                'category' => 'Main Course',
                'available' => true,
                'featured' => true,
                'preparation_time' => 20,
                'calories' => 450,
                'dietary_info' => 'vegetarian',
                'rating' => 4.7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Caesar Salad',
                'description' => 'Fresh romaine lettuce with Caesar dressing and croutons',
                'price' => 8.99,
                'category' => 'Appetizer',
                'available' => true,
                'preparation_time' => 10,
                'calories' => 250,
                'rating' => 4.3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grilled Chicken',
                'description' => 'Tender grilled chicken breast with herbs',
                'price' => 18.99,
                'category' => 'Main Course',
                'available' => true,
                'preparation_time' => 25,
                'calories' => 380,
                'rating' => 4.6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Chocolate Cake',
                'description' => 'Rich chocolate cake with chocolate frosting',
                'price' => 6.99,
                'category' => 'Dessert',
                'available' => true,
                'preparation_time' => 5,
                'calories' => 520,
                'dietary_info' => 'vegetarian',
                'rating' => 4.8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fresh Orange Juice',
                'description' => 'Freshly squeezed orange juice',
                'price' => 4.99,
                'category' => 'Beverage',
                'available' => true,
                'preparation_time' => 3,
                'calories' => 120,
                'dietary_info' => 'vegan',
                'rating' => 4.4,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($menuItems as $item) {
            MenuItem::firstOrCreate([
                'name' => $item['name']
            ], $item);
        }

        // Create test completed orders
        $menuItemsData = MenuItem::all();

        for ($i = 1; $i <= 3; $i++) {
            // Pre-select items and calculate total
            $selectedItems = $menuItemsData->random(rand(2, 4));
            $totalAmount = 0;
            $orderItems = [];

            foreach ($selectedItems as $menuItem) {
                $quantity = rand(1, 3);
                $itemTotal = $quantity * $menuItem->price;
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'price' => $menuItem->price,
                ];
            }

            $order = Order::create([
                'customer_name' => "Customer $i",
                'customer_email' => "customer{$i}@example.com",
                'customer_phone' => "+880-1234567{$i}{$i}",
                'order_type' => 'dine-in',
                'table_number' => $i + 10,
                'status' => 'completed',
                'total_amount' => $totalAmount,
                'notes' => "Test order $i for billing system",
                'created_at' => now()->subHours($i),
                'updated_at' => now()->subHours($i),
            ]);

            // Add items to the order
            foreach ($orderItems as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'item_name' => $menuItem->name,
                    'item_price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'created_at' => now()->subHours($i),
                    'updated_at' => now()->subHours($i),
                ]);
            }
        }

        $this->command->info('✅ Billing test data seeded successfully!');
        $this->command->info('👤 Created users: admin@smartdine.com, waiter@smartdine.com');
        $this->command->info('🍕 Created 5 menu items');
        $this->command->info('📋 Created 3 completed orders ready for billing');
    }
}
