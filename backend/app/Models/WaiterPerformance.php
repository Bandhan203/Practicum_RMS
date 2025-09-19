<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class WaiterPerformance extends Model
{
    use HasFactory;

    protected $fillable = [
        'waiter_id',
        'report_date',
        'total_orders',
        'total_revenue',
        'average_order_value',
        'average_service_rating',
        'total_customers_served',
        'average_service_time'
    ];

    protected $casts = [
        'report_date' => 'date',
        'total_revenue' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'average_service_rating' => 'decimal:2',
        'average_service_time' => 'datetime'
    ];

    /**
     * Get the waiter that owns this performance record
     */
    public function waiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    /**
     * Get performance for date range
     */
    public static function getForDateRange(Carbon $startDate, Carbon $endDate, ?int $waiterId = null)
    {
        $query = static::whereBetween('report_date', [$startDate, $endDate])
                      ->with('waiter');

        if ($waiterId) {
            $query->where('waiter_id', $waiterId);
        }

        return $query->orderBy('report_date')->get();
    }

    /**
     * Get top performing waiters
     */
    public static function getTopWaiters(Carbon $startDate, Carbon $endDate, int $limit = 10)
    {
        return static::whereBetween('report_date', [$startDate, $endDate])
                    ->with('waiter')
                    ->selectRaw('
                        waiter_id,
                        SUM(total_orders) as total_orders,
                        SUM(total_revenue) as total_revenue,
                        AVG(average_order_value) as avg_order_value,
                        AVG(average_service_rating) as avg_rating,
                        SUM(total_customers_served) as total_customers
                    ')
                    ->groupBy('waiter_id')
                    ->orderByDesc('total_revenue')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Get performance comparison
     */
    public static function getPerformanceComparison(Carbon $startDate, Carbon $endDate, string $groupBy = 'day')
    {
        $query = static::whereBetween('report_date', [$startDate, $endDate])
                      ->with('waiter');

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('
                    waiter_id,
                    YEAR(report_date) as year,
                    WEEK(report_date) as week,
                    SUM(total_orders) as total_orders,
                    SUM(total_revenue) as total_revenue,
                    AVG(average_service_rating) as avg_rating,
                    MIN(report_date) as period_start
                ')
                ->groupByRaw('waiter_id, YEAR(report_date), WEEK(report_date)')
                ->orderBy('year')
                ->orderBy('week')
                ->get();

            case 'month':
                return $query->selectRaw('
                    waiter_id,
                    YEAR(report_date) as year,
                    MONTH(report_date) as month,
                    SUM(total_orders) as total_orders,
                    SUM(total_revenue) as total_revenue,
                    AVG(average_service_rating) as avg_rating,
                    MIN(report_date) as period_start
                ')
                ->groupByRaw('waiter_id, YEAR(report_date), MONTH(report_date)')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            default: // day
                return $query->orderBy('report_date')->get();
        }
    }
}
