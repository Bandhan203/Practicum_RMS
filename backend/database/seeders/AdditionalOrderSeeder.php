<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Carbon\Carbon;

class AdditionalOrderSeeder extends Seeder
{
    /**
     * Create additional realistic orders for demo purposes
     */
    public function run(): void
    {
        $menuItems = MenuItem::all();

        if ($menuItems->isEmpty()) {
            $this->command->info('No menu items found. Please run MenuItemSeeder first.');
            return;
        }

        // Create a VIP large order
        $vipOrder = Order::create([
            'customer_name' => 'Corporate Event - TechCorp',
            'customer_email' => 'events@techcorp.com',
            'customer_phone' => '+1555000111',
            'order_type' => 'dine-in',
            'table_number' => 15,
            'status' => 'pending',
            'total_amount' => 0,
            'notes' => 'Corporate lunch meeting - please ensure timely service',
            'estimated_time' => 45,
            'created_at' => Carbon::now()->subMinutes(5),
            'updated_at' => Carbon::now()->subMinutes(5),
        ]);

        // Add multiple high-value items
        $vipTotal = 0;
        foreach ($menuItems as $item) {
            $quantity = rand(2, 5);
            $subtotal = $item->price * $quantity;
            $vipTotal += $subtotal;

            OrderItem::create([
                'order_id' => $vipOrder->id,
                'menu_item_id' => $item->id,
                'item_name' => $item->name,
                'item_price' => $item->price,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ]);
        }
        $vipOrder->update(['total_amount' => $vipTotal]);

        // Create urgent pickup order
        $urgentOrder = Order::create([
            'customer_name' => 'Maria Gonzalez',
            'customer_email' => 'maria.g@email.com',
            'customer_phone' => '+1555777888',
            'order_type' => 'pickup',
            'pickup_time' => Carbon::now()->addMinutes(10),
            'status' => 'preparing',
            'total_amount' => 0,
            'notes' => 'URGENT: Customer waiting outside, please prioritize!',
            'estimated_time' => 8,
            'created_at' => Carbon::now()->subMinutes(12),
            'updated_at' => Carbon::now()->subMinutes(2),
        ]);

        // Single high-value item
        $premiumItem = $menuItems->where('price', $menuItems->max('price'))->first();
        if ($premiumItem) {
            $urgentSubtotal = $premiumItem->price * 3;
            OrderItem::create([
                'order_id' => $urgentOrder->id,
                'menu_item_id' => $premiumItem->id,
                'item_name' => $premiumItem->name,
                'item_price' => $premiumItem->price,
                'quantity' => 3,
                'subtotal' => $urgentSubtotal,
            ]);
            $urgentOrder->update(['total_amount' => $urgentSubtotal]);
        }

        // Create ready-for-billing order
        $billingOrder = Order::create([
            'customer_name' => 'Jennifer Lee',
            'customer_email' => 'jen.lee@example.com',
            'customer_phone' => '+1555444333',
            'order_type' => 'dine-in',
            'table_number' => 8,
            'status' => 'served',
            'total_amount' => 0,
            'notes' => 'Customer ready to pay - generate bill',
            'estimated_time' => 25,
            'created_at' => Carbon::now()->subMinutes(35),
            'updated_at' => Carbon::now()->subMinutes(1),
        ]);

        // Multiple items for realistic bill
        $billingTotal = 0;
        $selectedItems = $menuItems->random(3);
        foreach ($selectedItems as $item) {
            $quantity = rand(1, 2);
            $subtotal = $item->price * $quantity;
            $billingTotal += $subtotal;

            OrderItem::create([
                'order_id' => $billingOrder->id,
                'menu_item_id' => $item->id,
                'item_name' => $item->name,
                'item_price' => $item->price,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ]);
        }
        $billingOrder->update(['total_amount' => $billingTotal]);

        // Create walk-in orders (no email/phone)
        for ($i = 0; $i < 3; $i++) {
            $walkInOrder = Order::create([
                'customer_name' => 'Walk-in Customer #' . ($i + 1),
                'customer_email' => null,
                'customer_phone' => null,
                'order_type' => 'dine-in',
                'table_number' => rand(1, 12),
                'status' => ['pending', 'preparing'][array_rand(['pending', 'preparing'])],
                'total_amount' => 0,
                'notes' => $i === 0 ? 'No onions please' : null,
                'estimated_time' => rand(15, 25),
                'created_at' => Carbon::now()->subMinutes(rand(10, 30)),
                'updated_at' => Carbon::now()->subMinutes(rand(1, 10)),
            ]);

            $walkInTotal = 0;
            $numItems = rand(1, 3);
            $selectedItems = $menuItems->random($numItems);

            foreach ($selectedItems as $item) {
                $quantity = rand(1, 2);
                $subtotal = $item->price * $quantity;
                $walkInTotal += $subtotal;

                OrderItem::create([
                    'order_id' => $walkInOrder->id,
                    'menu_item_id' => $item->id,
                    'item_name' => $item->name,
                    'item_price' => $item->price,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal,
                ]);
            }
            $walkInOrder->update(['total_amount' => $walkInTotal]);
        }

        $this->command->info('Created additional realistic orders for demonstration!');
    }
}
