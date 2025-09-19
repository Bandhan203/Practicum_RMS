<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Inventory extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'inventory';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'quantity',
        'unit',
        'category',
        'threshold',
        'critical_level',
        'cost',
        'description',
        'supplier',
        'expiry_date'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'quantity' => 'decimal:2',
        'threshold' => 'decimal:2',
        'critical_level' => 'decimal:2',
        'cost' => 'decimal:2',
        'expiry_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the stock status of the item.
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->quantity <= $this->critical_level) {
            return 'critical';
        } elseif ($this->quantity <= $this->threshold) {
            return 'low';
        }
        return 'adequate';
    }

    /**
     * Get the total value of this inventory item.
     */
    public function getTotalValueAttribute(): float
    {
        return $this->quantity * $this->cost;
    }

    /**
     * Check if the item is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if the item is expiring soon (within 7 days).
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isBefore(now()->addDays(7));
    }

    /**
     * Scope for low stock items.
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'threshold');
    }

    /**
     * Scope for critical stock items.
     */
    public function scopeCriticalStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'critical_level');
    }

    /**
     * Scope for adequate stock items.
     */
    public function scopeAdequateStock($query)
    {
        return $query->whereColumn('quantity', '>', 'threshold');
    }

    /**
     * Scope for expired items.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope for items expiring soon.
     */
    public function scopeExpiringSoon($query)
    {
        return $query->where('expiry_date', '<=', now()->addDays(7))
                    ->where('expiry_date', '>', now());
    }

    /**
     * Adjust stock quantity.
     */
    public function adjustStock(float $adjustment): bool
    {
        $newQuantity = $this->quantity + $adjustment;

        if ($newQuantity < 0) {
            return false; // Cannot have negative stock
        }

        $this->quantity = $newQuantity;
        return $this->save();
    }

    /**
     * Get formatted last updated time.
     */
    public function getFormattedUpdatedAtAttribute(): string
    {
        return $this->updated_at->format('M d, H:i');
    }
}
