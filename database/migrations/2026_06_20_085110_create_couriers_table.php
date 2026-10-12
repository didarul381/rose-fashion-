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
        Schema::create('couriers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('inside_city_charge', 12, 2)->default(0.00);
            $table->decimal('outside_city_charge', 12, 2)->default(0.00);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            
            // Steadfast Courier API settings
            $table->string('api_key')->nullable();
            $table->string('secret_key')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('couriers');
    }
};
