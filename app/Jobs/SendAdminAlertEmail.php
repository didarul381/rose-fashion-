<?php

namespace App\Jobs;

use App\Mail\AdminAlertMail;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use App\Services\MailSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAdminAlertEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;
    public int $timeout = 30;

    public function __construct(public string $alertType, public array $data = [])
    {
        $this->onConnection('database');
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        if (! MailSettings::enabled() || ! MailSettings::alertEnabled($this->alertType)) {
            return;
        }

        $recipients = MailSettings::recipients();
        if (empty($recipients)) {
            Log::warning('Admin mail alert skipped: no valid recipients configured.', ['type' => $this->alertType]);
            return;
        }

        if (! MailSettings::configureMailer()) {
            Log::warning('Admin mail alert skipped: mail settings are incomplete.', ['type' => $this->alertType]);
            return;
        }

        $payload = $this->buildPayload();
        if (empty($payload)) {
            return;
        }

        foreach ($recipients as $recipient) {
            Mail::mailer(MailSettings::MAILER_NAME)->to($recipient)->send(new AdminAlertMail($this->alertType, $payload));
        }
    }

    private function buildPayload(): array
    {
        $storeName = Setting::get('store_name') ?: Setting::get('theme_name') ?: Setting::get('site_title') ?: config('app.name');

        if ($this->alertType === 'register') {
            $user = User::find($this->data['user_id'] ?? null);
            if (! $user) {
                return [];
            }

            return [
                'store_name' => $storeName,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone,
                'created_at' => optional($user->created_at)->format('d M Y, h:i A'),
            ];
        }

        if (in_array($this->alertType, ['orders', 'order'], true)) {
            $order = Order::with(['items', 'user'])->find($this->data['order_id'] ?? null);
            if (! $order) {
                return [];
            }

            $shipping = is_array($order->shipping_address) ? $order->shipping_address : [];

            return [
                'store_name' => $storeName,
                'order_number' => $order->order_number,
                'customer_name' => $shipping['name'] ?? $order->user?->name ?? 'Guest Customer',
                'customer_email' => $order->email,
                'customer_phone' => $order->phone,
                'customer_address' => trim(($shipping['address'] ?? '') . ', ' . ($shipping['city'] ?? ''), ' ,'),
                'payment_method' => strtoupper((string) $order->payment_method),
                'payment_status' => strtoupper((string) $order->payment_status),
                'order_status' => strtoupper((string) $order->status),
                'subtotal' => number_format((float) $order->subtotal, 2),
                'shipping_cost' => number_format((float) $order->shipping_cost, 2),
                'discount' => number_format((float) $order->discount, 2),
                'total' => number_format((float) $order->total, 2),
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'quantity' => $item->quantity,
                    'price' => number_format((float) $item->price, 2),
                    'total' => number_format((float) $item->total, 2),
                ])->all(),
                'created_at' => optional($order->created_at)->format('d M Y, h:i A'),
            ];
        }

        return [];
    }
}
