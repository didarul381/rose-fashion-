<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 14px;
            background-color: #fff;
        }

        /* Common print styles */
        @media print {
            body {
                background-color: #fff;
                color: #000;
            }
            .no-print {
                display: none !important;
            }
        }

        .print-btn {
            background-color: #f97316;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 13px;
            margin: 20px auto;
            display: block;
            width: fit-content;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .print-btn:hover {
            background-color: #ea580c;
        }

        /* ---------------------------------------------------- */
        /* VERSION 1: MODERN / CLEAN STYLE                      */
        /* ---------------------------------------------------- */
        .modern-invoice {
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
            background-color: #fff;
        }

        .modern-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 25px;
            margin-bottom: 30px;
        }

        .company-info h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
        }

        .company-info p {
            margin: 4px 0 0 0;
            color: #64748b;
            font-size: 13px;
            line-height: 1.4;
        }

        .invoice-title-block {
            text-align: right;
        }

        .invoice-title-block h2 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            color: #f97316;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-title-block p {
            margin: 5px 0 0 0;
            font-weight: bold;
            color: #334155;
            font-size: 14px;
        }

        .modern-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
        }

        .ship-to-box {
            flex: 1;
            max-width: 60%;
        }

        .order-meta-box {
            flex: 0 0 auto;
            text-align: left;
        }

        .info-row {
            margin-bottom: 4px;
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
        }

        .info-row strong {
            color: #0f172a;
            font-weight: 700;
        }

        .modern-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .modern-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .modern-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
            color: #334155;
        }

        .modern-table .text-right {
            text-align: right;
        }

        .modern-summary {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }

        .summary-box {
            width: 300px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            color: #475569;
        }

        .summary-row.grand-total {
            border-top: 2px solid #f1f5f9;
            padding-top: 12px;
            margin-top: 4px;
            font-size: 18px;
            font-weight: 800;
            color: #1e293b;
        }

        .modern-footer {
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }


        /* ---------------------------------------------------- */
        /* VERSION 2: THERMAL / RECEIPT STYLE                   */
        /* ---------------------------------------------------- */
        .thermal-invoice {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            padding: 4mm;
            background-color: #fff;
            box-sizing: border-box;
        }

        .thermal-header {
            text-align: center;
            margin-bottom: 15px;
        }

        .thermal-header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .thermal-header p {
            margin: 2px 0;
            font-size: 11px;
            color: #555;
        }

        .thermal-divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }

        .thermal-info {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 10px;
        }

        .thermal-info p {
            margin: 2px 0;
        }

        .thermal-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        .thermal-table th {
            text-align: left;
            border-bottom: 1px dashed #000;
            padding: 4px 0;
            font-weight: bold;
        }

        .thermal-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .thermal-table .item-name {
            font-weight: bold;
        }

        .thermal-table .text-right {
            text-align: right;
        }

        .thermal-summary {
            font-size: 11px;
            margin-top: 8px;
        }

        .thermal-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
        }

        .thermal-summary-row.total-pay {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px dashed #000;
            padding-top: 4px;
            margin-top: 4px;
        }

        .thermal-footer {
            text-align: center;
            font-size: 10px;
            margin-top: 20px;
            line-height: 1.4;
        }

        /* Responsive override for thermal layout in browser screen */
        @media screen {
            .thermal-invoice {
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-top: 20px;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>

    <!-- Printable Trigger Button for browser preview screen -->
    <div class="no-print">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
    </div>

    @php
        $style = $settings['invoice_style'] ?? 'modern';
        $shipping = is_array($order->shipping_address) ? $order->shipping_address : (json_decode($order->shipping_address, true) ?? []);
        $showImage = ($settings['invoice_show_product_image'] ?? '1') === '1';
    @endphp

    @if($style === 'thermal')
        <!-- THERMAL SLIP INVOICE -->
        <div class="thermal-invoice">
            <div class="thermal-header">
                <h1>{{ $settings['invoice_company_name'] }}</h1>
                <p>{{ $settings['invoice_company_address'] }}</p>
                <p>Phone: {{ $settings['invoice_company_phone'] }}</p>
                @if(!empty($settings['invoice_company_email']))
                    <p>Email: {{ $settings['invoice_company_email'] }}</p>
                @endif
            </div>

            <div class="thermal-divider"></div>

            <div class="thermal-info">
                <p><strong>INVOICE:</strong> #{{ $order->order_number }}</p>
                <p><strong>DATE:</strong> {{ $order->created_at->format('d M Y, h:i A') }}</p>
                <p><strong>PAY METHOD:</strong> {{ strtoupper($order->payment_method) }}</p>
                <p><strong>PAY STATUS:</strong> {{ strtoupper($order->payment_status) }}</p>
                <div class="thermal-divider" style="margin: 5px 0;"></div>
                <p><strong>CUSTOMER:</strong> {{ $shipping['name'] ?? $order->name ?? 'Guest' }}</p>
                <p><strong>PHONE:</strong> {{ $order->phone ?? $shipping['phone'] ?? '' }}</p>
                <p><strong>ADDRESS:</strong> {{ $shipping['address'] ?? '' }}, {{ $shipping['city'] ?? '' }}</p>
            </div>

            <div class="thermal-divider"></div>

            <table class="thermal-table">
                <thead>
                    <tr>
                        <th>ITEM</th>
                        <th class="text-right">QTY</th>
                        <th class="text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    @if($showImage)
                                        @php
                                            $imgUrl = $item->product->primaryImage->image_path ?? null;
                                        @endphp
                                        @if($imgUrl)
                                            <img src="{{ asset($imgUrl) }}" alt="{{ $item->product->name }}" style="width: 28px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; flex-shrink: 0;">
                                        @endif
                                    @endif
                                    <div>
                                        <span class="item-name" style="display: block; font-size: 11px;">{{ $item->product->name }}</span>
                                        @if(!empty($item->variant_info))
                                            <div style="font-size: 9px; font-weight: normal; color: #555; margin-top: 1px;">{{ $item->variant_info }}</div>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">{{ $item->quantity }}</td>
                            <td class="text-right">৳{{ number_format($item->price * $item->quantity, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="thermal-divider"></div>

            <div class="thermal-summary">
                <div class="thermal-summary-row">
                    <span>Subtotal:</span>
                    <span>৳{{ number_format($order->subtotal ?? ($order->total - 100), 2) }}</span>
                </div>
                <div class="thermal-summary-row">
                    <span>Delivery Charge:</span>
                    <span>৳{{ number_format($order->delivery_charge ?? 100, 2) }}</span>
                </div>
                @if($order->coupon_discount > 0)
                    <div class="thermal-summary-row">
                        <span>Discount:</span>
                        <span>-৳{{ number_format($order->coupon_discount, 2) }}</span>
                    </div>
                @endif
                <div class="thermal-summary-row total-pay">
                    <span>TOTAL PAYABLE:</span>
                    <span>৳{{ number_format($order->total, 2) }}</span>
                </div>
            </div>

            <div class="thermal-divider"></div>

            <div class="thermal-footer">
                <p>{{ $settings['invoice_footer_note'] }}</p>
                <p>Powered by {{ $settings['invoice_company_name'] }}</p>
            </div>
        </div>

    @else
        <!-- MODERN CLEAN INVOICE -->
        <div class="modern-invoice">
            <div class="modern-header">
                <div class="company-info">
                    <h1>{{ $settings['invoice_company_name'] }}</h1>
                    <p>{{ $settings['invoice_company_address'] }}</p>
                    <p>Phone: {{ $settings['invoice_company_phone'] ?? '' }} | Web Site: {{ !empty($settings['invoice_company_website']) ? $settings['invoice_company_website'] : 'www.mahmudtrading.com' }}@if(!empty($settings['invoice_company_email'])) | Email: {{ $settings['invoice_company_email'] }}@endif</p>
                </div>
                <div class="invoice-title-block">
                    <h2>Invoice</h2>
                    <p>#{{ $order->order_number }}</p>
                    <p style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 3px;">
                        Date: {{ $order->created_at ? $order->created_at->format('M d, Y') : date('M d, Y') }}
                    </p>
                </div>
            </div>

            @php
                $customerName = $shipping['name'] ?? $order->name ?? ($order->user?->name ?? 'Guest Customer');
                $customerPhone = $order->phone ?? $shipping['phone'] ?? 'N/A';
                $customerEmail = $order->email ?? $shipping['email'] ?? ($order->user?->email ?? 'N/A');
                
                $addressParts = [];
                if (!empty($shipping['address'])) $addressParts[] = trim($shipping['address']);
                if (!empty($shipping['city']) && !in_array(trim($shipping['city']), $addressParts)) $addressParts[] = trim($shipping['city']);
                $customerAddress = !empty($addressParts) ? implode(', ', $addressParts) : ($shipping['address'] ?? $order->shipping_address ?? 'N/A');
                if (is_array($customerAddress)) {
                    $customerAddress = implode(', ', array_filter($customerAddress));
                }

                $rawPayment = strtolower($order->payment_method ?? '');
                $paymentMethodLabel = match($rawPayment) {
                    'cod', 'cash_on_delivery', 'cash' => 'Cash On Delivery',
                    'bkash' => 'bKash',
                    'nagad' => 'Nagad',
                    'sslcommerz' => 'SSLCommerz',
                    '' => 'Cash On Delivery',
                    default => ucwords(str_replace(['_', '-'], ' ', $rawPayment))
                };

                $shippingMethodLabel = $order->shipping_method_label ?: ($order->shipping_method ?: 'Inside Dhaka City');
                if (is_numeric($shippingMethodLabel)) {
                    $shippingMethodLabel = 'Inside Dhaka City';
                }
            @endphp

            <div class="modern-grid">
                <div class="ship-to-box">
                    <div class="info-row"><strong>Ship To:</strong></div>
                    <div class="info-row"><strong>Name:</strong> {{ $customerName }}</div>
                    <div class="info-row"><strong>Phone:</strong> {{ $customerPhone }}</div>
                    <div class="info-row"><strong>Email:</strong> {{ $customerEmail }}</div>
                    <div class="info-row"><strong>Address:</strong> {{ $customerAddress }}</div>
                </div>
                <div class="order-meta-box">
                    <div class="info-row"><strong>Order ID:</strong> {{ $order->id }}</div>
                    <div class="info-row"><strong>Date Added:</strong> {{ $order->created_at ? $order->created_at->format('d/m/Y') : date('d/m/Y') }}</div>
                    <div class="info-row"><strong>Payment Method:</strong> {{ $paymentMethodLabel }}</div>
                    <div class="info-row"><strong>Shipping Method:</strong> {{ $shippingMethodLabel }}</div>
                </div>
            </div>

            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Product Details</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right font-bold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    @if($showImage)
                                        @php
                                            $imgUrl = $item->product->primaryImage->image_path ?? null;
                                        @endphp
                                        @if($imgUrl)
                                            <img src="{{ asset($imgUrl) }}" alt="{{ $item->product->name }}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; flex-shrink: 0;">
                                        @else
                                            <div style="width: 40px; height: 40px; border-radius: 6px; background-color: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #94a3b8; flex-shrink: 0;">No Img</div>
                                        @endif
                                    @endif
                                    <div>
                                        <div style="font-weight: bold; color: #1e293b;">{{ $item->product->name }}</div>
                                        @if(!empty($item->variant_info))
                                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">{{ $item->variant_info }}</div>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">৳{{ number_format($item->price, 2) }}</td>
                            <td class="text-right">{{ $item->quantity }}</td>
                            <td class="text-right font-bold">৳{{ number_format($item->price * $item->quantity, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="modern-summary">
                <div class="summary-box">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>৳{{ number_format($order->subtotal ?? ($order->total - ($order->delivery_charge ?? 100)), 2) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping Cost</span>
                        <span>৳{{ number_format($order->delivery_charge ?? 100, 2) }}</span>
                    </div>
                    @if($order->coupon_discount > 0)
                        <div class="summary-row">
                            <span>Discount</span>
                            <span>-৳{{ number_format($order->coupon_discount, 2) }}</span>
                        </div>
                    @endif
                    <div class="summary-row grand-total">
                        <span>Total Payable</span>
                        <span>৳{{ number_format($order->total, 2) }}</span>
                    </div>
                </div>
            </div>

            <div class="modern-footer">
                <p>{{ $settings['invoice_footer_note'] }}</p>
                <p style="margin-top: 5px; font-size: 10px; color: #cbd5e1;">Generated by {{ $settings['invoice_company_name'] }} Admin Suite</p>
            </div>
        </div>
    @endif

    <!-- Auto trigger window print dialog -->
    <script>
        window.addEventListener('DOMContentLoaded', (event) => {
            // Auto open print dialog when loading directly
            setTimeout(function() {
                window.print();
            }, 500);
        });
    </script>
</body>
</html>
