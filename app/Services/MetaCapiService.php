<?php

namespace App\Services;

use App\Services\Marketing\MarketingIntegrationRegistry;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCapiService
{
    /**
     * Send conversion event to Meta (returns boolean).
     */
    public static function sendEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null, ?string $overrideTestCode = null): bool
    {
        $result = static::sendEventDetailed($eventName, $userData, $customData, $eventId, $overrideTestCode);
        return $result['success'];
    }

    /**
     * Send conversion event to Meta and return detailed response.
     */
    public static function sendEventDetailed(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null, ?string $overrideTestCode = null): array
    {
        $integration = MarketingIntegrationRegistry::find('meta_conversions_api');
        if (!$integration || empty($integration['enabled'])) {
            return [
                'success' => false,
                'events_received' => 0,
                'messages' => [],
                'error' => 'Meta Conversions API is not enabled in settings.',
            ];
        }

        $pixelId = MarketingIntegrationRegistry::readValue('meta_conversions_api', 'pixel_id', MarketingIntegrationRegistry::readValue('meta_pixel', 'pixel_id'));
        $accessToken = MarketingIntegrationRegistry::readValue('meta_conversions_api', 'access_token');

        if (!$pixelId || !$accessToken) {
            return [
                'success' => false,
                'events_received' => 0,
                'messages' => [],
                'error' => 'Meta Conversions API Pixel ID or Access Token is missing.',
            ];
        }

        // Clean values to avoid empty config issues
        if (str_contains($pixelId, 'MOCK') || empty($pixelId) || empty($accessToken)) {
            return [
                'success' => false,
                'events_received' => 0,
                'messages' => [],
                'error' => 'Meta Pixel ID or Access Token is placeholder/mock.',
            ];
        }

        $eventId = $eventId ?: uniqid('evt_', true);

        // Normalize User Data (Meta requires SHA256 hashing for PII)
        $payloadUserData = [
            'client_ip_address' => $userData['ip'] ?? request()->ip(),
            'client_user_agent' => $userData['user_agent'] ?? request()->header('User-Agent'),
        ];

        if (!empty($userData['email'])) {
            $payloadUserData['em'] = hash('sha256', strtolower(trim($userData['email'])));
        }

        if (!empty($userData['phone'])) {
            $payloadUserData['ph'] = hash('sha256', preg_replace('/\D/', '', $userData['phone']));
        }

        if (!empty($userData['first_name'])) {
            $payloadUserData['fn'] = hash('sha256', strtolower(trim($userData['first_name'])));
        }

        if (!empty($userData['last_name'])) {
            $payloadUserData['ln'] = hash('sha256', strtolower(trim($userData['last_name'])));
        }

        // Clean customData by removing helper keys
        $cleanCustomData = $customData;
        unset($cleanCustomData['event_source_url']);

        // Determine sensible event source URL
        $sourceUrl = $customData['event_source_url'] ?? $userData['source_url'] ?? request()->header('Referer') ?? request()->fullUrl();
        if (str_contains((string) $sourceUrl, '/api/tracking')) {
            $sourceUrl = request()->header('Referer') ?: url('/');
        }

        // Build main event payload
        $eventPayload = [
            'event_name' => $eventName,
            'event_time' => time(),
            'event_id' => $eventId,
            'event_source_url' => $sourceUrl,
            'action_source' => 'website',
            'user_data' => $payloadUserData,
            'custom_data' => $cleanCustomData,
        ];

        $requestData = [
            'data' => [$eventPayload],
        ];

        // Send meta test event code if it is configured or overridden
        $testCode = $overrideTestCode ?: MarketingIntegrationRegistry::readValue('meta_conversions_api', 'test_event_code');
        if ($testCode && !str_contains($testCode, 'MOCK')) {
            $requestData['test_event_code'] = trim($testCode);
        }

        try {
            $response = Http::post("https://graph.facebook.com/v19.0/{$pixelId}/events", array_merge($requestData, [
                'access_token' => $accessToken,
            ]));

            $json = $response->json() ?? [];

            if ($response->failed()) {
                Log::error('Meta CAPI Request Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'success' => false,
                    'events_received' => 0,
                    'messages' => $json['messages'] ?? [],
                    'error' => $json['error']['message'] ?? ('HTTP Error ' . $response->status()),
                    'fbtrace_id' => $json['fbtrace_id'] ?? null,
                ];
            }

            return [
                'success' => true,
                'events_received' => (int) ($json['events_received'] ?? 1),
                'messages' => $json['messages'] ?? [],
                'error' => null,
                'fbtrace_id' => $json['fbtrace_id'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Meta CAPI Request Exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'events_received' => 0,
                'messages' => [],
                'error' => $e->getMessage(),
            ];
        }
    }
}
