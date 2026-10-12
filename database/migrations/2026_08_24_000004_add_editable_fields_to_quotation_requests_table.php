<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotation_requests', function (Blueprint $table) {
            $table->string('address')->nullable()->after('phone');
            $table->string('product_name')->nullable()->after('products');
            $table->unsignedInteger('quantity')->nullable()->after('product_name');
            $table->decimal('price', 12, 2)->nullable()->after('quantity');
            $table->text('product_description')->nullable()->after('price');
            $table->string('delivery_time')->nullable()->after('product_description');
            $table->string('advance_payment')->nullable()->after('delivery_time');
            $table->string('at_delivery_payment')->nullable()->after('advance_payment');
        });
    }

    public function down(): void
    {
        Schema::table('quotation_requests', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'product_name',
                'quantity',
                'price',
                'product_description',
                'delivery_time',
                'advance_payment',
                'at_delivery_payment',
            ]);
        });
    }
};