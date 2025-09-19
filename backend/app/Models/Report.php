<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class Report extends Model
{
    protected $fillable = [
        'name',
        'type',
        'parameters',
        'generated_at',
        'cached_data',
        'expires_at'
    ];

    protected $casts = [
        'parameters' => 'array',
        'cached_data' => 'array',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Generate comprehensive business report
     */
    public static function generateBusinessReport($startDate, $endDate)
    {
        $cacheKey = "business_report_{$startDate}_{$endDate}";
        
        return Cache::remember($cacheKey, 300, function () use ($startDate, $endDate) {
            return [
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate
                ],
                'orders_summary' => self::getOrdersSummary($startDate, $endDate),
                'menu_performance' => self::getMenuPerformance($startDate, $endDate),
                'inventory_status' => self::getInventoryStatus(),
                'financial_overview' => self::getFinancialOverview($startDate, $endDate)
            ];
        });
    }

    /**
     * Get orders summary
     */
    private static function getOrdersSummary($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate]);
        
        return [
            'total_orders' => $orders->count(),
            'completed_orders' => $orders->where('status', 'completed')->count(),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
            'total_revenue' => $orders->where('status', 'completed')->sum('total_amount'),
            'average_order_value' => $orders->where('status', 'completed')->avg('total_amount') ?? 0,
            'order_types' => $orders->selectRaw('order_type, COUNT(*) as count')
                ->groupBy('order_type')
                ->pluck('count', 'order_type'),
            'daily_stats' => $orders->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue')
                ->where('status', 'completed')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
        ];
    }

    /**
     * Get menu performance data
     */
    private static function getMenuPerformance($startDate, $endDate)
    {
        // Top selling items
        $topItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->select(
                'menu_items.name',
                'menu_items.category',
                'menu_items.price',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category', 'menu_items.price')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Category performance
        $categoryStats = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->select(
                'menu_items.category',
                DB::raw('COUNT(DISTINCT menu_items.id) as items_count'),
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('menu_items.category')
            ->orderByDesc('total_revenue')
            ->get();

        return [
            'top_selling_items' => $topItems,
            'category_performance' => $categoryStats,
            'menu_overview' => [
                'total_items' => MenuItem::count(),
                'available_items' => MenuItem::where('available', true)->count(),
                'categories_count' => MenuItem::distinct('category')->count('category'),
                'featured_items' => MenuItem::where('featured', true)->count()
            ]
        ];
    }

    /**
     * Get inventory status
     */
    private static function getInventoryStatus()
    {
        $totalItems = Inventory::count();
        $criticalStock = Inventory::criticalStock()->count();
        $lowStock = Inventory::lowStock()->count();
        $adequateStock = $totalItems - $criticalStock - $lowStock;

        return [
            'total_items' => $totalItems,
            'stock_levels' => [
                'critical' => $criticalStock,
                'low' => $lowStock,
                'adequate' => $adequateStock
            ],
            'total_value' => Inventory::sum(DB::raw('quantity * cost')),
            'critical_items' => Inventory::criticalStock()
                ->select('name', 'quantity', 'critical_level', 'unit')
                ->limit(10)
                ->get(),
            'expiry_alerts' => [
                'expired' => Inventory::expired()->count(),
                'expiring_soon' => Inventory::expiringSoon()->count()
            ],
            'category_breakdown' => Inventory::select('category')
                ->selectRaw('COUNT(*) as count, SUM(quantity * cost) as value')
                ->groupBy('category')
                ->get()
        ];
    }

    /**
     * Get financial overview
     */
    private static function getFinancialOverview($startDate, $endDate)
    {
        $completedOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        $totalRevenue = $completedOrders->sum('total_amount');
        $totalTax = $completedOrders->sum('tax_amount');
        $totalDiscount = $completedOrders->sum('discount_amount');

        // Payment method breakdown
        $paymentBreakdown = $completedOrders->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->get();

        return [
            'revenue_summary' => [
                'gross_revenue' => $totalRevenue,
                'total_tax' => $totalTax,
                'total_discounts' => $totalDiscount,
                'net_revenue' => $totalRevenue - $totalDiscount
            ],
            'payment_methods' => $paymentBreakdown,
            'inventory_investment' => Inventory::sum(DB::raw('quantity * cost')),
            'profit_margins' => self::calculateProfitMargins($startDate, $endDate)
        ];
    }

    /**
     * Calculate basic profit margins
     */
    private static function calculateProfitMargins($startDate, $endDate)
    {
        // This is a simplified calculation
        // In a real scenario, you'd need cost of goods sold data
        $revenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('total_amount');

        $inventoryCost = Inventory::sum(DB::raw('quantity * cost')) * 0.3; // Assumed 30% usage

        return [
            'estimated_cogs' => $inventoryCost,
            'estimated_gross_profit' => $revenue - $inventoryCost,
            'estimated_margin_percentage' => $revenue > 0 ? (($revenue - $inventoryCost) / $revenue) * 100 : 0
        ];
    }

    /**
     * Generate and cache report
     */
    public static function generateAndCache($type, $parameters)
    {
        $data = [];
        
        switch ($type) {
            case 'business':
                $data = self::generateBusinessReport(
                    $parameters['start_date'],
                    $parameters['end_date']
                );
                break;
            default:
                throw new \InvalidArgumentException("Unknown report type: {$type}");
        }

        // Cache the report
        $report = new self([
            'name' => ucfirst($type) . ' Report',
            'type' => $type,
            'parameters' => $parameters,
            'generated_at' => now(),
            'cached_data' => $data,
            'expires_at' => now()->addHours(1)
        ]);

        $report->save();

        return $report;
    }

    /**
     * Get cached report if still valid
     */
    public static function getCachedReport($type, $parameters)
    {
        return self::where('type', $type)
            ->where('parameters', $parameters)
            ->where('expires_at', '>', now())
            ->orderBy('generated_at', 'desc')
            ->first();
    }
}