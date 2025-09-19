<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Inventory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SimpleAnalyticsController extends Controller
{
    /**
     * Get simple dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $period = $request->input('period', 'today');
            
            // Get date range
            $dates = $this->getDateRangeForPeriod($period);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            // Basic sales metrics
            $totalRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('total_amount');

            $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->count();

            $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

            // Inventory alerts (simplified)
            $totalInventory = Inventory::count();
            $lowStockItems = Inventory::where('quantity', '<=', 10)->count();

            // Menu items
            $totalMenuItems = MenuItem::count();
            $availableMenuItems = MenuItem::where('available', true)->count();

            $result = [
                'period' => $period,
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ],
                'kpis' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'average_order_value' => $averageOrderValue,
                    'total_menu_items' => $totalMenuItems,
                    'available_menu_items' => $availableMenuItems,
                    'total_inventory_items' => $totalInventory,
                    'low_stock_items' => $lowStockItems
                ],
                'summary_cards' => [
                    [
                        'title' => 'Total Revenue',
                        'value' => '$' . number_format($totalRevenue, 2),
                        'icon' => 'dollar-sign',
                        'color' => 'green'
                    ],
                    [
                        'title' => 'Total Orders',
                        'value' => $totalOrders,
                        'icon' => 'shopping-cart',
                        'color' => 'blue'
                    ],
                    [
                        'title' => 'Menu Items',
                        'value' => $availableMenuItems . '/' . $totalMenuItems,
                        'icon' => 'menu',
                        'color' => 'purple'
                    ],
                    [
                        'title' => 'Low Stock Alert',
                        'value' => $lowStockItems . ' items',
                        'icon' => 'alert-triangle',
                        'color' => $lowStockItems > 5 ? 'red' : 'yellow'
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get dashboard stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get date range for different periods
     */
    private function getDateRangeForPeriod($period)
    {
        switch ($period) {
            case 'today':
                return [
                    'start' => Carbon::today(),
                    'end' => Carbon::now()
                ];
            case 'yesterday':
                return [
                    'start' => Carbon::yesterday(),
                    'end' => Carbon::yesterday()->endOfDay()
                ];
            case 'week':
                return [
                    'start' => Carbon::now()->startOfWeek(),
                    'end' => Carbon::now()
                ];
            case 'month':
                return [
                    'start' => Carbon::now()->startOfMonth(),
                    'end' => Carbon::now()
                ];
            case 'year':
                return [
                    'start' => Carbon::now()->startOfYear(),
                    'end' => Carbon::now()
                ];
            default:
                return [
                    'start' => Carbon::today(),
                    'end' => Carbon::now()
                ];
        }
    }

    /**
     * Get orders report data
     */
    public function getOrdersReport(Request $request)
    {
        try {
            $period = $request->input('period', 'month');
            $dates = $this->getDateRangeForPeriod($period);
            
            $orders = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Order status breakdown
            $statusBreakdown = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('status')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                    'status_breakdown' => $statusBreakdown,
                    'period' => $period
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get orders report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get menu report data
     */
    public function getMenuReport(Request $request)
    {
        try {
            $menuItems = MenuItem::all();
            
            // Category breakdown
            $categoryBreakdown = MenuItem::selectRaw('category, COUNT(*) as count, AVG(price) as avg_price')
                ->groupBy('category')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'menu_items' => $menuItems,
                    'category_breakdown' => $categoryBreakdown,
                    'total_items' => $menuItems->count(),
                    'available_items' => $menuItems->where('available', true)->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get menu report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory report data
     */
    public function getInventoryReport(Request $request)
    {
        try {
            $inventory = Inventory::all();
            
            // Category breakdown
            $categoryBreakdown = Inventory::selectRaw('category, COUNT(*) as count, SUM(quantity * cost) as total_value')
                ->groupBy('category')
                ->get();

            // Stock alerts
            $lowStock = Inventory::where('quantity', '<=', 10)->get();
            $criticalStock = Inventory::where('quantity', '<=', 5)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'inventory_items' => $inventory,
                    'category_breakdown' => $categoryBreakdown,
                    'alerts' => [
                        'low_stock' => $lowStock,
                        'critical_stock' => $criticalStock
                    ],
                    'total_items' => $inventory->count(),
                    'total_value' => $inventory->sum(function($item) {
                        return $item->quantity * $item->cost;
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get inventory report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}