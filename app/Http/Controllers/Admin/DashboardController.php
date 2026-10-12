<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Dashboard Analytics metrics & charts data.
     */
    public function index(Request $request)
    {
        $request->validate([
            'range' => 'nullable|in:today,7d,30d,this_month,all,custom',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date',
        ]);

        $range = $request->string('range')->toString() ?: 'today';
        $now = now();

        [$startAt, $endAt, $rangeLabel] = match ($range) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay(), 'Today'],
            '7d' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay(), 'Last 7 Days'],
            'this_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfDay(), 'This Month'],
            'all' => [
                Order::min('created_at') ? Carbon::parse(Order::min('created_at'))->startOfDay() : $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
                'All Time',
            ],
            'custom' => [
                $request->filled('date_start') ? Carbon::parse($request->date_start)->startOfDay() : $now->copy()->subDays(29)->startOfDay(),
                $request->filled('date_end') ? Carbon::parse($request->date_end)->endOfDay() : $now->copy()->endOfDay(),
                'Custom Range',
            ],
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay(), 'Today'],
        };

        if ($startAt->greaterThan($endAt)) {
            [$startAt, $endAt] = [$endAt->copy()->startOfDay(), $startAt->copy()->endOfDay()];
        }

        $ordersQuery = Order::query()->whereBetween('created_at', [$startAt, $endAt]);
        $paidOrdersQuery = (clone $ordersQuery)->where('payment_status', 'paid');
        $ordersCount = (clone $ordersQuery)->count();
        $paidOrdersCount = (clone $paidOrdersQuery)->count();
        $revenue = (float) (clone $paidOrdersQuery)->sum('total');
        $activeBuyers = (clone $ordersQuery)
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->distinct()
            ->count('phone');
        $productsCount = Product::whereBetween('created_at', [$startAt, $endAt])->count();
        $newSignups = User::where('role', 'customer')->whereBetween('created_at', [$startAt, $endAt])->count();
        $fulfilledOrders = (clone $ordersQuery)->whereIn('status', ['completed', 'delivered'])->count();

        $averageOrderValue = $paidOrdersCount > 0 ? round($revenue / $paidOrdersCount, 2) : 0;
        $paymentRate = $ordersCount > 0 ? round(($paidOrdersCount / $ordersCount) * 100, 2) : 0;
        $fulfillmentRate = $ordersCount > 0 ? round(($fulfilledOrders / $ordersCount) * 100, 2) : 0;

        $spanInDays = $startAt->copy()->startOfDay()->diffInDays($endAt->copy()->startOfDay()) + 1;
        if ($spanInDays <= 45) {
            $revenueByPeriod = (clone $paidOrdersQuery)
                ->selectRaw('DATE(created_at) as period, SUM(total) as revenue')
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('revenue', 'period');

            $periods = CarbonPeriod::create($startAt->copy()->startOfDay(), '1 day', $endAt->copy()->startOfDay());
            $labels = [];
            $chartValues = [];
            foreach ($periods as $date) {
                $key = $date->format('Y-m-d');
                $labels[] = $date->format('M j');
                $chartValues[] = (float) ($revenueByPeriod[$key] ?? 0);
            }
        } else {
            $revenueByPeriod = (clone $paidOrdersQuery)
                ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period, SUM(total) as revenue")
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('revenue', 'period');

            $periods = CarbonPeriod::create($startAt->copy()->startOfMonth(), '1 month', $endAt->copy()->startOfMonth());
            $labels = [];
            $chartValues = [];
            foreach ($periods as $date) {
                $key = $date->format('Y-m');
                $labels[] = $date->format('M Y');
                $chartValues[] = (float) ($revenueByPeriod[$key] ?? 0);
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Paid Revenue',
                'data' => $chartValues,
                'borderColor' => '#f97316',
                'backgroundColor' => 'rgba(249, 115, 22, 0.1)',
            ]],
        ];

        $recentOrders = (clone $ordersQuery)->latest()->limit(6)->get();

        $topProducts = Schema::hasTable('order_items')
            ? DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereBetween('orders.created_at', [$startAt, $endAt])
                ->selectRaw('MIN(order_items.id) as id, order_items.product_id, order_items.name, SUM(order_items.quantity) as sales, SUM(order_items.total) as revenue')
                ->groupBy('order_items.product_id', 'order_items.name')
                ->orderByDesc('sales')
                ->limit(5)
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->product_id ?: $item->id,
                    'name' => $item->name ?: 'Unknown Product',
                    'sales' => (int) $item->sales,
                    'revenue' => (float) $item->revenue,
                ])
                ->values()
            : collect();

        $topCategories = Schema::hasTable('order_items') && Schema::hasTable('category_product')
            ? DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->join('category_product', 'category_product.product_id', '=', 'order_items.product_id')
                ->join('categories', 'categories.id', '=', 'category_product.category_id')
                ->whereBetween('orders.created_at', [$startAt, $endAt])
                ->selectRaw('categories.id, categories.name, COUNT(DISTINCT order_items.product_id) as products_count, SUM(order_items.quantity) as total_sales, SUM(order_items.total) as revenue')
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('total_sales')
                ->limit(5)
                ->get()
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'productsCount' => (int) $category->products_count,
                    'totalSales' => (int) $category->total_sales,
                    'revenue' => (float) $category->revenue,
                ])
                ->values()
            : collect();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'revenue' => $revenue,
                'orders_count' => $ordersCount,
                'products_count' => $productsCount,
                'customers_count' => $activeBuyers,
                'average_order_value' => $averageOrderValue,
                'new_signups' => $newSignups,
                'payment_rate' => $paymentRate,
                'fulfillment_rate' => $fulfillmentRate,
            ],
            'chartData' => $chartData,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'topCategories' => $topCategories,
            'filters' => [
                'range' => $range,
                'date_start' => $startAt->toDateString(),
                'date_end' => $endAt->toDateString(),
                'label' => $rangeLabel,
            ],
        ]);
    }
}
