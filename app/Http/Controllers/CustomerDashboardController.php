<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Setting;
use App\Models\LoyaltyPoint;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerDashboardController extends Controller
{
    /**
     * Display customer account overview dashboard.
     */
    public function index()
    {
        $user = auth()->user();
        
        $recentOrders = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $walletHistory = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $loyaltyHistory = LoyaltyPoint::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $referredUsers = \App\Models\Referral::where('referrer_id', $user->id)
            ->with('referred')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Customer/Dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'wallet_balance' => $user->wallet_balance,
                'loyalty_points' => $user->loyalty_points_balance,
                'referral_code' => $user->referral_code,
                'referral_link' => url('/register?ref=' . $user->referral_code),
                'referrals_count' => $referredUsers->count(),
                'referral_earnings' => $referredUsers->sum('commission_amount'),
            ],
            'recentOrders' => $recentOrders,
            'walletHistory' => $walletHistory,
            'loyaltyHistory' => $loyaltyHistory,
            'referredUsers' => $referredUsers,
        ]);
    }

    /**
     * Show all customer orders.
     */
    public function orders()
    {
        $orders = Order::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }

    /**
     * View specific order invoice & details.
     */
    public function viewOrder($orderNumber)
    {
        $order = Order::where('user_id', auth()->id())
            ->where('order_number', $orderNumber)
            ->with('items.product')
            ->firstOrFail();

        $settings = Setting::whereIn('group', ['general'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        return Inertia::render('Customer/OrderView', [
            'order' => $order,
            'settings' => $settings
        ]);
    }

    /**
     * Simulate depositing money into the loyalty wallet.
     */
    public function walletDeposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100'
        ]);

        $user = auth()->user();

        $user->walletTransactions()->create([
            'amount' => $request->amount,
            'type' => 'deposit',
            'description' => 'Funds deposited via online gateway'
        ]);

        return back()->with('success', '৳' . number_format($request->amount) . ' added to your wallet successfully!');
    }

    /**
     * Order Tracking utility.
     */
    public function track(Request $request)
    {
        $orderNumber = $request->get('order_number', '');
        $order = null;

        if ($request->filled('order_number')) {
            $order = Order::where('order_number', $orderNumber)
                ->first(['order_number', 'status', 'tracking_number', 'shipping_address', 'updated_at']);
        }

        return Inertia::render('Shop/TrackOrder', [
            'searched' => $request->filled('order_number'),
            'order' => $order
        ]);
    }
}
