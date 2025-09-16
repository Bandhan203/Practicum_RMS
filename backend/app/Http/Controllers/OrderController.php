<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
                'status' => 'required|in:pending,preparing,ready,completed,cancelled',
                'notes' => 'nullable|string|max:1000'
            ]);

            $order = Order::findOrFail($id);
            
            $order->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? $order->notes
            ]);

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
}
