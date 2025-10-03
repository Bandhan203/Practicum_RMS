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
use Illuminate\Support\Facades\Log;

class SimpleAnalyticsController extends Controller
{
    /**
     * Get simple dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $period = $request->input('period', 'month'); // Default to 'month' for better user experience

            // Handle custom date range
            if ($period === 'custom') {
                $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(30);
                $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
            } else {
                // Get date range for the specified period
                $dates = $this->getDateRangeForPeriod($period);
                $startDate = $dates['start'];
                $endDate = $dates['end'];
            }

            // Get completed orders within the date range
            $completedOrdersQuery = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed');

            $totalRevenue = $completedOrdersQuery->sum('total_amount');
            $totalOrders = $completedOrdersQuery->count();
            $averageOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

            // Get all orders (not just completed) for broader analytics
            $allOrdersQuery = Order::whereBetween('created_at', [$startDate, $endDate]);
            $totalAllOrders = $allOrdersQuery->count();

            // Inventory alerts
            $totalInventory = Inventory::count();
            $lowStockItems = Inventory::whereRaw('quantity <= threshold')->count();
            $criticalStockItems = Inventory::whereRaw('quantity <= critical_level')->count();

            // Menu items
            $totalMenuItems = MenuItem::count();
            $availableMenuItems = MenuItem::where('available', true)->count();

            // Order type distribution
            $orderTypeDistribution = Order::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('order_type, COUNT(*) as count')
                ->groupBy('order_type')
                ->get();

            // Daily revenue trend (last 7 days for chart)
            $revenueTrend = $this->getDailyRevenueTrend($period);

            $result = [
                'period' => $period,
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ],
                'kpis' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'total_all_orders' => $totalAllOrders,
                    'average_order_value' => $averageOrderValue,
                    'total_menu_items' => $totalMenuItems,
                    'available_menu_items' => $availableMenuItems,
                    'total_inventory_items' => $totalInventory,
                    'low_stock_items' => $lowStockItems,
                    'critical_stock_items' => $criticalStockItems
                ],
                'summary_cards' => [
                    [
                        'title' => 'Total Revenue',
                        'value' => '৳' . number_format($totalRevenue, 2),
                        'icon' => 'dollar-sign',
                        'color' => 'blue',
                        'change' => '+12.5%'
                    ],
                    [
                        'title' => 'Total Orders',
                        'value' => $totalOrders,
                        'icon' => 'shopping-cart',
                        'color' => 'green',
                        'change' => '+' . $totalAllOrders
                    ],
                    [
                        'title' => 'Avg Order Value',
                        'value' => '৳' . number_format($averageOrderValue, 2),
                        'icon' => 'target',
                        'color' => 'purple',
                        'change' => '৳' . $averageOrderValue
                    ],
                    [
                        'title' => 'Low Stock Alert',
                        'value' => $lowStockItems . ' items',
                        'icon' => 'alert-triangle',
                        'color' => $lowStockItems > 5 ? 'red' : ($lowStockItems > 0 ? 'orange' : 'green'),
                        'change' => $criticalStockItems . ' critical'
                    ]
                ],
                'charts' => [
                    'revenue_trend' => $revenueTrend,
                    'order_type_distribution' => $orderTypeDistribution->map(function($item) {
                        return [
                            'type' => ucfirst($item->order_type),
                            'count' => $item->count,
                            'percentage' => 0 // Will be calculated on frontend
                        ];
                    })
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
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
        $now = Carbon::now();

        switch ($period) {
            case 'today':
                return [
                    'start' => Carbon::today(),
                    'end' => $now
                ];
            case 'yesterday':
                return [
                    'start' => Carbon::yesterday(),
                    'end' => Carbon::yesterday()->endOfDay()
                ];
            case '7days':
            case 'week':
                return [
                    'start' => $now->copy()->subDays(7),
                    'end' => $now
                ];
            case 'last7days':
                return [
                    'start' => $now->copy()->subDays(7)->startOfDay(),
                    'end' => $now
                ];
            case '30days':
            case 'month':
                return [
                    'start' => $now->copy()->subDays(30),
                    'end' => $now
                ];
            case 'last30days':
                return [
                    'start' => $now->copy()->subDays(30)->startOfDay(),
                    'end' => $now
                ];
            case 'last90days':
                return [
                    'start' => $now->copy()->subDays(90)->startOfDay(),
                    'end' => $now
                ];
            case 'year':
            case '1year':
                return [
                    'start' => $now->copy()->subYear(),
                    'end' => $now
                ];
            case 'thisyear':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now
                ];
            case 'all':
            case 'lifetime':
                return [
                    'start' => Carbon::create(2020, 1, 1),
                    'end' => $now
                ];
            default:
                // Default to last 30 days for better user experience
                return [
                    'start' => $now->copy()->subDays(30),
                    'end' => $now
                ];
        }
    }

    /**
     * Get daily revenue trend data
     */
    private function getDailyRevenueTrend($period)
    {
        try {
            $dates = $this->getDateRangeForPeriod($period);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            // Determine the grouping based on period
            $groupBy = 'DATE(created_at)';
            $dateFormat = '%Y-%m-%d';

            if ($period === 'year' || $period === '1year') {
                $groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
                $dateFormat = '%Y-%m';
            } elseif ($period === 'all' || $period === 'lifetime') {
                $groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
                $dateFormat = '%Y-%m';
            }

            $dailyRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->selectRaw("$groupBy as date, SUM(total_amount) as revenue, COUNT(*) as orders")
                ->groupBy(DB::raw($groupBy))
                ->orderBy(DB::raw($groupBy))
                ->get();

            return $dailyRevenue->map(function($item) {
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'orders' => (int) $item->orders
                ];
            });

        } catch (\Exception $e) {
            Log::error('Revenue trend error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get orders report data
     */
    public function getOrdersReport(Request $request)
    {
        try {
            $period = $request->input('period', 'month');

            // Handle custom date range
            if ($period === 'custom') {
                $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(30);
                $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
                $dates = ['start' => $startDate, 'end' => $endDate];
            } else {
                $dates = $this->getDateRangeForPeriod($period);
            }

            // Get recent orders with order items
            $orders = Order::with(['orderItems.menuItem'])
                ->whereBetween('created_at', [$dates['start'], $dates['end']])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Order status breakdown
            $statusBreakdown = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('status')
                ->get();

            // Order type breakdown
            $typeBreakdown = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->selectRaw('order_type, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('order_type')
                ->get();

            // Peak hours analysis
            $peakHours = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->selectRaw('HOUR(created_at) as hour, COUNT(*) as orders, SUM(total_amount) as revenue')
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('orders', 'desc')
                ->limit(6)
                ->get();

            // Daily order trend
            $dailyTrend = Order::whereBetween('created_at', [$dates['start'], $dates['end']])
                ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue')
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy(DB::raw('DATE(created_at)'))
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                    'status_breakdown' => $statusBreakdown->map(function($item) {
                        return [
                            'status' => $item->status,
                            'count' => (int) $item->count,
                            'total' => (float) $item->total
                        ];
                    }),
                    'type_breakdown' => $typeBreakdown->map(function($item) {
                        return [
                            'type' => $item->order_type,
                            'count' => (int) $item->count,
                            'total' => (float) $item->total
                        ];
                    }),
                    'peak_hours' => $peakHours->map(function($item) {
                        return [
                            'hour' => (int) $item->hour,
                            'orders' => (int) $item->orders,
                            'revenue' => (float) $item->revenue
                        ];
                    }),
                    'daily_trend' => $dailyTrend->map(function($item) {
                        return [
                            'date' => $item->date,
                            'orders' => (int) $item->orders,
                            'revenue' => (float) $item->revenue
                        ];
                    }),
                    'period' => $period,
                    'date_range' => [
                        'start' => $dates['start']->format('Y-m-d'),
                        'end' => $dates['end']->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Orders report error: ' . $e->getMessage());
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
            $period = $request->input('period', 'month');

            // Handle custom date range
            if ($period === 'custom') {
                $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(30);
                $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
                $dates = ['start' => $startDate, 'end' => $endDate];
            } else {
                $dates = $this->getDateRangeForPeriod($period);
            }

            $menuItems = MenuItem::all();

            // Category breakdown
            $categoryBreakdown = MenuItem::selectRaw('category, COUNT(*) as count, AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price')
                ->groupBy('category')
                ->get();

            // Most popular items (based on order frequency)
            $popularItems = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                ->whereBetween('orders.created_at', [$dates['start'], $dates['end']])
                ->where('orders.status', 'completed')
                ->selectRaw('menu_items.id, menu_items.name, menu_items.category, menu_items.price,
                          SUM(order_items.quantity) as total_sold,
                          SUM(order_items.subtotal) as total_revenue,
                          COUNT(DISTINCT orders.id) as order_count')
                ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category', 'menu_items.price')
                ->orderBy('total_sold', 'desc')
                ->limit(10)
                ->get();

            // Revenue by category
            $categoryRevenue = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                ->whereBetween('orders.created_at', [$dates['start'], $dates['end']])
                ->where('orders.status', 'completed')
                ->selectRaw('menu_items.category, SUM(order_items.subtotal) as total_revenue, COUNT(*) as items_sold')
                ->groupBy('menu_items.category')
                ->orderBy('total_revenue', 'desc')
                ->get();

            // Price analysis
            $priceRanges = MenuItem::selectRaw('
                CASE
                    WHEN price < 100 THEN "Under ৳100"
                    WHEN price BETWEEN 100 AND 300 THEN "৳100-300"
                    WHEN price BETWEEN 300 AND 500 THEN "৳300-500"
                    WHEN price BETWEEN 500 AND 1000 THEN "৳500-1000"
                    ELSE "Above ৳1000"
                END as price_range,
                COUNT(*) as count
            ')
                ->groupBy(DB::raw('
                    CASE
                        WHEN price < 100 THEN "Under ৳100"
                        WHEN price BETWEEN 100 AND 300 THEN "৳100-300"
                        WHEN price BETWEEN 300 AND 500 THEN "৳300-500"
                        WHEN price BETWEEN 500 AND 1000 THEN "৳500-1000"
                        ELSE "Above ৳1000"
                    END
                '))
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'menu_items' => $menuItems,
                    'category_breakdown' => $categoryBreakdown->map(function($item) {
                        return [
                            'category' => $item->category,
                            'count' => (int) $item->count,
                            'avg_price' => (float) $item->avg_price,
                            'min_price' => (float) $item->min_price,
                            'max_price' => (float) $item->max_price
                        ];
                    }),
                    'popular_items' => $popularItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'category' => $item->category,
                            'price' => (float) $item->price,
                            'total_sold' => (int) $item->total_sold,
                            'total_revenue' => (float) $item->total_revenue,
                            'order_count' => (int) $item->order_count
                        ];
                    }),
                    'category_revenue' => $categoryRevenue->map(function($item) {
                        return [
                            'category' => $item->category,
                            'total_revenue' => (float) $item->total_revenue,
                            'items_sold' => (int) $item->items_sold
                        ];
                    }),
                    'price_ranges' => $priceRanges->map(function($item) {
                        return [
                            'range' => $item->price_range,
                            'count' => (int) $item->count
                        ];
                    }),
                    'summary' => [
                        'total_items' => $menuItems->count(),
                        'available_items' => $menuItems->where('available', true)->count(),
                        'categories' => $categoryBreakdown->count(),
                        'avg_price' => $menuItems->avg('price')
                    ],
                    'period' => $period,
                    'date_range' => [
                        'start' => $dates['start']->format('Y-m-d'),
                        'end' => $dates['end']->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Menu report error: ' . $e->getMessage());
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

            // Category breakdown with enhanced metrics
            $categoryBreakdown = Inventory::selectRaw('
                category,
                COUNT(*) as count,
                SUM(quantity * cost_per_unit) as total_value,
                AVG(quantity) as avg_quantity,
                SUM(quantity) as total_quantity
            ')
                ->groupBy('category')
                ->get();

            // Stock alerts with more detailed categorization
            $lowStock = Inventory::whereRaw('quantity <= threshold AND quantity > critical_level')->get();
            $criticalStock = Inventory::whereRaw('quantity <= critical_level')->get();
            $adequateStock = Inventory::whereRaw('quantity > threshold')->get();

            // Most valuable items
            $valuableItems = Inventory::selectRaw('*, (quantity * cost_per_unit) as total_value')
                ->orderBy(DB::raw('quantity * cost_per_unit'), 'desc')
                ->limit(10)
                ->get();

            // Stock turnover analysis (items that might be overstocked)
            $overStocked = Inventory::whereRaw('quantity > threshold * 3')->get();

            // Unit analysis
            $unitBreakdown = Inventory::selectRaw('unit, COUNT(*) as count, SUM(quantity) as total_quantity')
                ->groupBy('unit')
                ->get();

            // Supplier analysis
            $supplierBreakdown = Inventory::selectRaw('
                supplier,
                COUNT(*) as items_count,
                SUM(quantity * cost_per_unit) as total_value,
                AVG(cost_per_unit) as avg_cost
            ')
                ->groupBy('supplier')
                ->orderBy('total_value', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'inventory_items' => $inventory,
                    'category_breakdown' => $categoryBreakdown->map(function($item) {
                        return [
                            'category' => $item->category,
                            'count' => (int) $item->count,
                            'total_value' => (float) $item->total_value,
                            'avg_quantity' => (float) $item->avg_quantity,
                            'total_quantity' => (float) $item->total_quantity
                        ];
                    }),
                    'alerts' => [
                        'low_stock' => $lowStock->map(function($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'quantity' => $item->quantity,
                                'threshold' => $item->threshold,
                                'unit' => $item->unit,
                                'category' => $item->category,
                                'cost_per_unit' => $item->cost_per_unit
                            ];
                        }),
                        'critical_stock' => $criticalStock->map(function($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'quantity' => $item->quantity,
                                'critical_level' => $item->critical_level,
                                'unit' => $item->unit,
                                'category' => $item->category,
                                'cost_per_unit' => $item->cost_per_unit
                            ];
                        }),
                        'adequate_stock' => $adequateStock->count()
                    ],
                    'valuable_items' => $valuableItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'quantity' => $item->quantity,
                            'cost_per_unit' => $item->cost_per_unit,
                            'total_value' => (float) $item->total_value,
                            'category' => $item->category,
                            'unit' => $item->unit
                        ];
                    }),
                    'overstocked_items' => $overStocked->map(function($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'quantity' => $item->quantity,
                            'threshold' => $item->threshold,
                            'excess_quantity' => $item->quantity - $item->threshold,
                            'category' => $item->category
                        ];
                    }),
                    'unit_breakdown' => $unitBreakdown->map(function($item) {
                        return [
                            'unit' => $item->unit,
                            'count' => (int) $item->count,
                            'total_quantity' => (float) $item->total_quantity
                        ];
                    }),
                    'supplier_breakdown' => $supplierBreakdown->map(function($item) {
                        return [
                            'supplier' => $item->supplier,
                            'items_count' => (int) $item->items_count,
                            'total_value' => (float) $item->total_value,
                            'avg_cost' => (float) $item->avg_cost
                        ];
                    }),
                    'summary' => [
                        'total_items' => $inventory->count(),
                        'total_value' => $inventory->sum(function($item) {
                            return $item->quantity * $item->cost_per_unit;
                        }),
                        'low_stock_count' => $lowStock->count(),
                        'critical_stock_count' => $criticalStock->count(),
                        'adequate_stock_count' => $adequateStock->count(),
                        'categories' => $categoryBreakdown->count(),
                        'suppliers' => $supplierBreakdown->count()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Inventory report error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get inventory report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
