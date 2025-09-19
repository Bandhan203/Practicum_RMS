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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit');
            $table->string('category');
            $table->decimal('threshold', 10, 2)->default(10);
            $table->decimal('critical_level', 10, 2)->default(5);
            $table->decimal('cost', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('supplier')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index('category');
            $table->index(['quantity', 'threshold']);
            $table->index(['quantity', 'critical_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
