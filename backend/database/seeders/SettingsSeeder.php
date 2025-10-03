<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'restaurant_name',
                'value' => 'My Restaurant',
                'type' => 'string',
                'category' => 'restaurant',
                'description' => 'Name of the restaurant',
                'is_public' => true
            ],
            [
                'key' => 'restaurant_address',
                'value' => '123 Main Street, City, State 12345',
                'type' => 'string',
                'category' => 'restaurant',
                'description' => 'Restaurant address',
                'is_public' => true
            ],
            [
                'key' => 'restaurant_phone',
                'value' => '+1-234-567-8900',
                'type' => 'string',
                'category' => 'restaurant',
                'description' => 'Restaurant phone number',
                'is_public' => true
            ],
            [
                'key' => 'restaurant_email',
                'value' => 'info@myrestaurant.com',
                'type' => 'string',
                'category' => 'restaurant',
                'description' => 'Restaurant email address',
                'is_public' => true
            ],
            [
                'key' => 'tax_rate',
                'value' => '8.5',
                'type' => 'number',
                'category' => 'tax',
                'description' => 'Default tax rate percentage',
                'is_public' => false
            ],
            [
                'key' => 'service_charge',
                'value' => '10.0',
                'type' => 'number',
                'category' => 'tax',
                'description' => 'Service charge percentage',
                'is_public' => false
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default currency',
                'is_public' => true
            ],
            [
                'key' => 'currency_symbol',
                'value' => '$',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Currency symbol',
                'is_public' => true
            ],
            [
                'key' => 'enable_notifications',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'system',
                'description' => 'Enable system notifications',
                'is_public' => false
            ],
            [
                'key' => 'max_tables',
                'value' => '20',
                'type' => 'number',
                'category' => 'restaurant',
                'description' => 'Maximum number of tables',
                'is_public' => false
            ],
            [
                'key' => 'opening_hours',
                'value' => '{"monday": "9:00-22:00", "tuesday": "9:00-22:00", "wednesday": "9:00-22:00", "thursday": "9:00-22:00", "friday": "9:00-23:00", "saturday": "9:00-23:00", "sunday": "10:00-21:00"}',
                'type' => 'json',
                'category' => 'restaurant',
                'description' => 'Restaurant opening hours',
                'is_public' => true
            ],
            [
                'key' => 'default_preparation_time',
                'value' => '20',
                'type' => 'number',
                'category' => 'general',
                'description' => 'Default preparation time in minutes',
                'is_public' => false
            ]
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
