<?php

namespace App\Support;

use App\Models\Courier;
use App\Models\ShippingMethod;
use App\Models\Setting;

class ShippingMethodResolver
{
    public static function rates(): array
    {
        $methods = ShippingMethod::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        if ($methods->isNotEmpty()) {
            return $methods->mapWithKeys(function (ShippingMethod $method) {
                return [
                    (string) $method->id => [
                        'key' => (string) $method->id,
                        'label' => $method->name,
                        'price' => (float) $method->charge,
                        'weight_based_enabled' => (bool) $method->weight_based_enabled,
                        'weight_rates' => $method->weight_rates,
                    ],
                ];
            })->all();
        }

        $courier = Courier::where('is_active', true)
            ->where('is_default', true)
            ->first()
            ?? Courier::where('is_active', true)->orderBy('name')->first();

        if ($courier) {
            $insidePrice = (float) $courier->inside_city_charge;
            $outsidePrice = (float) $courier->outside_city_charge;
        } else {
            $insidePrice = (float) Setting::get('shipping_inside_dhaka', 60);
            $outsidePrice = (float) Setting::get('shipping_outside_dhaka', 120);
        }

        return [
            'legacy_inside_dhaka' => [
                'key' => 'legacy_inside_dhaka',
                'label' => 'Delivery Inside Dhaka',
                'price' => $insidePrice,
                'weight_based_enabled' => false,
                'weight_rates' => null,
            ],
            'legacy_outside_dhaka' => [
                'key' => 'legacy_outside_dhaka',
                'label' => 'Delivery Outside Dhaka',
                'price' => $outsidePrice,
                'weight_based_enabled' => false,
                'weight_rates' => null,
            ],
        ];
    }

    public static function options(?float $weightKg = null): array
    {
        return array_values(array_map(function (array $rate) use ($weightKg) {
            if (!empty($rate['weight_based_enabled'])) {
                $rate['price'] = self::calculateWeightRate($rate['weight_rates'] ?? '', (float) ($weightKg ?? 0), (float) $rate['price']);
            }
            return $rate;
        }, self::rates()));
    }

    public static function calculate(?string $shippingMethod = null, ?string $city = null, ?float $weightKg = null): array
    {
        $rates = self::rates();
        $defaultMethod = self::defaultMethod($city);
        $selectedMethod = array_key_exists($shippingMethod, $rates) ? $shippingMethod : $defaultMethod;
        $selected = $rates[$selectedMethod];
        $cost = (float) $selected['price'];

        if (!empty($selected['weight_based_enabled'])) {
            $cost = self::calculateWeightRate($selected['weight_rates'] ?? '', (float) ($weightKg ?? 0), $cost);
        }

        return [
            'method' => $selectedMethod,
            'label' => $selected['label'],
            'cost' => $cost,
            'weight_based_enabled' => !empty($selected['weight_based_enabled']),
            'weight_kg' => round((float) ($weightKg ?? 0), 3),
        ];
    }

    public static function defaultMethod(?string $city = null): string
    {
        $activeMethod = ShippingMethod::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->first();

        if ($activeMethod) {
            return (string) $activeMethod->id;
        }

        $city = strtolower(trim((string) $city));

        return str_contains($city, 'dhaka') ? 'legacy_inside_dhaka' : 'legacy_outside_dhaka';
    }

    public static function calculateWeightRate(?string $rates, float $weightKg, float $fallback): float
    {
        $pairs = collect(explode(',', (string) $rates))
            ->map(function ($item) {
                $parts = array_map('trim', explode(':', $item, 2));
                if (count($parts) !== 2 || !is_numeric($parts[0]) || !is_numeric($parts[1])) {
                    return null;
                }
                return ['limit' => (float) $parts[0], 'price' => (float) $parts[1]];
            })
            ->filter()
            ->sortBy('limit')
            ->values();

        if ($pairs->isEmpty()) {
            return $fallback;
        }

        $weight = max(0, $weightKg);
        $matched = $pairs->first(fn ($pair) => $weight <= $pair['limit']);

        return (float) ($matched['price'] ?? $pairs->last()['price']);
    }
}
