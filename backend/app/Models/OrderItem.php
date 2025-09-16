<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'menu_item_id',
        'item_name',
        'item_price',
        'quantity',
        'subtotal'
    ];

    protected $casts = [
        'item_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    // Calculate subtotal automatically
    public function calculateSubtotal(): float
    {
        return $this->quantity * $this->item_price;
    }

    // Boot method to calculate subtotal on save
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($orderItem) {
            $orderItem->subtotal = $orderItem->calculateSubtotal();
        });
    }
}
