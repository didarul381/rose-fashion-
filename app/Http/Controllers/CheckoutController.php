<?php

namespace App\Http\Controllers;

use App\Jobs\SendAdminAlertEmail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Coupon;
use App\Models\Setting;
use App\Support\ShippingMethodResolver;
use App\Services\Marketing\MarketingEventManager;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    /**
     * Render One Page Checkout screen.
     */
    public function index()
    {
        $settings = Setting::whereIn('group', ['general', 'theme', 'payment'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $shippingMethods = ShippingMethodResolver::options();
        
        return Inertia::render('Shop/Checkout', [
            'settings' => $settings,
            'shippingMethods' => $shippingMethods,
            'defaultShippingMethod' => ShippingMethodResolver::defaultMethod(),
            'user' => auth()->user() ? [
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
                'phone' => auth()->user()->phone ?? '',
                'wallet_balance' => auth()->user()->wallet_balance,
                'loyalty_points' => auth()->user()->loyalty_points_balance,
            ] : null,
        ]);
    }

    /**
     * Place order and handle payment routing.
     */
    public function placeOrder(Request $request)
    {
        $fieldIsEnabled = fn (string $key): bool => Setting::get($key, '1') !== '0';

        $request->validate([
            'name' => ($fieldIsEnabled('checkout_name_status') ? 'required' : 'nullable') . '|string|max:255',
            'phone' => ($fieldIsEnabled('checkout_phone_status') ? 'required' : 'nullable') . '|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => ($fieldIsEnabled('checkout_address_status') ? 'required' : 'nullable') . '|string|max:500',
            'notes' => 'nullable|string|max:90',
            'city' => ($fieldIsEnabled('checkout_city_status') ? 'required' : 'nullable') . '|string|max:100',
            'payment_method' => 'required|string|in:cod,stripe,bkash,nagad,rocket,wallet',
            'shipping_method' => ['required', 'string', Rule::in(array_keys(ShippingMethodResolver::rates()))],
            'cart_items' => 'required|array|min:1',
            'cart_items.*.id' => 'required|integer',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
            'use_wallet' => 'nullable|boolean',
            'use_loyalty_points' => 'nullable|boolean',
        ]);

        try {
            return DB::transaction(function () use ($request) {
            $user = auth()->user();
            $subtotal = 0.00;
            $totalWeightKg = 0.00;
            $itemsToProcess = [];

            // 1. Process items and verify stock
            foreach ($request->cart_items as $cartItem) {
                $product = Product::findOrFail($cartItem['id']);
                $quantity = (int) $cartItem['quantity'];
                $variantId = $cartItem['variant_id'] ?? null;
                $variant = null;

                if ($product->type === 'variable' && !$variantId) {
                    return response()->json([
                        'success' => false,
                        'message' => "Please select a variant for {$product->name}."
                    ], 422);
                }

                if ($variantId) {
                    $variant = ProductVariant::findOrFail($variantId);
                    if ((int) $variant->product_id !== (int) $product->id) {
                        return response()->json([
                            'success' => false,
                            'message' => "The selected option does not belong to {$product->name}."
                        ], 422);
                    }
                    if ($variant->stock < $quantity) {
                        return response()->json([
                            'success' => false,
                            'message' => "Stock unavailable for option in product {$product->name}."
                        ], 422);
                    }
                    $price = $variant->sale_price ?? $variant->price ?? $product->price;
                    $sku = $variant->sku ?? $product->sku;
                } else {
                    if ($product->stock < $quantity && $product->type !== 'digital') {
                        return response()->json([
                            'success' => false,
                            'message' => "Stock unavailable for product {$product->name}."
                        ], 422);
                    }
                    $price = $product->sale_price ?? $product->price;
                    $sku = $product->sku;
                }

                $itemTotal = $price * $quantity;
                $subtotal += $itemTotal;
                $weightUnit = strtolower((string) (optional($product->weightUnit)->code ?: 'kg'));
                $productWeight = (float) ($product->weight ?? 0) * $quantity;
                $totalWeightKg += match ($weightUnit) {
                    'g', 'gram', 'grams' => $productWeight / 1000,
                    'lb', 'lbs', 'pound', 'pounds' => $productWeight * 0.453592,
                    'ton', 'tons' => $productWeight * 1000,
                    default => $productWeight,
                };

                $itemsToProcess[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variantId,
                    'name' => $product->name,
                    'sku' => $sku,
                    'price' => $price,
                    'quantity' => $quantity,
                    'total' => $itemTotal,
                    'product_model' => $product,
                    'variant_model' => $variant,
                ];
            }

            // 2. Coupon Validation
            $discount = 0.00;
            if ($request->filled('coupon_code')) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if ($coupon && $coupon->isValid() && $subtotal >= $coupon->min_spend) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $coupon->increment('usage_count');
                }
            }

            // 3. Loyalty Points Adjustment
            $loyaltyDiscount = 0.00;
            $pointsToRedeem = 0;
            if ($request->use_loyalty_points && $user) {
                $availablePoints = $user->loyalty_points_balance;
                if ($availablePoints > 0) {
                    // 100 points = 10 BDT discount
                    $loyaltyDiscount = min($availablePoints * 0.1, $subtotal - $discount);
                    $pointsToRedeem = (int) ($loyaltyDiscount / 0.1);
                }
            }

            // 4. Shipping Calculation
            $shipping = ShippingMethodResolver::calculate($request->shipping_method, $request->city, $totalWeightKg);
            $shippingCost = $shipping['cost'];

            // 5. Tax Calculation
            $taxPercent = (float) Setting::get('tax_percentage', 5);
            $tax = ($subtotal - $discount - $loyaltyDiscount) * ($taxPercent / 100);

            // 6. Total Calculation
            $total = ($subtotal - $discount - $loyaltyDiscount) + $shippingCost + $tax;

            // 7. Wallet Deduction Check
            if ($request->payment_method === 'wallet') {
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Please log in to purchase with your wallet.'
                    ], 422);
                }
                if ($user->wallet_balance < $total) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient wallet balance.'
                    ], 422);
                }
            }

            // 8. Deduct Stock & Create Order record
            foreach ($itemsToProcess as $item) {
                if ($item['variant_model']) {
                    $item['variant_model']->decrement('stock', $item['quantity']);
                } else {
                    if ($item['product_model']->type !== 'digital') {
                        $item['product_model']->decrement('stock', $item['quantity']);
                    }
                }
            }

            $invoicePrefix = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) Setting::get('invoice_prefix', 'GOV')));
            $invoicePrefix = $invoicePrefix !== '' ? substr($invoicePrefix, 0, 10) : 'GOV';
            $orderNumber = $invoicePrefix . '-' . strtoupper(uniqid());

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'discount' => $discount + $loyaltyDiscount,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'wallet' ? 'paid' : 'pending',
                'shipping_method' => $shipping['method'],
                'shipping_method_label' => $shipping['label'],
                'shipping_address' => [
                    'name' => $request->name ?: 'Customer',
                    'address' => $request->address ?: '',
                    'city' => $request->city ?: '',
                    'country' => 'Bangladesh'
                ],
                'billing_address' => [
                    'name' => $request->name ?: 'Customer',
                    'address' => $request->address ?: '',
                    'city' => $request->city ?: '',
                    'country' => 'Bangladesh'
                ],
                'phone' => $request->phone ?: '',
                'email' => $request->email,
                'notes' => $request->notes,
                'coupon_code' => $request->coupon_code,
                'loyalty_points_used' => $pointsToRedeem,
                'tracking_number' => null,
            ]);

            // Save items
            foreach ($itemsToProcess as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'name' => $item['name'],
                    'sku' => $item['sku'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total' => $item['total'],
                ]);
            }

            // Deduct loyalty points and wallet transactions
            if ($pointsToRedeem > 0 && $user) {
                $user->loyaltyPoints()->create([
                    'points' => $pointsToRedeem,
                    'type' => 'redeem',
                    'description' => "Redeemed for discount on Order #{$orderNumber}",
                ]);
            }

            if ($request->payment_method === 'wallet' && $user) {
                $user->walletTransactions()->create([
                    'amount' => $total,
                    'type' => 'withdrawal',
                    'description' => "Paid for Order #{$orderNumber}",
                ]);
            }

            // Earn new loyalty points (10% of subtotal as loyalty points, e.g. 100 BDT = 10 points)
            if ($user) {
                $earnedPoints = (int) ($subtotal * 0.1);
                if ($earnedPoints > 0) {
                    $user->loyaltyPoints()->create([
                        'points' => $earnedPoints,
                        'type' => 'earn',
                        'description' => "Earned rewards from Order #{$orderNumber}",
                    ]);
                }
            }

            try {
                SendAdminAlertEmail::dispatch('orders', ['order_id' => $order->id])->afterResponse();
            } catch (\Throwable $e) {
                report($e);
            }

            // 9. Server-Side Pixel Conversion Hooks Tracking
            if ($request->payment_method === 'bkash') {
                $idToken = $this->getBkashToken();
                if (!$idToken) {
                    throw new \Exception('Failed to retrieve bKash access token. Please verify configuration credentials.');
                }
                
                $paymentResponse = $this->createBkashPayment($order, $idToken);
                if (empty($paymentResponse['bkashURL'])) {
                    $msg = $paymentResponse['errorMessage'] ?? 'Failed to initialize bKash transaction.';
                    throw new \Exception('bKash: ' . $msg);
                }

                // Save bKash payment ID and token in order note
                $order->notes = json_encode([
                    'bkash_payment_id' => $paymentResponse['paymentID'],
                    'original_notes' => $order->notes
                ]);
                $order->save();

                return response()->json([
                    'success' => true,
                    'order_number' => $orderNumber,
                    'total' => $total,
                    'payment_method' => 'bkash',
                    'redirect_url' => $paymentResponse['bkashURL']
                ]);
            }

            Log::info("Conversion API Hook: Purchase completed for {$orderNumber}. Total: {$total}");
            
            $eventId = "order_{$orderNumber}_purchase";
            MarketingEventManager::trackPurchase([
                'order' => $order,
                'items' => $itemsToProcess,
                'event_id' => $eventId,
                'email' => $request->email,
                'phone' => $request->phone,
                'first_name' => explode(' ', $request->name)[0] ?? '',
                'last_name' => explode(' ', $request->name, 2)[1] ?? '',
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'currency' => 'BDT',
            ]);

            // Return response details with success routing
            return response()->json([
                'success' => true,
                'order_number' => $orderNumber,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'redirect_url' => route('checkout.success', ['orderNumber' => $orderNumber, 'eventId' => $eventId])
            ]);
        });
        } catch (\Exception $e) {
            Log::error("Order placement failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Handle bKash redirect callback.
     */
    public function bkashCallback(Request $request)
    {
        $status = $request->query('status');
        $paymentId = $request->query('paymentID');

        Log::info("bKash callback status: {$status}, paymentID: {$paymentId}");

        // Find the order that has this paymentID saved in notes
        $order = Order::where('notes', 'like', "%{$paymentId}%")->first();

        if (!$order) {
            return redirect()->route('checkout.index')->with('error', 'Associated order not found for this transaction.');
        }

        $user = $order->user_id ? \App\Models\User::find($order->user_id) : null;

        if ($status === 'success') {
            $idToken = $this->getBkashToken();
            if ($idToken) {
                $executeResponse = $this->executeBkashPayment($paymentId, $idToken);
                
                if (!empty($executeResponse['transactionStatus']) && $executeResponse['transactionStatus'] === 'Completed') {
                    // Payment successful!
                    $order->payment_status = 'paid';
                    $order->status = 'processing';
                    $order->notes = "bKash TxID: " . ($executeResponse['trxID'] ?? 'N/A');
                    $order->save();

                    // Server-Side Pixel Conversion Hooks Tracking
                    $eventId = "order_{$order->order_number}_purchase";
                    $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : (json_decode($order->shipping_address, true) ?? []);
                    $name = $shippingAddress['name'] ?? 'Guest';

                    MarketingEventManager::trackPurchase([
                        'order' => $order,
                        'items' => $order->items->map(function ($item) {
                            return [
                                'product_id' => $item->product_id,
                                'quantity' => $item->quantity,
                                'price' => (float) $item->price,
                                'name' => $item->name,
                            ];
                        })->all(),
                        'event_id' => $eventId,
                        'email' => $order->email,
                        'phone' => $order->phone,
                        'first_name' => explode(' ', $name)[0] ?? '',
                        'last_name' => explode(' ', $name, 2)[1] ?? '',
                        'ip' => $request->ip(),
                        'user_agent' => $request->header('User-Agent'),
                        'currency' => 'BDT',
                    ]);

                    return redirect()->route('checkout.success', ['orderNumber' => $order->order_number, 'eventId' => $eventId]);
                } else {
                    Log::error("bKash execute failed: " . json_encode($executeResponse));
                }
            }
        }

        // Restore stock if payment was cancelled or failed
        foreach ($order->items as $item) {
            if ($item->variant_id) {
                $variant = ProductVariant::find($item->variant_id);
                if ($variant) {
                    $variant->increment('stock', $item->quantity);
                }
            } else {
                $product = Product::find($item->product_id);
                if ($product && $product->type !== 'digital') {
                    $product->increment('stock', $item->quantity);
                }
            }
        }

        // Revert loyalty points redeemed
        if ($user) {
            $user->loyaltyPoints()->where('description', 'like', "%#{$order->order_number}%")->delete();
            $user->walletTransactions()->where('description', 'like', "%#{$order->order_number}%")->delete();
        }

        // Mark the order as cancelled
        $order->status = 'cancelled';
        $order->payment_status = 'failed';
        $order->save();

        return redirect()->route('checkout.index')->with('error', 'bKash payment was unsuccessful or cancelled.');
    }

    private function getBkashToken()
    {
        $sandbox = Setting::get('payment_bkash_sandbox', '1') === '1';
        $baseUrl = $sandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized' : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized';

        $appKey = Setting::get('payment_bkash_app_key');
        $appSecret = Setting::get('payment_bkash_app_secret');
        $username = Setting::get('payment_bkash_username');
        $password = Setting::get('payment_bkash_password');

        $headers = [
            'Content-Type: application/json',
            'accept: application/json',
            'username: ' . $username,
            'password: ' . $password
        ];

        $body = json_encode([
            'app_key' => $appKey,
            'app_secret' => $appSecret
        ]);

        $ch = curl_init("{$baseUrl}/checkout/token/grant");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result, true);
        return $response['id_token'] ?? null;
    }

    private function createBkashPayment($order, $idToken)
    {
        $sandbox = Setting::get('payment_bkash_sandbox', '1') === '1';
        $baseUrl = $sandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized' : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized';
        $appKey = Setting::get('payment_bkash_app_key');

        $headers = [
            'Content-Type: application/json',
            'Authorization: ' . $idToken,
            'X-APP-Key: ' . $appKey
        ];

        $body = json_encode([
            'mode' => '0011',
            'payerReference' => $order->phone,
            'callbackURL' => route('bkash.callback'),
            'amount' => (string) round($order->total, 2),
            'currency' => 'BDT',
            'intent' => 'sale',
            'merchantInvoiceNumber' => $order->order_number
        ]);

        $ch = curl_init("{$baseUrl}/checkout/create");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result, true);
    }

    private function executeBkashPayment($paymentId, $idToken)
    {
        $sandbox = Setting::get('payment_bkash_sandbox', '1') === '1';
        $baseUrl = $sandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized' : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized';
        $appKey = Setting::get('payment_bkash_app_key');

        $headers = [
            'Content-Type: application/json',
            'Authorization: ' . $idToken,
            'X-APP-Key: ' . $appKey
        ];

        $body = json_encode([
            'paymentID' => $paymentId
        ]);

        $ch = curl_init("{$baseUrl}/checkout/execute");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result, true);
    }

    /**
     * Show successful checkout screen.
     */
    public function success($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('items.product')->firstOrFail();
        $settings = Setting::whereIn('group', ['general', 'theme', 'payment'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();
        $eventId = request()->query('eventId');

        return Inertia::render('Shop/Success', [
            'order' => $order,
            'settings' => $settings,
            'eventId' => $eventId
        ]);
    }
}
