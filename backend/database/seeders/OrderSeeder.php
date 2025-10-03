<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuItems = MenuItem::all();

        if ($menuItems->isEmpty()) {
            $this->command->info('No menu items found. Please run MenuItemSeeder first.');
            return;
        }

        $customers = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '+1234567890'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'phone' => '+1234567891'],
            ['name' => 'Mike Johnson', 'email' => 'mike@example.com', 'phone' => '+1234567892'],
            ['name' => 'Sarah Wilson', 'email' => 'sarah@example.com', 'phone' => '+1234567893'],
            ['name' => 'David Brown', 'email' => 'david@example.com', 'phone' => '+1234567894'],
            ['name' => 'Lisa Garcia', 'email' => 'lisa@example.com', 'phone' => '+1234567895'],
            ['name' => 'Robert Miller', 'email' => 'robert@example.com', 'phone' => '+1234567896'],
            ['name' => 'Emily Davis', 'email' => 'emily@example.com', 'phone' => '+1234567897'],
            ['name' => 'Walk-in Customer', 'email' => null, 'phone' => null],
        ];

        $statuses = ['pending', 'preparing', 'ready', 'served', 'completed'];
        $orderTypes = ['dine-in', 'pickup'];

        // Create orders for the last 7 days
        for ($i = 0; $i < 15; $i++) {
            $customer = $customers[array_rand($customers)];
            $orderType = $orderTypes[array_rand($orderTypes)];

            // Random date within last 7 days
            $createdAt = Carbon::now()->subDays(rand(0, 6))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            // Create base order
            $order = Order::create([
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'order_type' => $orderType,
                'table_number' => $orderType === 'dine-in' ? rand(1, 20) : null,
                'pickup_time' => $orderType === 'pickup' ? $createdAt->addHours(1) : null,
                'status' => $statuses[array_rand($statuses)],
                'total_amount' => 0, // Will calculate after adding items
                'notes' => rand(0, 1) ? 'Extra spicy please' : null,
                'estimated_time' => rand(15, 45),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Add random items to order
            $numItems = rand(1, 4);
            $totalAmount = 0;
            $selectedItems = $menuItems->random($numItems);

            foreach ($selectedItems as $menuItem) {
                $quantity = rand(1, 3);
                $subtotal = $menuItem->price * $quantity;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'item_price' => $menuItem->price,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);
        }

        // Create a few specific orders with interesting scenarios

        // Large family order
        $familyOrder = Order::create([
            'customer_name' => 'The Johnson Family',
            'customer_email' => 'johnson.family@example.com',
            'customer_phone' => '+1555123456',
            'order_type' => 'dine-in',
            'table_number' => 12,
            'status' => 'preparing',
            'total_amount' => 0,
            'notes' => 'Birthday celebration - please bring candles',
            'estimated_time' => 35,
            'created_at' => Carbon::now()->subMinutes(25),
            'updated_at' => Carbon::now()->subMinutes(25),
        ]);

        // Add multiple items to family order
        $familyTotal = 0;
        foreach ($menuItems->take(5) as $item) {
            $quantity = rand(2, 4);
            $subtotal = $item->price * $quantity;
            $familyTotal += $subtotal;

            OrderItem::create([
                'order_id' => $familyOrder->id,
                'menu_item_id' => $item->id,
                'item_name' => $item->name,
                'item_price' => $item->price,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ]);
        }
        $familyOrder->update(['total_amount' => $familyTotal]);

        // Quick pickup order
        $quickOrder = Order::create([
            'customer_name' => 'Alex Rodriguez',
            'customer_email' => 'alex@example.com',
            'customer_phone' => '+1555987654',
            'order_type' => 'pickup',
            'pickup_time' => Carbon::now()->addMinutes(15),
            'status' => 'ready',
            'total_amount' => 0,
            'notes' => 'Please have ready by pickup time',
            'estimated_time' => 10,
            'created_at' => Carbon::now()->subMinutes(10),
            'updated_at' => Carbon::now()->subMinutes(2),
        ]);

        // Single item for quick order
        $quickItem = $menuItems->first();
        $quickSubtotal = $quickItem->price * 2;
        OrderItem::create([
            'order_id' => $quickOrder->id,
            'menu_item_id' => $quickItem->id,
            'item_name' => $quickItem->name,
            'item_price' => $quickItem->price,
            'quantity' => 2,
            'subtotal' => $quickSubtotal,
        ]);
        $quickOrder->update(['total_amount' => $quickSubtotal]);

        // Today's fresh orders
        for ($i = 0; $i < 5; $i++) {
            $customer = $customers[array_rand($customers)];
            $orderType = $orderTypes[array_rand($orderTypes)];

            $order = Order::create([
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'order_type' => $orderType,
                'table_number' => $orderType === 'dine-in' ? rand(1, 20) : null,
                'pickup_time' => $orderType === 'pickup' ? Carbon::now()->addHours(1) : null,
                'status' => ['pending', 'preparing'][array_rand(['pending', 'preparing'])],
                'total_amount' => 0,
                'notes' => $i === 0 ? 'Make it extra crispy' : null,
                'estimated_time' => rand(15, 30),
                'created_at' => Carbon::now()->subMinutes(rand(5, 120)),
                'updated_at' => Carbon::now()->subMinutes(rand(1, 60)),
            ]);

            $numItems = rand(1, 3);
            $totalAmount = 0;
            $selectedItems = $menuItems->random($numItems);

            foreach ($selectedItems as $menuItem) {
                $quantity = rand(1, 2);
                $subtotal = $menuItem->price * $quantity;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'item_price' => $menuItem->price,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);
        }

        $this->command->info('Created sample orders with realistic data!');
    }
}
