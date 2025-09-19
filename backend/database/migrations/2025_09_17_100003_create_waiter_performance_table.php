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
        Schema::create('waiter_performance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('waiter_id')->constrained('users')->onDelete('cascade');
            $table->date('report_date');
            $table->integer('total_orders');
            $table->decimal('total_revenue', 10, 2);
            $table->decimal('average_order_value', 8, 2);
            $table->decimal('average_service_rating', 3, 2)->nullable();
            $table->integer('total_customers_served');
            $table->time('average_service_time')->nullable();
            $table->timestamps();

            $table->unique(['waiter_id', 'report_date']);
            $table->index(['waiter_id', 'report_date']);
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waiter_performance');
    }
};
