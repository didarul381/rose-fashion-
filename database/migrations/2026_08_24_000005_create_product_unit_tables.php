<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('weight_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'price_unit_id')) {
                $table->foreignId('price_unit_id')->nullable()->after('sale_price')->constrained('price_units')->nullOnDelete();
            }
            if (!Schema::hasColumn('products', 'weight_unit_id')) {
                $table->foreignId('weight_unit_id')->nullable()->after('weight')->constrained('weight_units')->nullOnDelete();
            }
        });

        DB::table('price_units')->insertOrIgnore([
            ['name' => 'Piece', 'code' => 'pcs', 'description' => 'Per piece / single item pricing.', 'order_index' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Set', 'code' => 'set', 'description' => 'Per set or bundled unit pricing.', 'order_index' => 2, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Box', 'code' => 'box', 'description' => 'Per box pricing.', 'order_index' => 3, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Carton', 'code' => 'ctn', 'description' => 'Per carton pricing for wholesale products.', 'order_index' => 4, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('weight_units')->insertOrIgnore([
            ['name' => 'Gram', 'code' => 'g', 'description' => 'Lightweight products measured in grams.', 'order_index' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kilogram', 'code' => 'kg', 'description' => 'Standard product shipping weight in kilograms.', 'order_index' => 2, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pound', 'code' => 'lb', 'description' => 'Imperial product weight in pounds.', 'order_index' => 3, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ton', 'code' => 'ton', 'description' => 'Heavy equipment or bulk item weight.', 'order_index' => 4, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'price_unit_id')) {
                $table->dropConstrainedForeignId('price_unit_id');
            }
            if (Schema::hasColumn('products', 'weight_unit_id')) {
                $table->dropConstrainedForeignId('weight_unit_id');
            }
        });

        Schema::dropIfExists('weight_units');
        Schema::dropIfExists('price_units');
    }
};