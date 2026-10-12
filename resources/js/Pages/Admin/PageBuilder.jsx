import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Eye, Edit3, X, Save, Plus, Trash2, ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const settingDropdowns = {
    layout_type: [
        { label: 'Slider + 3 Side Banners (1 Top, 2 Bottom - Malamal Style)', value: 'three_banners' },
        { label: 'Slider + 2 Side Banners (Stacked - Current Style)', value: 'two_columns' },
        { label: 'Slider + 1 Side Banner (Full Height)', value: 'one_banner' },
        { label: 'Single Slider (Full Width - No Side Banners)', value: 'single' },
        { label: 'Auto Detect (Based on Side Banners Count: 1, 2, or 3)', value: 'auto' }
    ],
    autoplay: [
        { label: 'Enable Autoplay', value: 'yes' },
        { label: 'Disable Autoplay', value: 'no' }
    ],
    navigation_style: [
        { label: 'Both Dots & Arrows', value: 'both' },
        { label: 'Navigation Dots Only', value: 'dots' },
        { label: 'Navigation Arrows Only', value: 'arrows' },
        { label: 'Hide All Navigation', value: 'hidden' }
    ],
    transition_effect: [
        { label: 'Fade Effect', value: 'fade' },
        { label: 'Slide Effect', value: 'slide' }
    ],
    product_source: [
        { label: 'Featured products', value: 'featured' },
        { label: 'Latest products / New arrivals', value: 'latest' },
        { label: 'Best selling products', value: 'best_selling' },
        { label: 'Trending products', value: 'trending' },
        { label: 'Active flash sale', value: 'flash_sale' },
        { label: 'Discounted products', value: 'discounted' },
        { label: 'All products', value: 'all' }
    ],
    use_catalog_categories: [
        { label: 'Use live catalog categories', value: 'yes' },
        { label: 'Use manual category cards', value: 'no' }
    ],
    design_style: [
        { label: 'Modern category cards', value: 'cards' },
        { label: 'Circle department icons', value: 'circles' }
    ],
    mobile_layout: [
        { label: 'Horizontal Slider on Mobile (Space Saver)', value: 'slider' },
        { label: 'Vertical Grid on Mobile', value: 'grid' }
    ],
    brand_design_style: [
        { label: 'Current brand cards', value: 'cards' },
        { label: 'Clean brand strip', value: 'strip' }
    ],
    title_position: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
    ],
    show_button: [
        { label: 'Show section action button', value: 'yes' },
        { label: 'Hide section action button', value: 'no' }
    ],
    item_border_radius: [
        { label: 'Circle (Full)', value: 'rounded-full' },
        { label: 'Large Rounded (2xl)', value: 'rounded-2xl' },
        { label: 'Medium Rounded (xl)', value: 'rounded-xl' },
        { label: 'Small Rounded (lg)', value: 'rounded-lg' },
        { label: 'Square (None)', value: 'rounded-none' }
    ],
    border_radius: [
        { label: 'None (Square)', value: 'rounded-none' },
        { label: 'Small', value: 'rounded-sm' },
        { label: 'Medium', value: 'rounded-md' },
        { label: 'Large', value: 'rounded-lg' },
        { label: 'X-Large', value: 'rounded-xl' },
        { label: '2X-Large (Standard)', value: 'rounded-2xl' },
        { label: '3X-Large', value: 'rounded-3xl' },
        { label: 'Circle (Full)', value: 'rounded-full' }
    ],
    border_style: [
        { label: 'None (No Border)', value: 'none' },
        { label: 'Solid Border (1px)', value: 'solid' },
        { label: 'Thick Solid Border (2px)', value: 'thick' },
        { label: 'Dashed Border', value: 'dashed' },
        { label: 'Dotted Border', value: 'dotted' }
    ],
    shadow: [
        { label: 'None (No Shadow)', value: 'shadow-none' },
        { label: 'Extra Small (xs)', value: 'shadow-xs' },
        { label: 'Small (sm)', value: 'shadow-sm' },
        { label: 'Regular (Standard)', value: 'shadow-md' },
        { label: 'Large (lg)', value: 'shadow-lg' },
        { label: 'Extra Large (xl)', value: 'shadow-xl' },
        { label: '2X-Large (2xl)', value: 'shadow-2xl' }
    ],
    active_border_radius: [
        { label: 'None (Square)', value: 'rounded-none' },
        { label: 'Small', value: 'rounded-sm' },
        { label: 'Medium', value: 'rounded-md' },
        { label: 'Large', value: 'rounded-lg' },
        { label: 'X-Large', value: 'rounded-xl' },
        { label: '2X-Large (Standard)', value: 'rounded-2xl' },
        { label: '3X-Large', value: 'rounded-3xl' },
        { label: 'Circle (Full)', value: 'rounded-full' }
    ],
    container_border_radius: [
        { label: 'None (Square)', value: 'rounded-none' },
        { label: 'Small', value: 'rounded-sm' },
        { label: 'Medium', value: 'rounded-md' },
        { label: 'Large', value: 'rounded-lg' },
        { label: 'X-Large', value: 'rounded-xl' },
        { label: '2X-Large (Standard)', value: 'rounded-2xl' },
        { label: '3X-Large', value: 'rounded-3xl' },
        { label: 'Circle (Full)', value: 'rounded-full' }
    ],
    is_sticky: [
        { label: 'Sticky Tab Bar (Sticks on Scroll)', value: 'yes' },
        { label: 'Static Tab Bar (Normal Scroll)', value: 'no' }
    ],
    item_font_size: [
        { label: 'Extra Small (10px)', value: 'text-[10px] md:text-xs' },
        { label: 'Small (12px)', value: 'text-xs md:text-sm' },
        { label: 'Medium (14px)', value: 'text-sm md:text-base' },
        { label: 'Large (16px)', value: 'text-base md:text-lg' }
    ],
    title_font_size: [
        { label: 'Small (14px)', value: 'text-sm md:text-base' },
        { label: 'Medium (16px)', value: 'text-base md:text-lg' },
        { label: 'Large (20px)', value: 'text-lg md:text-xl' },
        { label: 'Extra Large (24px)', value: 'text-xl md:text-2xl' }
    ],
    title_font_weight: [
        { label: 'Regular', value: 'font-normal' },
        { label: 'Medium', value: 'font-medium' },
        { label: 'Semibold', value: 'font-semibold' },
        { label: 'Bold', value: 'font-bold' },
        { label: 'Extra Bold', value: 'font-extrabold' },
        { label: 'Black', value: 'font-black' }
    ]
};

