import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { Search, MapPin, Truck, CheckCircle, Package, Calendar } from 'lucide-react';

export default function TrackOrder({ searched, order }) {
    const storeName = useStoreName();
    const [orderNumber, setOrderNumber] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('track-order'), { order_number: orderNumber }, { preserveState: true });
    };

    // Determine tracking status steps progress percentages
    const statusSteps = [
        { key: 'pending', label: 'Order Placed', desc: 'Awaiting admin processing', icon: Calendar },
        { key: 'processing', label: 'Packaging', desc: 'Preparing item dispatch', icon: Package },
        { key: 'shipped', label: 'In Transit', desc: 'Shipped via local courier', icon: Truck },
        { key: 'completed', label: 'Delivered', desc: 'Package received by buyer', icon: CheckCircle }
    ];

    const getStatusIndex = (status) => {
        if (status === 'pending') return 0;
        if (status === 'processing') return 1;
        if (status === 'shipped') return 2;
        if (status === 'completed' || status === 'paid') return 3;
        return -1; // e.g. cancelled/refunded
    };

    const activeIndex = order ? getStatusIndex(order.status) : -1;

    return (
        <ShopLayout>
            <Head title={`Track Shipment Status | ${storeName}`} />

            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-8">
                
                {/* Header Title */}
                <div className="text-center">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900">Track Your Order</h1>
                    <p className="text-sm text-slate-400 mt-1.5">Enter your unique order invoice number to monitor delivery transit.</p>
                </div>

                {/* Tracking search form */}
                <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex gap-3.5">
                    <input
                        type="text"
                        placeholder="Enter your order number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm font-semibold"
                        required
                    />
                    <button type="submit" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md">
                        <Search className="w-4 h-4" />
                        Track Now
                    </button>
                </form>

                {/* Result Section */}
                {searched && (
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col gap-8">
                        {order ? (
                            <>
                                {/* Status Overview */}
                                <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-100 gap-4 text-xs font-semibold text-slate-500">
                                    <div>
                                        <span className="text-slate-400 uppercase block font-bold mb-0.5">Tracking Number</span>
                                        <span className="font-mono text-slate-800 font-bold">{order.tracking_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 uppercase block font-bold mb-0.5">Order Code</span>
                                        <span className="text-slate-850 font-bold">#{order.order_number}</span>
                                    </div>
                                    <div className="sm:text-right">
                                        <span className="text-slate-400 uppercase block font-bold mb-0.5">Last Status Update</span>
                                        <span className="text-slate-850 font-bold">{new Date(order.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Visual Roadmap Tracking Bar */}
                                {order.status === 'cancelled' || order.status === 'refunded' ? (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-800 font-bold text-sm rounded-2xl text-center">
                                        This order was {order.status.toUpperCase()} and cannot be tracked further.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6 md:gap-10 pt-4">
                                        {statusSteps.map((step, idx) => {
                                            const Icon = step.icon;
                                            const isDone = idx <= activeIndex;
                                            const isActive = idx === activeIndex;

                                            return (
                                                <div key={idx} className="flex gap-4 items-start relative">
                                                    
                                                    {/* Roadmap line connector vertical */}
                                                    {idx < statusSteps.length - 1 && (
                                                        <div className={`absolute left-5 top-10 bottom-[-30px] w-0.5 ${
                                                            idx < activeIndex ? 'bg-orange-500' : 'bg-slate-200'
                                                        }`} />
                                                    )}

                                                    {/* Step Circle Badge */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 transition-all ${
                                                        isActive 
                                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg ring-4 ring-orange-500/15'
                                                            : isDone
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : 'bg-white border-slate-200 text-slate-350'
                                                    }`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`text-sm font-bold leading-none ${
                                                            isActive ? 'text-orange-500' : isDone ? 'text-slate-800' : 'text-slate-400'
                                                        }`}>
                                                            {step.label}
                                                        </h4>
                                                        <p className="text-xs text-slate-450 mt-1">{step.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center p-8 flex flex-col items-center justify-center">
                                <span className="text-2xl mb-1.5">🔍</span>
                                <h3 className="text-base font-bold text-slate-700">No matching order found</h3>
                                <p className="text-xs text-slate-450 mt-1">Check your order number spelling and try again.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </ShopLayout>
    );
}
