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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // business, orders, menu, inventory
            $table->json('parameters')->nullable(); // date ranges, filters, etc.
            $table->timestamp('generated_at');
            $table->json('cached_data')->nullable(); // cached report data
            $table->timestamp('expires_at')->nullable(); // cache expiration
            $table->timestamps();

            // Indexes for better performance
            $table->index(['type', 'generated_at']);
            $table->index(['expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
