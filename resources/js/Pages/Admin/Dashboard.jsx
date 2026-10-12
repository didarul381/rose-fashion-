import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    TrendingUp, ShoppingCart, Package, Users, Eye, ArrowUpRight, Award, FolderOpen, CalendarDays, RotateCcw, Loader2
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

function DashboardSkeletonContent() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* 1. Primary Metric Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                    <div 
                        key={n} 
                        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs flex flex-col justify-between h-36 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2.5">
                                <div className="w-24 h-3 bg-slate-200 rounded-md"></div>
                                <div className="w-32 h-7 bg-slate-200 rounded-lg"></div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <div className="w-5 h-5 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                        <div className="w-28 h-3 bg-slate-100 rounded-full mt-3"></div>
                    </div>
                ))}
            </div>

            {/* 2. Secondary Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white border border-slate-200/70 rounded-xl p-4 flex flex-col gap-2 shadow-2xs">
                        <div className="w-24 h-2.5 bg-slate-200 rounded-md"></div>
                        <div className="w-16 h-4 bg-slate-200 rounded-md"></div>
                    </div>
                ))}
            </div>

            {/* 3. Charts & Recent Orders Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Skeleton */}
                <div className="lg:col-span-2 bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div className="w-36 h-3.5 bg-slate-200 rounded-md"></div>
                        <div className="w-20 h-4 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="p-6 h-64 flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2.5 h-48 w-full pt-4">
                            {[40, 65, 35, 80, 50, 95, 45, 70, 60, 85, 30, 75].map((heightPct, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <div 
                                        className="w-full bg-slate-100 rounded-t-md transition-all duration-500"
                                        style={{ height: `${heightPct}%` }}
                                    ></div>
                                    <div className="w-4 h-2 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders Skeleton */}
                <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div className="w-28 h-3.5 bg-slate-200 rounded-md"></div>
                        <div className="w-16 h-4 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col gap-1.5">
                                    <div className="w-20 h-3 bg-slate-200 rounded"></div>
                                    <div className="w-24 h-2 bg-slate-100 rounded"></div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <div className="w-14 h-3 bg-slate-200 rounded"></div>
                                    <div className="w-16 h-3.5 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Top Products & Categories Tables Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((cardIdx) => (
                    <div key={cardIdx} className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                            <div className="w-40 h-3.5 bg-slate-200 rounded-md"></div>
                            <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <div className="w-28 h-2.5 bg-slate-200 rounded"></div>
                                <div className="w-16 h-2.5 bg-slate-200 rounded"></div>
                                <div className="w-16 h-2.5 bg-slate-200 rounded"></div>
                            </div>
                            {[1, 2, 3, 4].map((rowIdx) => (
                                <div key={rowIdx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div className="w-36 h-3 bg-slate-200 rounded"></div>
                                    <div className="w-12 h-3 bg-slate-100 rounded"></div>
                                    <div className="w-14 h-3 bg-slate-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard({ metrics = {}, chartData = { labels: [], datasets: [] }, recentOrders = [], topProducts = [], topCategories = [], filters = {} }) {
    const storeName = useStoreName();

    const [themeColor, setThemeColor] = useState('#f97316');
    const [themeColorLight, setThemeColorLight] = useState('rgba(249, 115, 22, 0.1)');
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedRange, setSelectedRange] = useState(filters.range || 'today');
    const [customStart, setCustomStart] = useState(filters.date_start || '');
    const [customEnd, setCustomEnd] = useState(filters.date_end || '');

    const rangeOptions = [
        { value: 'today', label: 'Today' },
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: 'this_month', label: 'This Month' },
        { value: 'all', label: 'All Time' },
        { value: 'custom', label: 'Custom' },
    ];

    const applyDashboardFilter = (range, dateStart = customStart, dateEnd = customEnd) => {
        const query = { range };
        if (range === 'custom') {
            query.date_start = dateStart;
            query.date_end = dateEnd;
        }

        setIsFiltering(true);
        router.get(route('admin.dashboard'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsFiltering(true),
            onFinish: () => {
                setIsFiltering(false);
                setIsLoading(false);
            },
            onError: () => {
                setIsFiltering(false);
                setIsLoading(false);
            },
        });
    };

    const selectRange = (range) => {
        if (isFiltering) return;
        setSelectedRange(range);
        if (range !== 'custom') {
            applyDashboardFilter(range);
        }
    };

    useEffect(() => {
        setSelectedRange(filters.range || 'today');
        setCustomStart(filters.date_start || '');
        setCustomEnd(filters.date_end || '');
    }, [filters.range, filters.date_start, filters.date_end]);

    useEffect(() => {
        const checkTheme = () => {
            const savedTheme = localStorage.getItem('govaly-admin-theme') || 'sunset';
            const colors = {
                sunset: { primary: '#f97316', light: 'rgba(249, 115, 22, 0.1)' },
                emerald: { primary: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },
                ocean: { primary: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },
                purple: { primary: '#8b5cf6', light: 'rgba(139, 92, 246, 0.1)' },
                dark: { primary: '#a78bfa', light: 'rgba(167, 139, 250, 0.15)' }
            };
            const activeColor = colors[savedTheme] || colors.sunset;
            setThemeColor(activeColor.primary);
            setThemeColorLight(activeColor.light);
        };

        checkTheme();
        
        // Initial quick load transition
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 400);

        window.addEventListener('storage', checkTheme);
        window.addEventListener('admin-theme-changed', checkTheme);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('storage', checkTheme);
            window.removeEventListener('admin-theme-changed', checkTheme);
        };
    }, []);

    const dynamicChartData = chartData?.datasets ? {
        ...chartData,
        datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            borderColor: themeColor,
            backgroundColor: themeColorLight,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: themeColor,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
        }))
    } : { labels: [], datasets: [] };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                grid: { color: '#f1f5f9' },
                ticks: { font: { family: 'Outfit', size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Outfit', size: 10 } }
            }
        }
    };

    const showSkeleton = isLoading || isFiltering;

    return (
        <AdminLayout>
            <Head title={`Admin Operations Dashboard | ${storeName}`} />

            <div className="flex flex-col gap-6">
                {/* Store Performance Header & Action Filter Buttons */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-950 p-2.5 text-white shadow-sm">
                            <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black text-slate-900">Store Performance</h1>
                                {isFiltering && (
                                    <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 animate-pulse border border-orange-100">
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" /> Updating...
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-400">
                                Showing analytics for {filters.label || 'Today'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
                            {rangeOptions.map((option) => {
                                const isActive = selectedRange === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        disabled={isFiltering}
                                        onClick={() => selectRange(option.value)}
                                        className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-all duration-200 ${
                                            isActive
                                                ? 'bg-white text-slate-950 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900'
                                        } ${isFiltering ? 'cursor-wait opacity-80' : ''}`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                disabled={isFiltering}
                                onClick={() => {
                                    setSelectedRange('today');
                                    applyDashboardFilter('today');
                                }}
                                className={`ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-900 ${
                                    isFiltering ? 'cursor-wait opacity-70' : ''
                                }`}
                                title="Reset to today"
                            >
                                <RotateCcw className={`h-3.5 w-3.5 ${isFiltering ? 'animate-spin text-slate-700' : ''}`} />
                            </button>
                        </div>

                        {selectedRange === 'custom' && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                                <input
                                    type="date"
                                    value={customStart}
                                    disabled={isFiltering}
                                    max={customEnd || undefined}
                                    onChange={(event) => setCustomStart(event.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 disabled:opacity-60"
                                />
                                <span className="hidden text-xs text-slate-400 sm:inline">to</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    disabled={isFiltering}
                                    min={customStart || undefined}
                                    onChange={(event) => setCustomEnd(event.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    disabled={!customStart || !customEnd || isFiltering}
                                    onClick={() => applyDashboardFilter('custom')}
                                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5"
                                >
                                    {isFiltering && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Apply Range
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body: Render Skeleton Loader or Actual Dashboard Content */}
                {showSkeleton ? (
                    <DashboardSkeletonContent />
                ) : (
                    <div className="flex flex-col gap-6 transition-opacity duration-300">
                        {/* Metrics cards grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Paid Revenue', value: `TK ${Number(metrics.revenue || 0).toLocaleString()}`, change: filters.label || 'Selected period', icon: TrendingUp },
                                { title: 'Total Orders', value: metrics.orders_count, change: filters.label || 'Selected period', icon: ShoppingCart },
                                { title: 'Products Added', value: metrics.products_count, change: filters.label || 'Selected period', icon: Package },
                                { title: 'Active Buyers', value: metrics.customers_count, change: filters.label || 'Selected period', icon: Users }
                            ].map((stat, idx) => (
                                <div 
                                    key={idx} 
                                    className="rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden text-white"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    <div className="p-6 flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{stat.title}</span>
                                                <span className="text-2xl font-black text-white mt-1">{stat.value}</span>
                                            </div>
                                            <div 
                                                className="w-9 h-9 rounded-lg flex items-center justify-center" 
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                            >
                                                <stat.icon className="w-4.5 h-4.5 text-white" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-white/80 font-semibold mt-4 block">
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Average Paid Order', val: `TK ${Number(metrics.average_order_value || 0).toLocaleString()}` },
                                { label: 'New Signups', val: `${metrics.new_signups || 0} users` },
                                { label: 'Payment Rate', val: `${Number(metrics.payment_rate || 0).toFixed(2)}%` },
                                { label: 'Fulfillment Rate', val: `${Number(metrics.fulfillment_rate || 0).toFixed(2)}%` }
                            ].map((aux, aIdx) => (
                                <div key={aIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{aux.label}</span>
                                    <span className="text-sm font-black text-slate-700">{aux.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Charts and table */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue chart column */}
                            <div className="lg:col-span-2 bg-white border border-slate-100/60 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
                                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                                        Revenue Performance
                                    </h2>
                                    <span className="text-[10px] font-bold text-white bg-white/20 py-0.5 px-2 rounded">
                                        {filters.label || 'Selected period'}
                                    </span>
                                </div>
                                <div className="p-6 h-64">
                                    <Bar data={dynamicChartData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Recent orders */}
                            <div className="bg-white border border-slate-100/60 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
                                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                                        Recent Orders
                                    </h2>
                                    <Link href={route('admin.orders')} className="text-[10px] font-bold text-white bg-white/20 py-0.5 px-2 rounded hover:bg-white/30 transition-colors">
                                        Manage All <ArrowUpRight className="w-3.5 h-3.5 inline ml-0.5" />
                                    </Link>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    {recentOrders.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-4 text-center">No orders placed recently.</p>
                                    ) : (
                                        recentOrders.map((ord) => (
                                            <div key={ord.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">#{ord.order_number}</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">{ord.phone}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-slate-850">TK {Number(ord.total || 0).toLocaleString()}</span>
                                                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 ${
                                                        ord.status === 'completed' 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : ord.status === 'cancelled'
                                                                ? 'bg-red-50 text-red-700'
                                                                : 'bg-orange-50 text-orange-755'
                                                    }`}>
                                                        {ord.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Best Selling Products & Categories Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Bestselling Products */}
                            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
                                    <div className="flex items-center gap-2 text-white">
                                        <Award className="w-4.5 h-4.5" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">Top Bestselling Products</h3>
                                    </div>
                                    <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded">{filters.label || 'Selected period'}</span>
                                </div>
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                                <th className="py-2.5 px-3">Product Name</th>
                                                <th className="py-2.5 px-3 text-right">Sales</th>
                                                <th className="py-2.5 px-3 text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="py-6 px-3 text-center text-xs font-semibold italic text-slate-400">No product sales found for this period.</td>
                                                </tr>
                                            ) : topProducts.map(p => (
                                                <tr key={p.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-55/35">
                                                    <td className="py-2 px-3 font-semibold text-slate-700 max-w-[160px] truncate">{p.name}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-slate-500">{p.sales} units</td>
                                                    <td className="py-2 px-3 text-right font-bold text-slate-800">TK {Number(p.revenue || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bestselling Categories */}
                            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
                                    <div className="flex items-center gap-2 text-white">
                                        <FolderOpen className="w-4.5 h-4.5" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">Top Product Categories</h3>
                                    </div>
                                    <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded">Sales Stats</span>
                                </div>
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                                <th className="py-2.5 px-3">Category</th>
                                                <th className="py-2.5 px-3 text-right">Products</th>
                                                <th className="py-2.5 px-3 text-right">Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topCategories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="py-6 px-3 text-center text-xs font-semibold italic text-slate-400">No category sales found for this period.</td>
                                                </tr>
                                            ) : topCategories.map(c => (
                                                <tr key={c.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-55/35">
                                                    <td className="py-2 px-3 font-semibold text-slate-700">{c.name}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-slate-500">{c.productsCount} items</td>
                                                    <td className="py-2 px-3 text-right font-bold text-emerald-600">{c.totalSales} units</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}



