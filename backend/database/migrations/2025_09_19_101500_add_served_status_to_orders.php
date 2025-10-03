<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'served' to the ENUM list for orders.status
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','preparing','ready','served','completed','cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to previous ENUM without 'served'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','preparing','ready','completed','cancelled') DEFAULT 'pending'");
    }
};
