import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    Save, RefreshCw, FileText, Settings, Palette, Layout, 
    Navigation, Gift, Upload, Loader2, Link2, HelpCircle, Store, MapPin, Mail, Bell, ShieldCheck,
    Phone, X, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import WhatsAppIcon from '../../Components/WhatsAppIcon';
import MessengerIcon from '../../Components/MessengerIcon';

export default function AdminSettings({ settings }) {
    const storeName = useStoreName();

    // Flatten settings object
    const initialSettings = {};
    Object.keys(settings).forEach(group => {
        settings[group].forEach(s => {
            initialSettings[s.key] = s.value;
        });
    });

    const form = useForm({
        settings: initialSettings
    });

    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam && tabParam !== 'header' && tabParam !== 'theme') return tabParam;
        }
        return 'general';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'header' || tabParam === 'theme') {
                router.visit(route('admin.theme-customize'));
            }
        }
    }, []);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingPopup, setUploadingPopup] = useState(false);

    const handleFieldChange = (key, val) => {
        form.setData('settings', {
            ...form.data.settings,
            [key]: val
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data?.url) {
                handleFieldChange('header_logo_image', response.data.url);
            }
        } catch (err) {
            alert('Upload failed.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handlePopupUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPopup(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data?.url) {
                handleFieldChange('popup_image', response.data.url);
            }
        } catch (err) {
            alert('Upload failed.');
        } finally {
            setUploadingPopup(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.settings.save'));
    };

    const handleGenerateSitemap = () => {
        router.post(route('admin.settings.sitemap'));
    };

    const tabs = [
        { id: 'general', name: '🛠️ General Settings' },
        { id: 'chat_plugin', name: '💬 Multiple Chat Plugin' },
        { id: 'checkout', name: 'Checkout Page' },
        { id: 'mail', name: 'Mail Settings' },
        { id: 'theme', name: '🎨 Theme Customize', href: route('admin.theme-customize') },
        { id: 'footer', name: '👣 Footer Builder' },
        { id: 'megamenu', name: '🧭 Mega Menu' },
        { id: 'popup', name: '🎁 Popup Builder' },
        { id: 'sections', name: '⚡ Dynamic Sections', href: route('admin.page-builder') }
    ];

    const checkoutFieldSettings = [
        { key: 'checkout_name_status', label: 'Recipient Name', description: 'Show the customer name field.' },
        { key: 'checkout_phone_status', label: 'Contact Phone Number', description: 'Show the customer phone field.' },
        { key: 'checkout_email_status', label: 'Email Address', description: 'Show the optional email field.' },
        { key: 'checkout_address_status', label: 'Street Address', description: 'Show the detailed delivery address field.' },
        { key: 'checkout_notes_status', label: 'Special Notes', description: 'Allow customers to add order instructions.' },
        { key: 'checkout_city_status', label: 'City / District', description: 'Show the delivery city or district field.' },
        { key: 'checkout_coupon_status', label: 'Coupon / Voucher', description: 'Show the coupon or voucher box in the order summary.' },
    ];

    const mailAlertSettings = [
        { key: 'mail_alert_register', label: 'Register', description: 'Send admin alert when a customer creates an account.' },
        { key: 'mail_alert_orders', label: 'Orders', description: 'Send admin alert when a customer places an order.' },
    ];

    return (
        <AdminLayout>
            <Head title={`Store Settings | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Heading */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Store Settings</h1>
                        <p className="text-xs text-slate-400 mt-1">Configure general store settings, chat plugins, checkout fields, and notifications.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    
                    {/* Tab Navigation Sidebar */}
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col gap-1">
                        {tabs.map((tab) => {
                            if (tab.href) {
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => router.get(tab.href)}
                                        className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-between"
                                    >
                                        <span>{tab.name}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-md">Page</span>
                                    </button>
                                );
                            }

                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        if (typeof window !== 'undefined') {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('tab', tab.id);
                                            window.history.replaceState({}, '', url.toString());
                                        }
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                        isActive 
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            );
                        })}
                        
                        <div className="border-t border-slate-100 mt-4 pt-4 flex flex-col gap-2">
                            <button
                                onClick={handleFormSubmit}
                                type="button"
                                disabled={form.processing}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                            >
                                <Save className="w-4 h-4" />
                                Save Configuration
                            </button>
                        </div>
                    </div>

                    {/* Active Configuration Panel */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                            
                            {/* TAB 1: General Settings */}
                            {activeTab === 'general' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                                        Pricing, Delivery & SEO Settings
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Inside Dhaka Delivery Fee (৳)</label>
                                            <input
                                                type="number"
                                                value={form.data.settings.shipping_inside_dhaka || ''}
                                                onChange={e => handleFieldChange('shipping_inside_dhaka', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Outside Dhaka Delivery Fee (৳)</label>
                                            <input
                                                type="number"
                                                value={form.data.settings.shipping_outside_dhaka || ''}
                                                onChange={e => handleFieldChange('shipping_outside_dhaka', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Tax percentage (%)</label>
                                            <input
                                                type="number"
                                                value={form.data.settings.tax_percentage || ''}
                                                onChange={e => handleFieldChange('tax_percentage', e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-6">
                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Browser Tab / Site Meta Title</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.site_title || ''}
                                                onChange={e => handleFieldChange('site_title', e.target.value)}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Site Tagline / Description</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.site_tagline || ''}
                                                onChange={e => handleFieldChange('site_tagline', e.target.value)}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Support Contact Hotline</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.contact_phone || ''}
                                                onChange={e => handleFieldChange('contact_phone', e.target.value)}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Support Email Address</label>
                                            <input
                                                type="email"
                                                value={form.data.settings.contact_email || ''}
                                                onChange={e => handleFieldChange('contact_email', e.target.value)}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="text-xs border-t border-slate-100 pt-6">
                                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-800">SEO & Tracking Verification</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">Microsoft Clarity Code</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.microsoft_clarity_code || ''}
                                                    onChange={e => handleFieldChange('microsoft_clarity_code', e.target.value)}
                                                    placeholder="yavq8hk0q8"
                                                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono"
                                                />
                                                <p className="mt-1 text-[10px] font-semibold text-slate-400">Paste only the Clarity project ID/code, not the full script.</p>
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">Google Search Console Verification Code</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.google_search_console_code || ''}
                                                    onChange={e => handleFieldChange('google_search_console_code', e.target.value)}
                                                    placeholder="google-site-verification content value"
                                                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono"
                                                />
                                                <p className="mt-1 text-[10px] font-semibold text-slate-400">This outputs: &lt;meta name=&quot;google-site-verification&quot; content=&quot;your-code&quot; /&gt;</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xs border-t border-slate-100 pt-6">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Custom Header Head Scripts (HTML)</label>
                                            <textarea
                                                value={form.data.settings.custom_header_scripts || ''}
                                                onChange={e => handleFieldChange('custom_header_scripts', e.target.value)}
                                                rows="3"
                                                placeholder="<script>...</script>"
                                                className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none font-mono"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">Use Marketing Suite &gt; Integrations for GTM and Meta Pixel IDs.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center gap-4">
                                        <div className="text-[10px] text-slate-400 max-w-md font-semibold leading-relaxed">
                                            Click below to generate google index sitemaps and update your robots.txt dynamically.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSitemap}
                                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Recompile XML Sitemap
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: Multiple Chat Plugin */}
                            {activeTab === 'chat_plugin' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                                Multiple Chat Plugin Configurations
                                            </h2>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Configure floating chat support buttons (WhatsApp, Messenger, Phone Call) for your storefront.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col divide-y divide-slate-100 text-xs">
                                        {/* Status */}
                                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <label className="font-bold text-slate-700 uppercase sm:text-right sm:pr-4">Status</label>
                                            <div className="sm:col-span-2">
                                                <select
                                                    value={form.data.settings.chat_plugin_status || 'enabled'}
                                                    onChange={e => handleFieldChange('chat_plugin_status', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-xs text-slate-800"
                                                >
                                                    <option value="enabled">Enabled</option>
                                                    <option value="disabled">Disabled</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* WhatsApp Number */}
                                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <div className="flex items-center sm:justify-end gap-1.5 sm:pr-4">
                                                <label className="font-bold text-slate-700 uppercase">WhatsApp Number</label>
                                                <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed">
                                                        Enter WhatsApp number with country code (e.g. 8801333-406693).
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={form.data.settings.chat_plugin_whatsapp || ''}
                                                    onChange={e => handleFieldChange('chat_plugin_whatsapp', e.target.value)}
                                                    placeholder="8801333-406693"
                                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Messenger(FB Page ID) */}
                                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <div className="flex items-center sm:justify-end gap-1.5 sm:pr-4">
                                                <label className="font-bold text-slate-700 uppercase">Messenger(FB Page ID)</label>
                                                <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed">
                                                        Enter Facebook Page username or numerical Page ID (e.g. smugbd1).
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={form.data.settings.chat_plugin_messenger || ''}
                                                    onChange={e => handleFieldChange('chat_plugin_messenger', e.target.value)}
                                                    placeholder="smugbd1"
                                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <div className="flex items-center sm:justify-end gap-1.5 sm:pr-4">
                                                <label className="font-bold text-slate-700 uppercase">Phone Number</label>
                                                <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed">
                                                        Enter customer service direct telephone number for calls (e.g. 01333-406693).
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={form.data.settings.chat_plugin_phone || ''}
                                                    onChange={e => handleFieldChange('chat_plugin_phone', e.target.value)}
                                                    placeholder="01333-406693"
                                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Color Code (Optional) */}
                                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                            <div className="flex items-center sm:justify-end gap-1.5 sm:pr-4">
                                                <label className="font-bold text-slate-700 uppercase">Color Code (Optional)</label>
                                                <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed">
                                                        Leave empty to use your site primary color automatically.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="color"
                                                        value={form.data.settings.chat_plugin_color || form.data.settings.primary_color || '#02BCEF'}
                                                        onChange={e => handleFieldChange('chat_plugin_color', e.target.value)}
                                                        className="h-10 w-11 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={form.data.settings.chat_plugin_color || ''}
                                                        onChange={e => handleFieldChange('chat_plugin_color', e.target.value)}
                                                        placeholder="#008140"
                                                        className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-xs font-mono"
                                                    />
                                                    {form.data.settings.chat_plugin_color && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFieldChange('chat_plugin_color', '')}
                                                            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="mt-1.5 text-[11px] text-slate-400">
                                                    {form.data.settings.chat_plugin_color
                                                        ? `Custom color active: ${form.data.settings.chat_plugin_color}`
                                                        : `Empty: Defaults to site primary color (${form.data.settings.primary_color || '#02BCEF'})`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Interactive Preview */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 mt-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                                            Floating Chat Widget Live Preview
                                        </h4>
                                        <div className="flex flex-wrap items-end gap-12">
                                            {/* Closed Preview */}
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[11px] font-semibold text-slate-500">Normal (Closed) State</span>
                                                <div
                                                    className="grid h-14 w-14 place-items-center rounded-full text-white shadow-xl"
                                                    style={{ backgroundColor: (form.data.settings.chat_plugin_color && form.data.settings.chat_plugin_color.trim()) || form.data.settings.primary_color || '#02BCEF' }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
                                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Open Preview */}
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[11px] font-semibold text-slate-500">Opened (Expanded) State</span>
                                                <div className="flex flex-col items-center gap-2.5">
                                                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#FFB800] text-white shadow-md">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0084FF] text-white shadow-md">
                                                        <MessengerIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white shadow-md">
                                                        <WhatsAppIcon className="h-5 w-5" />
                                                    </div>
                                                    <div
                                                        className="grid h-11 w-11 place-items-center rounded-full text-white shadow-md"
                                                        style={{ backgroundColor: (form.data.settings.chat_plugin_color && form.data.settings.chat_plugin_color.trim()) || form.data.settings.primary_color || '#02BCEF' }}
                                                    >
                                                        <X className="h-6 w-6" strokeWidth={2.6} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-slate-900/10"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Configuration
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Checkout Page */}
                            {activeTab === 'checkout' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <div className="border-b border-slate-100 pb-3">
                                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                            Checkout Page Fields
                                        </h2>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Enable or disable the customer input fields displayed during checkout.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {checkoutFieldSettings.map((field) => {
                                            const isEnabled = (form.data.settings[field.key] ?? '1') !== '0';

                                            return (
                                                <div key={field.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <label htmlFor={field.key} className="text-xs font-bold text-slate-700">
                                                                {field.label}
                                                            </label>
                                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                                                {field.description}
                                                            </p>
                                                        </div>
                                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                                            isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                            {isEnabled ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                    <select
                                                        id={field.key}
                                                        value={form.data.settings[field.key] ?? '1'}
                                                        onChange={e => handleFieldChange(field.key, e.target.value)}
                                                        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                                                    >
                                                        <option value="1">Enable</option>
                                                        <option value="0">Disable</option>
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* TAB 2: Store */}
                            {activeTab === 'store' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                                Store Settings
                                            </h2>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Optional store details that can appear in your storefront footer.
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                                            <Store className="h-3.5 w-3.5" />
                                            Optional
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 text-xs">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-[11px] mb-4">
                                                <MapPin className="h-4 w-4 text-emerald-600" />
                                                First Store Address
                                            </div>
                                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Optional field
                                            </label>
                                            <textarea
                                                value={form.data.settings.store_address_1 || ''}
                                                onChange={e => handleFieldChange('store_address_1', e.target.value)}
                                                rows="4"
                                                placeholder="House, road, city, district..."
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                                            />
                                            <p className="mt-2 text-[11px] text-slate-500">
                                                Leave this blank if you do not want to show an address in the footer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mail Settings */}
                            {activeTab === 'mail' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <div className="border-b border-slate-100 pb-3">
                                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
                                            <Mail className="h-4 w-4 text-sky-500" /> Dedicated Mail Settings
                                        </h2>
                                        <p className="mt-1 text-[11px] text-slate-400">Emails are queued so registration and checkout never wait for SMTP delivery.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <label className="text-xs font-bold text-slate-700">Mail Sending</label>
                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Turn all alert emails on or off.</p>
                                            <select value={form.data.settings.mail_status ?? '0'} onChange={e => handleFieldChange('mail_status', e.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/15">
                                                <option value="1">Enabled</option>
                                                <option value="0">Disabled</option>
                                            </select>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <label className="text-xs font-bold text-slate-700">Mail Transport</label>
                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Use SMTP live; Log only for local testing.</p>
                                            <select value={form.data.settings.mail_transport ?? 'smtp'} onChange={e => handleFieldChange('mail_transport', e.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/15">
                                                <option value="smtp">SMTP</option>
                                                <option value="log">Log only</option>
                                            </select>
                                        </div>
                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Async Processing</div>
                                            <p className="mt-2 text-[11px] leading-relaxed text-emerald-700/80">Run <span className="font-bold">php artisan queue:work --queue=emails,default</span> on server.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                                        <div><label className="font-bold text-slate-600 uppercase">SMTP Host</label><input type="text" value={form.data.settings.mail_host || ''} onChange={e => handleFieldChange('mail_host', e.target.value)} placeholder="smtp.gmail.com" className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div><label className="font-bold text-slate-600 uppercase">SMTP Port</label><input type="number" value={form.data.settings.mail_port || '587'} onChange={e => handleFieldChange('mail_port', e.target.value)} placeholder="587" className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div><label className="font-bold text-slate-600 uppercase">SMTP Username</label><input type="text" value={form.data.settings.mail_username || ''} onChange={e => handleFieldChange('mail_username', e.target.value)} placeholder="mail@example.com" className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div><label className="font-bold text-slate-600 uppercase">SMTP Password</label><input type="password" value={form.data.settings.mail_password || ''} onChange={e => handleFieldChange('mail_password', e.target.value)} placeholder="Leave blank to keep current password" className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /><p className="mt-1 text-[10px] font-semibold text-slate-400">Saved encrypted. Blank will not overwrite existing password.</p></div>
                                        <div><label className="font-bold text-slate-600 uppercase">Encryption</label><select value={form.data.settings.mail_encryption ?? 'tls'} onChange={e => handleFieldChange('mail_encryption', e.target.value)} className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white"><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">None</option></select></div>
                                        <div><label className="font-bold text-slate-600 uppercase">SMTP Timeout Seconds</label><input type="number" min="3" value={form.data.settings.mail_timeout || '10'} onChange={e => handleFieldChange('mail_timeout', e.target.value)} className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div><label className="font-bold text-slate-600 uppercase">From Email</label><input type="email" value={form.data.settings.mail_from_address || ''} onChange={e => handleFieldChange('mail_from_address', e.target.value)} placeholder="noreply@example.com" className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div><label className="font-bold text-slate-600 uppercase">From Name</label><input type="text" value={form.data.settings.mail_from_name || ''} onChange={e => handleFieldChange('mail_from_name', e.target.value)} placeholder={storeName} className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none" /></div>
                                        <div className="md:col-span-2"><label className="font-bold text-slate-600 uppercase">Admin Alert Recipients</label><textarea value={form.data.settings.mail_alert_recipients || ''} onChange={e => handleFieldChange('mail_alert_recipients', e.target.value)} rows="3" placeholder="admin@example.com, orders@example.com" className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none" /><p className="mt-1 text-[10px] font-semibold text-slate-400">Separate multiple emails with comma, semicolon, space, or new line.</p></div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-6">
                                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800"><Bell className="h-4 w-4 text-orange-500" /> Mail Alerts</h3>
                                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {mailAlertSettings.map((field) => {
                                                const isEnabled = (form.data.settings[field.key] ?? '0') === '1';
                                                return <label key={field.key} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${isEnabled ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}><input type="checkbox" checked={isEnabled} onChange={e => handleFieldChange(field.key, e.target.checked ? '1' : '0')} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" /><span><span className="block text-sm font-bold text-slate-800">{field.label}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-400">{field.description}</span></span></label>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* TAB 4: Footer Builder */}
                            {activeTab === 'footer' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                                        Footer Builder Settings
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Footer Background Color</label>
                                            <div className="flex gap-2 mt-1">
                                                <input
                                                    type="color"
                                                    value={form.data.settings.footer_bg_color || '#0f172a'}
                                                    onChange={e => handleFieldChange('footer_bg_color', e.target.value)}
                                                    className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_bg_color || '#0f172a'}
                                                    onChange={e => handleFieldChange('footer_bg_color', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Footer Font Color</label>
                                            <div className="flex gap-2 mt-1">
                                                <input
                                                    type="color"
                                                    value={form.data.settings.footer_text_color || '#e2e8f0'}
                                                    onChange={e => handleFieldChange('footer_text_color', e.target.value)}
                                                    className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_text_color || '#e2e8f0'}
                                                    onChange={e => handleFieldChange('footer_text_color', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Footer Copyright Text</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.footer_copyright || ''}
                                                onChange={e => handleFieldChange('footer_copyright', e.target.value)}
                                                placeholder="© 2026 Your Store. All Rights Reserved."
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">DBID Registration Text</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.footer_dbid || ''}
                                                onChange={e => handleFieldChange('footer_dbid', e.target.value)}
                                                placeholder="DBID: 751626035"
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Company pitch / About statement</label>
                                            <textarea
                                                value={form.data.settings.footer_about || ''}
                                                onChange={e => handleFieldChange('footer_about', e.target.value)}
                                                rows="2"
                                                placeholder="Your Store is an online shopping destination offering quality products."
                                                className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none font-sans"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Accepted Payments List (Comma Separated)</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.footer_payments || ''}
                                                onChange={e => handleFieldChange('footer_payments', e.target.value)}
                                                placeholder="bkash, nagad, rocket, visa, mastercard, cod"
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Social media links */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider mb-4">Footer Social Channels</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">Facebook URL</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_facebook || '#'}
                                                    onChange={e => handleFieldChange('footer_facebook', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">Instagram URL</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_instagram || '#'}
                                                    onChange={e => handleFieldChange('footer_instagram', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">TikTok URL</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_tiktok || '#'}
                                                    onChange={e => handleFieldChange('footer_tiktok', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-600 uppercase">YouTube URL</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_youtube || '#'}
                                                    onChange={e => handleFieldChange('footer_youtube', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="font-bold text-slate-600 uppercase">WhatsApp URL (API message link)</label>
                                                <input
                                                    type="text"
                                                    value={form.data.settings.footer_whatsapp || '#'}
                                                    onChange={e => handleFieldChange('footer_whatsapp', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: Mega Menu */}
                            {activeTab === 'megamenu' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                                        Mega Menu Configurations
                                    </h2>

                                    <div className="grid grid-cols-1 gap-6 text-xs">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Mega Menu Enabled</label>
                                            <select
                                                value={form.data.settings.mega_menu_enabled || 'true'}
                                                onChange={e => handleFieldChange('mega_menu_enabled', e.target.value)}
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none bg-white font-medium"
                                            >
                                                <option value="true">Enable Header Navbar Menu</option>
                                                <option value="false">Disable Header Navbar Menu</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Featured categories in navigation (Comma Separated)</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.mega_menu_categories || ''}
                                                onChange={e => handleFieldChange('mega_menu_categories', e.target.value)}
                                                placeholder="Smart Electronics, Premium Men's Apparel, Combo & Bundles"
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Only category names typed here will be featured in the desktop header navbar categories row.</p>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-600 uppercase flex items-center gap-1">
                                                Custom Navigation Links (JSON Format)
                                                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title='Must be valid JSON e.g. [{"label": "Contact Us", "url": "/contact"}]' />
                                            </label>
                                            <textarea
                                                value={form.data.settings.mega_menu_custom_links || '[]'}
                                                onChange={e => handleFieldChange('mega_menu_custom_links', e.target.value)}
                                                rows="4"
                                                placeholder='[{"label": "Flash Sales", "url": "/flash-sale"}]'
                                                className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 6: Popup Builder */}
                            {activeTab === 'popup' && (
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 animate-fadeIn">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                                        Entrance Promotion Popup Builder
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Popup Promo Modal Status</label>
                                            <select
                                                value={form.data.settings.popup_active || 'false'}
                                                onChange={e => handleFieldChange('popup_active', e.target.value)}
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none bg-white font-medium"
                                            >
                                                <option value="true">Enable Promotion Popup Dialog</option>
                                                <option value="false">Disable / Dismiss Popup Dialog</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Entrance Trigger Delay (seconds)</label>
                                            <input
                                                type="number"
                                                value={form.data.settings.popup_delay || '3'}
                                                onChange={e => handleFieldChange('popup_delay', e.target.value)}
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Popup Header Title</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.popup_title || ''}
                                                onChange={e => handleFieldChange('popup_title', e.target.value)}
                                                placeholder="Welcome to Your Store!"
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Popup Coupon Promo Code</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.popup_coupon_code || ''}
                                                onChange={e => handleFieldChange('popup_coupon_code', e.target.value)}
                                                placeholder="e.g. WELCOME100"
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Popup Subtitle / Promotional description</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.popup_subtitle || ''}
                                                onChange={e => handleFieldChange('popup_subtitle', e.target.value)}
                                                placeholder="Subscribe to our launch offer list and copy coupon to redeem savings."
                                                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="font-bold text-slate-600 uppercase">Popup Graphic Image</label>
                                            <div className="flex gap-4 mt-2 items-center">
                                                <input
                                                    type="text"
                                                    value={form.data.settings.popup_image || ''}
                                                    onChange={e => handleFieldChange('popup_image', e.target.value)}
                                                    placeholder="Promo Image URL path"
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                                                />
                                                <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px] h-10 select-none">
                                                    {uploadingPopup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                    Upload Image
                                                    <input 
                                                        type="file" 
                                                        onChange={handlePopupUpload} 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        disabled={uploadingPopup} 
                                                    />
                                                </label>
                                            </div>
                                            {form.data.settings.popup_image && (
                                                <div className="mt-2.5 p-2 border border-slate-100 rounded-xl bg-slate-50 max-w-xs">
                                                    <img src={form.data.settings.popup_image} alt="Popup promo preview" className="max-h-24 object-contain rounded" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
