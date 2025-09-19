<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Inventory;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Simple test endpoint
     */
    public function test()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'ReportController is working',
            'timestamp' => now()
        ]);
    }

    /**
     * Get comprehensive analytics dashboard data
     */
    public function getDashboardReport(Request $request)
    {
        try {
            $startDate = $request->input('start_date', now()->subDays(30));
            $endDate = $request->input('end_date', now());

            if (is_string($startDate)) {
                $startDate = Carbon::parse($startDate);
            }
            if (is_string($endDate)) {
                $endDate = Carbon::parse($endDate);
            }

            // Simple test data first
            $report = [
                'summary' => [
                    'total_orders' => Order::count(),
                    'total_revenue' => Order::where('status', 'completed')->sum('total_amount') ?? 0,
                    'active_menu_items' => MenuItem::where('available', true)->count(),
                    'low_stock_alerts' => 0, // Will implement later
                    'average_order_value' => 0,
                    'completed_orders' => Order::where('status', 'completed')->count()
                ],
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate report: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get summary cards data
     */
    private function getSummaryCards($startDate, $endDate)
    {
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('total_amount');
        
        $totalMenuItems = MenuItem::where('available', true)->count();
        $lowStockItems = Inventory::lowStock()->count();

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => round($totalRevenue, 2),
            'active_menu_items' => $totalMenuItems,
            'low_stock_alerts' => $lowStockItems,
            'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
            'completed_orders' => Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')->count()
        ];
    }

    /**
     * Get orders report
     */
    private function getOrdersReportData($startDate, $endDate)
    {
        // Order status breakdown
        $orderStatusBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        // Payment method breakdown
        $paymentMethods = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->get();

        // Recent orders
        $recentOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with(['items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'order_type' => $order->order_type,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'created_at' => $order->created_at->format('M d, H:i'),
                    'items_count' => $order->items->count()
                ];
            });

        // Daily revenue trend
        $dailyRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'status_breakdown' => $orderStatusBreakdown,
            'payment_methods' => $paymentMethods,
            'recent_orders' => $recentOrders,
            'daily_revenue' => $dailyRevenue,
            'total_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed_orders' => Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')->count()
        ];
    }

    /**
     * Get menu report
     */
    private function getMenuReportData($startDate, $endDate)
    {
        // Menu items by category
        $categoryBreakdown = MenuItem::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category => $item->count];
            });

        // Top selling items
        $topSellingItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                menu_items.name,
                menu_items.price,
                menu_items.category,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.quantity * order_items.price) as total_revenue
            ')
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.price', 'menu_items.category')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Menu performance
        $menuPerformance = [
            'total_items' => MenuItem::count(),
            'available_items' => MenuItem::where('available', true)->count(),
            'featured_items' => MenuItem::where('featured', true)->count(),
            'categories' => MenuItem::distinct('category')->count('category')
        ];

        // Price range analysis
        $priceAnalysis = MenuItem::selectRaw('
            AVG(price) as avg_price,
            MIN(price) as min_price,
            MAX(price) as max_price,
            COUNT(*) as total_items
        ')->first();

        return [
            'category_breakdown' => $categoryBreakdown,
            'top_selling_items' => $topSellingItems,
            'menu_performance' => $menuPerformance,
            'price_analysis' => $priceAnalysis
        ];
    }

    /**
     * Get inventory report
     */
    private function getInventoryReportData()
    {
        // Stock status breakdown
        $stockStatus = [
            'critical' => Inventory::criticalStock()->count(),
            'low' => Inventory::lowStock()->count(),
            'adequate' => Inventory::adequateStock()->count()
        ];

        // Items by category
        $categoryBreakdown = Inventory::selectRaw('category, COUNT(*) as count, SUM(quantity * cost) as total_value')
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category => [
                    'count' => $item->count,
                    'total_value' => round($item->total_value, 2)
                ]];
            });

        // Critical and low stock items
        $criticalItems = Inventory::criticalStock()
            ->select('name', 'quantity', 'critical_level', 'unit', 'category')
            ->get();

        $lowStockItems = Inventory::lowStock()
            ->whereColumn('quantity', '>', 'critical_level')
            ->select('name', 'quantity', 'threshold', 'unit', 'category')
            ->get();

        // Expiry tracking
        $expiredItems = Inventory::expired()->count();
        $expiringSoon = Inventory::expiringSoon()->count();

        // Total inventory value
        $totalValue = Inventory::selectRaw('SUM(quantity * cost) as total_value')->first()->total_value ?? 0;

        return [
            'stock_status' => $stockStatus,
            'category_breakdown' => $categoryBreakdown,
            'critical_items' => $criticalItems,
            'low_stock_items' => $lowStockItems,
            'expired_items' => $expiredItems,
            'expiring_soon' => $expiringSoon,
            'total_value' => round($totalValue, 2),
            'total_items' => Inventory::count()
        ];
    }

    /**
     * Get charts data
     */
    private function getChartsData($startDate, $endDate)
    {
        // Daily orders and revenue
        $dailyStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($stat) {
                return [
                    'date' => $stat->date,
                    'orders' => $stat->orders,
                    'revenue' => round($stat->revenue, 2)
                ];
            });

        // Order type distribution
        $orderTypeDistribution = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('order_type, COUNT(*) as count')
            ->groupBy('order_type')
            ->get();

        return [
            'daily_stats' => $dailyStats,
            'order_type_distribution' => $orderTypeDistribution
        ];
    }

    /**
     * Get orders report only
     */
    public function getOrdersReportOnly(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date', now()->subDays(30)));
        $endDate = Carbon::parse($request->input('end_date', now()));

        return response()->json([
            'status' => 'success',
            'data' => $this->getOrdersReportData($startDate, $endDate)
        ]);
    }

    /**
     * Get menu report only
     */
    public function getMenuReportOnly(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date', now()->subDays(30)));
        $endDate = Carbon::parse($request->input('end_date', now()));

        return response()->json([
            'status' => 'success',
            'data' => $this->getMenuReportData($startDate, $endDate)
        ]);
    }

    /**
     * Get inventory report only
     */
    public function getInventoryReportOnly(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->getInventoryReportData()
        ]);
    }
}