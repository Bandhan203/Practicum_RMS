<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['orderItems.menuItem']);

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('order_type') && $request->order_type !== 'all') {
                $query->where('order_type', $request->order_type);
            }

            if ($request->has('date')) {
                $query->whereDate('created_at', $request->date);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customerName' => 'required|string|max:255',
                'customerEmail' => 'nullable|email|max:255',
                'customerPhone' => 'nullable|string|max:20',
                'orderType' => 'required|in:dine-in,pickup',
                'tableNumber' => 'nullable|integer|min:1',
                'pickupTime' => 'nullable|date',
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:1',
                'notes' => 'nullable|string|max:1000'
            ]);

            // Calculate total amount
            $totalAmount = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['id']);

                if (!$menuItem->available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Item '{$menuItem->name}' is not available"
                    ], 400);
                }

                $subtotal = $menuItem->price * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'item_price' => $menuItem->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal
                ];
            }

            // Create order
            $order = Order::create([
                'customer_name' => $validated['customerName'],
                'customer_email' => $validated['customerEmail'] ?? null,
                'customer_phone' => $validated['customerPhone'] ?? null,
                'order_type' => $validated['orderType'],
                'table_number' => $validated['tableNumber'] ?? null,
                'pickup_time' => $validated['pickupTime'] ?? null,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending'
            ]);

            // Create order items
            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Load the order with items for response
            $order->load(['orderItems.menuItem']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::with(['orderItems.menuItem'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified order status
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,preparing,ready,served,completed,cancelled',
                'notes' => 'nullable|string|max:1000'
            ]);

            $order = Order::findOrFail($id);

            $order->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? $order->notes
            ]);

            // If order is marked as served or completed, automatically create a bill (proceed to billing)
            if ($validated['status'] === 'served' || $validated['status'] === 'completed') {
                Log::info('Order ' . $order->id . ' status changed to ' . $validated['status'] . ', creating bill...');
                try {
                    $bill = $this->createBillForOrder($order);
                    Log::info('Bill created successfully for order ' . $order->id . ': ' . $bill->bill_number);
                } catch (\Exception $e) {
                    // Log error but don't fail the order update
                    Log::error('Failed to create bill for order ' . $order->id . ': ' . $e->getMessage());
                }
            }

            $order->load(['orderItems.menuItem']);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy($id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            // Only allow deletion of pending or cancelled orders
            if (!in_array($order->status, ['pending', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending or cancelled orders can be deleted'
                ], 400);
            }

            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'preparing_orders' => Order::where('status', 'preparing')->count(),
                'ready_orders' => Order::where('status', 'ready')->count(),
                'completed_orders' => Order::where('status', 'completed')->count(),
                'cancelled_orders' => Order::where('status', 'cancelled')->count(),
                'todays_orders' => Order::whereDate('created_at', today())->count(),
                'todays_revenue' => Order::whereDate('created_at', today())
                    ->where('status', 'completed')
                    ->sum('total_amount')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Automatically create a bill when order is served
     */
    private function createBillForOrder(Order $order)
    {
        Log::info('createBillForOrder called for order ' . $order->id);

        try {
            // Check if bill already exists for this order
            $existingBill = Bill::where('order_id', $order->id)->first();
            if ($existingBill) {
                Log::info('Bill already exists for order ' . $order->id . ': ' . $existingBill->bill_number);
                return $existingBill; // Bill already exists, don't create duplicate
            }

            // Calculate totals
            $subtotal = floatval($order->total_amount);
            $taxRate = 0.10; // 10% tax rate
            $taxAmount = $subtotal * $taxRate;
            $totalAmount = $subtotal + $taxAmount;

            // Generate unique bill number
            $billNumber = 'BILL-' . date('Y-m-d') . '-' . str_pad(Bill::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

            // Ensure uniqueness by checking if bill number already exists
            $counter = 1;
            while (Bill::where('bill_number', $billNumber)->exists()) {
                $counter++;
                $billNumber = 'BILL-' . date('Y-m-d') . '-' . str_pad(Bill::whereDate('created_at', today())->count() + $counter, 3, '0', STR_PAD_LEFT);
            }

            // Create the bill
            $bill = Bill::create([
                'bill_number' => $billNumber,
                'order_id' => $order->id,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => 0.00,
                'total_amount' => $totalAmount,
                'payment_status' => 'pending',
                'payment_method' => 'cash', // Default payment method
                'table_number' => $order->table_number,
                'order_type' => $order->order_type,
                'notes' => 'Auto-generated bill for served order',
                'is_printed' => false,
            ]);

            Log::info('Bill created successfully for order ' . $order->id . ': ' . $bill->bill_number);
            return $bill;
        } catch (\Exception $e) {
            // Log error but don't fail the order update
            Log::error('Failed to create bill for order ' . $order->id . ': ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate bill for an order
     */
    public function generateBill(string $id): JsonResponse
    {
        try {
            $order = Order::with('items.menuItem')->findOrFail($id);

            // Check if bill already exists for this order
            $existingBill = Bill::where('order_id', $order->id)->first();
            if ($existingBill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill already exists for this order',
                    'data' => $existingBill
                ], 400);
            }

            // Load order items if not already loaded
            $order->load('orderItems');

            // Calculate amounts from order items
            $subtotal = $order->orderItems->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            // Fallback to order total if items calculation fails
            if ($subtotal == 0 && $order->total_amount > 0) {
                $subtotal = $order->total_amount;
            }

            // If still zero, calculate from order total
            if ($subtotal == 0) {
                $subtotal = 100.00; // Default minimum for testing
            }

            $taxRate = 8.00;
            $taxAmount = ($subtotal * $taxRate) / 100;
            $totalAmount = $subtotal + $taxAmount;

            // Generate unique bill number
            $billNumber = 'BILL-' . date('Y-m-d') . '-' . str_pad(Bill::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

            // Ensure uniqueness by checking if bill number already exists
            $counter = 1;
            while (Bill::where('bill_number', $billNumber)->exists()) {
                $counter++;
                $billNumber = 'BILL-' . date('Y-m-d') . '-' . str_pad(Bill::whereDate('created_at', today())->count() + $counter, 3, '0', STR_PAD_LEFT);
            }

            // Create bill
            $bill = Bill::create([
                'bill_number' => $billNumber,
                'order_id' => $order->id,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'table_number' => $order->table_number,
                'order_type' => $order->order_type,
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'payment_method' => 'cash',
                'payment_status' => 'pending',
                'notes' => 'Generated from order',
                'waiter_name' => 'System',
                'created_by' => 1,
                'status' => 'generated'
            ]);

            // Load relationships
            $bill->load(['order.items.menuItem']);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill generated successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate bill',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
