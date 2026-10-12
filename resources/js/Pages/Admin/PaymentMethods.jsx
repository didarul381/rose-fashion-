import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Save, CheckCircle2, X } from 'lucide-react';

export default function PaymentMethods({ settings }) {
    const storeName = useStoreName();

    const { flash } = usePage().props;

    const form = useForm({
        settings: {
            payment_cod_status: settings.payment_cod_status || '1',
            payment_bkash_status: settings.payment_bkash_status || '0',
            payment_bkash_app_key: settings.payment_bkash_app_key || '',
            payment_bkash_app_secret: settings.payment_bkash_app_secret || '',
            payment_bkash_username: settings.payment_bkash_username || '',
            payment_bkash_password: settings.payment_bkash_password || '',
            payment_bkash_sandbox: settings.payment_bkash_sandbox || '1',
            
            payment_nagad_status: settings.payment_nagad_status || '0',
            payment_nagad_mode: settings.payment_nagad_mode || 'sandbox',
            payment_nagad_merchant_id: settings.payment_nagad_merchant_id || '',
            payment_nagad_merchant_number: settings.payment_nagad_merchant_number || '',
            payment_nagad_public_key: settings.payment_nagad_public_key || '',
            payment_nagad_private_key: settings.payment_nagad_private_key || '',
        }
    });

    const handleToggle = (key) => {
        form.setData('settings', {
            ...form.data.settings,
            [key]: form.data.settings[key] === '1' ? '0' : '1'
        });
    };

    const handleFieldChange = (key, value) => {
        form.setData('settings', {
            ...form.data.settings,
            [key]: value
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.payment-methods.save'));
    };

    const Toggle = ({ checked, onChange, label }) => (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="font-bold text-slate-700 uppercase text-xs">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    checked ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`Payment Methods Settings | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Heading */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Payment Gateways</h1>
                    <p className="text-xs text-slate-400 mt-1">Configure active customer payment processors and sandbox gateway credentials.</p>
                </div>

                {/* Flash success/error alerts */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-rose-55 border border-rose-250 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <X className="w-4 h-4 text-rose-600" />
                        {flash.error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Cash on Delivery Card */}
                        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-orange-600 text-lg">
                                        COD
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Cash On Delivery</h2>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Collect Cash on Parcel Arrival</span>
                                    </div>
                                </div>

                                <Toggle 
                                    label="Website Active Status" 
                                    checked={form.data.settings.payment_cod_status === '1'} 
                                    onChange={() => handleToggle('payment_cod_status')} 
                                />

                                <p className="text-[11px] text-slate-450 leading-relaxed font-semibold mt-4">
                                    When active, customers will be able to complete their order instantly at checkout without advance digital payment. Order status will be initialized as "Pending" and can be assigned to Courier dispatcher.
                                </p>
                            </div>
                            
                            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save COD
                                </button>
                            </div>
                        </div>

                        {/* bKash Checkout Card */}
                        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center font-black text-pink-600 text-lg">
                                        bKash
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">bKash Checkout API</h2>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Instant Mobile Payment Gateway</span>
                                    </div>
                                </div>

                                <Toggle 
                                    label="Website Active Status" 
                                    checked={form.data.settings.payment_bkash_status === '1'} 
                                    onChange={() => handleToggle('payment_bkash_status')} 
                                />

                                <div className="space-y-4 text-xs mt-6">
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">bKash Checkout App Key</label>
                                        <input
                                            type="text"
                                            value={form.data.settings.payment_bkash_app_key}
                                            onChange={e => handleFieldChange('payment_bkash_app_key', e.target.value)}
                                            placeholder="Enter App Key"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">bKash Checkout App Secret</label>
                                        <input
                                            type="password"
                                            value={form.data.settings.payment_bkash_app_secret}
                                            onChange={e => handleFieldChange('payment_bkash_app_secret', e.target.value)}
                                            placeholder="Enter App Secret"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs font-mono"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">bKash User Name</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.payment_bkash_username}
                                                onChange={e => handleFieldChange('payment_bkash_username', e.target.value)}
                                                placeholder="Username"
                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">bKash Password</label>
                                            <input
                                                type="password"
                                                value={form.data.settings.payment_bkash_password}
                                                onChange={e => handleFieldChange('payment_bkash_password', e.target.value)}
                                                placeholder="Password"
                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="font-bold text-slate-600 uppercase text-[11px]">Sandbox Environment Mode</span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle('payment_bkash_sandbox')}
                                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                form.data.settings.payment_bkash_sandbox === '1' ? 'bg-emerald-500' : 'bg-slate-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                                    form.data.settings.payment_bkash_sandbox === '1' ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save bKash
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Nagad Card (As shown in screenshot mockup) */}
                    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center font-bold text-rose-600 text-lg">
                                Nagad
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Nagad Payment Gateway</h2>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Collect Payments via Nagad PG API</span>
                            </div>
                        </div>

                        <Toggle 
                            label="Website Active Status" 
                            checked={form.data.settings.payment_nagad_status === '1'} 
                            onChange={() => handleToggle('payment_nagad_status')} 
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-6">
                            <div>
                                <label className="font-bold text-slate-655 uppercase">Nagad Mode</label>
                                <select
                                    value={form.data.settings.payment_nagad_mode}
                                    onChange={e => handleFieldChange('payment_nagad_mode', e.target.value)}
                                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 bg-white text-xs focus:outline-none"
                                >
                                    <option value="sandbox">Sandbox</option>
                                    <option value="live">Live Production</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-655 uppercase">Nagad Merchant ID</label>
                                <input
                                    type="text"
                                    value={form.data.settings.payment_nagad_merchant_id}
                                    onChange={e => handleFieldChange('payment_nagad_merchant_id', e.target.value)}
                                    placeholder="Merchant ID"
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-655 uppercase">Nagad Merchant Number</label>
                                <input
                                    type="text"
                                    value={form.data.settings.payment_nagad_merchant_number}
                                    onChange={e => handleFieldChange('payment_nagad_merchant_number', e.target.value)}
                                    placeholder="Merchant Hotline / Phone Number"
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-xs"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="font-bold text-slate-655 uppercase">Nagad PG Public Key</label>
                                <textarea
                                    value={form.data.settings.payment_nagad_public_key}
                                    onChange={e => handleFieldChange('payment_nagad_public_key', e.target.value)}
                                    rows="2"
                                    placeholder="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg..."
                                    className="w-full mt-1 p-3 border border-slate-200 rounded-lg focus:outline-none font-mono text-xs"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="font-bold text-slate-655 uppercase">Nagad Merchant Private Key</label>
                                <textarea
                                    value={form.data.settings.payment_nagad_private_key}
                                    onChange={e => handleFieldChange('payment_nagad_private_key', e.target.value)}
                                    rows="2"
                                    placeholder="MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwgg..."
                                    className="w-full mt-1 p-3 border border-slate-200 rounded-lg focus:outline-none font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save Nagad
                            </button>
                        </div>
                    </div>

                </form>

            </div>
        </AdminLayout>
    );
}
