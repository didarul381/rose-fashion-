<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $payload['store_name'] ?? 'Store' }} Alert</title>
</head>
<body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;">
        <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr><td style="padding:24px 28px;background:#0f172a;color:#ffffff;">
                    <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;font-weight:700;">{{ $payload['store_name'] ?? 'Store' }}</div>
                    <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">{{ $alertType === 'register' ? 'New customer registered' : 'New order received' }}</h1>
                </td></tr>
                <tr><td style="padding:28px;">
                    @if($alertType === 'register')
                        <p style="margin:0 0 18px;font-size:15px;color:#475569;">A customer created an account on your store.</p>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.8;">
                            <tr><td style="color:#64748b;width:140px;">Name</td><td style="font-weight:700;">{{ $payload['customer_name'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Email</td><td>{{ $payload['customer_email'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Phone</td><td>{{ $payload['customer_phone'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Registered</td><td>{{ $payload['created_at'] ?? 'N/A' }}</td></tr>
                        </table>
                    @else
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;"><tr>
                            <td><div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Order Number</div><div style="font-size:22px;font-weight:800;color:#0f172a;">#{{ $payload['order_number'] ?? '' }}</div></td>
                            <td align="right"><div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Total</div><div style="font-size:24px;font-weight:900;color:#f97316;">?{{ $payload['total'] ?? '0.00' }}</div></td>
                        </tr></table>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.8;margin-bottom:22px;">
                            <tr><td style="color:#64748b;width:150px;">Customer</td><td style="font-weight:700;">{{ $payload['customer_name'] ?? 'Guest Customer' }}</td></tr>
                            <tr><td style="color:#64748b;">Phone</td><td>{{ $payload['customer_phone'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Email</td><td>{{ $payload['customer_email'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Address</td><td>{{ $payload['customer_address'] ?? 'N/A' }}</td></tr>
                            <tr><td style="color:#64748b;">Payment</td><td>{{ $payload['payment_method'] ?? '' }} / {{ $payload['payment_status'] ?? '' }}</td></tr>
                            <tr><td style="color:#64748b;">Status</td><td>{{ $payload['order_status'] ?? '' }}</td></tr>
                            <tr><td style="color:#64748b;">Created</td><td>{{ $payload['created_at'] ?? 'N/A' }}</td></tr>
                        </table>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;">
                            <thead><tr style="background:#f8fafc;color:#64748b;text-align:left;"><th style="padding:10px;border-bottom:1px solid #e5e7eb;">Product</th><th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">Qty</th><th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Total</th></tr></thead>
                            <tbody>
                                @foreach(($payload['items'] ?? []) as $item)
                                    <tr><td style="padding:12px 10px;border-bottom:1px solid #f1f5f9;"><strong>{{ $item['name'] }}</strong><br><span style="color:#94a3b8;font-size:12px;">{{ $item['sku'] ?? '' }}</span></td><td style="padding:12px 10px;border-bottom:1px solid #f1f5f9;text-align:center;">{{ $item['quantity'] }}</td><td style="padding:12px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">?{{ $item['total'] }}</td></tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
