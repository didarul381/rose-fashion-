<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaults = [
            'chat_plugin_status' => 'disabled',
            'chat_plugin_whatsapp' => '',
            'chat_plugin_messenger' => '',
            'chat_plugin_phone' => '',
            'chat_plugin_color' => '',
        ];

        foreach ($defaults as $key => $value) {
            if (Setting::where('key', $key)->doesntExist()) {
                Setting::set($key, $value, 'general');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Setting::whereIn('key', [
            'chat_plugin_status',
            'chat_plugin_whatsapp',
            'chat_plugin_messenger',
            'chat_plugin_phone',
            'chat_plugin_color',
        ])->delete();
    }
};
