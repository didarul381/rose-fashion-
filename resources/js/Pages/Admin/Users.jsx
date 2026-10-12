import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { BadgeCheck, Crown, Mail, Search, Shield, ShoppingBag, Users as UsersIcon } from 'lucide-react';

export default function Users({ users, filters, stats }) {
    const storeName = useStoreName();

    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || '');

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('admin.users'), {
            search,
            role,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRole('');
        router.get(route('admin.users'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const statsCards = [
        { label: 'Total users', value: stats.total_users, icon: UsersIcon, accent: 'from-sky-500 to-cyan-400' },
        { label: 'Admins', value: stats.admins_count, icon: Shield, accent: 'from-violet-500 to-fuchsia-500' },
        { label: 'Customers', value: stats.customers_count, icon: ShoppingBag, accent: 'from-emerald-500 to-teal-400' },
        { label: 'Verified', value: stats.verified_count, icon: BadgeCheck, accent: 'from-amber-500 to-orange-400' },
    ];

    return (
        <AdminLayout>
            <Head title={`Users | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600">
                                <Crown className="h-3.5 w-3.5" />
                                Customer directory
                            </span>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Users Management</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Search customers, review verification status, and keep track of who is shopping in your store.
                            </p>
                        </div>

                        <form onSubmit={applyFilters} className="flex w-full flex-col gap-3 lg:max-w-2xl">
                            <div className="grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, email, role, referral code"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                    />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                >
                                    <option value="">All roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                                >
                                    <Search className="h-4 w-4" />
                                    Search users
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Reset filters
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statsCards.map((card) => (
                        <div key={card.label} className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                            <div className="text-sm font-medium text-slate-500">{card.label}</div>
                            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</div>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-slate-200/80 px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-950">User Directory</h2>
                                <p className="text-sm text-slate-500">Showing {users.total} records</p>
                            </div>
                            <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 md:flex">
                                <Mail className="h-4 w-4" />
                                Email verified status included
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200/80">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">User</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Role</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Orders</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Verification</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-14 text-center">
                                            <div className="mx-auto max-w-sm">
                                                <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
                                                <h3 className="mt-4 text-lg font-bold text-slate-900">No users found</h3>
                                                <p className="mt-2 text-sm text-slate-500">Try a different search or clear the filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="bg-white transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-black text-white shadow-sm">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-950">{user.name}</div>
                                                        <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                                                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                            {user.referral_code || 'No referral code'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    user.role === 'admin'
                                                        ? 'bg-violet-100 text-violet-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {user.role || 'customer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {user.orders_count || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                    user.email_verified_at
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {user.email_verified_at ? (
                                                        <>
                                                            <BadgeCheck className="h-3.5 w-3.5" />
                                                            Verified
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="h-3.5 w-3.5" />
                                                            Pending
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {user.created_at}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.last_page > 1 && (
                        <div className="flex justify-center gap-1.5 border-t border-slate-200/80 bg-slate-50 px-6 py-5">
                            {users.links.map((link, idx) => {
                                if (link.url === null) return null;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => router.visit(link.url)}
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                            link.active
                                                ? 'border-slate-950 bg-slate-950 text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
