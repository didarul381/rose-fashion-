<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    public function getValueAttribute($value): mixed
    {
        $decrypted = static::maybeDecrypt($value);

        if (is_string($decrypted)) {
            return MediaUrl::resolve($decrypted) ?? $decrypted;
        }

        return $decrypted;
    }

    public static function get(string $key, $default = null)
    {
        $value = DB::table('settings')->where('key', $key)->value('value');

        if ($value === null) {
            return $default;
        }

        return static::maybeDecrypt($value);
    }

    public static function set(string $key, $value, string $group = 'general')
    {
        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $value, 'group' => $group, 'updated_at' => now(), 'created_at' => now()]
        );

        return DB::table('settings')->where('key', $key)->first();
    }

    public static function setSecure(string $key, $value, string $group = 'general')
    {
        $encrypted = $value === null || $value === '' ? $value : Crypt::encryptString((string) $value);

        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $encrypted, 'group' => $group, 'updated_at' => now(), 'created_at' => now()]
        );

        return DB::table('settings')->where('key', $key)->first();
    }

    public static function maybeDecrypt($value)
    {
        if (!is_string($value) || $value === '') {
            return $value;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable $e) {
            return $value;
        }
    }

    public static function publicValues(array $hiddenPatterns = []): array
    {
        $hiddenPatterns = $hiddenPatterns ?: [
            '/(^|\.)(access_token|api_key|app_secret|client_secret|private_key|secret|password|token)$/i',
            '/(_access_token|_api_key|_app_secret|_client_secret|_private_key|_secret|_password|_token)$/i',
        ];

        $settings = static::query()->get(['key', 'value'])->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])->all();
        $public = [];

        foreach ($settings as $key => $value) {
            $isHidden = false;
            foreach ($hiddenPatterns as $pattern) {
                if (preg_match($pattern, $key)) {
                    $isHidden = true;
                    break;
                }
            }

            if ($isHidden) {
                continue;
            }

            $public[$key] = static::maybeDecrypt($value);
        }

        return $public;
    }
}
