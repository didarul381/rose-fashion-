<?php

namespace App\Services\Marketing;

use App\Jobs\SendMetaCapiEvent;
use App\Jobs\SendTikTokEventsApiEvent;
use App\Models\Order;

class MarketingEventManager
{
    public static function track(string $eventName, array $payload = []): void
    {
        if ($eventName === 'purchase') {
            static::trackPurchase($payload);
        }
    }

    public static function trackPurchase(array $payload): void
    {
        $order = $payload['order'] ?? null;
        $items = $payload['items'] ?? [];
        $eventId = $payload['event_id'] ?? null;

        if (!$order instanceof Order) {
            return;
        }

        $userData = [
            'email' => $payload['email'] ?? $order->email,
            'phone' => $payload['phone'] ?? $order->phone,
            'first_name' => $payload['first_name'] ?? '',
            'last_name' => $payload['last_name'] ?? '',
            'ip' => $payload['ip'] ?? request()->ip(),
            'user_agent' => $payload['user_agent'] ?? request()->header('User-Agent'),
        ];

        $customData = [
            'order_id' => $order->order_number,
            'value' => (float) $order->total,
            'currency' => $payload['currency'] ?? 'BDT',
            'content_type' => 'product',
            'content_ids' => collect($items)->map(fn ($item) => $item['product_id'] ?? $item['id'])->filter()->values()->all(),
            'contents' => collect($items)->map(function ($item) {
                return [
                    'id' => $item['product_id'] ?? $item['id'],
                    'quantity' => $item['quantity'] ?? 1,
                    'item_price' => (float) ($item['price'] ?? 0),
                ];
            })->values()->all(),
            'num_items' => count($items),
        ];

        if (MarketingIntegrationRegistry::isEnabled('meta_conversions_api')) {
            SendMetaCapiEvent::dispatch('Purchase', $userData, $customData, $eventId);
        }

        if (MarketingIntegrationRegistry::isEnabled('tiktok_events_api')) {
            SendTikTokEventsApiEvent::dispatch('Purchase', $userData, [
                'order_id' => $order->order_number,
                'value' => (float) $order->total,
                'currency' => $payload['currency'] ?? 'BDT',
                'contents' => collect($items)->map(function ($item) {
                    return [
                        'price' => (float) ($item['price'] ?? 0),
                        'quantity' => (int) ($item['quantity'] ?? 1),
                        'content_type' => 'product',
                        'content_id' => (string) ($item['product_id'] ?? $item['id']),
                        'content_name' => $item['name'] ?? '',
                        'content_category' => $item['category'] ?? 'General',
                    ];
                })->values()->all(),
            ], $eventId);
        }
    }
}
