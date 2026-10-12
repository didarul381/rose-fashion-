<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->whereNull('courier_code')
            ->where('tracking_number', 'like', 'TRK-%')
            ->update(['tracking_number' => null]);
    }

    public function down(): void
    {
        // Generated placeholder tracking numbers cannot be restored safely.
    }
};