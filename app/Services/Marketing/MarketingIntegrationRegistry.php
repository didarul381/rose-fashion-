<?php

namespace App\Services\Marketing;

use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class MarketingIntegrationRegistry
{
    public static function definitions(): array
    {
        return [
            [
                'key' => 'google_tag_manager',
                'slug' => 'google-tag-manager',
                'name' => 'Google Tag Manager',
                'short_name' => 'GTM',
                'description' => 'Load a single tag container to orchestrate analytics, pixels, and custom events.',
                'category' => 'Analytics',
                'status_label' => 'Tag container',
                'type' => 'browser',
                'icon' => 'code-2',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'gtm_id' => ['type' => 'text', 'label' => 'Google Tag Manager ID', 'placeholder' => 'GTM-XXXXXXX'],
                ],
                'secret_fields' => [],
                'legacy_keys' => [
                    'enabled' => 'google_tag_manager_enabled',
                    'gtm_id' => 'google_tag_manager_id',
                ],
            ],
            [
                'key' => 'google_analytics_4',
                'slug' => 'google-analytics',
                'name' => 'Google Analytics 4',
                'short_name' => 'GA4',
                'description' => 'Track ecommerce behaviour and funnel performance with GA4 events.',
                'category' => 'Analytics',
                'status_label' => 'Measurement',
                'type' => 'browser',
                'icon' => 'line-chart',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'measurement_id' => ['type' => 'text', 'label' => 'Measurement ID', 'placeholder' => 'G-XXXXXXXXXX'],
                ],
                'secret_fields' => [],
                'legacy_keys' => [
                    'enabled' => 'google_analytics_enabled',
                    'measurement_id' => 'google_analytics_id',
                ],
            ],
            [
                'key' => 'meta_pixel',
                'slug' => 'meta-pixel',
                'name' => 'Meta Pixel',
                'short_name' => 'Meta Pixel',
                'description' => 'Capture browser events for Meta advertising optimization and retargeting.',
                'category' => 'Advertising',
                'status_label' => 'Browser',
                'type' => 'browser',
                'icon' => 'facebook',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'pixel_id' => ['type' => 'text', 'label' => 'Pixel ID', 'placeholder' => '123456789012345'],
                ],
                'secret_fields' => [],
                'legacy_keys' => [
                    'enabled' => 'facebook_pixel_enabled',
                    'pixel_id' => 'meta_pixel_id',
                ],
            ],
            [
                'key' => 'meta_conversions_api',
                'slug' => 'meta-conversions-api',
                'name' => 'Meta Conversions API',
                'short_name' => 'Meta CAPI',
                'description' => 'Send server-side purchase and lead events directly to Meta with deduplication.',
                'category' => 'Advertising',
                'status_label' => 'Server-side',
                'type' => 'server',
                'icon' => 'shield',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'pixel_id' => ['type' => 'text', 'label' => 'Pixel ID', 'placeholder' => '123456789012345'],
                    'test_event_code' => ['type' => 'text', 'label' => 'Test Event Code', 'placeholder' => 'TEST123'],
                ],
                'secret_fields' => [
                    'access_token' => ['type' => 'password', 'label' => 'Access Token', 'placeholder' => 'Stored securely'],
                ],
                'legacy_keys' => [
                    'enabled' => 'meta_capi_enabled',
                    'pixel_id' => 'meta_pixel_id',
                    'access_token' => 'meta_capi_token',
                    'test_event_code' => 'meta_capi_test_code',
                ],
            ],
            [
                'key' => 'tiktok_pixel',
                'slug' => 'tiktok-pixel',
                'name' => 'TikTok Pixel',
                'short_name' => 'TikTok Pixel',
                'description' => 'Measure browser events and campaigns inside TikTok Ads Manager.',
                'category' => 'Advertising',
                'status_label' => 'Browser',
                'type' => 'browser',
                'icon' => 'video',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'pixel_id' => ['type' => 'text', 'label' => 'Pixel ID', 'placeholder' => 'CXXXXXXXXXXXXXX'],
                ],
                'secret_fields' => [],
                'legacy_keys' => [
                    'enabled' => 'tiktok_pixel_enabled',
                    'pixel_id' => 'tiktok_pixel_id',
                ],
            ],
            [
                'key' => 'tiktok_events_api',
                'slug' => 'tiktok-events-api',
                'name' => 'TikTok Events API',
                'short_name' => 'TikTok Events',
                'description' => 'Send server-side purchase and lead events to TikTok for stronger attribution.',
                'category' => 'Advertising',
                'type' => 'server',
                'status_label' => 'Server-side',
                'icon' => 'shield-plus',
                'public_fields' => [
                    'enabled' => ['type' => 'boolean', 'label' => 'Enabled'],
                    'pixel_id' => ['type' => 'text', 'label' => 'Pixel ID', 'placeholder' => 'CXXXXXXXXXXXXXX'],
                ],
                'secret_fields' => [
                    'access_token' => ['type' => 'password', 'label' => 'Access Token', 'placeholder' => 'Stored securely'],
                ],
                'legacy_keys' => [
                    'enabled' => 'tiktok_events_api_enabled',
                    'pixel_id' => 'tiktok_pixel_id',
                    'access_token' => 'tiktok_capi_token',
                ],
            ],
        ];
    }

    public static function groups(): array
    {
        return collect(static::definitions())
            ->groupBy('category')
            ->map(fn ($items, $category) => [
                'category' => $category,
                'integrations' => array_values($items->map(fn ($integration) => static::withCurrentState($integration))->all()),
            ])
            ->values()
            ->all();
    }

    public static function all(): array
    {
        return array_map(fn ($integration) => static::withCurrentState($integration), static::definitions());
    }

    public static function find(?string $keyOrSlug): ?array
    {
        $integration = static::definition($keyOrSlug);
        return $integration ? static::withCurrentState($integration) : null;
    }

    public static function settingKey(string $integrationKey, string $field): string
    {
        return "marketing_integrations.{$integrationKey}.{$field}";
    }

    public static function isEnabled(string $integrationKey): bool
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return false;
        }

        $enabledKey = static::settingKey($integrationKey, 'enabled');
        $enabledValue = DB::table('settings')->where('key', $enabledKey)->value('value');
        if ($enabledValue !== null) {
            return filter_var(Setting::maybeDecrypt($enabledValue), FILTER_VALIDATE_BOOL);
        }

        $legacyEnabledKey = $integration['legacy_keys']['enabled'] ?? null;
        if ($legacyEnabledKey) {
            $legacyEnabledValue = DB::table('settings')->where('key', $legacyEnabledKey)->value('value');
            if ($legacyEnabledValue !== null) {
                return filter_var(Setting::maybeDecrypt($legacyEnabledValue), FILTER_VALIDATE_BOOL);
            }
        }

        foreach (array_keys($integration['public_fields']) as $field) {
            if ($field === 'enabled') {
                continue;
            }

            if (static::readValue($integrationKey, $field, '') !== '') {
                return true;
            }
        }

        foreach (array_keys($integration['secret_fields']) as $field) {
            if (static::readValue($integrationKey, $field, '') !== '') {
                return true;
            }
        }

        return false;
    }

    public static function readValue(string $integrationKey, string $field, $default = null)
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return $default;
        }

        $legacyKey = $integration['legacy_keys'][$field] ?? null;
        $key = static::settingKey($integrationKey, $field);

        $value = Setting::get($key, null);
        if ($value !== null && $value !== '') {
            return $value;
        }

        if ($legacyKey) {
            $legacyValue = Setting::get($legacyKey, null);
            if ($legacyValue !== null && $legacyValue !== '') {
                return $legacyValue;
            }
        }

        return $default;
    }

    public static function writeValue(string $integrationKey, string $field, $value, string $group = 'marketing')
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return null;
        }

        $isSecret = array_key_exists($field, $integration['secret_fields']);
        $settingKey = static::settingKey($integrationKey, $field);
        $legacyKey = $integration['legacy_keys'][$field] ?? null;

        if ($isSecret) {
            $result = Setting::setSecure($settingKey, $value, $group);

            if ($legacyKey) {
                Setting::setSecure($legacyKey, $value, $group);
            }

            return $result;
        }

        $result = Setting::set($settingKey, $value, $group);

        if ($legacyKey) {
            Setting::set($legacyKey, $value, $group);
        }

        return $result;
    }

    public static function currentConfig(string $integrationKey): array
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return [];
        }

        $config = [];

        foreach ($integration['public_fields'] as $field => $meta) {
            $config[$field] = static::readValue($integrationKey, $field, $field === 'enabled' ? false : '');
        }

        foreach ($integration['secret_fields'] as $field => $meta) {
            $config[$field] = static::readValue($integrationKey, $field, '');
        }

        return $config;
    }

    public static function maskedConfig(string $integrationKey): array
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return [];
        }

        $config = static::currentConfig($integrationKey);

        foreach ($integration['secret_fields'] as $field => $meta) {
            $val = (string) ($config[$field] ?? '');
            $hasValue = !empty($val);
            $config[$field . '_is_set'] = $hasValue;
            if ($hasValue && strlen($val) > 10) {
                $config[$field . '_preview'] = substr($val, 0, 7) . '••••••••••••••••' . substr($val, -4);
            } else {
                $config[$field . '_preview'] = $hasValue ? '••••••••••••••••' : '';
            }
            $config[$field] = '';
        }

        $config['enabled'] = filter_var($config['enabled'] ?? false, FILTER_VALIDATE_BOOL);

        return $config;
    }

    public static function saveConfig(string $integrationKey, array $input): void
    {
        $integration = static::definition($integrationKey);
        if (!$integration) {
            return;
        }

        foreach ($integration['public_fields'] as $field => $meta) {
            if ($field === 'enabled') {
                if (array_key_exists($field, $input)) {
                    static::writeValue($integrationKey, $field, $input[$field]);
                }
                continue;
            }

            if (array_key_exists($field, $input)) {
                static::writeValue($integrationKey, $field, $input[$field]);
            }
        }

        foreach ($integration['secret_fields'] as $field => $meta) {
            if (array_key_exists($field, $input) && $input[$field] !== null && $input[$field] !== '') {
                static::writeValue($integrationKey, $field, $input[$field]);
            }
        }
    }

    public static function browserConfig(): array
    {
        return array_values(array_map(function (array $integration) {
            $publicConfig = [];
            foreach ($integration['public_fields'] as $field => $meta) {
                $publicConfig[$field] = static::readValue($integration['key'], $field, $field === 'enabled' ? false : '');
            }

            return [
                'key' => $integration['key'],
                'slug' => $integration['slug'],
                'enabled' => static::isEnabled($integration['key']),
                'config' => $publicConfig,
            ];
        }, array_filter(static::definitions(), fn ($integration) => $integration['type'] === 'browser')));
    }

    public static function serverConfig(): array
    {
        return array_values(array_map(function (array $integration) {
            $publicConfig = [];
            foreach ($integration['public_fields'] as $field => $meta) {
                $publicConfig[$field] = static::readValue($integration['key'], $field, $field === 'enabled' ? false : '');
            }

            return [
                'key' => $integration['key'],
                'slug' => $integration['slug'],
                'enabled' => static::isEnabled($integration['key']),
                'config' => $publicConfig,
            ];
        }, array_filter(static::definitions(), fn ($integration) => $integration['type'] === 'server')));
    }

    protected static function withCurrentState(array $integration): array
    {
        $integration['enabled'] = static::isEnabled($integration['key']);
        $integration['config'] = static::maskedConfig($integration['key']);

        return $integration;
    }

    protected static function definition(?string $keyOrSlug): ?array
    {
        if (!$keyOrSlug) {
            return null;
        }

        foreach (static::definitions() as $integration) {
            if ($integration['key'] === $keyOrSlug || $integration['slug'] === $keyOrSlug) {
                return $integration;
            }
        }

        return null;
    }
}
