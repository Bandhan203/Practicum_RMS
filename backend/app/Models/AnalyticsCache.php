<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsCache extends Model
{
    use HasFactory;

    protected $table = 'analytics_cache';

    protected $fillable = [
        'cache_key',
        'data',
        'expires_at'
    ];

    protected $casts = [
        'data' => 'array',
        'expires_at' => 'datetime'
    ];

    /**
     * Check if cache is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Get cached data if not expired
     */
    public static function getCached(string $key)
    {
        $cache = static::where('cache_key', $key)->first();

        if (!$cache || $cache->isExpired()) {
            return null;
        }

        return $cache->data;
    }

    /**
     * Store data in cache
     */
    public static function store(string $key, array $data, int $minutesToExpire = 60)
    {
        return static::updateOrCreate(
            ['cache_key' => $key],
            [
                'data' => $data,
                'expires_at' => now()->addMinutes($minutesToExpire)
            ]
        );
    }

    /**
     * Clear expired cache entries
     */
    public static function clearExpired()
    {
        return static::where('expires_at', '<', now())->delete();
    }
}
