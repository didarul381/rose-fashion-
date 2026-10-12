import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { 
    User, Lock, Trash2, ShoppingBag, ShieldCheck, 
    Sparkles, Copy, Check, ExternalLink, Calendar, 
    Wallet, Award, ArrowRight, Package, PhoneCall,
    CheckCircle2, Clock, Truck, ChevronRight
} from 'lucide-react';

export default function Edit({ mustVerifyEmail, status, stats = {}, recentOrders = [] }) {
    const { auth, global_settings } = usePage().props;
    const user = auth.user || {};
    const storeName = global_settings?.store_name || global_settings?.theme_name || 'Online Store';
    const supportPhone = global_settings?.contact_phone || global_settings?.support_phone || '+880 1712-345678';

    const [activeTab, setActiveTab] = useState('profile');
    const [copiedReferral, setCopiedReferral] = useState(false);

    const handleCopyReferral = () => {
        if (user.referral_code) {
            navigator.clipboard.writeText(user.referral_code);
            setCopiedReferral(true);
            setTimeout(() => setCopiedReferral(false), 2000);
        }
    };

    // Format member since date
    const memberSince = user.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '2026';

    const formatPrice = (amount) => {
        const val = parseFloat(amount) || 0;
        return `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                                Customer Account
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-semibold text-sky-600">
                                {user.role === 'admin' ? 'Admin Profile' : 'Verified Member'}
                            </span>
                        </div>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            My Profile & Account
                        </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                        >
                            <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
                            <span>Continue Shopping</span>
                        </Link>

                        {user.role === 'admin' && (
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>Admin Panel</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Profile | ${user.name || 'My Account'}`} />

            <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.06),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] py-8 md:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Modern Hero Cover Card */}
                    <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-slate-950 via-slate-900 to-[#12284c] text-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] border border-slate-800/80">
                        {/* Decorative background glows */}
                        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

                        <div className="relative p-6 sm:p-8 lg:p-10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                {/* User Info & Avatar */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                    <div className="relative flex-shrink-0">
                                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-xl flex items-center justify-center text-white text-3xl font-black">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="bg-gradient-to-tr from-sky-600 to-indigo-600 h-full w-full flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm" title="Active account" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                                {user.name}
                                            </h1>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300 backdrop-blur-sm border border-white/10">
                                                <ShieldCheck className="h-3 w-3" />
                                                {user.role === 'admin' ? 'Store Administrator' : 'Verified Member'}
                                            </span>
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-300 font-medium">
                                            {user.email} {user.phone && <span className="text-slate-400">• {user.phone}</span>}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                Member since {memberSince}
                                            </span>

                                            {user.referral_code && (
                                                <>
                                                    <span className="text-slate-600">•</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyReferral}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1 text-slate-200 transition border border-white/10 group cursor-pointer"
                                                        title="Copy referral code"
                                                    >
                                                        <span>Code: <span className="font-mono font-bold text-sky-300">{user.referral_code}</span></span>
                                                        {copiedReferral ? (
                                                            <Check className="h-3 w-3 text-emerald-400" />
                                                        ) : (
                                                            <Copy className="h-3 w-3 text-slate-400 group-hover:text-white" />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Badges */}
                                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('profile')}
                                        className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition backdrop-blur-sm shadow-xs"
                                    >
                                        Edit Personal Info
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('security')}
                                        className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition backdrop-blur-sm shadow-xs"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>

                            {/* Ecommerce KPI Stats Grid */}
                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between text-slate-400 mb-1">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                                        <Package className="h-4 w-4 text-sky-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black text-white">
                                        {stats.total_orders || 0}
                                    </p>
                                    <span className="text-[10px] text-slate-400">All-time store orders</span>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between text-slate-400 mb-1">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Completed</span>
                                        <Truck className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black text-white">
                                        {stats.completed_orders || 0}
                                    </p>
                                    <span className="text-[10px] text-slate-400">Delivered packages</span>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between text-slate-400 mb-1">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Wallet Balance</span>
                                        <Wallet className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black text-white">
                                        {formatPrice(stats.wallet_balance || user.wallet_balance)}
                                    </p>
                                    <span className="text-[10px] text-slate-400">Available store credits</span>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between text-slate-400 mb-1">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Reward Points</span>
                                        <Award className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black text-white">
                                        {stats.loyalty_points || user.loyalty_points_balance || 0}
                                        <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
                                    </p>
                                    <span className="text-[10px] text-slate-400">Loyalty membership</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Layout: Modern Tabs & Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                        
                        {/* Sidebar Navigation */}
                        <aside className="space-y-4 lg:sticky lg:top-24">
                            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Account Navigation
                                </div>

                                <nav className="space-y-1 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                                            activeTab === 'profile'
                                                ? 'bg-slate-950 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <User className="h-4 w-4" />
                                            Personal Information
                                        </span>
                                        <ChevronRight className={`h-3.5 w-3.5 ${activeTab === 'profile' ? 'text-slate-300' : 'text-slate-400'}`} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                                            activeTab === 'security'
                                                ? 'bg-slate-950 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Lock className="h-4 w-4" />
                                            Password & Security
                                        </span>
                                        <ChevronRight className={`h-3.5 w-3.5 ${activeTab === 'security' ? 'text-slate-300' : 'text-slate-400'}`} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('orders')}
                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                                            activeTab === 'orders'
                                                ? 'bg-slate-950 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <ShoppingBag className="h-4 w-4" />
                                            Recent Orders
                                        </span>
                                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                            {recentOrders.length}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('danger')}
                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                                            activeTab === 'danger'
                                                ? 'bg-rose-600 text-white shadow-sm'
                                                : 'text-rose-600 hover:bg-rose-50'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Trash2 className="h-4 w-4" />
                                            Delete Account
                                        </span>
                                        <ChevronRight className={`h-3.5 w-3.5 ${activeTab === 'danger' ? 'text-rose-200' : 'text-rose-400'}`} />
                                    </button>
                                </nav>
                            </div>

                            {/* Need Help Card */}
                            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                                    <PhoneCall className="h-4 w-4 text-sky-600" />
                                    <span>Need Assistance?</span>
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                    Have queries about your orders, returns, or account settings? Our support team is here for you.
                                </p>
                                <a
                                    href={`tel:${supportPhone.replace(/[^+\d]/g, '')}`}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition"
                                >
                                    <span>Call {supportPhone}</span>
                                </a>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <main className="space-y-6">
                            {/* Tab 1: Personal Profile */}
                            {activeTab === 'profile' && (
                                <div className="rounded-[2rem] border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5 md:px-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                                                    Personal Profile & Avatar
                                                </h3>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Manage your photo, full name, email address, and delivery contact details.
                                                </p>
                                            </div>
                                            <span className="hidden sm:inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-[11px] font-bold border border-sky-100">
                                                Profile Settings
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <UpdateProfileInformationForm
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Security & Password */}
                            {activeTab === 'security' && (
                                <div className="rounded-[2rem] border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5 md:px-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                                                    Password & Account Security
                                                </h3>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Ensure your customer portal is protected with an updated, unique password.
                                                </p>
                                            </div>
                                            <span className="hidden sm:inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-[11px] font-bold border border-sky-100">
                                                Security Guard
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <UpdatePasswordForm />
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Recent Orders */}
                            {activeTab === 'orders' && (
                                <div className="rounded-[2rem] border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5 md:px-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-950">
                                                Recent Orders & Tracking
                                            </h3>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Review your latest purchases, delivery statuses, and invoices.
                                            </p>
                                        </div>
                                        <Link
                                            href={route('track-order')}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                                        >
                                            <span>Track Any Order</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        {recentOrders.length > 0 ? (
                                            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90">
                                                {recentOrders.map((order) => {
                                                    const isDelivered = order.status === 'delivered' || order.status === 'completed';
                                                    const isPending = order.status === 'pending' || order.status === 'processing';
                                                    return (
                                                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50/70 transition">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-sm text-slate-900">
                                                                        #{order.order_number || order.id}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                        isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                                                    }`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500">
                                                                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                                <span className="text-sm font-black text-slate-900">
                                                                    {formatPrice(order.total ?? order.total_amount)}
                                                                </span>

                                                                <Link
                                                                    href={route('track-order', { order_number: order.order_number })}
                                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                                                                >
                                                                    <span>Track</span>
                                                                    <ExternalLink className="h-3 w-3 text-slate-400" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 px-4">
                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                                                    <ShoppingBag className="h-7 w-7" />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900">No Orders Placed Yet</h4>
                                                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                                                    Your purchase history will appear here once you place your first order.
                                                </p>
                                                <Link
                                                    href={route('home')}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                                                >
                                                    <ShoppingBag className="h-3.5 w-3.5" />
                                                    <span>Explore Products</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Delete Account */}
                            {activeTab === 'danger' && (
                                <div className="rounded-[2rem] border border-rose-200 bg-white shadow-xs overflow-hidden">
                                    <div className="border-b border-rose-100 bg-rose-50/70 px-6 py-5 md:px-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold text-rose-950">
                                                    Delete Account
                                                </h3>
                                                <p className="mt-0.5 text-xs text-rose-800/80">
                                                    Permanently remove your profile and clear all customer records.
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-[11px] font-bold border border-rose-200">
                                                Danger Zone
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <DeleteUserForm />
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
