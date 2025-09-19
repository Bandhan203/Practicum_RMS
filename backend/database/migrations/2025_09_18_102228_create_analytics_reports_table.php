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
        Schema::create('analytics_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_type'); // sales, inventory, menu, dashboard
            $table->string('period')->nullable(); // today, week, month, year, custom
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('data'); // Report data as JSON
            $table->foreignId('generated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['generating', 'completed', 'failed'])->default('completed');
            $table->timestamps();

            $table->index(['report_type', 'period']);
            $table->index(['start_date', 'end_date']);
            $table->index('generated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_reports');
    }
};
