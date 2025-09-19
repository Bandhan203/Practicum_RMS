<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have users (waiters)
        $waiters = User::all();
        if ($waiters->isEmpty()) {
            $waiters = collect([
                User::create([
                    'name' => 'John Smith',
                    'email' => 'john@restaurant.com',
                    'password' => bcrypt('password')
                ]),
                User::create([
                    'name' => 'Sarah Johnson',
                    'email' => 'sarah@restaurant.com',
                    'password' => bcrypt('password')
                ]),
                User::create([
                    'name' => 'Mike Wilson',
                    'email' => 'mike@restaurant.com',
                    'password' => bcrypt('password')
                ])
            ]);
        }

        // Ensure we have menu items
        $menuItems = MenuItem::all();
        if ($menuItems->isEmpty()) {
            $menuItems = collect([
                MenuItem::create([
                    'name' => 'Burger Deluxe',
                    'description' => 'Juicy beef burger',
                    'price' => 15.99,
                    'category' => 'Main Course',
                    'available' => true
                ]),
                MenuItem::create([
                    'name' => 'Caesar Salad',
                    'description' => 'Fresh caesar salad',
                    'price' => 12.99,
                    'category' => 'Appetizer',
                    'available' => true
                ]),
                MenuItem::create([
                    'name' => 'Chocolate Cake',
                    'description' => 'Rich chocolate cake',
                    'price' => 8.99,
                    'category' => 'Dessert',
                    'available' => true
                ]),
                MenuItem::create([
                    'name' => 'Grilled Salmon',
                    'description' => 'Fresh Atlantic salmon',
                    'price' => 24.99,
                    'category' => 'Main Course',
                    'available' => true
                ]),
                MenuItem::create([
                    'name' => 'Pasta Carbonara',
                    'description' => 'Creamy pasta dish',
                    'price' => 18.99,
                    'category' => 'Main Course',
                    'available' => true
                ])
            ]);
        }

        $customers = [
            ['name' => 'Alice Brown', 'email' => 'alice@email.com', 'phone' => '555-0001'],
            ['name' => 'Bob Wilson', 'email' => 'bob@email.com', 'phone' => '555-0002'],
            ['name' => 'Carol Davis', 'email' => 'carol@email.com', 'phone' => '555-0003'],
            ['name' => 'David Miller', 'email' => 'david@email.com', 'phone' => '555-0004'],
            ['name' => 'Emma Garcia', 'email' => 'emma@email.com', 'phone' => '555-0005'],
            ['name' => 'Frank Martinez', 'email' => 'frank@email.com', 'phone' => '555-0006'],
            ['name' => 'Grace Lee', 'email' => 'grace@email.com', 'phone' => '555-0007'],
            ['name' => 'Henry Taylor', 'email' => 'henry@email.com', 'phone' => '555-0008'],
        ];

        $paymentMethods = ['cash', 'card', 'digital_wallet', 'bank_transfer'];

        // Create orders for the last 30 days
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays($i);

            // Generate 5-15 orders per day
            $ordersPerDay = rand(5, 15);

            for ($j = 0; $j < $ordersPerDay; $j++) {
                $customer = $customers[array_rand($customers)];
                $waiter = $waiters->random();
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

                // Random order time during the day
                $orderTime = $date->copy()->addHours(rand(10, 22))->addMinutes(rand(0, 59));

                $subtotal = 0;
                $itemCount = rand(1, 4); // 1-4 items per order

                $order = Order::create([
                    'customer_name' => $customer['name'],
                    'customer_email' => $customer['email'],
                    'customer_phone' => $customer['phone'],
                    'order_type' => rand(0, 1) ? 'dine-in' : 'pickup',
                    'table_number' => rand(0, 1) ? rand(1, 20) : null,
                    'status' => 'completed',
                    'waiter_id' => $waiter->id,
                    'payment_method' => $paymentMethod,
                    'tax_amount' => 0, // Will calculate after items
                    'discount_amount' => rand(0, 100) > 85 ? rand(5, 20) : 0, // 15% chance of discount
                    'served_at' => $orderTime->copy()->addMinutes(rand(15, 45)),
                    'service_rating' => rand(3, 5), // 3-5 star rating
                    'total_amount' => 0, // Will calculate after items
                    'created_at' => $orderTime,
                    'updated_at' => $orderTime
                ]);

                // Add order items
                for ($k = 0; $k < $itemCount; $k++) {
                    $menuItem = $menuItems->random();
                    $quantity = rand(1, 3);
                    $itemSubtotal = $menuItem->price * $quantity;
                    $subtotal += $itemSubtotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_item_id' => $menuItem->id,
                        'item_name' => $menuItem->name,
                        'item_price' => $menuItem->price,
                        'quantity' => $quantity,
                        'subtotal' => $itemSubtotal,
                        'created_at' => $orderTime,
                        'updated_at' => $orderTime
                    ]);
                }

                // Calculate tax and total
                $taxAmount = $subtotal * 0.08; // 8% tax
                $totalAmount = $subtotal + $taxAmount - $order->discount_amount;

                $order->update([
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount
                ]);
            }
        }

        echo "Created analytics sample data with orders, items, and performance metrics.\n";
        echo "Orders created: " . Order::count() . "\n";
        echo "Order items created: " . OrderItem::count() . "\n";
    }
}
