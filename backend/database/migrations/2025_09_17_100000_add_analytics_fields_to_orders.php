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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('waiter_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('payment_method', ['cash', 'card', 'digital_wallet', 'bank_transfer'])->default('cash');
            $table->decimal('tax_amount', 8, 2)->default(0);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->string('discount_reason')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->integer('service_rating')->nullable(); // 1-5 stars
            $table->text('feedback')->nullable();
            $table->index(['created_at', 'status']);
            $table->index(['waiter_id', 'created_at']);
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['waiter_id']);
            $table->dropColumn([
                'waiter_id',
                'payment_method',
                'tax_amount',
                'discount_amount',
                'discount_reason',
                'served_at',
                'service_rating',
                'feedback'
            ]);
        });
    }
};
