<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('revenue_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('report_date');
            $table->decimal('total_revenue', 10, 2);
            $table->decimal('total_tax', 8, 2);
            $table->decimal('total_discount', 8, 2);
            $table->integer('total_orders');
            $table->integer('total_customers');
            $table->decimal('average_order_value', 8, 2);
            $table->json('payment_breakdown'); // {cash: amount, card: amount, etc}
            $table->json('category_breakdown'); // {category_name: amount}
            $table->timestamps();

            $table->unique('report_date');
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenue_analytics');
    }
};
