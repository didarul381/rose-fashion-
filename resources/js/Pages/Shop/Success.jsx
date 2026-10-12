import { useStoreName } from '../../Hooks/useStoreName';
import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { CheckCircle, ArrowRight, FileText, MapPin, Calendar } from 'lucide-react';
import { Tracker } from '../../Services/Tracker';

export default function SuccessPage({ order, settings, eventId }) {
    const storeName = useStoreName();
    const shippingAddress = order.shipping_address;

    useEffect(() => {
        Tracker.trackPurchase(order, order.items || [], eventId);
    }, [order, eventId]);
    
    return (
        <ShopLayout>
            <Head title={`Order Completed Successfully | ${storeName}`} />

            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 text-center">
                
                {/* Header Badge */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900">Order Placed Successfully!</h1>
                <p className="text-sm text-slate-400 mt-2">Thank you for shopping at {storeName}. Your order is now in progress.</p>
                
                {/* Invoice Summary Card */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8 mt-10 text-left flex flex-col gap-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-100 gap-4">
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase">Order Invoice</span>
                            <h3 className="text-base font-extrabold text-slate-800 mt-0.5">#{order.order_number}</h3>
                        </div>
                        {/* <div className="flex flex-col sm:text-right">
                            <span className="text-xs text-slate-400 font-bold uppercase">Estimated Delivery</span>
                            <span className="text-sm font-bold text-orange-500 mt-0.5">1-4 Business Days</span>
                        </div> */}
                    </div>

                    {/* Delivery Address & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-500">
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">Shipping Details</span>
                                <p>{shippingAddress?.name}<br />{shippingAddress?.address}, {shippingAddress?.city}</p>
                                <p className="mt-1">Phone: {order.phone}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">Billing Summary</span>
                                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                <p>Payment Method: <strong className="uppercase text-slate-700">{order.payment_method}</strong></p>
                                <p>Payment Status: <strong className="uppercase text-slate-700">{order.payment_status}</strong></p>
                                {order.shipping_method_label && (
                                    <p>Shipping Method: <strong className="text-slate-700">{order.shipping_method_label}</strong></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product items list */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-1">Items Summary</span>
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-655 font-semibold">
                                    {item.name} <strong className="text-slate-400">x{item.quantity}</strong>
                                </span>
                                <span className="font-bold text-slate-800">৳{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals Summary */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs text-slate-500">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-800">৳{order.subtotal}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-orange-655 font-semibold">
                                <span>Discounts Applied</span>
                                <span>-৳{order.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span className="font-semibold text-slate-800">৳{order.tax}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping Cost</span>
                            <span className="font-semibold text-slate-800">৳{order.shipping_cost}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-3">
                            <span>Total Paid</span>
                            <span className="text-base font-extrabold text-orange-500">৳{order.total}</span>
                        </div>
                    </div>

                </div>

                {/* Back buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    <Link href={route('home')} className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all">
                        Back To Shop
                    </Link>
                    <Link href={route('customer.dashboard')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md">
                        Go To My Dashboard
                    </Link>
                </div>

            </div>
        </ShopLayout>
    );
}
