import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { ArrowLeft, Printer, MapPin, Calendar, FileText } from 'lucide-react';

export default function OrderView({ order, settings }) {
    const storeName = useStoreName();
    const shippingAddress = order.shipping_address;

    const handlePrint = () => {
        window.print();
    };

    return (
        <ShopLayout>
            <Head title={`Order #${order.order_number} Invoice | ${storeName}`} />

            <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 print:py-0 print:px-0 flex flex-col gap-6">
                
                {/* Header Back & Print buttons (hidden on print) */}
                <div className="flex items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link href={route('customer.orders')} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Order Invoice Detail</h1>
                            <p className="text-xs text-slate-400">Review line items and delivery receipts</p>
                        </div>
                    </div>

                    <button 
                        onClick={handlePrint}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                    </button>
                </div>

                {/* Printable Invoice Page Sheet */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-10 flex flex-col gap-8 print:border-none print:shadow-none print:p-0">
                    
                    {/* Brand name & Order details header */}
                    <div className="flex justify-between items-start pb-6 border-b border-slate-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                {storeName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{settings?.site_tagline || 'Premium single vendor ecommerce'}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400 font-bold uppercase block">Invoice Number</span>
                            <span className="text-base font-extrabold text-slate-850">#{order.order_number}</span>
                        </div>
                    </div>

                    {/* Metadata addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-500">
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">Shipping Details</span>
                                <p className="font-medium">{shippingAddress?.name}</p>
                                <p className="mt-0.5">{shippingAddress?.address}, {shippingAddress?.city}</p>
                                <p className="mt-1 font-semibold">Phone: {order.phone}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-slate-800 block mb-1">Receipt Details</span>
                                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                <p>Payment Method: <strong className="uppercase text-slate-700">{order.payment_method}</strong></p>
                                <p>Payment Status: <strong className="uppercase text-slate-700">{order.payment_status}</strong></p>
                                <p>Delivery Status: <strong className="uppercase text-slate-700">{order.status}</strong></p>
                                {order.shipping_method_label && (
                                    <p>Shipping Method: <strong className="text-slate-700">{order.shipping_method_label}</strong></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products lines Table */}
                    <div className="border-t border-slate-100 pt-6">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                                    <th className="py-2.5">Product Name</th>
                                    <th className="py-2.5">SKU</th>
                                    <th className="py-2.5">Price</th>
                                    <th className="py-2.5 text-center">Qty</th>
                                    <th className="py-2.5 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {order.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-3 text-slate-800 font-bold">
                                            {item.name}
                                        </td>
                                        <td className="py-3">{item.sku}</td>
                                        <td className="py-3">৳{item.price}</td>
                                        <td className="py-3 text-center">{item.quantity}</td>
                                        <td className="py-3 text-right font-bold text-slate-800">৳{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals pricing column */}
                    <div className="border-t border-slate-100 pt-6 flex justify-end">
                        <div className="w-full sm:w-64 space-y-2 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-800">৳{order.subtotal}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-orange-655 font-semibold">
                                    <span>Discount</span>
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

                    {/* Tracking box info */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between text-xs gap-3 print:hidden">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-500" />
                            <div>
                                <span className="font-bold text-slate-800 block">Courier Tracking Number</span>
                                <span className="font-mono text-slate-500 font-semibold">{order.tracking_number}</span>
                            </div>
                        </div>
                        <Link href={route('track-order', { order_number: order.order_number })} className="text-orange-500 hover:text-orange-650 font-bold">
                            View Shipment Timeline →
                        </Link>
                    </div>

                </div>

            </div>
        </ShopLayout>
    );
}
