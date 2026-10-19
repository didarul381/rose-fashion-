<?php

namespace App\Http\Controllers;

use App\Jobs\SendMetaCapiEvent;
use App\Jobs\SendTikTokEventsApiEvent;
use App\Services\Marketing\MarketingIntegrationRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    /**
     * Ingest client-side tracking events for hybrid server-side CAPI dispatch.
     */
    public function trackEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:100',
            'event_id' => 'nullable|string|max:120',
            'custom_data' => 'nullable|array',
            'user_data' => 'nullable|array',
            'source_url' => 'nullable|string|max:1000',
        ]);

        $eventName = $validated['event_name'];
        $eventId = $validated['event_id'] ?: uniqid('evt_'.strtolower(substr($eventName, 0, 4)).'_', true);
        $customData = $validated['custom_data'] ?? [];
        $clientUserData = $validated['user_data'] ?? [];

        if (!empty($validated['source_url'])) {
            $customData['event_source_url'] = $validated['source_url'];
        }

        $user = $request->user();
        $userData = [
            'email' => $user?->email ?: ($clientUserData['email'] ?? null),
            'phone' => $user?->phone ?: ($clientUserData['phone'] ?? null),
            'first_name' => $clientUserData['first_name'] ?? ($user ? explode(' ', $user->name)[0] : null),
            'last_name' => $clientUserData['last_name'] ?? ($user && count(explode(' ', $user->name)) > 1 ? explode(' ', $user->name)[1] : null),
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'source_url' => $validated['source_url'] ?? $request->header('Referer'),
        ];

        // 1. Meta Conversions API (server-side)
        if (MarketingIntegrationRegistry::isEnabled('meta_conversions_api')) {
            SendMetaCapiEvent::dispatch(
                $eventName,
                $userData,
                $customData,
                $eventId
            );
        }

        // 2. TikTok Events API (server-side)
        if (MarketingIntegrationRegistry::isEnabled('tiktok_events_api')) {
            SendTikTokEventsApiEvent::dispatch(
                $eventName,
                $userData,
                $customData,
                $eventId
            );
        }

        return response()->json([
            'success' => true,
            'event_name' => $eventName,
            'event_id' => $eventId,
        ]);
    }
}
