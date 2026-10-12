<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('show_on_home')->default(false)->after('is_featured');
        });

        // Preserve the current storefront: existing active main categories were
        // already visible on the homepage before this dedicated flag existed.
        DB::table('categories')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->update(['show_on_home' => true]);
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('show_on_home');
        });
    }
};
