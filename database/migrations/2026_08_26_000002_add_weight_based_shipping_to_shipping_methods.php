<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table) {
            if (!Schema::hasColumn('shipping_methods', 'weight_based_enabled')) {
                $table->boolean('weight_based_enabled')->default(false)->after('charge');
            }
            if (!Schema::hasColumn('shipping_methods', 'weight_rates')) {
                $table->text('weight_rates')->nullable()->after('weight_based_enabled');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table) {
            if (Schema::hasColumn('shipping_methods', 'weight_rates')) {
                $table->dropColumn('weight_rates');
            }
            if (Schema::hasColumn('shipping_methods', 'weight_based_enabled')) {
                $table->dropColumn('weight_based_enabled');
            }
        });
    }
};
