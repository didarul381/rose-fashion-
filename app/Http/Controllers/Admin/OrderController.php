<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderNote;
use App\Models\OrderStatus;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Orders List CRUD page.
     */
    public function orders(Request $request)
    {
        $query = Order::with(['items.product.primaryImage', 'assignedUser', 'creator', 'user'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('assigned_user_id')) {
            $query->where('assigned_user_id', $request->assigned_user_id);
        }

        if ($request->filled('courier_status')) {
            if ($request->courier_status === 'tracked') {
                $query->whereNotNull('tracking_number')->where('tracking_number', '!=', '');
            } elseif ($request->courier_status === 'untracked') {
                $query->where(function ($subQuery) {
                    $subQuery->whereNull('tracking_number')->orWhere('tracking_number', '=', '');
                });
            }
        }

        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('created_at', [$request->date_start.' 00:00:00', $request->date_end.' 23:59:59']);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('order_number', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('tracking_number', 'like', "%{$search}%")
                    ->orWhere('shipping_address', 'like', "%{$search}%")
                    ->orWhere('billing_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($itemQuery) use ($search) {
                        $itemQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        $statuses = OrderStatus::orderBy('sort_order')->get();

        // Count orders for each status
        $statusCounts = [];
        foreach ($statuses as $status) {
            $statusCounts[$status->slug] = Order::where('status', $status->slug)->count();
        }

        $couriers = Courier::orderBy('name')->get();
        $users = User::whereIn('role', ['admin', 'staff'])->orderBy('name')->get();
        if ($users->isEmpty()) {
            $users = User::orderBy('name')->limit(10)->get();
        }

        $totalSales = Order::sum('total');
        $totalOrders = Order::count();
        $totalProducts = Schema::hasTable('order_items') ? (int) DB::table('order_items')->sum('quantity') : 0;

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'statuses' => $statuses,
            'statusCounts' => $statusCounts,
            'couriers' => $couriers,
            'users' => $users,
            'totalSales' => (float) $totalSales,
            'totalOrders' => $totalOrders,
            'totalProducts' => $totalProducts,
            'filters' => $request->only(['search', 'status', 'payment_status', 'courier_status', 'assigned_user_id', 'date_start', 'date_end']),
        ]);
    }

    /**
     * Show a dedicated order details page.
     */
    public function showOrder($id)
    {
        $order = Order::with([
            'user',
            'items.product.primaryImage',
            'items.variant',
            'assignedUser',
            'creator',
        ])->findOrFail($id);

        if ($this->orderNotesTableExists()) {
            $order->load(['orderNotes.user']);
        } else {
            $order->setRelation('orderNotes', collect());
        }

        $statuses = OrderStatus::orderBy('sort_order')->get();
        $couriers = Courier::orderBy('name')->get();
        $products = Product::with(['primaryImage', 'variants'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/OrderDetails', [
            'order' => $order,
            'statuses' => $statuses,
            'couriers' => $couriers,
            'availableProducts' => $products,
            'paymentStatusOptions' => [
                ['value' => 'pending', 'label' => 'Pending Collections'],
                ['value' => 'paid', 'label' => 'Paid (Collected)'],
                ['value' => 'failed', 'label' => 'Failed'],
                ['value' => 'refunded', 'label' => 'Refunded'],
            ],
            'trackUrl' => $order->tracking_number
                ? 'https://steadfast.com.bd/t/'.$order->tracking_number
                : null,
        ]);
    }

    /**
     * Update order details (status, tracking ID).
     */
    public function updateOrder(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'payment_status' => 'required|string|in:pending,paid,failed,refunded',
            'tracking_number' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $statusNames = OrderStatus::whereIn('slug', [$order->status, $request->status])
            ->pluck('name', 'slug')
            ->all();

        $before = $order->only(['status', 'payment_status', 'tracking_number']);
        $order->update([
            'status' => $request->status,
            'payment_status' => $request->payment_status,
            'tracking_number' => $request->tracking_number,
        ]);

        $changes = [];
        if ($before['status'] !== $request->status) {
            $changes[] = 'Delivery status changed from '.($statusNames[$before['status']] ?? ucwords(str_replace('_', ' ', $before['status']))).' to '.($statusNames[$request->status] ?? ucwords(str_replace('_', ' ', $request->status)));
        }

        if ($before['payment_status'] !== $request->payment_status) {
            $changes[] = 'Payment status changed from '.$this->paymentStatusLabel($before['payment_status']).' to '.$this->paymentStatusLabel($request->payment_status);
        }

        if (($before['tracking_number'] ?? '') !== ($request->tracking_number ?? '')) {
            $changes[] = 'Tracking number updated to '.($request->tracking_number ?: 'Not set');
        }

        if (! empty($changes) && $this->orderNotesTableExists()) {
            OrderNote::create([
                'order_id' => $order->id,
                'user_id' => auth()->id(),
                'type' => 'status_update',
                'note' => implode('. ', $changes),
                'metadata' => [
                    'before' => $before,
                    'after' => [
                        'status' => $request->status,
                        'payment_status' => $request->payment_status,
                        'tracking_number' => $request->tracking_number,
                    ],
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Order status updated successfully!');
    }

    /**
     * Add an admin note to an order.
     */
    public function storeOrderNote(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:2000',
        ]);

        $order = Order::findOrFail($id);

        if (! $this->orderNotesTableExists()) {
            return redirect()->back()->with('error', 'Order notes are not available until the database migration is applied.');
        }

        OrderNote::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'note' => $request->note,
        ]);

        return redirect()->back()->with('success', 'Order note added successfully!');
    }

    /**
     * Add a product to an existing order.
     */
    public function storeOrderItem(Request $request, $id)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $order = Order::with('items')->findOrFail($id);
        $product = Product::with('variants')->findOrFail($request->product_id);
        $variant = null;

        if ($product->variants->isNotEmpty()) {
            if (! $request->filled('variant_id')) {
                throw ValidationException::withMessages([
                    'variant_id' => 'Please select a variant for this product.',
                ]);
            }

            $variant = $product->variants->firstWhere('id', (int) $request->variant_id);
            if (! $variant) {
                throw ValidationException::withMessages([
                    'variant_id' => 'The selected variant does not belong to this product.',
                ]);
            }
        }

        $unitPrice = $variant
            ? (float) ($variant->sale_price ?: $variant->price ?: $product->sale_price ?: $product->price)
            : (float) ($product->sale_price ?: $product->price);

        $quantity = (int) $request->quantity;

        $availableStock = $variant
            ? (int) $variant->stock
            : (int) $product->stock;

        if ($product->type !== 'digital' && $availableStock < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => 'Not enough stock available for this product.',
            ]);
        }

        DB::transaction(function () use ($order, $product, $variant, $unitPrice, $quantity) {
            if ($product->type !== 'digital') {
                if ($variant) {
                    $variant->decrement('stock', $quantity);
                } else {
                    $product->decrement('stock', $quantity);
                }
            }

            $lineTotal = $unitPrice * $quantity;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'name' => $variant?->sku ? $product->name.' ('.$variant->sku.')' : $product->name,
                'sku' => $variant?->sku ?: $product->sku,
                'price' => $unitPrice,
                'quantity' => $quantity,
                'total' => $lineTotal,
            ]);

            $newSubtotal = (float) $order->items->sum('total') + $lineTotal;
            $taxPercent = (float) Setting::get('tax_percentage', 5);
            $discount = (float) $order->discount;
            $taxBase = max($newSubtotal - $discount, 0);
            $newTax = round($taxBase * ($taxPercent / 100), 2);
            $newTotal = round($taxBase + (float) $order->shipping_cost + $newTax, 2);

            $order->update([
                'subtotal' => $newSubtotal,
                'tax' => $newTax,
                'total' => $newTotal,
            ]);

            if ($this->orderNotesTableExists()) {
                OrderNote::create([
                    'order_id' => $order->id,
                    'user_id' => auth()->id(),
                    'type' => 'item_added',
                    'note' => sprintf(
                        'Added %s x %s to the order.',
                        $quantity,
                        $variant?->sku ? $product->name.' ('.$variant->sku.')' : $product->name
                    ),
                    'metadata' => [
                        'product_id' => $product->id,
                        'variant_id' => $variant?->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'line_total' => $lineTotal,
                    ],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Product added to order successfully!');
    }

    /**
     * Human readable payment status label.
     */
    protected function paymentStatusLabel(?string $status): string
    {
        return match ($status) {
            'pending' => 'Pending Collections',
            'paid' => 'Paid (Collected)',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
            default => ucwords(str_replace('_', ' ', (string) $status)),
        };
    }

    /**
     * Bulk update order statuses.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'status' => 'required|string',
        ]);

        $statusName = OrderStatus::where('slug', $request->status)->value('name') ?? ucwords(str_replace('_', ' ', $request->status));

        $orders = Order::whereIn('id', $request->order_ids)->get();
        foreach ($orders as $order) {
            $beforeStatus = $order->status;
            $order->update([
                'status' => $request->status,
            ]);

            if ($beforeStatus !== $request->status) {
                if ($this->orderNotesTableExists()) {
                    OrderNote::create([
                        'order_id' => $order->id,
                        'user_id' => auth()->id(),
                        'type' => 'status_update',
                        'note' => 'Delivery status changed from '.(OrderStatus::where('slug', $beforeStatus)->value('name') ?? ucwords(str_replace('_', ' ', $beforeStatus)))." to {$statusName}.",
                        'metadata' => [
                            'before' => ['status' => $beforeStatus],
                            'after' => ['status' => $request->status],
                        ],
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Bulk order statuses updated successfully!');
    }

    /**
     * Bulk assign user to orders.
     */
    public function bulkAssignUser(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'user_id' => 'required|exists:users,id',
        ]);

        Order::whereIn('id', $request->order_ids)->update([
            'assigned_user_id' => $request->user_id,
        ]);

        return redirect()->back()->with('success', 'Orders successfully assigned to the user!');
    }

    /**
     * Send orders to steadfast or other courier.
     */
    public function sendToCourier(Request $request)
    {
        $request->validate([
            'courier_id' => 'required|string',
            'order_ids' => 'required|array',
        ]);

        $successCount = 0;
        $failCount = 0;
        $failMessages = [];
        $courierCode = $request->courier_id;

        $courierRecord = Courier::where('code', $request->courier_id)->first();
        $apiKey = $courierRecord->api_key ?? config('services.steadfast.key');
        $apiSecret = $courierRecord->secret_key ?? config('services.steadfast.secret');

        foreach ($request->order_ids as $orderId) {
            $order = Order::find($orderId);
            if (! $order) {
                continue;
            }

            $shipping = is_array($order->shipping_address) ? $order->shipping_address : (json_decode($order->shipping_address, true) ?? []);

            // Calculate total amount to collect
            if ($order->payment_status === 'paid') {
                $totalAmount = 0;
            } else {
                $totalAmount = (! empty($order->courier_price) && $order->courier_price > 0)
                    ? (int) $order->courier_price
                    : (int) $order->total;
            }

            if ($request->courier_id === 'steadfast') {
                $data = [
                    'courierId' => 'steadfast',
                    'order' => [
                        'order_id' => $order->id,
                        'invoice' => $order->order_number,
                        'firstname' => $shipping['name'] ?? '',
                        'lastname' => '',
                        'telephone' => $order->phone ?? $shipping['phone'] ?? '',
                        'payment_address_1' => $shipping['address'] ?? ($shipping['city'] ?? ''),
                        'total' => $totalAmount,
                        'note' => $order->notes ?? 'Direct dispatch',
                    ],
                    'courier' => [
                        'api_user_id' => $apiKey,
                        'api_password' => $apiSecret,
                    ],
                ];

                $result = $this->steadfastApiOrderAdd($data);

                if (isset($result['status']) && ($result['status'] == '200' || $result['status'] == 200)) {
                    $trackingCode = $result['consignment']['tracking_code']
                                 ?? $result['consignment']['consignment_id']
                                 ?? null;
                    $before = $order->only(['status', 'tracking_number']);

                    $order->update([
                        'status' => 'in_courier',
                        'tracking_number' => $trackingCode,
                        'courier_code' => $courierCode,
                    ]);

                    if ($this->orderNotesTableExists()) {
                        OrderNote::create([
                            'order_id' => $order->id,
                            'user_id' => auth()->id(),
                            'type' => 'status_update',
                            'note' => 'Courier dispatch updated the order. Delivery status changed to In Courier'.($trackingCode ? ". Tracking ID: {$trackingCode}" : '.'),
                            'metadata' => [
                                'before' => $before,
                                'after' => [
                                    'status' => 'in_courier',
                                    'tracking_number' => $trackingCode,
                                ],
                            ],
                        ]);
                    }
                    $successCount++;
                } else {
                    $failCount++;
                    $errorMessage = $result['errors'] ?? $result['message'] ?? $result['error'] ?? null;
                    if (! $errorMessage) {
                        $errorMessage = json_encode($result);
                    } elseif (is_array($errorMessage)) {
                        $errorMessage = json_encode($errorMessage);
                    }
                    $failMessages[] = "Order #{$order->order_number}: ".substr($errorMessage, 0, 250);
                }
            } else {
                // If it's a different courier, just update status to in_courier
                $before = $order->only(['status', 'tracking_number', 'courier_code']);
                $order->update([
                    'status' => 'in_courier',
                    'courier_code' => $courierCode,
                ]);

                if ($this->orderNotesTableExists()) {
                    OrderNote::create([
                        'order_id' => $order->id,
                        'user_id' => auth()->id(),
                        'type' => 'status_update',
                        'note' => 'Courier dispatch updated the order. Delivery status changed to In Courier.',
                        'metadata' => [
                            'before' => $before,
                            'after' => [
                                'status' => 'in_courier',
                            ],
                        ],
                    ]);
                }
                $successCount++;
            }
        }

        if ($failCount > 0) {
            $msg = "Dispatched {$successCount} orders. Failed {$failCount} orders. Errors: ".implode(', ', $failMessages);

            return redirect()->back()->with('error', $msg);
        }

        return redirect()->back()->with('success', "Successfully dispatched {$successCount} orders to courier!");
    }

    /**
     * Steadfast Order Add API Helper.
     */
    public function steadfastApiOrderAdd($data)
    {
        $base_url = 'https://portal.packzy.com/api/v1';

        $header = [
            'cache-control: no-cache',
            'Api-Key:'.($data['courier']['api_user_id'] ?? ''),
            'Secret-Key:'.($data['courier']['api_password'] ?? ''),
            'Content-Type:application/json',
        ];

        $requestOrderPostData = [
            'invoice' => $data['order']['invoice'] ?? '',
            'recipient_name' => trim(($data['order']['firstname'] ?? '').' '.($data['order']['lastname'] ?? '')),
            'recipient_phone' => $data['order']['telephone'] ?? '',
            'recipient_address' => $data['order']['payment_address_1'] ?? '',
            'cod_amount' => (int) ($data['order']['total'] ?? 0),
            'note' => $data['order']['note'] ?? '',
        ];

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $base_url.'/create_order',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($requestOrderPostData),
            CURLOPT_HTTPHEADER => $header,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true,
        ]);

        $response = curl_exec($curl);

        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);

            return [
                'status' => 'error',
                'error' => $error_msg,
            ];
        }

        $responseOrderDataValue = json_decode($response, true);
        curl_close($curl);

        return $responseOrderDataValue;
    }

    /**
     * Check whether the order notes table exists.
     */
    protected function orderNotesTableExists(): bool
    {
        return Schema::hasTable('order_notes');
    }
}
