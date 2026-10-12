<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('charge', 12, 2)->default(0.00);
            $table->string('status')->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $insideCharge = DB::table('couriers')
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->value('inside_city_charge');

        $outsideCharge = DB::table('couriers')
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->value('outside_city_charge');

        $insideCharge = $insideCharge ?? DB::table('settings')->where('key', 'shipping_inside_dhaka')->value('value') ?? 60;
        $outsideCharge = $outsideCharge ?? DB::table('settings')->where('key', 'shipping_outside_dhaka')->value('value') ?? 120;

        DB::table('shipping_methods')->insert([
            [
                'name' => 'Delivery Inside Dhaka',
                'slug' => Str::slug('Delivery Inside Dhaka'),
                'charge' => $insideCharge,
                'status' => 'active',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Delivery Outside Dhaka',
                'slug' => Str::slug('Delivery Outside Dhaka'),
                'charge' => $outsideCharge,
                'status' => 'active',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
