import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { 
    Wallet, Coins, ShoppingBag, Eye, CreditCard, ChevronRight, User, Share2, Users, Copy, Check 
} from 'lucide-react';

export default function CustomerDashboard({ user, recentOrders, walletHistory, loyaltyHistory, referredUsers = [] }) {
    const storeName = useStoreName();
    const [depositAmount, setDepositAmount] = useState('');
    const [copied, setCopied] = useState(false);
    
    const depositForm = useForm({
        amount: ''
    });

    const handleCopyLink = () => {
        if (user.referral_link) {
            navigator.clipboard.writeText(user.referral_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDepositSubmit = (e) => {
        e.preventDefault();
        if (!depositAmount || parseFloat(depositAmount) < 100) return;
        depositForm.setData('amount', depositAmount);
        
        // Post request to Laravel
        depositForm.post(route('customer.wallet-deposit'), {
            data: { amount: depositAmount },
            onSuccess: () => {
                setDepositAmount('');
            }
        });
    };

    return (
        <ShopLayout>
            <Head title={`Customer Dashboard | ${storeName}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                
                {/* Greeting banner */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl shadow-slate-900/10 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-orange-500">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black">Welcome Back, {user.name}!</h1>
                            <p className="text-xs text-slate-400 mt-0.5">Manage your shipping details, wallet credits, and loyalty rewards.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link href={route('profile.edit')} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all border border-slate-700">
                            Edit Account Profile
                        </Link>
                    </div>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    
                    {/* Wallet Widget */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-bold uppercase">My Wallet Balance</span>
                                <span className="text-2xl font-black text-slate-800 mt-1">৳{parseFloat(user.wallet_balance).toFixed(2)}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        
                        {/* Deposit input */}
                        <form onSubmit={handleDepositSubmit} className="mt-6 border-t border-slate-50 pt-4 flex gap-2">
                            <input
                                type="number"
                                placeholder="Amount (min ৳100)"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                required
                            />
                            <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
                                Deposit
                            </button>
                        </form>
                    </div>

                    {/* Loyalty Points Widget */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-bold uppercase">My Loyalty Points</span>
                                <span className="text-2xl font-black text-slate-800 mt-1">{user.loyalty_points} pts</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                <Coins className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-semibold">
                            Redeem points for store discounts. Every 100 points grants a ৳10 reduction at checkout.
                        </p>
                    </div>

                    {/* Quick orders shortcut */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-bold uppercase">Orders History</span>
                                <span className="text-2xl font-black text-slate-800 mt-1">{recentOrders.length} Recent</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                        <Link href={route('customer.orders')} className="mt-4 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                            Browse full order list <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Recent Orders table column */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
                            Recent Orders
                        </h2>
                        
                        <div className="overflow-x-auto">
                            {recentOrders.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 italic text-center">You haven't placed any orders yet.</p>
                            ) : (
                                <table className="w-full text-left text-xs text-slate-500">
                                    <thead>
                                        <tr className="border-b border-slate-50 text-slate-400 font-bold uppercase">
                                            <th className="py-3">Order Number</th>
                                            <th className="py-3">Placed Date</th>
                                            <th className="py-3">Method</th>
                                            <th className="py-3">Total Payable</th>
                                            <th className="py-3">Delivery Status</th>
                                            <th className="py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-medium">
                                        {recentOrders.map((ord) => (
                                            <tr key={ord.id} className="hover:bg-slate-50/50">
                                                <td className="py-3.5 font-bold text-slate-800">#{ord.order_number}</td>
                                                <td className="py-3.5">{new Date(ord.created_at).toLocaleDateString()}</td>
                                                <td className="py-3.5 uppercase">{ord.payment_method}</td>
                                                <td className="py-3.5 font-bold text-slate-800">৳{ord.total}</td>
                                                <td className="py-3.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                                        ord.status === 'completed' 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : ord.status === 'cancelled'
                                                                ? 'bg-red-50 text-red-700'
                                                                : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                        {ord.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <Link href={route('customer.order-view', { orderNumber: ord.order_number })} className="p-1 text-slate-400 hover:text-orange-500 inline-block">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* History logs (Wallet and Loyalty logs) */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Wallet Logs */}
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                            <h2 className="text-xs font-bold text-slate-850 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                                Wallet Transactions
                            </h2>
                            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                                {walletHistory.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic py-2">No transactions recorded yet.</p>
                                ) : (
                                    walletHistory.map((tr) => (
                                        <div key={tr.id} className="flex justify-between items-center text-xs">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-slate-700 truncate">{tr.description}</span>
                                                <span className="text-[9px] text-slate-400 mt-0.5">{new Date(tr.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`font-bold ${
                                                tr.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'
                                            }`}>
                                                {tr.type === 'deposit' ? '+' : '-'}৳{tr.amount}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Loyalty Logs */}
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                            <h2 className="text-xs font-bold text-slate-850 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                                Loyalty Points Ledger
                            </h2>
                            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                                {loyaltyHistory.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic py-2">No points earned/redeemed yet.</p>
                                ) : (
                                    loyaltyHistory.map((tr) => (
                                        <div key={tr.id} className="flex justify-between items-center text-xs">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-slate-700 truncate">{tr.description}</span>
                                                <span className="text-[9px] text-slate-400 mt-0.5">{new Date(tr.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`font-bold ${
                                                tr.type === 'earn' ? 'text-emerald-600' : 'text-red-500'
                                            }`}>
                                                {tr.type === 'earn' ? '+' : '-'}{tr.points} pts
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>

                {/* Affiliate & Referral System Widget */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm mt-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Share2 className="w-4.5 h-4.5 text-orange-500" />
                                Affiliate & Referral Program
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Share your personal referral code/link to invite friends. Earn ৳50 reward commission on every signup!
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Referral Link Copy */}
                        <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl md:col-span-2 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] text-slate-455 uppercase font-bold tracking-wider">Your Unique Referral Link</span>
                                <div className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={user.referral_link || ''}
                                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 font-medium focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Referral Code Display */}
                        <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between items-center text-center">
                            <span className="text-[10px] text-slate-455 uppercase font-bold tracking-wider">Referral Code</span>
                            <span className="text-base font-mono font-black text-orange-600 tracking-wider bg-orange-50 px-4 py-1.5 rounded-xl border border-orange-100 mt-2">
                                {user.referral_code}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-orange-50/40 border border-orange-100 p-5 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Referred Friends</span>
                                <h3 className="text-base font-bold text-slate-800 mt-0.5">{user.referrals_count} Signups</h3>
                            </div>
                        </div>

                        <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Referral Earnings</span>
                                <h3 className="text-base font-bold text-slate-800 mt-0.5">৳{parseFloat(user.referral_earnings || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Friends Invited list */}
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Invited Friends List</h3>
                        
                        <div className="overflow-x-auto">
                            {referredUsers.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-4">No friends referred yet. Start sharing your link to earn rewards!</p>
                            ) : (
                                <table className="w-full text-left text-xs text-slate-500">
                                    <thead>
                                        <tr className="border-b border-slate-50 text-slate-400 font-bold uppercase">
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Joined Date</th>
                                            <th className="py-2">Reward Earned</th>
                                            <th className="py-2 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                        {referredUsers.map((ref) => (
                                            <tr key={ref.id} className="hover:bg-slate-50/30">
                                                <td className="py-3 font-bold">{ref.referred?.name || 'Referred User'}</td>
                                                <td className="py-3">{new Date(ref.created_at).toLocaleDateString()}</td>
                                                <td className="py-3 text-emerald-600 font-bold">৳{parseFloat(ref.commission_amount).toFixed(2)}</td>
                                                <td className="py-3 text-right">
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] uppercase font-bold">
                                                        {ref.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </ShopLayout>
    );
}
