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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_number')->unique(); // e.g., BILL-2025-001
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('table_number')->nullable();
            $table->enum('order_type', ['dine-in', 'pickup', 'delivery'])->default('dine-in');

            // Financial Details
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(8.00); // Tax rate as percentage
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('service_charge', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2);

            // Payment Details
            $table->enum('payment_method', ['cash', 'card', 'digital', 'bank_transfer'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'partially_paid', 'refunded'])->default('pending');
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->decimal('change_amount', 10, 2)->default(0.00);
            $table->timestamp('payment_date')->nullable();
            $table->string('payment_reference')->nullable(); // Transaction ID, etc.

            // Additional Information
            $table->text('notes')->nullable();
            $table->string('waiter_name')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_printed')->default(false);
            $table->timestamp('printed_at')->nullable();

            // Status and Timestamps
            $table->enum('status', ['draft', 'generated', 'paid', 'cancelled', 'refunded'])->default('draft');
            $table->timestamps();

            // Indexes for better performance
            $table->index(['order_id']);
            $table->index(['payment_status']);
            $table->index(['status']);
            $table->index(['bill_number']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
