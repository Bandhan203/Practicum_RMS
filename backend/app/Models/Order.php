<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class Order extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'order_type',
        'table_number',
        'pickup_time',
        'status',
        'total_amount',
        'notes',
        'estimated_time',
        'waiter_id',
        'payment_method',
        'tax_amount',
        'discount_amount',
        'discount_reason',
        'served_at',
        'service_rating',
        'feedback'
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
        'served_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Alias for consistency with other parts of the system
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function waiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    /**
     * Get the bill associated with this order
     */
    public function bill(): HasOne
    {
        return $this->hasOne(Bill::class);
    }

    /**
     * Check if order has a bill
     */
    public function hasBill(): bool
    {
        return $this->bill()->exists();
    }

    /**
     * Get the waiter name for the order
     */
    public function getWaiterNameAttribute(): string
    {
        return $this->waiter ? $this->waiter->name : 'N/A';
    }

    // Analytics methods
    public static function getRevenueByDateRange(Carbon $startDate, Carbon $endDate)
    {
        return static::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->sum('total_amount');
    }

    public static function getOrdersByDateRange(Carbon $startDate, Carbon $endDate)
    {
        return static::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->count();
    }

    public static function getPaymentBreakdown(Carbon $startDate, Carbon $endDate)
    {
        return static::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
                    ->groupBy('payment_method')
                    ->get();
    }

    public static function getTopCustomers(Carbon $startDate, Carbon $endDate, int $limit = 10)
    {
        return static::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->selectRaw('customer_name, customer_email, COUNT(*) as order_count, SUM(total_amount) as total_spent')
                    ->whereNotNull('customer_name')
                    ->groupBy('customer_name', 'customer_email')
                    ->orderByDesc('total_spent')
                    ->limit($limit)
                    ->get();
    }

    // Status scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePreparing($query)
    {
        return $query->where('status', 'preparing');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    // Order type scopes
    public function scopeDineIn($query)
    {
        return $query->where('order_type', 'dine-in');
    }

    public function scopePickup($query)
    {
        return $query->where('order_type', 'pickup');
    }
}
