<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Seed default order statuses from user's request/images
        $statuses = [
            [
                'name' => 'Canceled',
                'slug' => 'cancelled',
                'color' => '#ef4444', // Red
                'sort_order' => 0,
                'is_default' => false,
            ],
            [
                'name' => 'Complete',
                'slug' => 'completed',
                'color' => '#22c55e', // Green
                'sort_order' => 1,
                'is_default' => false,
            ],
            [
                'name' => 'Hold',
                'slug' => 'hold',
                'color' => '#38bdf8', // Cyan
                'sort_order' => 2,
                'is_default' => false,
            ],
            [
                'name' => 'In Courier',
                'slug' => 'in_courier',
                'color' => '#0d9488', // Teal
                'sort_order' => 3,
                'is_default' => false,
            ],
            [
                'name' => 'Out Of Stock',
                'slug' => 'out_of_stock',
                'color' => '#06b6d4', // Light teal/blue
                'sort_order' => 4,
                'is_default' => false,
            ],
            [
                'name' => 'Pending',
                'slug' => 'pending',
                'color' => '#f97316', // Orange (Default)
                'sort_order' => 5,
                'is_default' => true,
            ],
            [
                'name' => 'Processing',
                'slug' => 'processing',
                'color' => '#3b82f6', // Blue
                'sort_order' => 6,
                'is_default' => false,
            ],
            [
                'name' => 'Return Parcel',
                'slug' => 'return_parcel',
                'color' => '#14b8a6', // Teal
                'sort_order' => 7,
                'is_default' => false,
            ],
            [
                'name' => 'Wrong Model',
                'slug' => 'wrong_model',
                'color' => '#0f766e', // Dark teal
                'sort_order' => 8,
                'is_default' => false,
            ],
        ];

        foreach ($statuses as $status) {
            DB::table('order_statuses')->insert(array_merge($status, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_statuses');
    }
};
