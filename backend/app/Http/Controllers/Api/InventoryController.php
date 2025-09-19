<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items with filtering and statistics.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Inventory::query();

            // Apply filters
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('status')) {
                switch ($request->status) {
                    case 'critical':
                        $query->criticalStock();
                        break;
                    case 'low':
                        $query->lowStock()->whereColumn('quantity', '>', 'critical_level');
                        break;
                    case 'adequate':
                        $query->adequateStock();
                        break;
                }
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%")
                      ->orWhere('supplier', 'like', "%{$search}%");
                });
            }

            // Get paginated results
            $perPage = $request->get('per_page', 15);
            $inventory = $query->orderBy('updated_at', 'desc')->paginate($perPage);

            // Calculate statistics
            $stats = [
                'total' => Inventory::count(),
                'critical' => Inventory::criticalStock()->count(),
                'low' => Inventory::lowStock()->whereColumn('quantity', '>', 'critical_level')->count(),
                'adequate' => Inventory::adequateStock()->count(),
                'total_value' => Inventory::sum(DB::raw('quantity * cost')),
                'expired' => Inventory::expired()->count(),
                'expiring_soon' => Inventory::expiringSoon()->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $inventory->items(),
                'pagination' => [
                    'current_page' => $inventory->currentPage(),
                    'last_page' => $inventory->lastPage(),
                    'per_page' => $inventory->perPage(),
                    'total' => $inventory->total()
                ],
                'stats' => $stats,
                'categories' => Inventory::distinct()->pluck('category')->sort()->values()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve inventory items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created inventory item.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:inventory,name',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:50',
                'category' => 'required|string|max:100',
                'threshold' => 'nullable|numeric|min:0',
                'critical_level' => 'nullable|numeric|min:0',
                'cost' => 'nullable|numeric|min:0',
                'description' => 'nullable|string|max:1000',
                'supplier' => 'nullable|string|max:255',
                'expiry_date' => 'nullable|date|after:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['threshold'] = $data['threshold'] ?? 10;
            $data['critical_level'] = $data['critical_level'] ?? 5;
            $data['cost'] = $data['cost'] ?? 0;

            $inventory = Inventory::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Inventory item created successfully',
                'data' => $inventory
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified inventory item.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $inventory = Inventory::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $inventory
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Inventory item not found'
            ], 404);
        }
    }

    /**
     * Update the specified inventory item.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $inventory = Inventory::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('inventory', 'name')->ignore($inventory->id)
                ],
                'quantity' => 'sometimes|required|numeric|min:0',
                'unit' => 'sometimes|required|string|max:50',
                'category' => 'sometimes|required|string|max:100',
                'threshold' => 'sometimes|nullable|numeric|min:0',
                'critical_level' => 'sometimes|nullable|numeric|min:0',
                'cost' => 'sometimes|nullable|numeric|min:0',
                'description' => 'sometimes|nullable|string|max:1000',
                'supplier' => 'sometimes|nullable|string|max:255',
                'expiry_date' => 'sometimes|nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $inventory->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Inventory item updated successfully',
                'data' => $inventory->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inventory item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $inventory = Inventory::findOrFail($id);
            $inventory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete inventory item'
            ], 500);
        }
    }

    /**
     * Adjust stock quantity for an inventory item.
     */
    public function adjustStock(Request $request, string $id): JsonResponse
    {
        try {
            $inventory = Inventory::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'adjustment' => 'required|numeric',
                'reason' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $adjustment = $validator->validated()['adjustment'];

            if (!$inventory->adjustStock($adjustment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid stock adjustment. Cannot result in negative stock.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stock adjusted successfully',
                'data' => $inventory->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to adjust stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory statistics and alerts.
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_items' => Inventory::count(),
                'critical_stock' => Inventory::criticalStock()->count(),
                'low_stock' => Inventory::lowStock()->whereColumn('quantity', '>', 'critical_level')->count(),
                'adequate_stock' => Inventory::adequateStock()->count(),
                'total_value' => Inventory::sum(DB::raw('quantity * cost')),
                'expired_items' => Inventory::expired()->count(),
                'expiring_soon' => Inventory::expiringSoon()->count(),
                'categories' => Inventory::selectRaw('category, COUNT(*) as count')
                    ->groupBy('category')
                    ->pluck('count', 'category'),
                'recent_updates' => Inventory::orderBy('updated_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'quantity', 'unit', 'updated_at'])
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
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
     * Get low stock alerts.
     */
    public function alerts(): JsonResponse
    {
        try {
            $alerts = [
                'critical_stock' => Inventory::criticalStock()->get(),
                'low_stock' => Inventory::lowStock()->whereColumn('quantity', '>', 'critical_level')->get(),
                'expired_items' => Inventory::expired()->get(),
                'expiring_soon' => Inventory::expiringSoon()->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $alerts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
