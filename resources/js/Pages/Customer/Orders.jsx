import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { Eye, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CustomerOrders({ orders }) {
    const storeName = useStoreName();
    return (
        <ShopLayout>
            <Head title={`My Orders History | ${storeName}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                
                {/* Header Back button */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('customer.dashboard')} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900">Orders History</h1>
                        <p className="text-xs text-slate-400">View and track all purchases made on your account</p>
                    </div>
                </div>

                {/* Orders list card */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm">
                    <div className="overflow-x-auto">
                        {orders.data.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <ShoppingBag className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="text-sm font-semibold text-slate-550 italic">No orders found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs text-slate-500">
                                <thead>
                                    <tr className="border-b border-slate-50 text-slate-400 font-bold uppercase">
                                        <th className="py-3">Order Number</th>
                                        <th className="py-3">Placed Date</th>
                                        <th className="py-3">Payment Method</th>
                                        <th className="py-3">Total Paid</th>
                                        <th className="py-3">Payment Status</th>
                                        <th className="py-3">Delivery Status</th>
                                        <th className="py-3 text-right">View Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {orders.data.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/50">
                                            <td className="py-4 font-bold text-slate-800">#{ord.order_number}</td>
                                            <td className="py-4">{new Date(ord.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 uppercase">{ord.payment_method}</td>
                                            <td className="py-4 font-bold text-slate-800">৳{ord.total}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                                    ord.payment_status === 'paid' 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : ord.payment_status === 'failed'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-orange-50 text-orange-700'
                                                }`}>
                                                    {ord.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-4">
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
                                            <td className="py-4 text-right">
                                                <Link href={route('customer.order-view', { orderNumber: ord.order_number })} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-orange-500 hover:border-orange-200 inline-block transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {orders.links.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-orange-500 border-orange-500 text-white' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </ShopLayout>
    );
}
