import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { FileText, Printer, Save, Sliders, List, Search } from 'lucide-react';

export default function Invoices({ invoice_settings, orders, filters }) {
    const storeName = useStoreName();

    const settingsForm = useForm({
        settings: {
            invoice_style: invoice_settings.invoice_style || 'modern',
            invoice_prefix: invoice_settings.invoice_prefix || 'GOV',
            invoice_show_product_image: invoice_settings.invoice_show_product_image || '1',
            invoice_company_name: invoice_settings.invoice_company_name || '',
            invoice_company_address: invoice_settings.invoice_company_address || '',
            invoice_company_phone: invoice_settings.invoice_company_phone || '',
            invoice_company_website: invoice_settings.invoice_company_website || 'www.mahmudtrading.com',
            invoice_company_email: invoice_settings.invoice_company_email || '',
            invoice_footer_note: invoice_settings.invoice_footer_note || '',
        }
    });

    const handleSettingChange = (key, value) => {
        settingsForm.setData('settings', {
            ...settingsForm.data.settings,
            [key]: value
        });
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.invoices.settings.save'));
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        router.get(route('admin.invoices'), { search: query }, {
            preserveState: true,
            replace: true
        });
    };

    const openPrintInvoice = (orderId) => {
        window.open(route('admin.orders.invoice', { id: orderId }), '_blank');
    };

    return (
        <AdminLayout>
            <Head title={`Invoice Center | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Invoice Manager
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Configure company billing settings, switch layout styles (Standard Modern vs. Thermal Slip), and dispatch print orders.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Invoice Configurations */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-fit">
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2 pb-2 border-b border-slate-50">
                            <Sliders className="w-4 h-4 text-orange-500" />
                            Global Invoice Layout Settings
                        </h2>

                        <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 uppercase">Invoice Prefix</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.settings.invoice_prefix}
                                    onChange={e => handleSettingChange('invoice_prefix', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. GOV or HB"
                                    maxLength="10"
                                    required
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400">
                                    New invoices will use this format: #{settingsForm.data.settings.invoice_prefix || 'GOV'}-XXXXXXXX
                                </p>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Default Invoice Version</label>
                                <select
                                    value={settingsForm.data.settings.invoice_style}
                                    onChange={e => handleSettingChange('invoice_style', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                >
                                    <option value="modern">Version 1: Modern / Clean PDF Layout</option>
                                    <option value="thermal">Version 2: Standard Thermal POS 80mm Receipt</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Product Image Status</label>
                                <select
                                    value={settingsForm.data.settings.invoice_show_product_image}
                                    onChange={e => handleSettingChange('invoice_show_product_image', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                >
                                    <option value="1">Show Product Images in Invoice</option>
                                    <option value="0">Hide Product Images in Invoice</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Company Name</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.settings.invoice_company_name}
                                    onChange={e => handleSettingChange('invoice_company_name', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. Your Store"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Billing Address</label>
                                <textarea
                                    value={settingsForm.data.settings.invoice_company_address}
                                    onChange={e => handleSettingChange('invoice_company_address', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    rows="2"
                                    placeholder="e.g. Level-4, House-12, Sector-3, Uttara, Dhaka"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Billing Hotline</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.settings.invoice_company_phone}
                                    onChange={e => handleSettingChange('invoice_company_phone', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. +8801700000000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Company Web Site</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.settings.invoice_company_website}
                                    onChange={e => handleSettingChange('invoice_company_website', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. www.mahmudtrading.com"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Billing Email</label>
                                <input
                                    type="email"
                                    value={settingsForm.data.settings.invoice_company_email}
                                    onChange={e => handleSettingChange('invoice_company_email', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. billing@example.com"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 uppercase">Footer Memo / Note</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.settings.invoice_footer_note}
                                    onChange={e => handleSettingChange('invoice_footer_note', e.target.value)}
                                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g. Thank you for your purchase!"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                Save Invoice Configs
                            </button>
                        </form>
                    </div>

                    {/* Order Invoice dispatch list */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm lg:col-span-2">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-2 border-b border-slate-50">
                            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <List className="w-4 h-4 text-orange-500" />
                                Print Invoices Dispatch List
                            </h2>

                            <div className="relative text-xs">
                                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    defaultValue={filters.search || ''}
                                    onChange={handleSearch}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl w-[200px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="Search order number..."
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto text-xs">
                            <table className="w-full text-left text-slate-500">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3">Order Number</th>
                                        <th className="py-3">Customer</th>
                                        <th className="py-3">Total Payable</th>
                                        <th className="py-3">Payment Method</th>
                                        <th className="py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                    {orders.data.map((order) => {
                                        const shipping = typeof order.shipping_address === 'string'
                                            ? JSON.parse(order.shipping_address) || {}
                                            : order.shipping_address || {};
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/50">
                                                <td className="py-4 font-bold text-slate-800">#{order.order_number}</td>
                                                <td className="py-4">
                                                    <div className="font-bold text-slate-850">{shipping.name || order.name || 'Guest'}</div>
                                                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{order.phone || shipping.phone || ''}</div>
                                                </td>
                                                <td className="py-4 font-black text-slate-800">৳{order.total}</td>
                                                <td className="py-4 uppercase text-[10px] font-bold text-slate-500">{order.payment_method}</td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => openPrintInvoice(order.id)}
                                                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg font-bold flex items-center gap-1 ml-auto transition-all"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        Print Invoice
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {orders.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400 italic">No orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination bar */}
                        {orders.links.length > 3 && (
                            <div className="flex justify-end gap-1.5 mt-6 border-t border-slate-50 pt-4">
                                {orders.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => router.get(link.url)}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                                            link.active 
                                                ? 'bg-orange-500 text-white' 
                                                : link.url 
                                                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-650' 
                                                    : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
