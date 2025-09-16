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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 8, 2);
            $table->string('category');
            $table->string('image')->nullable();
            $table->integer('preparation_time')->default(15); // in minutes
            $table->boolean('available')->default(true);
            $table->boolean('featured')->default(false);
            $table->json('ingredients')->nullable();
            $table->string('dietary_info')->nullable(); // vegetarian, vegan, gluten-free, etc.
            $table->integer('calories')->nullable();
            $table->decimal('rating', 3, 2)->default(4.5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
