<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsReport extends Model
{
    protected $fillable = [
        'report_type',
        'period',
        'start_date',
        'end_date',
        'data',
        'generated_by',
        'status'
    ];

    protected $casts = [
        'data' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Generate comprehensive sales analytics
     */
    public static function generateSalesAnalytics($startDate, $endDate)
    {
        $startDate = Carbon::parse($startDate)->startOfDay();
        $endDate = Carbon::parse($endDate)->endOfDay();

        // Basic sales metrics
        $totalRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Daily breakdown
        $dailySales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Order type breakdown
        $orderTypeBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('order_type, COUNT(*) as count, SUM(total_amount) as revenue')
            ->groupBy('order_type')
            ->get();

        // Payment method breakdown
        $paymentMethodBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as revenue')
            ->groupBy('payment_method')
            ->get();

        // Top selling items
        $topItems = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                menu_items.name,
                menu_items.category,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.quantity * order_items.unit_price) as total_revenue
            ')
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Category performance
        $categoryPerformance = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                menu_items.category,
                COUNT(DISTINCT order_items.order_id) as orders_count,
                SUM(order_items.quantity) as items_sold,
                SUM(order_items.quantity * order_items.unit_price) as revenue
            ')
            ->groupBy('menu_items.category')
            ->orderByDesc('revenue')
            ->get();

        return [
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => $averageOrderValue,
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'days' => $startDate->diffInDays($endDate) + 1
                ]
            ],
            'daily_sales' => $dailySales,
            'order_type_breakdown' => $orderTypeBreakdown,
            'payment_method_breakdown' => $paymentMethodBreakdown,
            'top_items' => $topItems,
            'category_performance' => $categoryPerformance
        ];
    }

    /**
     * Generate inventory analytics
     */
    public static function generateInventoryAnalytics()
    {
        $totalItems = Inventory::count();
        $totalValue = Inventory::sum(DB::raw('quantity * cost'));

        $lowStockItems = Inventory::lowStock()->count();
        $criticalStockItems = Inventory::criticalStock()->count();
        $adequateStockItems = Inventory::adequateStock()->count();

        $expiredItems = Inventory::expired()->count();
        $expiringSoonItems = Inventory::expiringSoon()->count();

        // Category breakdown
        $categoryBreakdown = Inventory::selectRaw('
            category,
            COUNT(*) as item_count,
            SUM(quantity * cost) as total_value,
            SUM(CASE WHEN quantity <= critical_level THEN 1 ELSE 0 END) as critical_items,
            SUM(CASE WHEN quantity <= threshold AND quantity > critical_level THEN 1 ELSE 0 END) as low_items
        ')
        ->groupBy('category')
        ->get();

        // Most valuable items
        $mostValuableItems = Inventory::selectRaw('
            name,
            category,
            quantity,
            cost,
            (quantity * cost) as total_value
        ')
        ->orderByDesc(DB::raw('quantity * cost'))
        ->limit(10)
        ->get();

        // Recently updated items
        $recentlyUpdated = Inventory::orderByDesc('updated_at')
            ->limit(10)
            ->get();

        return [
            'summary' => [
                'total_items' => $totalItems,
                'total_value' => $totalValue,
                'low_stock_items' => $lowStockItems,
                'critical_stock_items' => $criticalStockItems,
                'adequate_stock_items' => $adequateStockItems,
                'expired_items' => $expiredItems,
                'expiring_soon_items' => $expiringSoonItems
            ],
            'category_breakdown' => $categoryBreakdown,
            'most_valuable_items' => $mostValuableItems,
            'recently_updated' => $recentlyUpdated,
            'stock_alerts' => [
                'critical' => Inventory::criticalStock()->get(['name', 'quantity', 'critical_level']),
                'low' => Inventory::lowStock()->get(['name', 'quantity', 'threshold']),
                'expired' => Inventory::expired()->get(['name', 'expiry_date']),
                'expiring_soon' => Inventory::expiringSoon()->get(['name', 'expiry_date'])
            ]
        ];
    }

    /**
     * Generate menu analytics
     */
    public static function generateMenuAnalytics($startDate = null, $endDate = null)
    {
        $startDate = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->subDays(30);
        $endDate = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now();

        $totalMenuItems = MenuItem::count();
        $availableItems = MenuItem::where('available', true)->count();
        $featuredItems = MenuItem::where('featured', true)->count();

        // Category breakdown
        $categoryBreakdown = MenuItem::selectRaw('category, COUNT(*) as count, AVG(price) as avg_price')
            ->groupBy('category')
            ->get();

        // Price analysis
        $priceAnalysis = MenuItem::selectRaw('
            MIN(price) as min_price,
            MAX(price) as max_price,
            AVG(price) as avg_price,
            COUNT(*) as total_items
        ')->first();

        // Popular items (based on orders)
        $popularItems = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                menu_items.id,
                menu_items.name,
                menu_items.category,
                menu_items.price,
                SUM(order_items.quantity) as times_ordered,
                SUM(order_items.quantity * order_items.unit_price) as revenue_generated
            ')
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category', 'menu_items.price')
            ->orderByDesc('times_ordered')
            ->limit(10)
            ->get();

        // Least popular items
        $leastPopularItems = DB::table('menu_items')
            ->leftJoin('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->leftJoin('orders', function($join) use ($startDate, $endDate) {
                $join->on('orders.id', '=', 'order_items.order_id')
                     ->whereBetween('orders.created_at', [$startDate, $endDate])
                     ->where('orders.status', 'completed');
            })
            ->selectRaw('
                menu_items.id,
                menu_items.name,
                menu_items.category,
                menu_items.price,
                COALESCE(SUM(order_items.quantity), 0) as times_ordered
            ')
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category', 'menu_items.price')
            ->orderBy('times_ordered')
            ->limit(10)
            ->get();

        return [
            'summary' => [
                'total_menu_items' => $totalMenuItems,
                'available_items' => $availableItems,
                'featured_items' => $featuredItems,
                'unavailable_items' => $totalMenuItems - $availableItems
            ],
            'category_breakdown' => $categoryBreakdown,
            'price_analysis' => $priceAnalysis,
            'popular_items' => $popularItems,
            'least_popular_items' => $leastPopularItems,
            'performance_metrics' => [
                'items_never_ordered' => $leastPopularItems->where('times_ordered', 0)->count(),
                'high_performers' => $popularItems->where('times_ordered', '>', 50)->count(),
                'average_orders_per_item' => $popularItems->avg('times_ordered')
            ]
        ];
    }

    /**
     * Generate comprehensive dashboard statistics
     */
    public static function generateDashboardStats($period = 'today')
    {
        $dates = self::getDateRangeForPeriod($period);
        $startDate = $dates['start'];
        $endDate = $dates['end'];

        // Sales metrics
        $salesData = self::generateSalesAnalytics($startDate, $endDate);

        // Order status breakdown
        $orderStatusBreakdown = Order::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->get();

        // Inventory alerts
        $inventoryAlerts = [
            'critical_stock' => Inventory::criticalStock()->count(),
            'low_stock' => Inventory::lowStock()->count(),
            'expired_items' => Inventory::expired()->count(),
            'expiring_soon' => Inventory::expiringSoon()->count()
        ];

        // Recent activity
        $recentOrders = Order::with(['orderItems.menuItem'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return [
            'period' => $period,
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ],
            'sales_summary' => $salesData['summary'],
            'order_status_breakdown' => $orderStatusBreakdown,
            'inventory_alerts' => $inventoryAlerts,
            'recent_orders' => $recentOrders,
            'kpis' => [
                'total_revenue' => $salesData['summary']['total_revenue'],
                'total_orders' => $salesData['summary']['total_orders'],
                'average_order_value' => $salesData['summary']['average_order_value'],
                'inventory_value' => Inventory::sum(DB::raw('quantity * cost')),
                'menu_items_count' => MenuItem::count(),
                'available_items_count' => MenuItem::where('available', true)->count()
            ]
        ];
    }

    /**
     * Get date range for different periods
     */
    private static function getDateRangeForPeriod($period)
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
     * Relationship to user who generated the report
     */
    public function generatedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'generated_by');
    }
}
