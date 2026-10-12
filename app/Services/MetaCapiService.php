<?php

namespace App\Services;

use App\Services\Marketing\MarketingIntegrationRegistry;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCapiService
{
    /**
     * Send conversion event to Meta.
     */
    public static function sendEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null)
    {
        $integration = MarketingIntegrationRegistry::find('meta_conversions_api');
        if (!$integration || empty($integration['enabled'])) {
            return false;
        }

        $pixelId = $integration['public_config']['pixel_id'] ?? MarketingIntegrationRegistry::readValue('meta_conversions_api', 'pixel_id');
        $accessToken = MarketingIntegrationRegistry::readValue('meta_conversions_api', 'access_token');

        if (!$pixelId || !$accessToken) {
            return false;
        }

        // Clean values to avoid empty config issues
        if (str_contains($pixelId, 'MOCK') || empty($pixelId) || empty($accessToken)) {
            return false;
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

        // Build main event payload
        $eventPayload = [
            'event_name' => $eventName,
            'event_time' => time(),
            'event_id' => $eventId,
            'event_source_url' => request()->fullUrl(),
            'action_source' => 'website',
            'user_data' => $payloadUserData,
            'custom_data' => $customData,
        ];

        $requestData = [
            'data' => [$eventPayload],
        ];

        // Send meta test event code if it is configured in settings
        $testCode = MarketingIntegrationRegistry::readValue('meta_conversions_api', 'test_event_code');
        if ($testCode && !str_contains($testCode, 'MOCK')) {
            $requestData['test_event_code'] = $testCode;
        }

        try {
            $response = Http::post("https://graph.facebook.com/v19.0/{$pixelId}/events", array_merge($requestData, [
                'access_token' => $accessToken,
            ]));

            if ($response->failed()) {
                Log::error('Meta CAPI Request Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Meta CAPI Request Exception', [
                'message' => $e->getMessage()
            ]);
            return false;
        }
    }
}
