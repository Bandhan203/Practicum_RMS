<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use App\Models\RevenueAnalytics;
use App\Models\WaiterPerformance;
use App\Models\AnalyticsCache;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    /**
     * Get comprehensive analytics for dashboard
     */
    public function getAnalytics(Carbon $startDate, Carbon $endDate, string $groupBy = 'day')
    {
        $cacheKey = "analytics_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$groupBy}";

        // Try to get from cache first
        $cached = AnalyticsCache::getCached($cacheKey);
        if ($cached) {
            return $cached;
        }

        try {
            $analytics = [
                'revenue_trend' => $this->getRevenueTrend($startDate, $endDate, $groupBy),
                'revenue_by_category' => $this->getRevenueByCategory($startDate, $endDate),
                'top_items' => $this->getTopItems($startDate, $endDate),
                'top_customers' => $this->getTopCustomers($startDate, $endDate),
                'payment_mix' => $this->getPaymentMix($startDate, $endDate),
                'waiter_performance' => $this->getWaiterPerformance($startDate, $endDate),
                'summary_stats' => $this->getSummaryStats($startDate, $endDate)
            ];

            // Cache for 30 minutes
            AnalyticsCache::store($cacheKey, $analytics, 30);

            return $analytics;
        } catch (\Exception $e) {
            Log::error('Analytics calculation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get revenue trend data
     */
    public function getRevenueTrend(Carbon $startDate, Carbon $endDate, string $groupBy = 'day')
    {
        $query = Order::whereBetween('created_at', [$startDate, $endDate])
                     ->where('status', 'completed');

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('
                    YEAR(created_at) as year,
                    WEEK(created_at) as week,
                    DATE(MIN(created_at)) as date,
                    SUM(total_amount) as revenue,
                    COUNT(*) as orders,
                    AVG(total_amount) as avg_order_value
                ')
                ->groupByRaw('YEAR(created_at), WEEK(created_at)')
                ->orderBy('year')
                ->orderBy('week')
                ->get()
                ->map(function ($item) {
                    $item->period = "Week {$item->week}, {$item->year}";
                    return $item;
                });

            case 'month':
                return $query->selectRaw('
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    DATE(MIN(created_at)) as date,
                    SUM(total_amount) as revenue,
                    COUNT(*) as orders,
                    AVG(total_amount) as avg_order_value
                ')
                ->groupByRaw('YEAR(created_at), MONTH(created_at)')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    $monthName = Carbon::create($item->year, $item->month, 1)->format('M');
                    $item->period = "{$monthName} {$item->year}";
                    return $item;
                });

            default: // day
                return $query->selectRaw('
                    DATE(created_at) as date,
                    SUM(total_amount) as revenue,
                    COUNT(*) as orders,
                    AVG(total_amount) as avg_order_value
                ')
                ->groupByRaw('DATE(created_at)')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    $item->period = Carbon::parse($item->date)->format('M d');
                    return $item;
                });
        }
    }

    /**
     * Get revenue breakdown by category
     */
    public function getRevenueByCategory(Carbon $startDate, Carbon $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                menu_items.category,
                SUM(order_items.subtotal) as revenue,
                SUM(order_items.quantity) as items_sold,
                COUNT(DISTINCT orders.id) as orders_count
            ')
            ->groupBy('menu_items.category')
            ->orderByDesc('revenue')
            ->get();
    }

    /**
     * Get top selling items
     */
    public function getTopItems(Carbon $startDate, Carbon $endDate, int $limit = 10)
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('
                order_items.item_name,
                menu_items.category,
                SUM(order_items.quantity) as quantity_sold,
                SUM(order_items.subtotal) as revenue,
                AVG(order_items.item_price) as avg_price,
                COUNT(DISTINCT orders.id) as orders_count
            ')
            ->groupBy('order_items.item_name', 'menu_items.category')
            ->orderByDesc('quantity_sold')
            ->limit($limit)
            ->get();
    }

    /**
     * Get top customers
     */
    public function getTopCustomers(Carbon $startDate, Carbon $endDate, int $limit = 10)
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
                   ->where('status', 'completed')
                   ->whereNotNull('customer_name')
                   ->selectRaw('
                       customer_name,
                       customer_email,
                       customer_phone,
                       COUNT(*) as order_count,
                       SUM(total_amount) as total_spent,
                       AVG(total_amount) as avg_order_value,
                       MAX(created_at) as last_order_date
                   ')
                   ->groupBy('customer_name', 'customer_email', 'customer_phone')
                   ->orderByDesc('total_spent')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get payment method breakdown
     */
    public function getPaymentMix(Carbon $startDate, Carbon $endDate)
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
                   ->where('status', 'completed')
                   ->selectRaw('
                       payment_method,
                       COUNT(*) as transaction_count,
                       SUM(total_amount) as total_amount,
                       AVG(total_amount) as avg_transaction_value
                   ')
                   ->groupBy('payment_method')
                   ->orderByDesc('total_amount')
                   ->get();
    }

    /**
     * Get waiter performance data
     */
    public function getWaiterPerformance(Carbon $startDate, Carbon $endDate)
    {
        return DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.waiter_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->whereNotNull('orders.waiter_id')
            ->selectRaw('
                users.name as waiter_name,
                users.id as waiter_id,
                COUNT(*) as total_orders,
                SUM(orders.total_amount) as total_revenue,
                AVG(orders.total_amount) as avg_order_value,
                AVG(orders.service_rating) as avg_rating,
                COUNT(DISTINCT orders.customer_name) as customers_served
            ')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_revenue')
            ->get();
    }

    /**
     * Get summary statistics
     */
    public function getSummaryStats(Carbon $startDate, Carbon $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                      ->where('status', 'completed');

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $uniqueCustomers = $orders->whereNotNull('customer_name')
                                 ->distinct('customer_name')
                                 ->count('customer_name');

        $totalTax = $orders->sum('tax_amount');
        $totalDiscount = $orders->sum('discount_amount');

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'unique_customers' => $uniqueCustomers,
            'total_tax' => round($totalTax, 2),
            'total_discount' => round($totalDiscount, 2),
            'period_days' => $startDate->diffInDays($endDate) + 1
        ];
    }

    /**
     * Generate daily analytics data for caching
     */
    public function generateDailyAnalytics(Carbon $date = null)
    {
        $date = $date ?? now()->subDay();

        try {
            DB::beginTransaction();

            // Generate revenue analytics
            $this->generateDailyRevenueAnalytics($date);

            // Generate waiter performance
            $this->generateDailyWaiterPerformance($date);

            DB::commit();

            Log::info("Daily analytics generated for {$date->format('Y-m-d')}");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to generate daily analytics for {$date->format('Y-m-d')}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate daily revenue analytics
     */
    protected function generateDailyRevenueAnalytics(Carbon $date)
    {
        $startDate = $date->copy()->startOfDay();
        $endDate = $date->copy()->endOfDay();

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                      ->where('status', 'completed')
                      ->get();

        if ($orders->isEmpty()) {
            return;
        }

        $totalRevenue = $orders->sum('total_amount');
        $totalTax = $orders->sum('tax_amount');
        $totalDiscount = $orders->sum('discount_amount');
        $totalOrders = $orders->count();
        $uniqueCustomers = $orders->whereNotNull('customer_name')->unique('customer_name')->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Payment breakdown
        $paymentBreakdown = $orders->groupBy('payment_method')
                                  ->map(fn($group) => $group->sum('total_amount'))
                                  ->toArray();

        // Category breakdown
        $categoryBreakdown = $this->getCategoryBreakdownForDate($startDate, $endDate);

        RevenueAnalytics::updateOrCreate(
            ['report_date' => $date->format('Y-m-d')],
            [
                'total_revenue' => $totalRevenue,
                'total_tax' => $totalTax,
                'total_discount' => $totalDiscount,
                'total_orders' => $totalOrders,
                'total_customers' => $uniqueCustomers,
                'average_order_value' => $avgOrderValue,
                'payment_breakdown' => $paymentBreakdown,
                'category_breakdown' => $categoryBreakdown
            ]
        );
    }

    /**
     * Generate daily waiter performance
     */
    protected function generateDailyWaiterPerformance(Carbon $date)
    {
        $startDate = $date->copy()->startOfDay();
        $endDate = $date->copy()->endOfDay();

        $waiterStats = DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.waiter_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->whereNotNull('orders.waiter_id')
            ->selectRaw('
                orders.waiter_id,
                COUNT(*) as total_orders,
                SUM(orders.total_amount) as total_revenue,
                AVG(orders.total_amount) as avg_order_value,
                AVG(orders.service_rating) as avg_rating,
                COUNT(DISTINCT orders.customer_name) as customers_served
            ')
            ->groupBy('orders.waiter_id')
            ->get();

        foreach ($waiterStats as $stat) {
            WaiterPerformance::updateOrCreate(
                [
                    'waiter_id' => $stat->waiter_id,
                    'report_date' => $date->format('Y-m-d')
                ],
                [
                    'total_orders' => $stat->total_orders,
                    'total_revenue' => $stat->total_revenue,
                    'average_order_value' => $stat->avg_order_value,
                    'average_service_rating' => $stat->avg_rating,
                    'total_customers_served' => $stat->customers_served
                ]
            );
        }
    }

    /**
     * Get category breakdown for specific date range
     */
    protected function getCategoryBreakdownForDate(Carbon $startDate, Carbon $endDate)
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->selectRaw('menu_items.category, SUM(order_items.subtotal) as revenue')
            ->groupBy('menu_items.category')
            ->pluck('revenue', 'category')
            ->toArray();
    }

    /**
     * Clear old cache entries
     */
    public function clearOldCache()
    {
        return AnalyticsCache::clearExpired();
    }
}
