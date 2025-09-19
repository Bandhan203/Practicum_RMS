<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RevenueAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_date',
        'total_revenue',
        'total_tax',
        'total_discount',
        'total_orders',
        'total_customers',
        'average_order_value',
        'payment_breakdown',
        'category_breakdown'
    ];

    protected $casts = [
        'report_date' => 'date',
        'total_revenue' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'payment_breakdown' => 'array',
        'category_breakdown' => 'array'
    ];

    /**
     * Get revenue for date range
     */
    public static function getForDateRange(Carbon $startDate, Carbon $endDate)
    {
        return static::whereBetween('report_date', [$startDate, $endDate])
                    ->orderBy('report_date')
                    ->get();
    }

    /**
     * Get aggregated revenue for period
     */
    public static function getAggregatedRevenue(Carbon $startDate, Carbon $endDate, string $groupBy = 'day')
    {
        $query = static::whereBetween('report_date', [$startDate, $endDate]);

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('
                    YEAR(report_date) as year,
                    WEEK(report_date) as week,
                    SUM(total_revenue) as total_revenue,
                    SUM(total_orders) as total_orders,
                    AVG(average_order_value) as average_order_value,
                    MIN(report_date) as period_start
                ')
                ->groupByRaw('YEAR(report_date), WEEK(report_date)')
                ->orderBy('year')
                ->orderBy('week')
                ->get();

            case 'month':
                return $query->selectRaw('
                    YEAR(report_date) as year,
                    MONTH(report_date) as month,
                    SUM(total_revenue) as total_revenue,
                    SUM(total_orders) as total_orders,
                    AVG(average_order_value) as average_order_value,
                    MIN(report_date) as period_start
                ')
                ->groupByRaw('YEAR(report_date), MONTH(report_date)')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            default: // day
                return $query->orderBy('report_date')->get();
        }
    }
}
