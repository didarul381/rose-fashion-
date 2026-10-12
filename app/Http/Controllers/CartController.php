<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\ShippingMethodResolver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CartController extends Controller
{
    /**
     * Validate coupon code and return discount amounts.
     */
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon code not found.'
            ], 422);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon has expired or reached its usage limit.'
            ], 422);
        }

        if ($request->subtotal < $coupon->min_spend) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum spend of ' . "\u{09F3}" .  number_format($coupon->min_spend) . ' is required to use this coupon.'
            ], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

        return response()->json([
            'success' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount' => $discount,
            'message' => 'Coupon applied successfully!'
        ]);
    }

    /**
     * Calculate shipping rates dynamically based on Zone inside/outside Dhaka.
     */
    public function calculateShipping(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
            'shipping_method' => ['nullable', 'string', Rule::in(array_keys(ShippingMethodResolver::rates()))],
            'weight' => 'nullable|numeric'
        ]);

        $weight = (float) ($request->weight ?? 0);
        $shipping = ShippingMethodResolver::calculate($request->shipping_method, $request->city, $weight);
        $cost = $shipping['cost'];

        return response()->json([
            'success' => true,
            'cost' => $cost,
            'method' => $shipping['method'],
            'label' => $shipping['label'],
            'weight_based_enabled' => $shipping['weight_based_enabled'] ?? false,
            'weight_kg' => $shipping['weight_kg'] ?? $weight,
        ]);
    }
}
