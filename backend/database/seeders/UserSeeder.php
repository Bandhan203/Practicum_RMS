<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@restaurant.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Restaurant Manager',
            'email' => 'manager@restaurant.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'System Administrator',
            'email' => 'sysadmin@restaurant.com',
            'password' => Hash::make('password'),
        ]);
    }
}
