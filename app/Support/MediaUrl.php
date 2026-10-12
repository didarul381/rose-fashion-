<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MediaUrl
{
    public static function resolve(?string $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (Str::startsWith($value, 'data:')) {
            return $value;
        }

        $currentBase = static::currentBaseUrl();

        if (Str::startsWith($value, ['/storage/', 'storage/'])) {
            return $currentBase . '/storage/' . ltrim(Str::after($value, '/storage/'), '/');
        }

        if (Str::startsWith($value, ['/page-builder/', 'page-builder/'])) {
            return $currentBase . '/storage/' . ltrim(Str::after($value, '/page-builder/'), '/');
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            $parts = parse_url($value);
            $host = $parts['host'] ?? '';
            $path = $parts['path'] ?? '';

            if (in_array(strtolower($host), ['localhost', '127.0.0.1', '::1'], true)) {
                if (Str::startsWith($path, '/storage/')) {
                    return $currentBase . $path . (isset($parts['query']) ? '?' . $parts['query'] : '') . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '');
                }

                if (Str::startsWith($path, '/page-builder/')) {
                    return $currentBase . '/storage' . $path . (isset($parts['query']) ? '?' . $parts['query'] : '') . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '');
                }
            }

            return $value;
        }

        return $value;
    }

    protected static function currentBaseUrl(): string
    {
        try {
            if (app()->bound('request')) {
                /** @var Request $request */
                $request = request();
                return rtrim($request->getSchemeAndHttpHost() . $request->getBaseUrl(), '/');
            }
        } catch (\Throwable) {
            // Fall back below.
        }

        return rtrim((string) config('app.url', ''), '/');
    }
}
