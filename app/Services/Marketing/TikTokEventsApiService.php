<?php

namespace App\Services\Marketing;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TikTokEventsApiService
{
    public static function sendEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null): bool
    {
        $integration = MarketingIntegrationRegistry::find('tiktok_events_api');
        if (!$integration || empty($integration['enabled'])) {
            return false;
        }

        $config = $integration['public_config'] ?? MarketingIntegrationRegistry::currentConfig('tiktok_events_api');
        $pixelCode = $config['pixel_id'] ?? '';
        $accessToken = MarketingIntegrationRegistry::readValue('tiktok_events_api', 'access_token');

        if (!$pixelCode || !$accessToken) {
            return false;
        }

        $payload = [
            'event_source' => 'web',
            'event_source_id' => $pixelCode,
            'data' => [[
                'event' => $eventName,
                'event_time' => time(),
                'event_id' => $eventId ?: uniqid('tt_', true),
                'context' => [
                    'page' => [
                        'url' => request()->fullUrl(),
                        'referrer' => request()->headers->get('referer'),
                    ],
                    'user' => array_filter([
                        'email' => !empty($userData['email']) ? [hash('sha256', strtolower(trim($userData['email'])))] : null,
                        'phone' => !empty($userData['phone']) ? [hash('sha256', preg_replace('/\D+/', '', $userData['phone']))] : null,
                        'external_id' => !empty($userData['external_id']) ? [hash('sha256', (string) $userData['external_id'])] : null,
                        'ip' => $userData['ip'] ?? request()->ip(),
                        'user_agent' => $userData['user_agent'] ?? request()->header('User-Agent'),
                    ]),
                ],
                'properties' => $customData,
            ]],
        ];

        $testCode = $config['test_event_code'] ?? '';
        if ($testCode) {
            $payload['test_event_code'] = $testCode;
        }

        try {
            $response = Http::withHeaders([
                'Access-Token' => $accessToken,
                'Content-Type' => 'application/json',
            ])->post('https://business-api.tiktok.com/open_api/v1.3/event/track/', $payload);

            if ($response->failed()) {
                Log::error('TikTok Events API Request Failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('TikTok Events API Request Exception', [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
