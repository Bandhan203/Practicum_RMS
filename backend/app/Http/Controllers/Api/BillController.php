<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillController extends Controller
{
    public function __construct()
    {
        // Temporarily disable authentication for testing
        // $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of bills
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Bill::with(['order.items.menuItem', 'createdBy'])
                         ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_status') && $request->payment_status !== 'all') {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('bill_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%")
                      ->orWhere('customer_phone', 'like', "%{$search}%")
                      ->orWhere('table_number', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $bills = $query->paginate($perPage);

            // Calculate totals for current page
            $totalAmount = $bills->sum('total_amount');
            $paidAmount = $bills->sum('paid_amount');

            return response()->json([
                'success' => true,
                'data' => $bills->items(),
                'meta' => [
                    'current_page' => $bills->currentPage(),
                    'total_pages' => $bills->lastPage(),
                    'per_page' => $bills->perPage(),
                    'total' => $bills->total(),
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'pending_amount' => $totalAmount - $paidAmount
                ],
                'message' => 'Bills retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve bills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created bill
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'payment_method' => 'required|in:cash,card,digital,bank_transfer',
                'discount_amount' => 'nullable|numeric|min:0',
                'service_charge' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'tax_rate' => 'nullable|numeric|min:0|max:100'
            ]);

            // Get the order
            $order = Order::with('items.menuItem')->findOrFail($validatedData['order_id']);

            // Check if bill already exists for this order
            $existingBill = Bill::where('order_id', $order->id)->first();
            if ($existingBill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill already exists for this order',
                    'data' => $existingBill
                ], 400);
            }

            // Calculate amounts
            $subtotal = $order->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            $taxRate = $validatedData['tax_rate'] ?? 8.00;
            $taxAmount = ($subtotal * $taxRate) / 100;
            $discountAmount = $validatedData['discount_amount'] ?? 0;
            $serviceCharge = $validatedData['service_charge'] ?? 0;
            $totalAmount = $subtotal + $taxAmount + $serviceCharge - $discountAmount;

            // Create bill
            $bill = Bill::create([
                'order_id' => $order->id,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'table_number' => $order->table_number,
                'order_type' => $order->order_type,
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'service_charge' => $serviceCharge,
                'total_amount' => $totalAmount,
                'payment_method' => $validatedData['payment_method'],
                'payment_status' => 'pending',
                'notes' => $validatedData['notes'],
                'waiter_name' => 'System',
                'created_by' => 1, // Default user ID for testing
                'status' => 'generated'
            ]);

            // Load relationships
            $bill->load(['order.items.menuItem', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill generated successfully'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate bill',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific bill
     */
    public function show(string $id): JsonResponse
    {
        try {
            $bill = Bill::with(['order.items.menuItem', 'createdBy'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bill not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a bill
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $bill = Bill::findOrFail($id);

            $validatedData = $request->validate([
                'payment_method' => 'nullable|in:cash,card,digital,bank_transfer',
                'discount_amount' => 'nullable|numeric|min:0',
                'service_charge' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'tax_rate' => 'nullable|numeric|min:0|max:100'
            ]);

            // Recalculate amounts if needed
            if (isset($validatedData['tax_rate']) ||
                isset($validatedData['discount_amount']) ||
                isset($validatedData['service_charge'])) {

                $taxRate = $validatedData['tax_rate'] ?? $bill->tax_rate;
                $taxAmount = ($bill->subtotal * $taxRate) / 100;
                $discountAmount = $validatedData['discount_amount'] ?? $bill->discount_amount;
                $serviceCharge = $validatedData['service_charge'] ?? $bill->service_charge;
                $totalAmount = $bill->subtotal + $taxAmount + $serviceCharge - $discountAmount;

                $validatedData['tax_rate'] = $taxRate;
                $validatedData['tax_amount'] = $taxAmount;
                $validatedData['discount_amount'] = $discountAmount;
                $validatedData['service_charge'] = $serviceCharge;
                $validatedData['total_amount'] = $totalAmount;
            }

            $bill->update($validatedData);
            $bill->load(['order.items.menuItem', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill updated successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bill',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process payment for a bill
     */
    public function processPayment(Request $request, string $id): JsonResponse
    {
        try {
            $bill = Bill::findOrFail($id);

            $validatedData = $request->validate([
                'paid_amount' => 'required|numeric|min:0',
                'payment_method' => 'required|in:cash,card,digital,bank_transfer',
                'payment_reference' => 'nullable|string|max:255'
            ]);

            $paidAmount = $validatedData['paid_amount'];
            $totalAmount = $bill->total_amount;

            // Validate payment amount
            if ($paidAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount must be greater than 0'
                ], 400);
            }

            // Calculate change
            $changeAmount = max(0, $paidAmount - $totalAmount);

            // Determine payment status
            $paymentStatus = $paidAmount >= $totalAmount ? 'paid' : 'partially_paid';

            // Update bill
            $bill->update([
                'paid_amount' => $bill->paid_amount + $paidAmount,
                'payment_method' => $validatedData['payment_method'],
                'payment_status' => $paymentStatus,
                'payment_date' => now(),
                'payment_reference' => $validatedData['payment_reference'],
                'change_amount' => $changeAmount,
                'status' => $paymentStatus === 'paid' ? 'paid' : 'generated'
            ]);

            $bill->load(['order.items.menuItem', 'createdBy']);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Payment processed successfully',
                'change_amount' => $changeAmount
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark bill as printed
     */
    public function markPrinted(string $id): JsonResponse
    {
        try {
            $bill = Bill::findOrFail($id);
            $bill->markAsPrinted();

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill marked as printed'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark bill as printed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get completed orders that don't have bills yet
     */
    public function getCompletedOrders(): JsonResponse
    {
        try {
            $orders = Order::with('items.menuItem')
                          ->where('status', 'completed')
                          ->whereDoesntHave('bill')
                          ->orderBy('created_at', 'desc')
                          ->get();

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Completed orders retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve completed orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth());
            $endDate = $request->get('end_date', now()->endOfMonth());

            $stats = [
                'total_bills' => Bill::inDateRange($startDate, $endDate)->count(),
                'total_revenue' => Bill::inDateRange($startDate, $endDate)
                                     ->byStatus('paid')
                                     ->sum('total_amount'),
                'pending_bills' => Bill::inDateRange($startDate, $endDate)
                                      ->byPaymentStatus('pending')
                                      ->count(),
                'paid_bills' => Bill::inDateRange($startDate, $endDate)
                                   ->byPaymentStatus('paid')
                                   ->count(),
                'partially_paid_bills' => Bill::inDateRange($startDate, $endDate)
                                             ->byPaymentStatus('partially_paid')
                                             ->count(),
                'today_revenue' => Bill::today()->byStatus('paid')->sum('total_amount'),
                'today_bills' => Bill::today()->count(),
                'payment_methods' => Bill::inDateRange($startDate, $endDate)
                                        ->select('payment_method', DB::raw('count(*) as count'))
                                        ->groupBy('payment_method')
                                        ->get(),
                'daily_revenue' => Bill::inDateRange($startDate, $endDate)
                                      ->byStatus('paid')
                                      ->select(
                                          DB::raw('DATE(created_at) as date'),
                                          DB::raw('SUM(total_amount) as total')
                                      )
                                      ->groupBy('date')
                                      ->orderBy('date')
                                      ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a bill
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $bill = Bill::findOrFail($id);

            // Only allow deletion of draft or cancelled bills
            if (!in_array($bill->status, ['draft', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft or cancelled bills can be deleted'
                ], 400);
            }

            $bill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bill deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bill',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
