import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    Save, Monitor, Tablet, Smartphone, Upload, Loader2, Plus, Trash2, 
    Palette, Type, Layout as LayoutIcon, Play, Compass, CreditCard, ShoppingBag, Eye,
    ExternalLink, X, Sliders, Search, Phone, Send, Share2, GitCompare, Heart, FileText
} from 'lucide-react';
import WhatsAppIcon from '../../Components/WhatsAppIcon';
import axios from 'axios';

// Component helpers
const SwitchToggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl transition-all">
        <div>
            <span className="text-xs font-bold text-slate-800 block">{label}</span>
            {description && <span className="text-[11px] text-slate-500 block mt-0.5">{description}</span>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                checked ? 'bg-slate-900' : 'bg-slate-300'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

const ColorPickerInput = ({ label, value, onChange, fallback = '#000000' }) => {
    const val = value || fallback;
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-2.5 p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-800">
                <div className="relative flex items-center justify-center">
                    <input
                        type="color"
                        value={val}
                        onChange={e => onChange(e.target.value)}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div 
                        className="w-9 h-9 rounded-lg shadow-inner border border-slate-200/80 transition-transform hover:scale-105 flex items-center justify-center text-[10px]" 
                        style={{ backgroundColor: val }}
                    />
                </div>
                <input
                    type="text"
                    value={val}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 text-xs font-mono font-bold text-slate-800 uppercase bg-transparent border-0 focus:outline-none focus:ring-0"
                />
            </div>
        </div>
    );
};

const defaultHeaderBottomNavItems = [
    { title: 'Categories', link: '/main-categories', visible: true, order: 1 },
    { title: 'Shop', link: '/shop', visible: true, order: 2 },
    { title: 'Promotions/Campaigns', link: '/campaigns', visible: true, order: 3 },
    { title: 'Shop By Brands', link: '/shop-by-brands', visible: true, order: 4 },
    { title: 'Quotation Request', link: '/quotation-request', visible: true, order: 5 },
    { title: 'Our Contacts', link: '#contact', visible: true, order: 6 },
    { title: 'Return Policy', link: '#service', visible: true, order: 7 },
    { title: 'Terms & Conditions', link: '#footer', visible: true, order: 8 },
];