const defaultSettingsSchema = {
    hero_slider: {
        title: 'Main Promotional Banner',
        slides: [{ image: '', title: 'New Banner Offer', subtitle: 'Featured promotion', link: '#products', button_text: 'Shop now' }],
        side_banners: [],
        layout_type: 'three_banners', autoplay: 'yes', autoplay_speed: '5000', navigation_style: 'both',
        transition_effect: 'fade', button_text: 'Shop now',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    product_shelf: {
        title: 'Featured products', title_color: '#102f58', product_source: 'featured', product_limit: '10',
        title_font_size: 'text-lg md:text-xl', title_font_weight: 'font-extrabold',
        category_slug: '', anchor_id: 'featured', show_button: 'yes', button_text: 'More Products',
        button_link: '#categories', item_border_color: '#e2e8f0',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    products_tabs: {
        title: 'PRODUCTS FOR YOU',
        title_color: '#42bce8',
        product_source: 'latest',
        title_font_size: 'text-base md:text-lg',
        title_font_weight: 'font-bold',
        categories: '',
        active_tab_bg_color: '#42bce8',
        active_tab_text_color: '#ffffff',
        inactive_tab_text_color: '#42bce8',
        item_border_color: '#42bce8',
        border_radius: 'rounded-full',
        active_border_radius: 'rounded-full',
        container_border_radius: 'rounded-3xl',
        product_limit: '18',
        show_button: 'yes',
        button_text: 'VIEW MORE PRODUCTS',
        button_link: '/shop',
        is_sticky: 'yes',
        section_background_color: '#ffffff', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    feature_badges: {
        title: 'Service Benefits', anchor_id: 'service',
        items: [
            { title: 'Cash On Delivery', text: 'Pay after receiving product' },
            { title: 'Instant Return', text: '7 days return policy' },
            { title: 'Delivery Within 48hrs', text: 'Fastest nationwide service' },
            { title: 'Best Price Deal', text: 'Affordable & direct pricing' }
        ],
        title_color: '#102f58', text_color: '#64748b', icon_color: '#db2777', icon_background_color: '#ecfeff',
        item_border_color: '#e2e8f0',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    category_grid: {
        title: 'Shop By Category', title_color: '#102f58', design_style: 'cards', title_position: 'left', anchor_id: 'categories', use_catalog_categories: 'yes',
        mobile_layout: 'slider',
        title_font_size: 'text-lg md:text-xl', title_font_weight: 'font-extrabold',
        limit: '8', show_button: 'yes', button_text: 'More Products', button_link: '/main-categories',
        items: [], section_background_color: '#ffffff', item_border_radius: 'rounded-2xl', item_background_color: '#f8fafc',
        item_font_size: 'text-xs md:text-sm', item_font_color: '#334155', item_border_color: '#e2e8f0',
        border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    signature_banners: {
        title: 'Featured Collections', title_color: '#102f58',
        title_font_size: 'text-xl', title_font_weight: 'font-extrabold',
        men_button_text: 'Shop Men', men_link: '#',
        women_button_text: 'Shop Women', women_link: '#',
        button_color: '#c2005f',
        items: [],
        item_border_color: '#e2e8f0',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    cosmetics_banner: {
        title: 'Promotional Collection', title_color: '#ffffff', subtitle: 'Premium products',
        title_font_size: 'text-2xl md:text-3xl', title_font_weight: 'font-extrabold',
        description: '', image: '', btn_text: 'Explore Collection', link: '#',
        section_background_color: '#102f58', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    top_brands: {
        title: 'Shop By Brands', title_color: '#102f58', title_position: 'left', brand_design_style: 'cards', anchor_id: 'brands', limit: '16',
        mobile_layout: 'slider',
        title_font_size: 'text-lg md:text-xl', title_font_weight: 'font-extrabold',
        brands: '', items: [], show_button: 'yes',
        button_text: 'More Brands', button_link: '/shop-by-brands', item_border_color: '#e2e8f0',
        directory_eyebrow: 'Brand directory', directory_title: 'Shop By Brands', directory_description: 'Brand browsing page with the names and collections used across the store.',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    },
    campaign_grid: {
        eyebrow: 'Built for your shopping journey', title: 'Catalog, cart and checkout flows are all covered here.',
        description: 'Keep product discovery and checkout aligned for a dependable experience.',
        background_color: '#102f58', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none',
        items: [
            { title: 'Best Deals', text: 'Find value-for-money products faster' },
            { title: 'Compare Products', text: 'Review choices side by side' },
            { title: 'Save Wishlist', text: 'Keep favorites for later' },
            { title: 'Easy Shopping', text: 'Add to cart with confidence' }
        ]
    },
    experience_features: {
        eyebrow: 'Built for your shopping journey', title: 'A smooth storefront experience.',
        description: 'Configure the messages that explain your customer experience.',
        background_color: '#102f58', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none',
        items: [{ title: 'Best Deals', text: 'Find value-for-money products faster' }, { title: 'Easy Shopping', text: 'Add to cart with confidence' }]
    },
    content_columns: {
        title: 'About Our Online Store', title_color: '#102f58', description: 'Introduce your store and explain why customers should shop with you.',
        items: [
            { title: 'Quality products in one place', text: 'Describe your product range and value.', link: '', link_text: 'Read more' },
            { title: 'Fast, trusted service', text: 'Describe delivery and customer support.', link: '', link_text: 'Read more' },
            { title: 'Safe and easy checkout', text: 'Describe payment and checkout options.', link: '', link_text: 'Read more' }
        ],
        item_border_color: '#e2e8f0',
        section_background_color: '#ffffff', border_radius: 'rounded-2xl', border_style: 'none', border_color: '#e2e8f0', shadow: 'shadow-none'
    }
};

export default function AdminPageBuilder({ sections, categories = [], activeBrands = [] }) {
    const storeName = useStoreName();

    const [editingSection, setEditingSection] = useState(null);
    const [uploadingStates, setUploadingStates] = useState({});
    const form = useForm({
        title: '',
        is_active: true,
        order_index: 0,
        settings: {}
    });

    const addForm = useForm({
        title: '',
        type: 'hero_slider'
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('admin.page-builder.add'), {
            onSuccess: () => {
                addForm.reset();
            }
        });
    };

    const handleDeleteSection = (id) => {
        if (confirm('Are you sure you want to delete this layout block?')) {
            router.delete(route('admin.page-builder.delete', { id }), { preserveScroll: true });
        }
    };

    const handleToggleActive = (section) => {
        router.post(route('admin.page-builder.update', { id: section.id }), {
            is_active: !section.is_active
        }, { preserveScroll: true });
    };

    const handleShiftOrder = (section, direction) => {
        const currentIndex = sections.findIndex(item => item.id === section.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const target = sections[targetIndex];
        if (!target) return;
        router.post(route('admin.page-builder.update', { id: section.id }), {
            order_index: target.order_index,
            swap_with_id: target.id
        }, { preserveScroll: true });
    };

    const handleEditClick = (section) => {
        setEditingSection(section);
        const defaults = defaultSettingsSchema[section.type] || {};
        const mergedSettings = {
            ...defaults,
            ...(section.settings || {})
        };
        if (section.type === 'hero_slider') {
            if (!Array.isArray(mergedSettings.side_banners)) {
                mergedSettings.side_banners = [];
            }
            if (mergedSettings.side_banners.length === 0 && (mergedSettings.side_banner_image || mergedSettings.side_banner_title)) {
                mergedSettings.side_banners.push({
                    title: mergedSettings.side_banner_title || '',
                    subtitle: mergedSettings.side_banner_subtitle || '',
                    image: mergedSettings.side_banner_image || '',
                    link: mergedSettings.side_banner_link || '#',
                    button_text: 'Shop now'
                });
            }
            delete mergedSettings.side_banner_link;
            delete mergedSettings.side_banner_image;
            delete mergedSettings.side_banner_title;
            delete mergedSettings.side_banner_subtitle;
        }
        form.setData({
            title: section.title || '',
            is_active: section.is_active,
            order_index: section.order_index,
            settings: mergedSettings
        });
    };

    const handleSettingsChange = (key, val) => {
        form.setData('settings', {
            ...form.data.settings,
            [key]: val
        });
    };

    const getArrayItemKeys = (key, arrayVal) => {
        if (arrayVal && arrayVal.length > 0) {
            const keysSet = new Set();
            arrayVal.forEach(item => {
                if (item && typeof item === 'object') {
                    Object.keys(item).forEach(k => keysSet.add(k));
                }
            });
            if (keysSet.size > 0) {
                return Array.from(keysSet);
            }
        }
        if (key === 'slides' || key === 'side_banners') return ['title', 'subtitle', 'image', 'link', 'button_text'];
        if (key === 'shelves') return ['title', 'product_source', 'product_limit', 'category_slug', 'anchor_id', 'button_text', 'button_link'];
        if (key === 'items') {
            if (editingSection?.type === 'category_grid') return ['name', 'description', 'image', 'link', 'sub_count'];
            if (editingSection?.type === 'signature_banners') return ['title', 'subtitle', 'image', 'link', 'button_text'];
            if (editingSection?.type === 'top_brands') return ['title', 'brand', 'image', 'link'];
            if (editingSection?.type === 'content_columns') return ['title', 'text', 'link', 'link_text'];
            return ['title', 'text'];
        }
        return ['title', 'image', 'link'];
    };

    const handleArrayItemChange = (settingKey, index, fieldKey, value) => {
        const currentArray = form.data.settings[settingKey] || [];
        const newArray = [...currentArray];
        const nextItem = {
            ...newArray[index],
            [fieldKey]: value
        };

        if (editingSection?.type === 'top_brands' && settingKey === 'items' && fieldKey === 'brand') {
            const selectedBrand = activeBrands.find((brand) => brand.slug === value);
            if (selectedBrand) {
                nextItem.title = selectedBrand.name;
                nextItem.image = selectedBrand.logo || nextItem.image || '';
                if (!nextItem.link || nextItem.link === '#') {
                    nextItem.link = '';
                }
            }
        }

        newArray[index] = nextItem;
        handleSettingsChange(settingKey, newArray);
    };

    const handleAddArrayItem = (settingKey) => {
        const currentArray = form.data.settings[settingKey] || [];
        const itemKeys = getArrayItemKeys(settingKey, currentArray);
        const newItem = {};
        itemKeys.forEach(k => {
            newItem[k] = '';
        });
        handleSettingsChange(settingKey, [...currentArray, newItem]);
    };

    const handleRemoveArrayItem = (settingKey, index) => {
        const currentArray = form.data.settings[settingKey] || [];
        const newArray = currentArray.filter((_, idx) => idx !== index);
        handleSettingsChange(settingKey, newArray);
    };

    const handleMoveArrayItem = (settingKey, index, direction) => {
        const currentArray = form.data.settings[settingKey] || [];
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === currentArray.length - 1) return;
        
        const newArray = [...currentArray];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newArray[index];
        newArray[index] = newArray[targetIndex];
        newArray[targetIndex] = temp;
        
        handleSettingsChange(settingKey, newArray);
    };

    const isImageKey = (keyName) => {
        const k = keyName.toLowerCase();
        return k.includes('image') || k.includes('img') || k.includes('banner') || k.includes('logo');
    };

    const handleImageUpload = async (e, settingKey, index, fieldKey) => {
        const file = e.target.files[0];
        if (!file) return;

        const stateKey = `${settingKey}-${index}-${fieldKey}`;
        setUploadingStates(prev => ({ ...prev, [stateKey]: true }));

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data && response.data.url) {
                handleArrayItemChange(settingKey, index, fieldKey, response.data.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploadingStates(prev => ({ ...prev, [stateKey]: false }));
        }
    };

    const handleSingleImageUpload = async (e, settingKey) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingStates(prev => ({ ...prev, [settingKey]: true }));

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data && response.data.url) {
                handleSettingsChange(settingKey, response.data.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploadingStates(prev => ({ ...prev, [settingKey]: false }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.page-builder.update', { id: editingSection.id }), {
            onSuccess: () => {
                setEditingSection(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Homepage Layout Page Builder | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Heading */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Homepage Layout Builder</h1>
                    <p className="text-xs text-slate-400 mt-1">Configure layout, sort blocks order, and edit slide components.</p>
                </div>

                {/* Settings Edit Drawer */}
                {editingSection && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex justify-end" onClick={() => setEditingSection(null)}>
                        <div className="w-full max-w-6xl bg-white h-full p-6 md:p-8 flex flex-col shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Configure Layout Block</h3>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Section Type: {editingSection.type}</span>
                                </div>
                                <button onClick={() => setEditingSection(null)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
                                
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Admin block name</label>
                                    <input
                                        type="text"
                                        value={form.data.title || ''}
                                        onChange={e => form.setData('title', e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#c2005f]"
                                        placeholder="Example: Featured products"
                                    />
                                    <p className="mt-1.5 text-[10px] text-slate-400">Used in the admin list to identify this block.</p>
                                </div>

                                {form.data.settings && Object.keys(form.data.settings).map((key) => {
                                    const val = form.data.settings[key];
                                    
                                    if (editingSection?.type === 'product_shelf' && ['category_slug', 'product_limit'].includes(key)) {
                                        return null;
                                    }

                                    if (['side_banner_link', 'side_banner_image', 'side_banner_title', 'side_banner_subtitle'].includes(key)) {
                                        return null;
                                    }

                                    if (editingSection?.type === 'product_shelf' && key === 'product_source') {
                                        const sourceOptions = [
                                            { label: 'All Products', value: 'all' },
                                            { label: 'Featured', value: 'featured' },
                                            { label: 'Latest', value: 'latest' },
                                            { label: 'Best Selling', value: 'best_selling' },
                                            { label: 'Trending', value: 'trending' },
                                            { label: 'Discounted', value: 'discounted' },
                                            { label: 'Flash', value: 'flash_sale' },
                                        ];
                                        const categorySlug = form.data.settings.category_slug || '';
                                        const productLimit = form.data.settings.product_limit || '10';
                                        return (
                                            <div key="product_settings_panel" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                <div className="border-b-2 border-orange-500 bg-black px-5 py-4 text-white">
                                                    <h3 className="flex items-center gap-2 text-sm font-extrabold">
                                                        <ShoppingBag className="h-4 w-4" /> Products Settings
                                                    </h3>
                                                </div>
                                                <div className="space-y-6 p-5">
                                                    <div className="grid gap-3 md:grid-cols-[120px_1fr] md:items-center">
                                                        <label className="text-right text-sm font-extrabold text-slate-700 md:text-right">Collection</label>
                                                        <div className="flex flex-wrap gap-0 rounded-lg bg-black p-1">
                                                            {sourceOptions.map((option) => {
                                                                const active = (val || 'featured') === option.value;
                                                                return (
                                                                    <button
                                                                        key={option.value}
                                                                        type="button"
                                                                        onClick={() => handleSettingsChange('product_source', option.value)}
                                                                        className={`min-h-10 px-5 text-xs font-bold transition-all ${active ? 'bg-orange-600 text-white shadow-sm' : 'bg-black text-white hover:bg-slate-800'}`}
                                                                    >
                                                                        {option.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-[120px_1fr] md:items-center">
                                                        <label className="text-right text-sm font-extrabold text-slate-700 md:text-right">Category</label>
                                                        {categories.length ? (
                                                            <select
                                                                value={categorySlug}
                                                                onChange={e => handleSettingsChange('category_slug', e.target.value)}
                                                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                            >
                                                                <option value="">All Categories</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id || cat.slug} value={cat.slug}>{cat.name}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={categorySlug}
                                                                onChange={e => handleSettingsChange('category_slug', e.target.value)}
                                                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                                placeholder="category-slug"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-[120px_1fr] md:items-center">
                                                        <label className="text-right text-sm font-extrabold text-slate-700 md:text-right">Products</label>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="rounded-lg bg-orange-600 px-5 py-3 text-xs font-bold text-white">Limit</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={productLimit}
                                                                onChange={e => handleSettingsChange('product_limit', e.target.value)}
                                                                className="w-32 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (val !== null && typeof val === 'object') {
                                        if (Array.isArray(val)) {
                                            const itemKeys = getArrayItemKeys(key, val);
                                            return (
                                                <div key={key} className="flex flex-col gap-3 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                                                    <div className="flex justify-between items-center">
                                                        <label className="font-black text-slate-700 uppercase tracking-wider text-xs">
                                                            {key.replace(/_/g, ' ')} ({val.length})
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddArrayItem(key)}
                                                            className="px-2.5 py-1 bg-[#c2005f] hover:bg-[#a0004e] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all shadow-xs"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            Add Item
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                                        {val.map((item, index) => (
                                                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col gap-2 relative group/item">
                                                                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1">
                                                                    <span className="font-bold text-slate-800 text-[11px]">
                                                                        #{index + 1} - {item.name || item.title || `Item ${index + 1}`}
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            disabled={index === 0}
                                                                            onClick={() => handleMoveArrayItem(key, index, 'up')}
                                                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                                                                        >
                                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={index === val.length - 1}
                                                                            onClick={() => handleMoveArrayItem(key, index, 'down')}
                                                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                                                                        >
                                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveArrayItem(key, index)}
                                                                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded ml-1 transition-all"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-2.5">
                                                                    {itemKeys.map(fieldKey => {
                                                                        const isImage = isImageKey(fieldKey);
                                                                        const uploadStateKey = `${key}-${index}-${fieldKey}`;
                                                                        return (
                                                                            <div key={fieldKey} className="flex flex-col gap-0.5">
                                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                    {fieldKey}
                                                                                </label>
                                                                                <div className="flex flex-col gap-1.5 w-full">
                                                                                    <div className="flex gap-2 items-center">
                                                                                        {isImage && item[fieldKey] && (
                                                                                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 shadow-xs">
                                                                                                <img 
                                                                                                    src={item[fieldKey]} 
                                                                                                    className="w-full h-full object-cover" 
                                                                                                    alt="" 
                                                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                        {editingSection?.type === 'top_brands' && key === 'items' && fieldKey === 'brand' ? (
                                                                                            <select
                                                                                                value={item[fieldKey] || ''}
                                                                                                onChange={e => handleArrayItemChange(key, index, fieldKey, e.target.value)}
                                                                                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                                                            >
                                                                                                <option value="">Select active brand</option>
                                                                                                {item[fieldKey] && !activeBrands.some(brand => brand.slug === item[fieldKey]) && (
                                                                                                    <option value={item[fieldKey]}>{item[fieldKey]}</option>
                                                                                                )}
                                                                                                {activeBrands.map(brand => (
                                                                                                    <option key={brand.id} value={brand.slug}>{brand.name}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        ) : (
                                                                                            <input
                                                                                                type="text"
                                                                                                value={item[fieldKey] || ''}
                                                                                                onChange={e => handleArrayItemChange(key, index, fieldKey, e.target.value)}
                                                                                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                                                                placeholder={`Enter ${fieldKey}...`}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    {isImage && (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <label className="cursor-pointer px-3 py-1 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-[10px] transition-all inline-flex items-center gap-1">
                                                                                                <span>Upload Image File</span>
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept="image/*"
                                                                                                    className="hidden" 
                                                                                                    onChange={e => handleImageUpload(e, key, index, fieldKey)}
                                                                                                />
                                                                                            </label>
                                                                                            {uploadingStates[uploadStateKey] && (
                                                                                                <span className="text-[10px] text-slate-400 animate-pulse">Uploading...</span>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={key} className="flex flex-col gap-1">
                                                <label className="font-bold text-slate-600 uppercase tracking-wider">
                                                    {key.replace(/_/g, ' ')} (JSON Configuration)
                                                </label>
                                                <textarea
                                                    rows={8}
                                                    defaultValue={JSON.stringify(val, null, 2)}
                                                    onChange={e => {
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            handleSettingsChange(key, parsed);
                                                        } catch (err) {
                                                            // Keep typing, don't update form key until valid JSON
                                                        }
                                                    }}
                                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                    placeholder="Enter valid JSON array or object..."
                                                />
                                                <span className="text-[10px] text-slate-400">Must be a valid JSON format.</span>
                                            </div>
                                        );
                                    }

                                    if (settingDropdowns[key]) {
                                        return (
                                            <div key={key} className="flex flex-col gap-1">
                                                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px] text-slate-400">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <select
                                                    value={val || settingDropdowns[key][0].value}
                                                    onChange={e => handleSettingsChange(key, e.target.value)}
                                                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                >
                                                    {settingDropdowns[key].map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    const isImg = isImageKey(key);
                                    const isColor = key.toLowerCase().includes('color');
                                    const isCategoriesField = key === 'categories';
                                    return (
                                        <div key={key} className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                                {isCategoriesField ? 'ASSIGN CATEGORIES' : key.replace(/_/g, ' ')}
                                            </label>
                                            <div className="flex gap-2 items-center w-full">
                                                {isImg && val && (
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 shadow-xs">
                                                        <img 
                                                            src={val} 
                                                            className="w-full h-full object-cover" 
                                                            alt="" 
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                )}
                                                {isColor && (
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <input
                                                            type="color"
                                                            value={val && val.startsWith('#') && (val.length === 7 || val.length === 4) ? val : '#ffffff'}
                                                            onChange={e => handleSettingsChange(key, e.target.value)}
                                                            className="w-10 h-10 border border-slate-200 rounded-xl p-0.5 cursor-pointer bg-white flex-shrink-0"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSettingsChange(key, 'transparent')}
                                                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${val === 'transparent' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                            title="Set transparent background"
                                                        >
                                                            Transparent
                                                        </button>
                                                    </div>
                                                )}
                                                {isCategoriesField ? (
                                                    <div className="flex flex-col gap-3.5 w-full bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
                                                        <div className="flex flex-wrap gap-2">
                                                            {categories.map((cat) => {
                                                                const activeCategories = (val || '')
                                                                    .split(',')
                                                                    .map(c => c.trim())
                                                                    .filter(Boolean);
                                                                const isActive = activeCategories.some(
                                                                    c => c.toLowerCase() === cat.name.trim().toLowerCase()
                                                                );
                                                                return (
                                                                    <button
                                                                        key={cat.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            let updated;
                                                                            if (isActive) {
                                                                                updated = activeCategories.filter(
                                                                                    c => c.toLowerCase() !== cat.name.trim().toLowerCase()
                                                                                );
                                                                            } else {
                                                                                updated = [...activeCategories, cat.name.trim()];
                                                                            }
                                                                            handleSettingsChange(key, updated.join(', '));
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                                                                            isActive
                                                                                ? 'border-orange-500 text-orange-650 bg-orange-500/5 shadow-xs'
                                                                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        {cat.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex flex-col gap-1 border-t border-slate-150 pt-2.5">
                                                            <span className="text-[10px] font-bold text-slate-400">CURRENT SELECTION:</span>
                                                            <input
                                                                type="text"
                                                                value={val || ''}
                                                                onChange={e => handleSettingsChange(key, e.target.value)}
                                                                className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                                placeholder="No categories selected"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={val || ''}
                                                        onChange={e => handleSettingsChange(key, e.target.value)}
                                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#c2005f] transition-all"
                                                    />
                                                )}
                                            </div>
                                            {isImg && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <label className="cursor-pointer px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-[10px] transition-all inline-flex items-center gap-1">
                                                        <span>Upload Image File</span>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            className="hidden" 
                                                            onChange={e => handleSingleImageUpload(e, key)}
                                                        />
                                                    </label>
                                                    {uploadingStates[key] && (
                                                        <span className="text-[10px] text-slate-400 animate-pulse">Uploading...</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full mt-4 py-3.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Section Settings
                                </button>

                            </form>

                        </div>
                    </div>
                )}

                {/* Add Section Block Form */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-[#c2005f]" />
                        Add New Homepage Section Block
                    </h3>
                    <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex flex-col gap-1 text-xs">
                            <label className="font-bold text-slate-500 uppercase tracking-wider">Section Title</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.title}
                                onChange={e => addForm.setData('title', e.target.value)}
                                placeholder="e.g., Summer Special Collection"
                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#c2005f]"
                            />
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <label className="font-bold text-slate-500 uppercase tracking-wider">Block Type</label>
                            <select
                                value={addForm.data.type}
                                onChange={e => addForm.setData('type', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#c2005f]"
                            >
                                <option value="hero_slider">Hero Slider & Banner Grid</option>
                                <option value="product_shelf">Product Shelf</option>
                                <option value="feature_badges">Feature Trust Badges</option>
                                <option value="category_grid">Category Grid / Department Icons</option>
                                <option value="signature_banners">Signature Collection Split Banners</option>
                                <option value="cosmetics_banner">Cosmetics Banner Ribbon</option>
                                <option value="top_brands">Top Brands List</option>
                                <option value="campaign_grid">Store Experience Grid</option>
                                <option value="experience_features">Experience Features</option>
                                <option value="content_columns">Content Columns / About</option>
                                <option value="products_tabs">Dynamic Products Filter Tabs</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={addForm.processing}
                            className="bg-[#c2005f] hover:bg-[#a0004e] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md h-[38px] cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add Layout Block
                        </button>
                    </form>
                </div>

                {/* Sections List */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4">
                    {sections.map((section, idx) => (
                        <div 
                            key={section.id} 
                            className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                                section.is_active 
                                    ? 'bg-white border-slate-200' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Sorting buttons */}
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => handleShiftOrder(section, 'up')}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800"
                                        disabled={idx === 0}
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => handleShiftOrder(section, 'down')}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800"
                                        disabled={idx === sections.length - 1}
                                    >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 capitalize">
                                        {section.type.replace('_', ' ')} Block
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">
                                        {section.settings?.title || 'No Title Configuration'} (Index: {section.order_index})
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Toggle Active button */}
                                <button
                                    onClick={() => handleToggleActive(section)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        section.is_active 
                                            ? 'text-orange-500 hover:bg-orange-50' 
                                            : 'text-slate-300 hover:bg-slate-100'
                                    }`}
                                    title={section.is_active ? 'Block Active' : 'Block Inactive'}
                                >
                                    {section.is_active ? (
                                        <ToggleRight className="w-8 h-8" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleEditClick(section)}
                                    className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                    title="Edit settings config"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    className="p-2 border border-slate-200 hover:border-red-350 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                                    title="Delete Layout Block"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AdminLayout>
    );
}







