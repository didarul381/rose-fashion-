<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\Setting;
use App\Services\Marketing\MarketingIntegrationRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/'.ltrim($user->avatar, '/'))) : null,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'referral_code' => $user->referral_code,
                    'wallet_balance' => $user->wallet_balance,
                    'loyalty_points_balance' => $user->loyalty_points_balance,
                    'created_at' => $user->created_at?->toISOString(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'global_settings' => fn () => Setting::publicValues(),
            'marketing_integrations' => fn () => MarketingIntegrationRegistry::browserConfig(),
            'admin_notifications' => fn () => $this->adminNotifications($request),
            'categories' => fn () => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => function ($query) {
                    $query->where('is_active', true)->orderBy('order_index');
                }])
                ->orderBy('order_index')
                ->get(),
            'header_categories' => fn () => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->with(['children' => function ($query) {
                    $query->where('is_active', true)->orderBy('order_index');
                }])
                ->orderBy('order_index')
                ->get(),
            'footer_pages' => fn () => Schema::hasTable('pages')
                ? Page::where('status', 'active')
                    ->where('show_in_footer', true)
                    ->orderBy('sort_order')
                    ->get(['id', 'title', 'slug', 'sort_order'])
                : collect(),
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }

    private function adminNotifications(Request $request): array
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            return [];
        }

        $notifications = collect();

        if (Schema::hasTable('orders')) {
            Order::query()
                ->latest('created_at')
                ->limit(3)
                ->get(['id', 'order_number', 'total', 'status', 'tracking_number', 'courier_code', 'created_at', 'updated_at'])
                ->each(function (Order $order) use ($notifications) {
                    $notifications->push([
                        'id' => 'order-'.$order->id,
                        'title' => 'New Order Placed',
                        'description' => 'Order #'.$order->order_number.' of TK '.number_format((float) $order->total).' has been placed.',
                        'time' => optional($order->created_at)->diffForHumans() ?? 'Just now',
                        'unread' => true,
                        'type' => 'order',
                        'sort_at' => optional($order->created_at)->timestamp ?? 0,
                    ]);
                });

            Order::query()
                ->where('status', 'in_courier')
                ->latest('updated_at')
                ->limit(2)
                ->get(['id', 'order_number', 'tracking_number', 'courier_code', 'updated_at'])
                ->each(function (Order $order) use ($notifications) {
                    $notifications->push([
                        'id' => 'courier-'.$order->id,
                        'title' => 'Courier Dispatched',
                        'description' => 'Order #'.$order->order_number.' sent to '.($order->courier_code ?: 'courier').($order->tracking_number ? '. Tracking: '.$order->tracking_number : '.'),
                        'time' => optional($order->updated_at)->diffForHumans() ?? 'Just now',
                        'unread' => true,
                        'type' => 'courier',
                        'sort_at' => optional($order->updated_at)->timestamp ?? 0,
                    ]);
                });
        }

        if (Schema::hasTable('products')) {
            Product::query()
                ->where('status', 'active')
                ->where('type', '!=', 'digital')
                ->where('stock', '<=', 5)
                ->orderBy('stock')
                ->latest('updated_at')
                ->limit(3)
                ->get(['id', 'name', 'stock', 'updated_at'])
                ->each(function (Product $product) use ($notifications) {
                    $notifications->push([
                        'id' => 'stock-'.$product->id,
                        'title' => $product->stock <= 0 ? 'Out of Stock' : 'Stock Alert',
                        'description' => 'Product "'.$product->name.'" has '.$product->stock.' unit(s) remaining.',
                        'time' => optional($product->updated_at)->diffForHumans() ?? 'Just now',
                        'unread' => true,
                        'type' => 'stock',
                        'sort_at' => optional($product->updated_at)->timestamp ?? 0,
                    ]);
                });
        }

        return $notifications
            ->sortByDesc('sort_at')
            ->take(6)
            ->map(fn ($notification) => collect($notification)->except('sort_at')->all())
            ->values()
            ->all();
    }
}