const parseHeaderBottomNavItems = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return defaultHeaderBottomNavItems;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length ? parsed : defaultHeaderBottomNavItems;
    } catch {
        return defaultHeaderBottomNavItems;
    }
};
export default function ThemeCustomize({ settings }) {
    const storeName = useStoreName();

    // Flatten settings object
    const initialSettings = {};
    Object.keys(settings).forEach(group => {
        settings[group].forEach(s => {
            initialSettings[s.key] = s.value;
        });
    });

    // Provide default fallback values for new customizer keys
    const defaults = {
        theme_name: initialSettings.theme_name || initialSettings.store_name || 'Online Store',
        store_logo: initialSettings.store_logo || initialSettings.header_logo_image || '',
        favicon: initialSettings.favicon || '',
        loader_toggle: 'enabled',
        primary_color: '#c2005f',
        secondary_color: '#1e293b',
        accent_color: '#f59e0b',
        color_success: '#10b981',
        color_warning: '#f59e0b',
        color_danger: '#ef4444',
        color_text: '#334155',
        color_bg: '#ffffff',
        color_button: '#c2005f',
        color_hover: '#a0004e',
        breadcrumb_bg_color: '#f8fafc',
        breadcrumb_text_color: '#475569',
        breadcrumb_active_color: '#c2005f',
        breadcrumb_separator_color: '#94a3b8',
        breadcrumb_border_radius: 'rounded-xl',
        breadcrumb_shadow_level: 'shadow-sm',
        breadcrumb_status: 'enabled',
        breadcrumb_design: 'default',
        category_header_status: 'enabled',
        category_header_design: 'default',
        product_info_status: 'enabled',
        product_info_design: 'default',
        product_info_return_label: 'Return',
        product_info_return_value: 'Instant',
        product_info_exchange_label: 'Exchange',
        product_info_exchange_value: 'Not Exchangeable',
        product_info_delivery_label: 'Delivery Time',
        product_info_delivery_value: '2 Days',
        product_info_payment_label: 'Payment',
        product_info_payment_value: 'COD Available',
        product_info_merchant_shop_label: 'Merchant Shop',
        product_info_merchant_name: 'Al-Baraka',
        product_info_merchant_verified_label: 'Verified',

        header_design: 'classic',
        header_modern_bg_color: '#08bde3',
        header_modern_text_color: '#ffffff',
        header_bg_color: '#c2005f',
        header_text_color: '#ffffff',
        header_font_family: 'Outfit',
        header_menu_font_family: 'Outfit',
        header_bottom_bg_color: '#e11d74',
        header_bottom_text_color: '#0f172a',
        header_bottom_active_color: '#0f172a',
        header_bottom_font_family: 'Outfit',
        header_bottom_nav_mode: 'manual',
        header_featured_show_campaigns: 'true',
        header_featured_show_quotation: 'true',
        header_featured_show_flash: 'true',
        header_show_category_menu: 'true',
        header_show_compare: 'true',
        header_show_wishlist: 'true',
        header_show_cart: 'true',
        header_show_quotation: 'true',
        header_modern_show_track_order: 'true',
        header_show_support: 'true',
        header_bottom_nav_items: JSON.stringify(defaultHeaderBottomNavItems),
        header_sticky: 'true',
        header_logo_text: 'Online Store',
        header_logo_image: '',
        header_announcement_active: 'true',
        header_announcement_text: 'Grand Launching Sale! Get 15% OFF with coupon LAUNCH15 | COD Available Nationwide',
        header_announcement_bg: '#0f172a',
        header_announcement_color: '#ffffff',

        mobile_bottom_nav_status: 'enabled',
        mobile_bottom_nav_bg_color: '',
        mobile_bottom_nav_text_color: '',
        mobile_bottom_nav_badge_bg_color: '#ff4b19',
        mobile_bottom_nav_badge_text_color: '#ffffff',
        mobile_bottom_nav_font_weight: 'semibold',
        mobile_header_search_status: 'disabled',
        mobile_bottom_nav_show_home: 'true',
        mobile_bottom_nav_show_menu: 'true',
        mobile_bottom_nav_show_cart: 'true',
        mobile_bottom_nav_show_compare: 'true',
        mobile_bottom_nav_show_search: 'true',
        mobile_bottom_nav_show_account: 'true',
        footer_bg_color: '#0f172a',
        footer_text_color: '#e2e8f0',

        font_family: 'Outfit',
        font_heading: 'Outfit',
        font_body: 'Outfit',
        font_menu: 'Outfit',
        font_weight: 'medium',
        font_size: 'medium',

        layout_style: 'full_width',
        container_width: '1200px',
        border_radius: 'rounded-2xl',
        shadow_level: 'md',

        button_radius: 'rounded-xl',
        button_hover_effect: 'scale',
        button_animation: 'none',

        product_detail_call_button_status: 'enabled',
        product_detail_call_phone: '+880 1712-345678',
        product_detail_call_button_text: 'Call For Order',
        product_detail_whatsapp_status: 'enabled',
        product_detail_whatsapp_phone: '+880 1712-345678',
        product_detail_whatsapp_text: 'Order on WhatsApp',
        product_detail_show_compare: 'enabled',
        product_detail_show_wishlist: 'enabled',
        product_detail_show_share: 'enabled',
        product_detail_thumb_layout: 'responsive',

        card_radius: 'rounded-2xl',
        card_shadow: 'md',
        card_badge_position: 'top-left',
        card_hover_style: 'lift',
        card_show_wishlist: 'true',
        card_show_compare: 'true',
        card_show_custom_badge: 'true',
        card_show_review: 'true',
        card_show_rating: 'true',
        card_show_category: 'true',
        card_show_brand: 'true',
        card_show_sku: 'true',
        card_show_stock: 'true',
        card_show_catalog_label: 'true',
        card_show_view_button: 'true',
        card_show_discount_badge: 'true',
        card_show_add_to_cart: 'true',
        card_show_buy_now: 'true',
        card_show_old_price: 'true',
        card_action_text: 'both',
        card_bg_color: '#ffffff',
        card_border_color: '#e2e8f0',
        card_text_color: '#475569',
        card_title_color: '#0f172a',
        card_price_color: '#c2005f',
        card_old_price_color: '#94a3b8',
        card_rating_color: '#f59e0b',
        card_badge_bg_color: '#c2005f',
        card_badge_text_color: '#ffffff',
        card_custom_badge_bg_color: '',
        card_custom_badge_text_color: '#ffffff',
        card_button_bg_color: '#c2005f',
        card_button_text_color: '#ffffff',
        card_select_option_bg_color: '#c2005f',
        card_select_option_text_color: '#ffffff',
        card_secondary_button_bg_color: '#f8fafc',
        card_secondary_button_text_color: '#0f172a',
        card_buy_now_bg_color: '#0f172a',
        card_buy_now_text_color: '#ffffff',
        card_button_border_color: '#e2e8f0',
        product_detail_thumb_layout: 'responsive'
    };

    const finalInitialSettings = { ...defaults, ...initialSettings };

    const form = useForm({
        settings: finalInitialSettings
    });

    const [activeSection, setActiveSection] = useState('general');
    const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    const handleFieldChange = (key, val) => {
        form.setData('settings', {
            ...form.data.settings,
            [key]: val
        });
    };

    const headerBottomNavItems = parseHeaderBottomNavItems(form.data.settings.header_bottom_nav_items);

    const saveHeaderBottomNavItems = (items) => {
        const normalized = items
            .map((item, index) => ({
                title: item.title || '',
                link: item.link || '',
                visible: item.visible !== false,
                order: Number(item.order || index + 1),
            }))
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        handleFieldChange('header_bottom_nav_items', JSON.stringify(normalized));
    };

    const updateHeaderBottomNavItem = (index, key, value) => {
        const next = [...headerBottomNavItems];
        next[index] = { ...next[index], [key]: value };
        saveHeaderBottomNavItems(next);
    };

    const addHeaderBottomNavItem = () => {
        saveHeaderBottomNavItems([
            ...headerBottomNavItems,
            { title: 'New Link', link: '/', visible: true, order: headerBottomNavItems.length + 1 }
        ]);
    };

    const deleteHeaderBottomNavItem = (index) => {
        saveHeaderBottomNavItems(headerBottomNavItems.filter((_, itemIndex) => itemIndex !== index));
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
                handleFieldChange('store_logo', response.data.url);
            }
        } catch (err) {
            alert('Upload failed.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFavicon(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data?.url) {
                handleFieldChange('favicon', response.data.url);
            }
        } catch (err) {
            alert('Upload failed.');
        } finally {
            setUploadingFavicon(false);
        }
    };

    const handleFormSubmit = (e) => {
        if (e) e.preventDefault();
        form.post(route('admin.theme-customize.save'));
    };

    const sections = [
        { id: 'general', name: 'General Config', category: 'Branding', icon: LayoutIcon, desc: 'Logo, favicon & loader' },
        { id: 'colors', name: 'Color Palette', category: 'Branding', icon: Palette, desc: 'Theme colors & background' },
        { id: 'header', name: 'Header Builder', category: 'Navigation', icon: Monitor, desc: 'Logo text, stickiness & colors' },
        { id: 'header_bottom_nav', name: 'Header Bottom Nav', category: 'Navigation', icon: LayoutIcon, desc: 'Manage desktop header menu links' },
        { id: 'mobile_bottom_nav', name: 'Mobile Bottom Nav', category: 'Navigation', icon: Smartphone, desc: 'Mobile app-style quick navigation' },
        { id: 'breadcrumbs', name: 'Breadcrumbs', category: 'Navigation', icon: Compass, desc: 'Breadcrumb styles & shadow' },
        { id: 'product_details', name: 'Product Details', category: 'Components', icon: ShoppingBag, desc: 'Call, WhatsApp, compare & share' },
        { id: 'product_info', name: 'Product Info Box', category: 'Components', icon: CreditCard, desc: 'Delivery, returns & merchant badges' },
        { id: 'typography', name: 'Typography & Fonts', category: 'Styling', icon: Type, desc: 'Font families, weights & sizes' },
        { id: 'layout', name: 'Layout & Spacers', category: 'Styling', icon: Sliders, desc: 'Container widths & radius' },
        { id: 'buttons', name: 'Button Styles', category: 'Components', icon: Play, desc: 'Radius, hover & animations' },
        { id: 'cards', name: 'Product Card Designs', category: 'Components', icon: ShoppingBag, desc: 'Card badges, toggles & colors' },
    ];

    const getBorderRadiusClass = (token) => {
        const mapping = {
            'rounded-none': 'rounded-none',
            'rounded-sm': 'rounded-sm',
            'rounded-md': 'rounded-md',
            'rounded-lg': 'rounded-lg',
            'rounded-xl': 'rounded-xl',
            'rounded-2xl': 'rounded-2xl',
            'rounded-3xl': 'rounded-3xl',
            'rounded-full': 'rounded-full'
        };
        return mapping[token] || 'rounded-2xl';
    };

    return (
        <AdminLayout>
            <Head title={`Theme Customize | ${storeName} Admin`} />

            <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
                
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200/70 p-6 rounded-2xl shadow-xs gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Theme Customize</h1>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                Live Controls
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Configure your online store appearance, layouts, color schemes, and cards dynamically.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button
                            type="button"
                            onClick={() => setShowPreviewModal(true)}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-200"
                        >
                            <Eye className="w-4 h-4 text-slate-600" />
                            Preview Live Storefront
                        </button>

                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
                            title="Open Storefront in New Tab"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                            onClick={handleFormSubmit}
                            disabled={form.processing}
                            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-slate-900/10 active:scale-98"
                        >
                            {form.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Theme Settings
                        </button>
                    </div>
                </div>

                {/* Main Content Workspace - 12 Column Layout: 3 cols Navigation, 9 cols Full-Width Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Sidebar Section Navigator (3 Cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                            <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Customizer Sections
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                {sections.map(s => {
                                    const isActive = activeSection === s.id;
                                    const IconComponent = s.icon;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setActiveSection(s.id)}
                                            className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between group ${
                                                isActive 
                                                    ? 'bg-slate-900 text-white shadow-sm' 
                                                    : 'text-slate-700 hover:bg-slate-100/80'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg transition-colors ${
                                                    isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                                                }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold leading-tight">{s.name}</div>
                                                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                                                        isActive ? 'text-slate-300' : 'text-slate-400'
                                                    }`}>{s.desc}</div>
                                                </div>
                                            </div>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Options Workspace Panel (9 Cols - Takes Full Space across Right Side) */}
                    <div className="lg:col-span-9 bg-white border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-xs min-h-[580px]">
                        
                        {/* Section Header Banner */}
                        {(() => {
                            const currentSec = sections.find(s => s.id === activeSection);
                            if (!currentSec) return null;
                            const IconComp = currentSec.icon;
                            return (
                                <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                                    <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                                        <IconComp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-900">{currentSec.name}</h2>
                                        <p className="text-xs text-slate-500">{currentSec.desc}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Panel 1: General Settings */}
                        {activeSection === 'general' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Theme / Brand Name</label>
                                        <input
                                            type="text"
                                            value={form.data.settings.theme_name}
                                            onChange={e => handleFieldChange('theme_name', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-xs font-semibold"
                                            placeholder="Your Store Theme Name"
                                        />
                                        <span className="text-[11px] text-slate-400">Main brand name displayed across store header and footer.</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Preloader Screen Toggle</label>
                                        <SwitchToggle
                                            label="Enable Entrance Preloader"
                                            description="Show animated preloader screen while store pages load."
                                            checked={form.data.settings.loader_toggle === 'enabled'}
                                            onChange={val => handleFieldChange('loader_toggle', val ? 'enabled' : 'disabled')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    {/* Store Logo */}
                                    <div className="flex flex-col gap-3">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Store Logo Image</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={form.data.settings.store_logo}
                                                onChange={e => handleFieldChange('store_logo', e.target.value)}
                                                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                                                placeholder="/images/logo.png"
                                            />
                                            <label className="cursor-pointer px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all h-10 select-none text-xs">
                                                {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                Upload
                                                <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" disabled={uploadingLogo} />
                                            </label>
                                        </div>
                                        {form.data.settings.store_logo && (
                                            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl w-fit flex items-center gap-3 mt-1">
                                                <img src={form.data.settings.store_logo} alt="Logo preview" className="h-8 max-w-[140px] object-contain" />
                                                <span className="text-[10px] text-slate-500 font-semibold">Active Logo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Favicon */}
                                    <div className="flex flex-col gap-3">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Store Favicon Icon</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={form.data.settings.favicon}
                                                onChange={e => handleFieldChange('favicon', e.target.value)}
                                                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                                                placeholder="/favicon.ico"
                                            />
                                            <label className="cursor-pointer px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all h-10 select-none text-xs">
                                                {uploadingFavicon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                Upload
                                                <input type="file" onChange={handleFaviconUpload} accept="image/*" className="hidden" disabled={uploadingFavicon} />
                                            </label>
                                        </div>
                                        {form.data.settings.favicon && (
                                            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl w-fit flex items-center gap-3 mt-1">
                                                <img src={form.data.settings.favicon} alt="Favicon preview" className="w-6 h-6 object-contain" />
                                                <span className="text-[10px] text-slate-500 font-semibold">Active Favicon</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 2: Color Palette Settings */}
                        {activeSection === 'colors' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <ColorPickerInput
                                        label="Primary Theme Color"
                                        value={form.data.settings.primary_color}
                                        onChange={val => handleFieldChange('primary_color', val)}
                                        fallback="#c2005f"
                                    />
                                    <ColorPickerInput
                                        label="Secondary Theme Color"
                                        value={form.data.settings.secondary_color}
                                        onChange={val => handleFieldChange('secondary_color', val)}
                                        fallback="#1e293b"
                                    />
                                    <ColorPickerInput
                                        label="Accent Highlight Color"
                                        value={form.data.settings.accent_color}
                                        onChange={val => handleFieldChange('accent_color', val)}
                                        fallback="#f59e0b"
                                    />
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">State & UI Colors</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <ColorPickerInput
                                            label="Success Alert Color"
                                            value={form.data.settings.color_success}
                                            onChange={val => handleFieldChange('color_success', val)}
                                            fallback="#10b981"
                                        />
                                        <ColorPickerInput
                                            label="Warning Alert Color"
                                            value={form.data.settings.color_warning}
                                            onChange={val => handleFieldChange('color_warning', val)}
                                            fallback="#f59e0b"
                                        />
                                        <ColorPickerInput
                                            label="Danger / Sale Badge Color"
                                            value={form.data.settings.color_danger}
                                            onChange={val => handleFieldChange('color_danger', val)}
                                            fallback="#ef4444"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Body Text & Global Background</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                        <ColorPickerInput
                                            label="Body Text Color"
                                            value={form.data.settings.color_text}
                                            onChange={val => handleFieldChange('color_text', val)}
                                            fallback="#334155"
                                        />
                                        <ColorPickerInput
                                            label="Page Background"
                                            value={form.data.settings.color_bg}
                                            onChange={val => handleFieldChange('color_bg', val)}
                                            fallback="#ffffff"
                                        />
                                        <ColorPickerInput
                                            label="Primary Button Bg"
                                            value={form.data.settings.color_button}
                                            onChange={val => handleFieldChange('color_button', val)}
                                            fallback="#c2005f"
                                        />
                                        <ColorPickerInput
                                            label="Button Hover Bg"
                                            value={form.data.settings.color_hover}
                                            onChange={val => handleFieldChange('color_hover', val)}
                                            fallback="#a0004e"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 3: Header Builder Settings */}
                        {activeSection === 'header' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Header Main Bar</h3>
                                    <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Header Design</label>
                                        <select
                                            value={form.data.settings.header_design || 'classic'}
                                            onChange={e => handleFieldChange('header_design', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-cyan-100 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="classic">Classic Header</option>
                                            <option value="humanbeing">HumanBeing Cyan Header</option>
                                        </select>
                                        <p className="mt-2 text-[11px] font-medium text-slate-500">Choose the storefront top header style. The bottom menu keeps using your Header Bottom Nav settings.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <ColorPickerInput
                                            label="Classic Header Background"
                                            value={form.data.settings.header_bg_color}
                                            onChange={val => handleFieldChange('header_bg_color', val)}
                                            fallback="#c2005f"
                                        />
                                        <ColorPickerInput
                                            label="Classic Header Text / Icon"
                                            value={form.data.settings.header_text_color}
                                            onChange={val => handleFieldChange('header_text_color', val)}
                                            fallback="#ffffff"
                                        />
                                        <ColorPickerInput
                                            label="HumanBeing Header Background"
                                            value={form.data.settings.header_modern_bg_color}
                                            onChange={val => handleFieldChange('header_modern_bg_color', val)}
                                            fallback="#08bde3"
                                        />
                                        <ColorPickerInput
                                            label="HumanBeing Header Text / Icon"
                                            value={form.data.settings.header_modern_text_color}
                                            onChange={val => handleFieldChange('header_modern_text_color', val)}
                                            fallback="#ffffff"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Header Font Family</label>
                                        <select
                                            value={form.data.settings.header_font_family || 'Outfit'}
                                            onChange={e => handleFieldChange('header_font_family', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="Outfit">Outfit</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Playfair Display">Playfair Display</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Header Menu Font</label>
                                        <select
                                            value={form.data.settings.header_menu_font_family || 'Outfit'}
                                            onChange={e => handleFieldChange('header_menu_font_family', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="Outfit">Outfit</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Playfair Display">Playfair Display</option>
                                        </select>
                                    </div>

                                    <SwitchToggle
                                        label="Header Sticky Position"
                                        description="Keep header fixed at top on page scroll"
                                        checked={form.data.settings.header_sticky === 'true'}
                                        onChange={val => handleFieldChange('header_sticky', val ? 'true' : 'false')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Header Logo Text</label>
                                        <input
                                            type="text"
                                            value={form.data.settings.header_logo_text || ''}
                                            onChange={e => handleFieldChange('header_logo_text', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-semibold text-xs"
                                            placeholder="Online Store"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Header Logo Image URL</label>
                                        <input
                                            type="text"
                                            value={form.data.settings.header_logo_image || ''}
                                            onChange={e => handleFieldChange('header_logo_image', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Header Action Buttons</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        <SwitchToggle
                                            label="Show Categories Dropdown Button"
                                            description="Display the large Categories button beside the logo/search."
                                            checked={form.data.settings.header_show_category_menu !== 'false'}
                                            onChange={val => handleFieldChange('header_show_category_menu', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Compare Button"
                                            description="Display compare shortcut in the main header."
                                            checked={form.data.settings.header_show_compare !== 'false'}
                                            onChange={val => handleFieldChange('header_show_compare', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Wishlist Button"
                                            description="Display wishlist shortcut in the main header."
                                            checked={form.data.settings.header_show_wishlist !== 'false'}
                                            onChange={val => handleFieldChange('header_show_wishlist', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Cart Button"
                                            description="Display cart shortcut in the main header."
                                            checked={form.data.settings.header_show_cart !== 'false'}
                                            onChange={val => handleFieldChange('header_show_cart', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Quotation Button"
                                            description="Display quotation request CTA in the main header."
                                            checked={form.data.settings.header_show_quotation !== 'false'}
                                            onChange={val => handleFieldChange('header_show_quotation', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Track Order Button"
                                            description="Display Track Order pill in the HumanBeing header style."
                                            checked={form.data.settings.header_modern_show_track_order !== 'false'}
                                            onChange={val => handleFieldChange('header_modern_show_track_order', val ? 'true' : 'false')}
                                        />
                                        <SwitchToggle
                                            label="Show Customer Support"
                                            description="Display customer phone support button on the header bottom row."
                                            checked={form.data.settings.header_show_support !== 'false'}
                                            onChange={val => handleFieldChange('header_show_support', val ? 'true' : 'false')}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Header Bottom / Category Row</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <ColorPickerInput
                                            label="Bottom Bar Background"
                                            value={form.data.settings.header_bottom_bg_color}
                                            onChange={val => handleFieldChange('header_bottom_bg_color', val)}
                                            fallback="#e11d74"
                                        />
                                        <ColorPickerInput
                                            label="Bottom Bar Text Color"
                                            value={form.data.settings.header_bottom_text_color}
                                            onChange={val => handleFieldChange('header_bottom_text_color', val)}
                                            fallback="#0f172a"
                                        />
                                        <ColorPickerInput
                                            label="Active Link Indicator"
                                            value={form.data.settings.header_bottom_active_color}
                                            onChange={val => handleFieldChange('header_bottom_active_color', val)}
                                            fallback="#0f172a"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 4: Header Bottom Navigation Settings */}
                        {activeSection === 'header_bottom_nav' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px] md:items-center">
                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900">Header Bottom Navigation Source</h3>
                                            <p className="mt-1 text-[11px] text-slate-500">Choose manual links, or automatically show active categories marked as Featured on Home.</p>
                                        </div>
                                        <select
                                            value={form.data.settings.header_bottom_nav_mode || 'manual'}
                                            onChange={e => handleFieldChange('header_bottom_nav_mode', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                        >
                                            <option value="manual">Manual Links</option>
                                            <option value="categories">Featured Categories</option>
                                        </select>
                                    </div>
                                </div>

                                {(form.data.settings.header_bottom_nav_mode || 'manual') === 'manual' ? (
                                    <>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-sm font-extrabold text-slate-900">Manual Navigation Items</h3>
                                                    <p className="mt-1 text-[11px] text-slate-500">Create, edit, hide, reorder, or delete each header bottom link.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addHeaderBottomNavItem}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Nav Item
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {headerBottomNavItems.map((item, index) => (
                                                <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1.5fr_110px_130px_44px] lg:items-end">
                                                        <div>
                                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Navigation Title</label>
                                                            <input
                                                                type="text"
                                                                value={item.title || ''}
                                                                onChange={e => updateHeaderBottomNavItem(index, 'title', e.target.value)}
                                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                                placeholder="e.g. Shop"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Slug / URL / Link</label>
                                                            <input
                                                                type="text"
                                                                value={item.link || ''}
                                                                onChange={e => updateHeaderBottomNavItem(index, 'link', e.target.value)}
                                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                                placeholder="/shop, shop, #contact, https://..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Order</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.order || index + 1}
                                                                onChange={e => updateHeaderBottomNavItem(index, 'order', e.target.value)}
                                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                            />
                                                        </div>
                                                        <SwitchToggle
                                                            label={item.visible === false ? 'Hidden' : 'Visible'}
                                                            description="Show in header"
                                                            checked={item.visible !== false}
                                                            onChange={val => updateHeaderBottomNavItem(index, 'visible', val)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteHeaderBottomNavItem(index)}
                                                            className="grid h-10 w-10 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                                                            title="Delete navigation item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">Manual Links Preview</p>
                                            <div
                                                className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl px-3 py-2"
                                                style={{
                                                    backgroundColor: form.data.settings.header_bottom_bg_color || '#e11d74',
                                                    color: form.data.settings.header_bottom_text_color || '#0f172a',
                                                    fontFamily: form.data.settings.header_bottom_font_family || form.data.settings.header_menu_font_family || 'Outfit'
                                                }}
                                            >
                                                {headerBottomNavItems.filter(item => item.visible !== false).map((item, index) => (
                                                    <span key={`${item.title}-preview-${index}`} className="rounded-lg px-3 py-2 text-[11px] font-bold">
                                                        {item.title || 'Untitled'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sky-900">
                                        <h3 className="text-sm font-extrabold">Featured Categories Mode</h3>
                                        <p className="mt-2 text-[11px] font-semibold leading-5 text-sky-800">
                                            The storefront will show active parent categories where <span className="font-black">Featured on Home</span> is enabled. If a category has children, it shows a dropdown arrow like modern ecommerce category menus.
                                        </p>
                                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                                            <SwitchToggle
                                                label="Promotions/Campaigns"
                                                description="Show campaigns link after categories"
                                                checked={form.data.settings.header_featured_show_campaigns !== 'false'}
                                                onChange={val => handleFieldChange('header_featured_show_campaigns', val ? 'true' : 'false')}
                                            />
                                            <SwitchToggle
                                                label="Quotation Request"
                                                description="Show quotation request link"
                                                checked={form.data.settings.header_featured_show_quotation !== 'false'}
                                                onChange={val => handleFieldChange('header_featured_show_quotation', val ? 'true' : 'false')}
                                            />
                                            <SwitchToggle
                                                label="Flash"
                                                description="Show flash section link"
                                                checked={form.data.settings.header_featured_show_flash !== 'false'}
                                                onChange={val => handleFieldChange('header_featured_show_flash', val ? 'true' : 'false')}
                                            />
                                        </div>
                                        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100">
                                            <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Example</p>
                                            <div
                                                className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl px-3 py-2"
                                                style={{
                                                    backgroundColor: form.data.settings.header_bottom_bg_color || '#e11d74',
                                                    color: form.data.settings.header_bottom_text_color || '#0f172a'
                                                }}
                                            >
                                                {[
                                                    'Smart Electronics',
                                                    "Premium Men's Apparel",
                                                    'Health & Cosmetics',
                                                    form.data.settings.header_featured_show_campaigns !== 'false' ? 'Promotions/Campaigns' : null,
                                                    form.data.settings.header_featured_show_quotation !== 'false' ? 'Quotation Request' : null,
                                                    form.data.settings.header_featured_show_flash !== 'false' ? 'Flash' : null,
                                                ].filter(Boolean).map(label => (
                                                    <span key={label} className="rounded-lg px-3 py-2 text-[11px] font-bold">{label}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Panel 4: Mobile Bottom Navigation Settings */}
                        {activeSection === 'mobile_bottom_nav' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <SwitchToggle
                                        label="Mobile Bottom Navigation"
                                        description="Show app-style quick navigation on mobile storefront."
                                        checked={form.data.settings.mobile_bottom_nav_status !== 'disabled'}
                                        onChange={val => handleFieldChange('mobile_bottom_nav_status', val ? 'enabled' : 'disabled')}
                                    />

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Label Font Weight</label>
                                        <select
                                            value={form.data.settings.mobile_bottom_nav_font_weight || 'semibold'}
                                            onChange={e => handleFieldChange('mobile_bottom_nav_font_weight', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="medium">Medium - clean</option>
                                            <option value="semibold">Semi Bold - balanced</option>
                                            <option value="bold">Bold - strong</option>
                                        </select>
                                        <p className="mt-1.5 text-[11px] text-slate-400">Controls HOME, MENU, CART, COMPARE and ACCOUNT label weight.</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Mobile Header & Nav Visibility</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SwitchToggle
                                            label="Mobile Header Search Bar"
                                            description="Show or hide the search box under the mobile header."
                                            checked={(form.data.settings.mobile_header_search_status || 'disabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('mobile_header_search_status', val ? 'enabled' : 'disabled')}
                                        />
                                        <SwitchToggle label="Show Home" checked={(form.data.settings.mobile_bottom_nav_show_home || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_home', val ? 'true' : 'false')} />
                                        <SwitchToggle label="Show Menu" checked={(form.data.settings.mobile_bottom_nav_show_menu || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_menu', val ? 'true' : 'false')} />
                                        <SwitchToggle label="Show Cart" checked={(form.data.settings.mobile_bottom_nav_show_cart || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_cart', val ? 'true' : 'false')} />
                                        <SwitchToggle label="Show Compare" checked={(form.data.settings.mobile_bottom_nav_show_compare || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_compare', val ? 'true' : 'false')} />
                                        <SwitchToggle label="Show Search" checked={(form.data.settings.mobile_bottom_nav_show_search || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_search', val ? 'true' : 'false')} />
                                        <SwitchToggle label="Show Account" checked={(form.data.settings.mobile_bottom_nav_show_account || 'true') !== 'false'} onChange={val => handleFieldChange('mobile_bottom_nav_show_account', val ? 'true' : 'false')} />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Mobile Bar Colors</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <ColorPickerInput
                                            label="Background Color"
                                            value={form.data.settings.mobile_bottom_nav_bg_color}
                                            onChange={val => handleFieldChange('mobile_bottom_nav_bg_color', val)}
                                            fallback={form.data.settings.header_bg_color || '#c2005f'}
                                        />
                                        <ColorPickerInput
                                            label="Text / Icon Color"
                                            value={form.data.settings.mobile_bottom_nav_text_color}
                                            onChange={val => handleFieldChange('mobile_bottom_nav_text_color', val)}
                                            fallback="#ffffff"
                                        />
                                        <ColorPickerInput
                                            label="Count Badge Background"
                                            value={form.data.settings.mobile_bottom_nav_badge_bg_color}
                                            onChange={val => handleFieldChange('mobile_bottom_nav_badge_bg_color', val)}
                                            fallback="#ff4b19"
                                        />
                                        <ColorPickerInput
                                            label="Count Badge Text"
                                            value={form.data.settings.mobile_bottom_nav_badge_text_color}
                                            onChange={val => handleFieldChange('mobile_bottom_nav_badge_text_color', val)}
                                            fallback="#ffffff"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">Live Mini Preview</p>
                                    <div
                                        className="mx-auto flex h-[68px] max-w-md items-center justify-around rounded-xl px-2 shadow-sm"
                                        style={{
                                            backgroundColor: form.data.settings.mobile_bottom_nav_bg_color || form.data.settings.header_bg_color || '#c2005f',
                                            color: form.data.settings.mobile_bottom_nav_text_color || '#ffffff'
                                        }}
                                    >
                                        {[
                                            (form.data.settings.mobile_bottom_nav_show_home || 'true') !== 'false' ? ['Home', Smartphone] : null,
                                            (form.data.settings.mobile_bottom_nav_show_menu || 'true') !== 'false' ? ['Menu', LayoutIcon] : null,
                                            (form.data.settings.mobile_bottom_nav_show_cart || 'true') !== 'false' ? ['Cart', ShoppingBag] : null,
                                            (form.data.settings.mobile_bottom_nav_show_compare || 'true') !== 'false' ? ['Compare', Sliders] : null,
                                            (form.data.settings.mobile_bottom_nav_show_search || 'true') !== 'false' ? ['Search', Search] : null,
                                            (form.data.settings.mobile_bottom_nav_show_account || 'true') !== 'false' ? ['Account', Monitor] : null,
                                        ].filter(Boolean).map(([label, Icon]) => (
                                            <div key={label} className={`flex flex-col items-center gap-1 text-[11px] uppercase tracking-wide ${
                                                form.data.settings.mobile_bottom_nav_font_weight === 'bold' ? 'font-bold' :
                                                form.data.settings.mobile_bottom_nav_font_weight === 'medium' ? 'font-medium' : 'font-semibold'
                                            }`}>
                                                <Icon className="h-5 w-5" />
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Panel 4: Breadcrumbs Settings */}
                        {activeSection === 'breadcrumbs' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <SwitchToggle
                                        label="Breadcrumb Bar Visibility"
                                        description="Show breadcrumbs navigation bar on category and product pages."
                                        checked={form.data.settings.breadcrumb_status === 'enabled'}
                                        onChange={val => handleFieldChange('breadcrumb_status', val ? 'enabled' : 'disabled')}
                                    />

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Breadcrumb Design Theme</label>
                                        <select
                                            value={form.data.settings.breadcrumb_design || 'default'}
                                            onChange={e => handleFieldChange('breadcrumb_design', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="default">Default Standard</option>
                                            <option value="minimal">Minimalist Clean</option>
                                            <option value="pill">Rounded Pill</option>
                                            <option value="modern">Modern Glass</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Breadcrumb Color Palette</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                        <ColorPickerInput
                                            label="Background Color"
                                            value={form.data.settings.breadcrumb_bg_color}
                                            onChange={val => handleFieldChange('breadcrumb_bg_color', val)}
                                            fallback="#f8fafc"
                                        />
                                        <ColorPickerInput
                                            label="Text Color"
                                            value={form.data.settings.breadcrumb_text_color}
                                            onChange={val => handleFieldChange('breadcrumb_text_color', val)}
                                            fallback="#475569"
                                        />
                                        <ColorPickerInput
                                            label="Active Link Accent"
                                            value={form.data.settings.breadcrumb_active_color}
                                            onChange={val => handleFieldChange('breadcrumb_active_color', val)}
                                            fallback="#c2005f"
                                        />
                                        <ColorPickerInput
                                            label="Separator Color"
                                            value={form.data.settings.breadcrumb_separator_color}
                                            onChange={val => handleFieldChange('breadcrumb_separator_color', val)}
                                            fallback="#94a3b8"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Breadcrumb Radius</label>
                                        <select
                                            value={form.data.settings.breadcrumb_border_radius || 'rounded-xl'}
                                            onChange={e => handleFieldChange('breadcrumb_border_radius', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="rounded-none">Square (0px)</option>
                                            <option value="rounded-md">Small (rounded-md)</option>
                                            <option value="rounded-lg">Medium (rounded-lg)</option>
                                            <option value="rounded-xl">Standard (rounded-xl)</option>
                                            <option value="rounded-2xl">Large (rounded-2xl)</option>
                                            <option value="rounded-full">Pill (rounded-full)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Breadcrumb Elevation Shadow</label>
                                        <select
                                            value={form.data.settings.breadcrumb_shadow_level || 'shadow-sm'}
                                            onChange={e => handleFieldChange('breadcrumb_shadow_level', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="none">None (Flat)</option>
                                            <option value="shadow-sm">Soft Elevation (shadow-sm)</option>
                                            <option value="shadow-md">Medium (shadow-md)</option>
                                            <option value="shadow-lg">Elevated (shadow-lg)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 5: Product Info Box */}
                        {activeSection === 'product_info' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <SwitchToggle
                                        label="Product Info Box Status"
                                        description="Display trust badges and delivery details box on product pages."
                                        checked={form.data.settings.product_info_status === 'enabled'}
                                        onChange={val => handleFieldChange('product_info_status', val ? 'enabled' : 'disabled')}
                                    />

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Info Box Design Style</label>
                                        <select
                                            value={form.data.settings.product_info_design || 'default'}
                                            onChange={e => handleFieldChange('product_info_design', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="default">Default Filled</option>
                                            <option value="light">Light Subtle</option>
                                            <option value="outline">Border Outline Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Badges & Labels Content</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Return Label</label>
                                                <input type="text" value={form.data.settings.product_info_return_label || ''} onChange={e => handleFieldChange('product_info_return_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Return Value</label>
                                                <input type="text" value={form.data.settings.product_info_return_value || ''} onChange={e => handleFieldChange('product_info_return_value', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Exchange Label</label>
                                                <input type="text" value={form.data.settings.product_info_exchange_label || ''} onChange={e => handleFieldChange('product_info_exchange_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Exchange Value</label>
                                                <input type="text" value={form.data.settings.product_info_exchange_value || ''} onChange={e => handleFieldChange('product_info_exchange_value', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Delivery Label</label>
                                                <input type="text" value={form.data.settings.product_info_delivery_label || ''} onChange={e => handleFieldChange('product_info_delivery_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Delivery Value</label>
                                                <input type="text" value={form.data.settings.product_info_delivery_value || ''} onChange={e => handleFieldChange('product_info_delivery_value', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Payment Label</label>
                                                <input type="text" value={form.data.settings.product_info_payment_label || ''} onChange={e => handleFieldChange('product_info_payment_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="font-bold text-slate-600 uppercase text-[10px]">Payment Value</label>
                                                <input type="text" value={form.data.settings.product_info_payment_value || ''} onChange={e => handleFieldChange('product_info_payment_value', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Merchant & Shop Badges</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase text-[10px]">Merchant Label</label>
                                            <input type="text" value={form.data.settings.product_info_merchant_shop_label || ''} onChange={e => handleFieldChange('product_info_merchant_shop_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase text-[10px]">Merchant Name</label>
                                            <input type="text" value={form.data.settings.product_info_merchant_name || ''} onChange={e => handleFieldChange('product_info_merchant_name', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase text-[10px]">Verified Badge Label</label>
                                            <input type="text" value={form.data.settings.product_info_merchant_verified_label || ''} onChange={e => handleFieldChange('product_info_merchant_verified_label', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 6: Typography Settings */}
                        {activeSection === 'typography' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Heading Font Family</label>
                                        <select
                                            value={form.data.settings.font_heading || 'Outfit'}
                                            onChange={e => handleFieldChange('font_heading', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="Outfit">Outfit</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Playfair Display">Playfair Display</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Body Font Family</label>
                                        <select
                                            value={form.data.settings.font_body || 'Outfit'}
                                            onChange={e => handleFieldChange('font_body', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="Outfit">Outfit</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Montserrat">Montserrat</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Heading Font Weight</label>
                                        <select
                                            value={form.data.settings.font_weight || 'medium'}
                                            onChange={e => handleFieldChange('font_weight', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="normal">Normal (400)</option>
                                            <option value="medium">Medium (500)</option>
                                            <option value="bold">Semibold (600)</option>
                                            <option value="extrabold">Bold (700)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Base Font Size</label>
                                        <select
                                            value={form.data.settings.font_size || 'medium'}
                                            onChange={e => handleFieldChange('font_size', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="small">Small (13px)</option>
                                            <option value="medium">Medium (14px)</option>
                                            <option value="large">Large (16px)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Typography Live Preview Card */}
                                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-3 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Font Typography Live Sample</span>
                                    <h4 
                                        style={{ fontFamily: `${form.data.settings.font_heading}, Outfit, sans-serif` }}
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        The quick brown fox jumps over the lazy dog.
                                    </h4>
                                    <p 
                                        style={{ fontFamily: `${form.data.settings.font_body}, Outfit, sans-serif` }}
                                        className="text-xs text-slate-600 leading-relaxed"
                                    >
                                        Crafting high conversion ecommerce storefronts with customizable Google Web Fonts and modern layout engine.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Panel 7: Layout & Spacers */}
                        {activeSection === 'layout' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Store Layout Mode</label>
                                        <select
                                            value={form.data.settings.layout_style || 'full_width'}
                                            onChange={e => handleFieldChange('layout_style', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="full_width">Full Width Layout (Edge-to-edge)</option>
                                            <option value="boxed">Boxed Layout (Centered Container)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Max Container Width</label>
                                        <select
                                            value={form.data.settings.container_width || '1200px'}
                                            onChange={e => handleFieldChange('container_width', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="1200px">Compact (1200px)</option>
                                            <option value="1400px">Standard Wide (1400px)</option>
                                            <option value="1600px">Ultra Wide (1600px)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Global Border Radius</label>
                                        <select
                                            value={form.data.settings.border_radius || 'rounded-2xl'}
                                            onChange={e => handleFieldChange('border_radius', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="rounded-none">Square Corners (0px)</option>
                                            <option value="rounded-md">Small (rounded-md)</option>
                                            <option value="rounded-lg">Medium (rounded-lg)</option>
                                            <option value="rounded-xl">Standard (rounded-xl)</option>
                                            <option value="rounded-2xl">Large (rounded-2xl)</option>
                                            <option value="rounded-3xl">Extra Large (rounded-3xl)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Global Shadow Level</label>
                                        <select
                                            value={form.data.settings.shadow_level || 'md'}
                                            onChange={e => handleFieldChange('shadow_level', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="none">Flat (no shadow)</option>
                                            <option value="sm">Soft (shadow-sm)</option>
                                            <option value="md">Medium Elevation (shadow-md)</option>
                                            <option value="lg">Heavy Elevation (shadow-lg)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Product Detail Thumbnail Layout</label>
                                        <select
                                            value={form.data.settings.product_detail_thumb_layout || 'responsive'}
                                            onChange={e => handleFieldChange('product_detail_thumb_layout', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="responsive">Responsive (Desktop vertical, mobile horizontal)</option>
                                            <option value="vertical">Always Vertical</option>
                                            <option value="horizontal">Always Horizontal</option>
                                        </select>
                                        <p className="mt-1 text-[10px] font-semibold text-slate-400">Controls product detail gallery thumbnails.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 8: Button Styles */}
                        {activeSection === 'buttons' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Button Corner Radius</label>
                                        <select
                                            value={form.data.settings.button_radius || 'rounded-xl'}
                                            onChange={e => handleFieldChange('button_radius', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="rounded-none">Square Corners (0px)</option>
                                            <option value="rounded-md">Mild Rounded (rounded-md)</option>
                                            <option value="rounded-lg">Standard (rounded-lg)</option>
                                            <option value="rounded-xl">Medium (rounded-xl)</option>
                                            <option value="rounded-2xl">Large (rounded-2xl)</option>
                                            <option value="rounded-full">Fully Rounded Pill (rounded-full)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Hover Effect Mode</label>
                                        <select
                                            value={form.data.settings.button_hover_effect || 'scale'}
                                            onChange={e => handleFieldChange('button_hover_effect', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="scale">Zoom scale (scale-105)</option>
                                            <option value="opacity">Slight opacity fade</option>
                                            <option value="slide">Slide up lift effect</option>
                                            <option value="none">Flat Hover</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Continuous Animation</label>
                                        <select
                                            value={form.data.settings.button_animation || 'none'}
                                            onChange={e => handleFieldChange('button_animation', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="none">No continuous animation</option>
                                            <option value="pulse">Pulse wave glow (pulse)</option>
                                            <option value="bounce">Continuous slow bounce</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Live Interactive Button Test Box */}
                                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center gap-4 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Button Preview</span>
                                    <button
                                        type="button"
                                        style={{
                                            backgroundColor: form.data.settings.color_button || '#c2005f',
                                            color: '#ffffff'
                                        }}
                                        className={`px-8 py-3 font-extrabold text-xs shadow-lg transition-all ${
                                            getBorderRadiusClass(form.data.settings.button_radius)
                                        } ${
                                            form.data.settings.button_hover_effect === 'scale' ? 'hover:scale-105' :
                                            form.data.settings.button_hover_effect === 'opacity' ? 'hover:opacity-80' :
                                            form.data.settings.button_hover_effect === 'slide' ? 'hover:-translate-y-1' : ''
                                        } ${
                                            form.data.settings.button_animation === 'pulse' ? 'animate-pulse' :
                                            form.data.settings.button_animation === 'bounce' ? 'animate-bounce' : ''
                                        }`}
                                    >
                                        Add to Cart Now ðŸ›ï¸
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Panel: Product Details */}
                        {activeSection === 'product_details' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                {/* Product Detail Call Button Card */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Phone className="w-4 h-4 text-[#29469b]" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Product Detail Call Button</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <SwitchToggle
                                            label="Show Call For Order Button"
                                            description="Display a tap-to-call button on product detail pages."
                                            checked={(form.data.settings.product_detail_call_button_status || 'enabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('product_detail_call_button_status', val ? 'enabled' : 'disabled')}
                                        />
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Call For Order Mobile Number</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_detail_call_phone || ''}
                                                onChange={e => handleFieldChange('product_detail_call_phone', e.target.value)}
                                                placeholder="+880 1712-345678"
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">Used for tap-to-call on the product detail page.</p>
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Call Button Text</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_detail_call_button_text ?? 'Call For Order'}
                                                onChange={e => handleFieldChange('product_detail_call_button_text', e.target.value)}
                                                placeholder="Call For Order"
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">Custom label for the call button.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Order Button Card */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Send className="w-4 h-4 text-emerald-600" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">WhatsApp Order Button</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <SwitchToggle
                                            label="Show WhatsApp Order Button"
                                            description="Display direct Order on WhatsApp link on product detail pages."
                                            checked={(form.data.settings.product_detail_whatsapp_status || 'enabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('product_detail_whatsapp_status', val ? 'enabled' : 'disabled')}
                                        />
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">WhatsApp Mobile Number</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_detail_whatsapp_phone ?? ''}
                                                onChange={e => handleFieldChange('product_detail_whatsapp_phone', e.target.value)}
                                                placeholder="+880 1712-345678 (defaults to store phone)"
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">Falls back to store contact/support phone if empty.</p>
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">WhatsApp Button Text</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_detail_whatsapp_text ?? 'Order on WhatsApp'}
                                                onChange={e => handleFieldChange('product_detail_whatsapp_text', e.target.value)}
                                                placeholder="Order on WhatsApp"
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">Custom label for the WhatsApp button.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Compare, Wishlist & Social Share Card */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Share2 className="w-4 h-4 text-slate-600" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Action Buttons & Social Sharing</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <SwitchToggle
                                            label="Show Compare Button"
                                            description="Allow visitors to add products to compare list on product page."
                                            checked={(form.data.settings.product_detail_show_compare || 'enabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('product_detail_show_compare', val ? 'enabled' : 'disabled')}
                                        />
                                        <SwitchToggle
                                            label="Show Wishlist Button"
                                            description="Allow visitors to add products to wishlist on product page."
                                            checked={(form.data.settings.product_detail_show_wishlist || 'enabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('product_detail_show_wishlist', val ? 'enabled' : 'disabled')}
                                        />
                                        <SwitchToggle
                                            label="Show Social Share Icons"
                                            description="Display social share icons (Facebook, X, LinkedIn)."
                                            checked={(form.data.settings.product_detail_show_share || 'enabled') !== 'disabled'}
                                            onChange={val => handleFieldChange('product_detail_show_share', val ? 'enabled' : 'disabled')}
                                        />
                                    </div>
                                </div>

                                {/* Gallery Layout */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Gallery & Thumbnails</h3>
                                    <div className="max-w-md">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Thumbnail Strip Layout</label>
                                        <select
                                            value={form.data.settings.product_detail_thumb_layout || 'responsive'}
                                            onChange={e => handleFieldChange('product_detail_thumb_layout', e.target.value)}
                                            className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                        >
                                            <option value="responsive">Responsive (Desktop vertical, mobile horizontal)</option>
                                            <option value="vertical">Always Vertical</option>
                                            <option value="horizontal">Always Horizontal</option>
                                        </select>
                                        <p className="mt-1 text-[10px] font-semibold text-slate-400">Controls product detail gallery thumbnails orientation.</p>
                                    </div>
                                </div>

                                {/* Live Interactive PDP Actions Preview */}
                                <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Product Detail Preview</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Interactive Preview</span>
                                    </div>

                                    <div className="max-w-lg mx-auto bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                                        {/* WhatsApp Preview */}
                                        {(form.data.settings.product_detail_whatsapp_status || 'enabled') !== 'disabled' && (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600">
                                                <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                                                <span>{form.data.settings.product_detail_whatsapp_text || 'Order on WhatsApp'}</span>
                                            </div>
                                        )}

                                        {/* Cart & Buy Buttons Preview */}
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[70px_1fr_1fr]">
                                            <div className="flex h-9 items-center justify-between rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600">
                                                <span>-</span>
                                                <span>1</span>
                                                <span>+</span>
                                            </div>
                                            <button
                                                type="button"
                                                style={{ backgroundColor: form.data.settings.card_button_bg_color || '#c2005f', color: form.data.settings.card_button_text_color || '#ffffff' }}
                                                className={`h-9 px-3 text-xs font-black transition-all ${getBorderRadiusClass(form.data.settings.button_radius)}`}
                                            >
                                                Add To Cart
                                            </button>
                                            <button
                                                type="button"
                                                style={{ backgroundColor: form.data.settings.card_buy_now_bg_color || '#0f172a', color: form.data.settings.card_buy_now_text_color || '#ffffff' }}
                                                className={`h-9 px-3 text-xs font-black transition-all ${getBorderRadiusClass(form.data.settings.button_radius)}`}
                                            >
                                                Buy Now
                                            </button>
                                            {(form.data.settings.product_detail_call_button_status || 'enabled') !== 'disabled' && (
                                                <div
                                                    className={`flex h-9 items-center justify-center gap-2 whitespace-nowrap bg-[#29469b] px-3 text-xs font-black text-white shadow-xs sm:col-start-2 sm:col-span-2 ${getBorderRadiusClass(form.data.settings.button_radius)}`}
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>{form.data.settings.product_detail_call_button_text || 'Call For Order'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Secondary Actions Preview */}
                                        {(((form.data.settings.product_detail_show_compare || 'enabled') !== 'disabled') ||
                                          ((form.data.settings.product_detail_show_wishlist || 'enabled') !== 'disabled') ||
                                          ((form.data.settings.product_detail_show_share || 'enabled') !== 'disabled')) && (
                                            <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                                                {(form.data.settings.product_detail_show_compare || 'enabled') !== 'disabled' && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700">
                                                        <GitCompare className="h-3 w-3" /> Compare
                                                    </span>
                                                )}
                                                {(form.data.settings.product_detail_show_wishlist || 'enabled') !== 'disabled' && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700">
                                                        <Heart className="h-3 w-3" /> Wishlist
                                                    </span>
                                                )}
                                                {(form.data.settings.product_detail_show_share || 'enabled') !== 'disabled' && (
                                                    <div className="ml-auto flex items-center gap-2.5 text-slate-400">
                                                        <Share2 className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold">f</span>
                                                        <span className="text-[10px] font-bold">x</span>
                                                        <span className="text-[10px] font-bold">in</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel 9: Product Card Designs */}
                        {activeSection === 'cards' && (
                            <div className="flex flex-col gap-6 text-xs animate-fadeIn">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Card Geometry & Interactivity</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Card Radius</label>
                                            <select
                                                value={form.data.settings.card_radius || 'rounded-2xl'}
                                                onChange={e => handleFieldChange('card_radius', e.target.value)}
                                                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                            >
                                                <option value="rounded-none">Square Corners</option>
                                                <option value="rounded-lg">Mild (rounded-lg)</option>
                                                <option value="rounded-xl">Standard (rounded-xl)</option>
                                                <option value="rounded-2xl">Heavy (rounded-2xl)</option>
                                                <option value="rounded-3xl">Circular (rounded-3xl)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Card Elevation Shadow</label>
                                            <select
                                                value={form.data.settings.card_shadow || 'md'}
                                                onChange={e => handleFieldChange('card_shadow', e.target.value)}
                                                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                            >
                                                <option value="none">Flat border-only</option>
                                                <option value="sm">Soft (shadow-sm)</option>
                                                <option value="md">Standard (shadow-md)</option>
                                                <option value="lg">Elevated (shadow-lg)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Hover Transition</label>
                                            <select
                                                value={form.data.settings.card_hover_style || 'lift'}
                                                onChange={e => handleFieldChange('card_hover_style', e.target.value)}
                                                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-xs"
                                            >
                                                <option value="lift">Lift and Float card shadow</option>
                                                <option value="zoom">Zoom scale image background</option>
                                                <option value="glow">Outer border glow effect</option>
                                                <option value="none">No hover transition</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Card Display Elements Toggles</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            ['card_show_wishlist', 'Show Wishlist Icon'],
                                            ['card_show_compare', 'Show Compare Icon'],
                                            ['card_show_custom_badge', 'Show Product Badge (Ribbon)'],
                                            ['card_show_review', 'Show Review Stars'],
                                            ['card_show_category', 'Show Product Category'],
                                            ['card_show_brand', 'Show Brand Text'],
                                            ['card_show_sku', 'Show SKU Text'],
                                            ['card_show_stock', 'Show Stock Text'],
                                            ['card_show_catalog_label', 'Show Catalog Label'],
                                            ['card_show_view_button', 'Show View Button'],
                                            ['card_show_discount_badge', 'Show Discount Badge'],
                                            ['card_show_add_to_cart', 'Show Add To Cart'],
                                            ['card_show_buy_now', 'Show Buy Now'],
                                            ['card_show_old_price', 'Show Old Strike Price']
                                        ].map(([key, label]) => (
                                            <SwitchToggle
                                                key={key}
                                                label={label}
                                                checked={form.data.settings[key] !== 'false'}
                                                onChange={val => handleFieldChange(key, val ? 'true' : 'false')}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Card Color Customizer</h3>
                                    
                                    <div className="flex flex-col gap-6">
                                        {/* Sub-section 1: Typography & Badges */}
                                        <div>
                                            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">Text, Prices & Badges</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <ColorPickerInput label="Title Color" value={form.data.settings.card_title_color} onChange={v => handleFieldChange('card_title_color', v)} fallback="#0f172a" />
                                                <ColorPickerInput label="Price Color" value={form.data.settings.card_price_color} onChange={v => handleFieldChange('card_price_color', v)} fallback="#c2005f" />
                                                <ColorPickerInput label="Old Price Color" value={form.data.settings.card_old_price_color} onChange={v => handleFieldChange('card_old_price_color', v)} fallback="#94a3b8" />
                                                <ColorPickerInput label="Rating Star Color" value={form.data.settings.card_rating_color} onChange={v => handleFieldChange('card_rating_color', v)} fallback="#f59e0b" />
                                                <ColorPickerInput label="Discount Badge Bg" value={form.data.settings.card_badge_bg_color} onChange={v => handleFieldChange('card_badge_bg_color', v)} fallback="#c2005f" />
                                                <ColorPickerInput label="Discount Badge Text" value={form.data.settings.card_badge_text_color} onChange={v => handleFieldChange('card_badge_text_color', v)} fallback="#ffffff" />
                                                <ColorPickerInput label="Ribbon Badge Bg" value={form.data.settings.card_custom_badge_bg_color} onChange={v => handleFieldChange('card_custom_badge_bg_color', v)} fallback={form.data.settings.primary_color || '#02BCEF'} />
                                                <ColorPickerInput label="Ribbon Badge Text" value={form.data.settings.card_custom_badge_text_color} onChange={v => handleFieldChange('card_custom_badge_text_color', v)} fallback="#ffffff" />
                                            </div>
                                        </div>

                                        {/* Sub-section 2: Button Colors */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">Product Card Action Buttons</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {/* Add To Cart (Primary Button) */}
                                                <ColorPickerInput label="Add To Cart (Primary) Bg" value={form.data.settings.card_button_bg_color} onChange={v => handleFieldChange('card_button_bg_color', v)} fallback="#c2005f" />
                                                <ColorPickerInput label="Add To Cart Text Color" value={form.data.settings.card_button_text_color} onChange={v => handleFieldChange('card_button_text_color', v)} fallback="#ffffff" />
                                                <ColorPickerInput label="Select Option Button Bg" value={form.data.settings.card_select_option_bg_color} onChange={v => handleFieldChange('card_select_option_bg_color', v)} fallback="#c2005f" />
                                                <ColorPickerInput label="Select Option Text Color" value={form.data.settings.card_select_option_text_color} onChange={v => handleFieldChange('card_select_option_text_color', v)} fallback="#ffffff" />

                                                {/* View Button */}
                                                <ColorPickerInput label="View Button Bg" value={form.data.settings.card_secondary_button_bg_color} onChange={v => handleFieldChange('card_secondary_button_bg_color', v)} fallback="#f8fafc" />
                                                <ColorPickerInput label="View Button Text Color" value={form.data.settings.card_secondary_button_text_color} onChange={v => handleFieldChange('card_secondary_button_text_color', v)} fallback="#0f172a" />

                                                {/* Buy Now Button */}
                                                <ColorPickerInput label="Buy Now Button Bg" value={form.data.settings.card_buy_now_bg_color} onChange={v => handleFieldChange('card_buy_now_bg_color', v)} fallback="#0f172a" />
                                                <ColorPickerInput label="Buy Now Text Color" value={form.data.settings.card_buy_now_text_color} onChange={v => handleFieldChange('card_buy_now_text_color', v)} fallback="#ffffff" />
                                            </div>
                                        </div>

                                        {/* Sub-section 3: Card Container */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">Card Container Styling</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <ColorPickerInput label="Card Background Color" value={form.data.settings.card_bg_color} onChange={v => handleFieldChange('card_bg_color', v)} fallback="#ffffff" />
                                                <ColorPickerInput label="Card Border Color" value={form.data.settings.card_border_color} onChange={v => handleFieldChange('card_border_color', v)} fallback="#e2e8f0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Optional Live Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Top Bar */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-bold">Interactive Storefront Live Preview</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex bg-white/10 p-1 rounded-xl">
                                    <button
                                        onClick={() => setPreviewDevice('desktop')}
                                        className={`p-1.5 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white text-slate-900' : 'text-slate-300'}`}
                                    >
                                        <Monitor className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice('tablet')}
                                        className={`p-1.5 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white text-slate-900' : 'text-slate-300'}`}
                                    >
                                        <Tablet className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice('mobile')}
                                        className={`p-1.5 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white text-slate-900' : 'text-slate-300'}`}
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Store Preview Area */}
                        <div className="bg-slate-100 p-6 flex justify-center items-center overflow-y-auto min-h-[450px]">
                            <div 
                                style={{
                                    fontFamily: `${form.data.settings.font_family}, Outfit, sans-serif`,
                                    backgroundColor: form.data.settings.color_bg,
                                    color: form.data.settings.color_text
                                }}
                                className={`bg-white transition-all duration-300 shadow-xl overflow-hidden border border-slate-200 ${
                                    previewDevice === 'desktop' ? 'w-full max-w-4xl' : 
                                    previewDevice === 'tablet' ? 'w-[520px]' : 'w-[320px]'
                                }`}
                            >
                                {/* Announcement Bar */}
                                {form.data.settings.header_announcement_active !== 'false' && (
                                    <div
                                        style={{
                                            backgroundColor: form.data.settings.header_announcement_bg || form.data.settings.header_bg_color || form.data.settings.primary_color,
                                            color: form.data.settings.header_announcement_color || '#ffffff'
                                        }}
                                        className="py-1 px-4 text-center text-[10px] font-bold tracking-wider"
                                    >
                                        {form.data.settings.header_announcement_text || 'Grand Launching Sale! Get 15% OFF | COD Available'}
                                    </div>
                                )}

                                {/* Header Navbar */}
                                <div
                                    className="h-12 border-b px-4 flex items-center justify-between"
                                    style={{
                                        backgroundColor: form.data.settings.header_bg_color || form.data.settings.primary_color,
                                        color: form.data.settings.header_text_color || '#ffffff'
                                    }}
                                >
                                    <span className="text-sm font-black">{form.data.settings.header_logo_text || 'Store'}</span>
                                    <div className="flex gap-3 text-[10px] font-bold">
                                        <span>Home</span>
                                        <span>Products</span>
                                        <span>Trending</span>
                                    </div>
                                </div>

                                {/* Content Demo */}
                                <div className="p-8 text-center bg-slate-50 flex flex-col items-center gap-3">
                                    <h2 className="text-xl font-black text-slate-800">Preview Store Theme</h2>
                                    <p className="text-xs text-slate-500 max-w-md">All font styles, colors, button corner radii, and header customizer options applied in real-time.</p>
                                    <button
                                        style={{ backgroundColor: form.data.settings.color_button, color: '#ffffff' }}
                                        className={`px-5 py-2.5 font-bold text-xs ${getBorderRadiusClass(form.data.settings.button_radius)}`}
                                    >
                                        Sample Button Element
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}








