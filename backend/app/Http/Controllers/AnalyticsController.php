<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Bill;
use App\Models\MenuItem;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get comprehensive analytics data with date range support
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $dateRange = $request->get('range', '7days');
            $startDate = $this->getStartDate($dateRange);
            $endDate = Carbon::now();

            $analytics = [
                'overview' => $this->getOverviewStats($startDate, $endDate),
                'revenue_trend' => $this->getRevenueTrend($startDate, $endDate),
                'order_distribution' => $this->getOrderTypeDistribution($startDate, $endDate),
                'top_items' => $this->getTopSellingItems($startDate, $endDate),
                'recent_activity' => $this->getRecentActivity(),
                'hourly_sales' => $this->getHourlySales($startDate, $endDate),
                'daily_comparison' => $this->getDailyComparison($startDate, $endDate),
                'customer_insights' => $this->getCustomerInsights($startDate, $endDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                    'range' => $dateRange
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats($startDate, $endDate): array
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate]);
        $bills = Bill::whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = $bills->sum('total_amount');
        $totalOrders = $orders->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $uniqueCustomers = $orders->distinct('customer_name')->count('customer_name');

        // Previous period comparison
        $previousStart = $startDate->copy()->subDays($startDate->diffInDays($endDate));
        $previousEnd = $startDate->copy()->subDay();
        
        $previousRevenue = Bill::whereBetween('created_at', [$previousStart, $previousEnd])->sum('total_amount');
        $previousOrders = Order::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $revenueGrowth = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
        $orderGrowth = $previousOrders > 0 ? (($totalOrders - $previousOrders) / $previousOrders) * 100 : 0;

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'unique_customers' => $uniqueCustomers,
            'revenue_growth' => round($revenueGrowth, 1),
            'order_growth' => round($orderGrowth, 1)
        ];
    }

    /**
     * Get revenue trend data
     */
    private function getRevenueTrend($startDate, $endDate): array
    {
        $days = $startDate->diffInDays($endDate) + 1;
        $trend = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            $revenue = Bill::whereBetween('created_at', [$dayStart, $dayEnd])->sum('total_amount');
            $orders = Order::whereBetween('created_at', [$dayStart, $dayEnd])->count();

            $trend[] = [
                'date' => $date->format('M j'),
                'full_date' => $date->toDateString(),
                'revenue' => round($revenue, 2),
                'orders' => $orders
            ];
        }

        return $trend;
    }

    /**
     * Get order type distribution
     */
    private function getOrderTypeDistribution($startDate, $endDate): array
    {
        $distribution = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select('order_type', DB::raw('count(*) as count'))
            ->groupBy('order_type')
            ->get();

        $total = $distribution->sum('count');
        
        return $distribution->map(function ($item) use ($total) {
            return [
                'type' => ucfirst($item->order_type),
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 1) : 0
            ];
        })->toArray();
    }

    /**
     * Get top selling items
     */
    private function getTopSellingItems($startDate, $endDate): array
    {
        $topItems = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'menu_items.name',
                'menu_items.price',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.price')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();

        return $topItems->map(function ($item) {
            return [
                'name' => $item->name,
                'quantity' => $item->total_quantity,
                'revenue' => round($item->total_revenue, 2),
                'avg_price' => round($item->price, 2)
            ];
        })->toArray();
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent orders
        $recentOrders = Order::with('orderItems.menuItem')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentOrders as $order) {
            $activities[] = [
                'type' => 'order',
                'message' => "New order {$order->order_number} from {$order->customer_name}",
                'time' => $order->created_at->diffForHumans(),
                'amount' => "৳" . number_format($order->total_amount, 2),
                'timestamp' => $order->created_at->toISOString()
            ];
        }

        // Recent bills
        $recentBills = Bill::orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentBills as $bill) {
            $activities[] = [
                'type' => 'payment',
                'message' => "Payment received for {$bill->bill_number}",
                'time' => $bill->created_at->diffForHumans(),
                'amount' => "৳" . number_format($bill->total_amount, 2),
                'timestamp' => $bill->created_at->toISOString()
            ];
        }

        // Sort by timestamp
        usort($activities, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($activities, 0, 8);
    }

    /**
     * Get hourly sales data
     */
    private function getHourlySales($startDate, $endDate): array
    {
        $hourlySales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy('hour')
            ->get();

        $hourlyData = [];
        for ($i = 0; $i < 24; $i++) {
            $hourData = $hourlySales->firstWhere('hour', $i);
            $hourlyData[] = [
                'hour' => $i,
                'time' => sprintf('%02d:00', $i),
                'orders' => $hourData ? $hourData->orders : 0,
                'revenue' => $hourData ? round($hourData->revenue, 2) : 0
            ];
        }

        return $hourlyData;
    }

    /**
     * Get daily comparison data
     */
    private function getDailyComparison($startDate, $endDate): array
    {
        $dailyStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(DISTINCT customer_name) as customers')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return $dailyStats->map(function ($stat) {
            return [
                'date' => $stat->date,
                'orders' => $stat->orders,
                'revenue' => round($stat->revenue, 2),
                'customers' => $stat->customers,
                'avg_order_value' => $stat->orders > 0 ? round($stat->revenue / $stat->orders, 2) : 0
            ];
        })->toArray();
    }

    /**
     * Get customer insights
     */
    private function getCustomerInsights($startDate, $endDate): array
    {
        $customerStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'customer_name',
                'customer_phone',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_spent'),
                DB::raw('AVG(total_amount) as avg_order_value'),
                DB::raw('MAX(created_at) as last_order')
            )
            ->groupBy('customer_name', 'customer_phone')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return $customerStats->map(function ($customer) {
            return [
                'name' => $customer->customer_name,
                'phone' => $customer->customer_phone,
                'orders' => $customer->order_count,
                'total_spent' => round($customer->total_spent, 2),
                'avg_order_value' => round($customer->avg_order_value, 2),
                'last_order' => Carbon::parse($customer->last_order)->diffForHumans()
            ];
        })->toArray();
    }

    /**
     * Get start date based on range
     */
    private function getStartDate(string $range): Carbon
    {
        switch ($range) {
            case '1day':
                return Carbon::today();
            case '7days':
                return Carbon::now()->subDays(6);
            case '30days':
                return Carbon::now()->subDays(29);
            case '90days':
                return Carbon::now()->subDays(89);
            case '1year':
                return Carbon::now()->subYear();
            default:
                return Carbon::now()->subDays(6);
        }
    }
}
