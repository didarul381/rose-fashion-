<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('size_charts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('clothing');
            $table->string('unit')->default('cm');
            $table->string('status')->default('draft');
            $table->string('image_path')->nullable();
            $table->text('measurement_instructions')->nullable();
            $table->timestamps();
        });

        Schema::create('size_chart_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_chart_id')->constrained('size_charts')->cascadeOnDelete();
            $table->string('name');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('size_chart_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_chart_id')->constrained('size_charts')->cascadeOnDelete();
            $table->string('label');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('size_chart_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_chart_row_id')->constrained('size_chart_rows')->cascadeOnDelete();
            $table->foreignId('size_chart_column_id')->constrained('size_chart_columns')->cascadeOnDelete();
            $table->string('value')->nullable();
            $table->timestamps();

            $table->unique(['size_chart_row_id', 'size_chart_column_id'], 'size_chart_value_unique_cell');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('size_chart_id')
                ->nullable()
                ->after('material')
                ->constrained('size_charts')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('size_chart_id');
        });

        Schema::dropIfExists('size_chart_values');
        Schema::dropIfExists('size_chart_rows');
        Schema::dropIfExists('size_chart_columns');
        Schema::dropIfExists('size_charts');
    }
};
