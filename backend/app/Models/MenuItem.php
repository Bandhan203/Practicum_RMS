<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'image',
        'preparation_time',
        'available',
        'featured',
        'ingredients',
        'dietary_info',
        'calories',
        'rating',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'available' => 'boolean',
        'featured' => 'boolean',
        'ingredients' => 'array',
        'rating' => 'decimal:2',
        'preparation_time' => 'integer',
        'calories' => 'integer',
    ];

    // Scope for available items
    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    // Scope for featured items
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    // Scope for category
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
