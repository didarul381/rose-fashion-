import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, ChevronRight, GitCompare, Heart, Home, Info, LayoutDashboard, LogOut, Mail, MapPin, Menu, Minus, Phone, Plus, Search, Settings, ShoppingBag, ShoppingCart, Trash2, User, X } from 'lucide-react';
import { useCart } from '../Contexts/CartContext';
import { getWishlistItems, removeWishlistProduct } from '../Services/Wishlist';
import { compareUrl, getCompareItems } from '../Services/Compare';
import { Tracker } from '../Services/Tracker';
import MultipleChatPlugin from '../Components/MultipleChatPlugin';

function parseHeaderBottomNavItems(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeHeaderNavHref(link) {
    const value = String(link || '').trim();
    if (!value) return '#';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
    if (value.startsWith('#')) return route('home') + value;
    return `/${value.replace(/^\/+/, '')}`;
}
export default function ShopLayout({ children, hideMobileBottomNav = false }) {
    const page = usePage();
    const { auth, flash, global_settings = {}, categories = [], header_categories = [], footer_pages = [] } = page.props;
    const currentUrl = page.url || '/';
    const { cartItems, cartCount, subtotal, removeFromCart, updateQty } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [compareItems, setCompareItems] = useState([]);
    const [mobileCategory, setMobileCategory] = useState(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [notice, setNotice] = useState(null);
    const [accountOpen, setAccountOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const accountRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        let timer = null;

        const handleCartEvent = (event) => {
            if (event.detail?.action === 'added') {
                const item = event.detail?.item;
                const qty = event.detail?.quantity || 1;
                const name = item?.name || 'Product';
                setNotice({
                    type: 'success',
                    title: 'Added to Cart',
                    text: `${name} (x${qty}) added to your cart successfully`,
                    image: item?.image,
                    showCartBtn: true,
                });
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    setNotice(null);
                }, 3800);
            }
        };

        const handleToastEvent = (event) => {
            if (event.detail?.text) {
                setNotice({
                    type: event.detail.type || 'info',
                    title: event.detail.title || '',
                    text: event.detail.text,
                    image: event.detail.image || null,
                    showCartBtn: false,
                });
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    setNotice(null);
                }, 3500);
            }
        };

        window.addEventListener('govaly-cart-event', handleCartEvent);
        window.addEventListener('govaly-toast', handleToastEvent);

        return () => {
            if (timer) clearTimeout(timer);
            window.removeEventListener('govaly-cart-event', handleCartEvent);
            window.removeEventListener('govaly-toast', handleToastEvent);
        };
    }, []);

    const primaryColor = global_settings.primary_color || global_settings.theme_primary || '#102f58';
    const storeName = global_settings.theme_name || global_settings.store_name || global_settings.site_title || 'Malamal';
    const logo = global_settings.header_logo_image || global_settings.store_logo;
    const phone = global_settings.contact_phone || '+880 9638212121';
    const email = global_settings.contact_email || 'support@example.com';
    const address = global_settings.store_address_1 || global_settings.contact_address || 'Dhaka, Bangladesh';
    const headerStickySetting = String(global_settings.header_sticky ?? global_settings.header_sticky_status ?? 'true');
    const headerSticky = !['false', '0', 'no', 'disabled'].includes(headerStickySetting.toLowerCase());
    const headerBgColor = global_settings.header_bg_color || '#f8fafc';
    const headerTextColor = global_settings.header_text_color || '#0f172a';
    const headerDesign = global_settings.header_design || 'classic';
    const isHumanbeingHeader = headerDesign === 'humanbeing';
    const modernHeaderBgColor = global_settings.header_modern_bg_color || '#08bde3';
    const modernHeaderTextColor = global_settings.header_modern_text_color || '#ffffff';
    const headerFontFamily = global_settings.header_font_family || global_settings.font_family || 'Outfit';
    const headerMenuFontFamily = global_settings.header_bottom_font_family || global_settings.header_menu_font_family || headerFontFamily;
    const headerLogoText = global_settings.header_logo_text || storeName;
    const bottomBarBgColor = global_settings.header_bottom_bg_color || '#ffffff';
    const bottomBarTextColor = global_settings.header_bottom_text_color || '#0f172a';
    const activeLinkColor = global_settings.header_bottom_active_color || global_settings.header_active_link_color || '#ff4b19';
    const mobileBottomNavEnabled = String(global_settings.mobile_bottom_nav_status || 'enabled') !== 'disabled';
    const mobileBottomNavBgColor = global_settings.mobile_bottom_nav_bg_color || headerBgColor;
    const mobileBottomNavTextColor = global_settings.mobile_bottom_nav_text_color || headerTextColor || '#ffffff';
    const mobileBottomNavBadgeBgColor = global_settings.mobile_bottom_nav_badge_bg_color || '#ff4b19';
    const mobileBottomNavBadgeTextColor = global_settings.mobile_bottom_nav_badge_text_color || '#ffffff';
    const mobileBottomNavFontWeight = global_settings.mobile_bottom_nav_font_weight || 'semibold';
    const showMobileHeaderSearch = String(global_settings.mobile_header_search_status || 'disabled') !== 'disabled';
    const showMobileNavHome = String(global_settings.mobile_bottom_nav_show_home || 'true') !== 'false';
    const showMobileNavMenu = String(global_settings.mobile_bottom_nav_show_menu || 'true') !== 'false';
    const showMobileNavCart = String(global_settings.mobile_bottom_nav_show_cart || 'true') !== 'false';
    const showMobileNavCompare = String(global_settings.mobile_bottom_nav_show_compare || 'true') !== 'false';
    const showMobileNavSearch = String(global_settings.mobile_bottom_nav_show_search || 'true') !== 'false';
    const showMobileNavAccount = String(global_settings.mobile_bottom_nav_show_account || 'true') !== 'false';
    const showHeaderCategoryMenu = String(global_settings.header_show_category_menu ?? 'true') !== 'false';
    const showHeaderCompare = String(global_settings.header_show_compare ?? 'true') !== 'false';
    const showHeaderWishlist = String(global_settings.header_show_wishlist ?? 'true') !== 'false';
    const showHeaderCart = String(global_settings.header_show_cart ?? 'true') !== 'false';
    const showHeaderQuotation = String(global_settings.header_show_quotation ?? 'true') !== 'false';
    const showHeaderTrackOrder = String(global_settings.header_modern_show_track_order ?? 'true') !== 'false';
    const showHeaderSupport = String(global_settings.header_show_support ?? 'true') !== 'false';
    const showFeaturedCampaigns = String(global_settings.header_featured_show_campaigns ?? 'true') !== 'false';
    const showFeaturedQuotation = String(global_settings.header_featured_show_quotation ?? 'true') !== 'false';
    const showFeaturedFlash = String(global_settings.header_featured_show_flash ?? 'true') !== 'false';
    const headerBottomNavMode = global_settings.header_bottom_nav_mode || 'manual';
    const footerBgColor = global_settings.footer_bg_color || '#102f58';
    const footerTextColor = global_settings.footer_text_color || '#ffffff';
    const footerCopyright = global_settings.footer_copyright || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
    const footerDbid = global_settings.footer_dbid || '';
    const footerAbout = global_settings.footer_about || '';
    const footerPayments = String(global_settings.footer_payments || '').split(',').map((item) => item.trim()).filter(Boolean);
    const footerSocialLinks = [
        { label: 'Facebook', href: global_settings.footer_facebook },
        { label: 'Instagram', href: global_settings.footer_instagram },
        { label: 'TikTok', href: global_settings.footer_tiktok },
        { label: 'YouTube', href: global_settings.footer_youtube },
        { label: 'WhatsApp', href: global_settings.footer_whatsapp },
    ].filter((item) => item.href && item.href !== '#');

    useEffect(() => {
        const sync = () => setWishlistItems(getWishlistItems());
        sync();
        window.addEventListener('govaly-wishlist-changed', sync);
        return () => window.removeEventListener('govaly-wishlist-changed', sync);
    }, []);

    useEffect(() => {
        const sync = () => setCompareItems(getCompareItems());
        sync();
        window.addEventListener('malamal-compare-changed', sync);
        return () => window.removeEventListener('malamal-compare-changed', sync);
    }, []);

    useEffect(() => {
        const close = (event) => {
            if (!searchRef.current?.contains(event.target) && !mobileSearchRef.current?.contains(event.target)) setSuggestions([]);
            if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        if (query.trim().length < 1) { setSuggestions([]); return; }
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`${route('api.search')}?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSuggestions(Array.isArray(data) ? data : (data.products || []));
            } catch { setSuggestions([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!flash?.success && !flash?.error) return;
        setNotice({ type: flash.success ? 'success' : 'error', text: flash.success || flash.error });
        const timer = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(timer);
    }, [flash]);

    useEffect(() => {
        Tracker.init(global_settings);
        const unsubscribe = router.on('navigate', () => { setMenuOpen(false); setCategoriesOpen(false); setCartOpen(false); setWishlistOpen(false); setAccountOpen(false); setMobileSearchOpen(false); });
        return () => unsubscribe();
    }, [global_settings]);




    useEffect(() => {
        if (!mobileSearchOpen) return;
        window.setTimeout(() => mobileSearchInputRef.current?.focus(), 80);
    }, [mobileSearchOpen]);
    const submitSearch = (event) => {
        event.preventDefault();
        if (suggestions[0]) {
            setMobileSearchOpen(false);
            router.visit(route('product.show', { slug: suggestions[0].slug }));
        }
    };
    const money = (value) => `${global_settings.currency_symbol || '\u09F3'} ${Number(value || 0).toLocaleString('en-BD')}`;
        const defaultNavItems = [
        { label: 'Categories', href: route('categories.index'), order: 1 },
        { label: 'Shop', href: route('shop.index'), order: 2 },
        { label: 'Promotions/Campaigns', href: route('campaigns.index'), order: 3 },
        { label: 'Shop By Brands', href: route('brands.index'), order: 4 },
        { label: 'Quotation Request', href: route('quotation.request'), order: 5 },
        { label: 'Our Contacts', href: route('home') + '#contact', order: 6 },
        { label: 'Return Policy', href: route('home') + '#service', order: 7 },
        { label: 'Terms & Conditions', href: route('home') + '#footer', order: 8 },
    ];
    const customNavItems = parseHeaderBottomNavItems(global_settings.header_bottom_nav_items)
        .filter((item) => item && item.visible !== false && item.title)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((item) => ({ label: item.title, href: normalizeHeaderNavHref(item.link), order: item.order }));
    const categoryNavItems = header_categories.map((category, index) => ({
        label: category.name,
        href: category.slug ? route('category.show', { slug: category.slug }) : '#',
        order: index + 1,
        children: category.children || [],
    }));
    const featuredExtraNavItems = [
        showFeaturedCampaigns ? { label: 'Promotions/Campaigns', href: route('campaigns.index'), order: categoryNavItems.length + 1 } : null,
        showFeaturedQuotation ? { label: 'Quotation Request', href: route('quotation.request'), order: categoryNavItems.length + 2 } : null,
        showFeaturedFlash ? { label: 'Flash', href: route('home') + '#flash', order: categoryNavItems.length + 3 } : null,
    ].filter(Boolean);
    const navItems = headerBottomNavMode === 'categories'
        ? [...categoryNavItems, ...featuredExtraNavItems]
        : (customNavItems.length ? customNavItems : defaultNavItems);

    return (
        <div className={`${mobileBottomNavEnabled ? 'pb-20 md:pb-0' : ''} min-h-screen overflow-x-clip bg-slate-50 text-slate-900`}>
            <header ref={headerRef} className={`${headerSticky ? 'sticky top-0' : 'relative'} z-40 ${isHumanbeingHeader ? 'border-b border-cyan-500/20 shadow-[0_8px_22px_rgba(6,182,212,0.18)]' : 'border-b border-slate-200 shadow-sm backdrop-blur-xl'}`} style={{ fontFamily: headerFontFamily, backgroundColor: isHumanbeingHeader ? modernHeaderBgColor : headerBgColor }}>
                <div className={`store-container flex items-center ${isHumanbeingHeader ? 'h-[66px] gap-3 md:h-[78px] md:gap-4 lg:gap-6' : 'h-[74px] gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4'}`} style={{ backgroundColor: isHumanbeingHeader ? modernHeaderBgColor : headerBgColor, color: isHumanbeingHeader ? modernHeaderTextColor : headerTextColor }}>
                    <button onClick={() => setMenuOpen(true)} className={isHumanbeingHeader ? 'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 lg:hidden' : 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 lg:hidden'} style={{ color: isHumanbeingHeader ? modernHeaderTextColor : headerTextColor }} aria-label="Open menu"><Menu className={isHumanbeingHeader ? 'h-7 w-7' : 'h-5 w-5'} /></button>
                    <Link href={route('home')} className={isHumanbeingHeader ? 'flex min-w-0 flex-1 items-center justify-center md:justify-start md:flex-none md:min-w-[210px]' : 'flex min-w-0 flex-1 items-center justify-center md:flex-none md:shrink-0 md:justify-start'}>
                        {logo ? (
                            <img
                                src={logo}
                                alt={storeName}
                                className={isHumanbeingHeader ? 'max-h-12 w-auto max-w-[145px] object-contain sm:max-w-[170px] lg:max-w-[220px] mx-auto md:mx-0' : 'max-h-10 sm:max-h-11 md:max-h-12 w-auto max-w-[150px] sm:max-w-[175px] lg:max-w-[200px] xl:max-w-[220px] object-contain mx-auto md:mx-0'}
                            />
                        ) : (
                            <span className="text-xl font-bold tracking-tight text-center md:text-left truncate" style={{ color: isHumanbeingHeader ? modernHeaderTextColor : headerTextColor }}>
                                {headerLogoText}
                            </span>
                        )}
                    </Link>
                    {!isHumanbeingHeader && showHeaderCategoryMenu && <DesktopCategoryMenu categories={header_categories} open={categoriesOpen} setOpen={setCategoriesOpen} primaryColor={primaryColor} />}
                    <form ref={searchRef} onSubmit={submitSearch} className={isHumanbeingHeader ? "relative hidden min-w-0 flex-[0_1_760px] md:block" : "relative hidden min-w-0 md:flex flex-1"}>
                        <div className={isHumanbeingHeader ? 'flex h-[44px] overflow-hidden rounded-full bg-white shadow-[0_8px_18px_rgba(8,145,178,0.16)] ring-1 ring-white/25' : 'flex h-[42px] xl:h-[46px] items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm w-full'}>
                            {!isHumanbeingHeader && <Search className="ml-4 h-4 w-4 text-slate-400 shrink-0" />}
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isHumanbeingHeader ? 'Search for smartwatches, cotton polos, combos...' : 'Search for products...'} className={isHumanbeingHeader ? 'min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-medium text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:ring-0' : 'h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-xs xl:text-sm outline-none ring-0 focus:ring-0'} />
                            <button className={isHumanbeingHeader ? 'm-1 inline-flex items-center gap-1.5 rounded-full bg-[#08bde3] px-5 text-xs font-bold text-white shadow-[0_5px_12px_rgba(8,189,227,0.28)] transition hover:bg-[#06a9cc]' : 'h-full rounded-none px-4 xl:px-6 text-xs xl:text-sm font-bold text-white shrink-0 transition hover:opacity-90'} style={!isHumanbeingHeader ? { backgroundColor: primaryColor } : undefined}>{isHumanbeingHeader && <Search className="h-3.5 w-3.5" />}Search</button>
                        </div>
                        <SearchSuggestions suggestions={suggestions} money={money} onSelect={() => setSuggestions([])} />
                    </form>
                    <div className={isHumanbeingHeader ? 'ml-auto flex shrink-0 items-center gap-2 md:gap-3' : `flex shrink-0 items-center md:ml-auto w-10 md:w-auto justify-end ${showHeaderQuotation ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-2.5 xl:gap-3'}`}>
                        {isHumanbeingHeader ? <>
                            {showHeaderTrackOrder && <Link href={route('track-order')} className="hidden h-10 items-center rounded-full border border-white/25 bg-white/10 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 xl:flex">Track Order</Link>}
                            {showHeaderWishlist && <button onClick={() => setWishlistOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20" aria-label="Wishlist"><Heart className="h-7 w-7" strokeWidth={2.1} />{wishlistItems.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-black text-[#08bde3]">{wishlistItems.length}</span> : null}</button>}
                            {showHeaderCart && <button onClick={() => setCartOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20" aria-label="Cart"><ShoppingBag className="h-7 w-7" strokeWidth={2.1} /><span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-black text-[#08bde3]">{cartCount}</span></button>}
                            <AccountMenu auth={auth} open={accountOpen} setOpen={setAccountOpen} accountRef={accountRef} variant="humanbeing" primaryColor={primaryColor} />
                        </> : <>
                            {showHeaderCompare && <Link href={compareUrl()} className={`hidden h-[40px] xl:h-[42px] items-center gap-1.5 rounded-full border border-slate-200 bg-white ${showHeaderQuotation ? 'px-2.5 xl:px-3.5' : 'px-3 xl:px-4'} text-xs font-bold lg:flex shrink-0`}><GitCompare className="h-3.5 w-3.5 xl:h-4 xl:w-4" />Compare {compareItems.length ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ff4b19] px-1 text-[10px] text-white">{compareItems.length}</span> : ''}</Link>}
                            {showHeaderWishlist && <button onClick={() => setWishlistOpen(true)} className={`hidden h-[40px] xl:h-[42px] items-center gap-1.5 rounded-full border border-slate-200 bg-white ${showHeaderQuotation ? 'px-2.5 xl:px-3.5' : 'px-3 xl:px-4'} text-xs font-bold lg:flex shrink-0`}><Heart className="h-3.5 w-3.5 xl:h-4 xl:w-4" />Wishlist {wishlistItems.length ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ff4b19] px-1 text-[10px] text-white">{wishlistItems.length}</span> : ''}</button>}
                            {showHeaderCart && (
                                <>
                                    {/* Mobile Cart Button: Circular button with badge over top-right corner */}
                                    <button
                                        type="button"
                                        onClick={() => setCartOpen(true)}
                                        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition active:scale-95 md:hidden"
                                        aria-label="Cart"
                                    >
                                        <span className="relative grid h-6 w-6 place-items-center">
                                            <ShoppingCart className="h-5 w-5 text-slate-700" strokeWidth={2.2} />
                                            {Number(cartCount || 0) > 0 && (
                                                <span className="absolute -right-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff4b19] px-1 text-[10px] font-black leading-none text-white shadow-sm ring-2 ring-white">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </span>
                                    </button>

                                    {/* Desktop Cart Button: Pill style with text */}
                                    <button
                                        type="button"
                                        onClick={() => setCartOpen(true)}
                                        className={`hidden md:flex h-[40px] xl:h-[42px] items-center gap-1.5 rounded-full border border-slate-200 bg-white ${showHeaderQuotation ? 'px-2.5 sm:px-3 xl:px-3.5' : 'px-3 sm:px-3.5 xl:px-4'} text-xs font-bold shrink-0`}
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                                        <span>Cart</span>
                                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ff4b19] px-1 text-[10px] text-white">{cartCount}</span>
                                    </button>
                                </>
                            )}
                            {showHeaderQuotation && (
                                <Link
                                    href={route('quotation.request')}
                                    className="hidden h-[40px] xl:h-[42px] items-center rounded-full px-3.5 xl:px-4 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90 active:scale-95 lg:flex shrink-0 whitespace-nowrap"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Quotation Request
                                </Link>
                            )}
                            <AccountMenu auth={auth} open={accountOpen} setOpen={setAccountOpen} accountRef={accountRef} primaryColor={primaryColor} />
                        </>}
                    </div>
                </div>
                {showMobileHeaderSearch && !mobileSearchOpen && <div ref={mobileSearchRef} className="store-container relative mb-3 md:hidden">
                    <form onSubmit={submitSearch} className="flex h-11 overflow-hidden rounded-full border border-slate-200 bg-white" style={{ color: headerTextColor }}><Search className="ml-4 mt-3.5 h-4 w-4 text-slate-400" /><input ref={mobileSearchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none ring-0 focus:ring-0" /><button className="rounded-none px-5 text-xs font-bold text-white transition hover:opacity-90" style={{ backgroundColor: primaryColor }}>Search</button>{mobileSearchOpen && !showMobileHeaderSearch && <button type="button" onClick={() => { setMobileSearchOpen(false); setSuggestions([]); }} className="grid w-10 place-items-center bg-white text-slate-500" aria-label="Close search"><X className="h-4 w-4" /></button>}</form>
                    <SearchSuggestions suggestions={suggestions} money={money} onSelect={() => setSuggestions([])} mobile />
                </div>}
                <nav className="hidden border-t border-slate-200 lg:block" style={{ backgroundColor: bottomBarBgColor, color: bottomBarTextColor, fontFamily: headerMenuFontFamily }}>
                    <div className="store-container flex min-h-12 items-center gap-7">
                        {navItems.map((item) => (
                            <HeaderBottomNavItem
                                key={item.label}
                                item={item}
                                textColor={bottomBarTextColor}
                                activeColor={activeLinkColor}
                                currentUrl={currentUrl}
                            />
                        ))}
                        {showHeaderSupport && (
                            <a
                                href={`tel:${String(phone || '').replace(/[^0-9+]/g, '')}`}
                                className="ml-auto inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow active:scale-95 shrink-0"
                                style={{ backgroundColor: primaryColor }}
                                title={`Call Customer support: ${phone}`}
                            >
                                <div className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white shrink-0">
                                    <Phone className="h-3 w-3 fill-current" />
                                </div>
                                <div className="text-left leading-tight">
                                    <span className="block text-[10px] font-semibold text-white/90">Customer support</span>
                                    {phone && <span className="block text-[11px] font-bold text-white tracking-wide">{phone}</span>}
                                </div>
                            </a>
                        )}
                    </div>
                </nav>
            </header>

            <main>{children}</main>

            <footer id="footer" style={{ backgroundColor: footerBgColor, color: footerTextColor }}>
                <div id="contact" className="store-container grid items-start gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.25fr] lg:gap-12">
                    <div>
                        <h3 className="text-lg font-bold">Registered Office</h3>
                        {footerAbout && <p className="mt-4 text-sm leading-6 opacity-80">{footerAbout}</p>}
                        <div className="mt-5 space-y-3 text-sm leading-relaxed opacity-85">
                            <p className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0" style={{ color: activeLinkColor }} />{address}</p>
                            <p className="flex gap-3"><Mail className="h-4 w-4 shrink-0" style={{ color: activeLinkColor }} />{email}</p>
                            <p className="flex gap-3"><Phone className="h-4 w-4 shrink-0" style={{ color: activeLinkColor }} />{phone}</p>
                            {footerDbid && <p className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold opacity-90">{footerDbid}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Store Sitemap</h3>
                        <div className="mt-5 grid max-w-[260px] gap-3 text-sm opacity-85">
                            {footer_pages.length ? footer_pages.map((page) => <Link key={page.id} href={route('page.show', { slug: page.slug })}>{page.title}</Link>) : <span className="opacity-70">No pages available</span>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Categories</h3>
                        <div className="mt-5 grid max-w-[260px] gap-3 text-sm opacity-85">{categories.slice(0, 8).map((category) => <Link key={category.id} href={category.slug ? route('category.show', { slug: category.slug }) : '#'} className="leading-snug transition hover:translate-x-1">{category.name}</Link>)}</div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Customer Care</h3>
                        <div className="mt-5 max-w-[300px] space-y-3 text-sm opacity-85">
                            <p>Hotline: {phone}</p>
                            <p>Sales: {email}</p>
                            <Link href={route('track-order')} className="block">Track your order</Link>
                            <button onClick={() => setWishlistOpen(true)}>My Wishlist</button>
                        </div>
                        {footerPayments.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Accepted Payments</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {footerPayments.map((payment) => <span key={payment} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">{payment}</span>)}
                                </div>
                            </div>
                        )}
                        {footerSocialLinks.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Follow Us</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {footerSocialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/20">{social.label}</a>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="store-container flex flex-col justify-between items-center gap-3 py-5 text-xs text-white/70 sm:flex-row">
                        <p>{footerCopyright}</p>
                        <a
                            href="https://zorvyn-meet.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-white/[0.08] to-white/[0.02] px-3.5 py-1.5 text-xs shadow-inner shadow-white/5 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102f58]"
                            title="Visit Zorvyn"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
                            </span>
                            <span className="text-white/75 transition-colors group-hover:text-white">Made by</span>
                            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text font-black tracking-wider text-transparent uppercase drop-shadow-xs transition-all group-hover:from-cyan-200 group-hover:via-white group-hover:to-cyan-300">
                                zorvyn
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                        </a>
                    </div>
                </div>
            </footer>


            {mobileSearchOpen && (
                <div className="fixed inset-0 z-[72] bg-white md:hidden">
                    <div ref={mobileSearchRef} className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 pb-3 pt-4 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <form onSubmit={submitSearch} className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 px-3 transition focus-within:border-[#102f58] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#102f58]/10">
                                    <Search className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2.2} />
                                    <input ref={mobileSearchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] font-medium text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-0" />
                                    {query && (
                                        <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200/70 text-slate-500" aria-label="Clear search">
                                            <X className="h-4 w-4" strokeWidth={2.5} />
                                        </button>
                                    )}
                                </form>
                                <button type="button" onClick={() => { setMobileSearchOpen(false); setSuggestions([]); }} className="shrink-0 rounded-full px-2 py-2 text-sm font-bold text-slate-600" aria-label="Close search">
                                    Cancel
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">Search products</h3>
                                    <p className="text-xs font-medium text-slate-400">Find what you need quickly</p>
                                </div>
                                {query && <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{suggestions.length} found</span>}
                            </div>
                            <SearchSuggestions suggestions={suggestions} money={money} onSelect={() => { setSuggestions([]); setMobileSearchOpen(false); }} mobile />
                            {query && suggestions.length === 0 && (
                                <div className="mt-10 text-center">
                                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-700">No products found</p>
                                    <p className="mt-1 text-xs text-slate-400">Try another keyword or category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <MobileBottomNavigation
                auth={auth}
                cartCount={cartCount}
                compareCount={compareItems.length}
                compareHref={compareUrl()}
                enabled={mobileBottomNavEnabled && !hideMobileBottomNav && !currentUrl.startsWith('/checkout')}
                bgColor={mobileBottomNavBgColor}
                textColor={mobileBottomNavTextColor}
                badgeBgColor={mobileBottomNavBadgeBgColor}
                badgeTextColor={mobileBottomNavBadgeTextColor}
                fontWeight={mobileBottomNavFontWeight}
                showHome={showMobileNavHome}
                showMenu={showMobileNavMenu}
                showCart={showMobileNavCart}
                showCompare={showMobileNavCompare}
                showSearch={showMobileNavSearch}
                showAccount={showMobileNavAccount}
                onCartOpen={() => setCartOpen(true)}
                onMenuOpen={() => setMenuOpen(true)}
                onSearchOpen={() => setMobileSearchOpen(true)}
                primaryColor={primaryColor}
            />

            {menuOpen && <MobileMenu categories={header_categories} items={navItems} expanded={mobileCategory} setExpanded={setMobileCategory} onClose={() => setMenuOpen(false)} />}
            {cartOpen && <CartDrawer items={cartItems} subtotal={subtotal} onClose={() => setCartOpen(false)} remove={removeFromCart} update={updateQty} money={money} />}
            {wishlistOpen && <WishlistDrawer items={wishlistItems} onClose={() => setWishlistOpen(false)} onRemove={(id) => { removeWishlistProduct(id); setWishlistItems(getWishlistItems()); }} money={money} />}
            {notice && (
                <div
                    className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[95] flex max-w-sm sm:max-w-md items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/95 p-3.5 sm:p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
                    role="alert"
                >
                    {notice.image ? (
                        <img
                            src={notice.image}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                        />
                    ) : notice.type === 'error' ? (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/20 text-red-400">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                    ) : notice.type === 'info' ? (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
                            <Info className="h-5 w-5" />
                        </div>
                    ) : (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        {notice.title && (
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {notice.title}
                            </p>
                        )}
                        <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-100">
                            {notice.text}
                        </p>
                    </div>

                    {notice.type === 'success' && notice.showCartBtn !== false && (
                        <button
                            type="button"
                            onClick={() => {
                                setNotice(null);
                                setCartOpen(true);
                            }}
                            className="shrink-0 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
                        >
                            View Cart
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                        aria-label="Close notification"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <MultipleChatPlugin hideOnMobile={hideMobileBottomNav} />
        </div>
    );
}

function stripHeaderNavUrl(value) {
    const raw = String(value || '/');
    try {
        const parsed = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        return parsed.pathname.replace(/\/+$/, '') || '/';
    } catch {
        return raw.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
    }
}

function isHeaderNavActive(item, currentUrl) {
    const currentPath = stripHeaderNavUrl(currentUrl);
    const itemPath = stripHeaderNavUrl(item?.href);

    if (itemPath === '/' && currentPath === '/') return true;
    if (itemPath !== '/' && (currentPath === itemPath || currentPath.startsWith(`${itemPath}/`))) return true;

    return Array.isArray(item?.children) && item.children.some((child) => {
        if (!child?.slug) return false;
        const childPath = stripHeaderNavUrl(route('category.show', { slug: child.slug }));
        return currentPath === childPath || currentPath.startsWith(`${childPath}/`);
    });
}

function HeaderBottomNavItem({ item, textColor, activeColor, currentUrl }) {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isActive = isHeaderNavActive(item, currentUrl);

    return (
        <div className="group relative">
            <Link
                href={item.href}
                className="relative flex items-center gap-1.5 py-4 text-xs font-bold transition-colors"
                style={{ color: isActive ? activeColor : textColor }}
                onMouseEnter={(e) => { e.currentTarget.style.color = activeColor; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? activeColor : textColor; }}
            >
                <span className="relative z-10">{item.label}</span>
                {hasChildren && <ChevronDown className="relative z-10 h-3.5 w-3.5 transition group-hover:rotate-180" />}
                {isActive && <span className="absolute inset-x-0 bottom-2 h-0.5 rounded-full" style={{ backgroundColor: activeColor }} />}
            </Link>

            {hasChildren && (
                <div className="invisible absolute left-0 top-full z-[80] w-64 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 opacity-0 shadow-2xl ring-1 ring-slate-950/5 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => {
                        const childHref = child.slug ? route('category.show', { slug: child.slug }) : '#';
                        const childActive = stripHeaderNavUrl(currentUrl) === stripHeaderNavUrl(childHref);

                        return (
                            <Link
                                key={child.id}
                                href={childHref}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition hover:bg-slate-50"
                                style={{ color: childActive ? activeColor : undefined }}
                            >
                                <span className="line-clamp-1">{child.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
function suggestionImage(item) {
    return item?.primary_image?.image_path || item?.primaryImage?.image_path || item?.image || item?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=60';
}

function SearchSuggestions({ suggestions = [], money, onSelect, mobile = false }) {
    if (!suggestions.length) return null;

    if (mobile) {
        return (
            <div className="divide-y divide-slate-100 rounded-2xl bg-white">
                {suggestions.slice(0, 6).map((item) => (
                    <Link
                        key={item.id}
                        href={route('product.show', { slug: item.slug })}
                        onClick={onSelect}
                        className="flex items-center gap-3 py-3 active:bg-slate-50"
                    >
                        <img src={suggestionImage(item)} alt={item.name} className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100 object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{item.name}</p>
                            <p className="mt-1 text-sm font-extrabold text-[#00aeef]">{money(item.sale_price || item.price).replace(/\s+/g, '')}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" strokeWidth={1.8} />
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className="absolute left-0 right-0 top-14 z-[75] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {suggestions.slice(0, 6).map((item) => (
                <Link
                    key={item.id}
                    href={route('product.show', { slug: item.slug })}
                    onClick={onSelect}
                    className="flex items-center gap-3 border-b border-slate-100 p-2.5 last:border-b-0 hover:bg-slate-50"
                >
                    <img src={suggestionImage(item)} alt={item.name} className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 bg-slate-50 object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{item.name}</p>
                        {item.sku && <p className="mt-0.5 truncate text-[11px] text-slate-400">SKU: {item.sku}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#ff4b19]">{money(item.sale_price || item.price)}</span>
                </Link>
            ))}
        </div>
    );
}
function userAvatar(user) {
    return user?.profile_photo_url || user?.avatar || user?.photo || user?.profile_image || user?.image || null;
}

function userInitials(user) {
    const raw = String(user?.name || user?.email || 'US').trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
}

function AccountMenu({ auth, open, setOpen, accountRef, variant = 'classic', primaryColor = '#102f58' }) {
    const user = auth?.user;
    const isHumanbeing = variant === 'humanbeing';

    if (!user) {
        return (
            <Link
                href={route('login')}
                className={isHumanbeing ? 'grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20 shrink-0' : 'hidden h-[40px] xl:h-[42px] items-center gap-2 rounded-full px-3.5 xl:px-4 text-xs font-bold text-white shadow-sm transition hover:opacity-90 md:flex shrink-0 whitespace-nowrap'}
                style={!isHumanbeing ? { backgroundColor: primaryColor } : undefined}
                aria-label="Sign in"
            >
                <User className={isHumanbeing ? 'h-7 w-7' : 'h-4 w-4'} />
                {!isHumanbeing && <span className="hidden xl:inline">Sign in</span>}
            </Link>
        );
    }

    const dashboardRoute = user.role === 'admin' ? 'admin.dashboard' : 'customer.dashboard';
    const avatar = userAvatar(user);
    const displayName = user.name || 'Account';

    return (
        <div ref={accountRef} className={isHumanbeing ? 'relative block shrink-0' : 'relative hidden md:block shrink-0'}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={isHumanbeing 
                    ? 'grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20 shrink-0' 
                    : 'grid h-[40px] w-[40px] xl:h-[42px] xl:w-[42px] place-items-center overflow-hidden rounded-full text-white shadow-sm transition hover:opacity-90 shrink-0'}
                style={!isHumanbeing ? { backgroundColor: primaryColor } : undefined}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                title={displayName}
            >
                {avatar ? (
                    <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs font-black tracking-wider">{userInitials(user)}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-[52px] z-[90] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-950/5" role="menu">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                            {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : <span className="text-sm font-black">{userInitials(user)}</span>}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">{displayName}</p>
                            {user.email && <p className="truncate text-xs font-medium text-slate-500">{user.email}</p>}
                        </div>
                    </div>
                    <div className="p-2">
                        <Link href={route(dashboardRoute)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition hover:bg-slate-50" role="menuitem">
                            <LayoutDashboard className="h-4 w-4 text-slate-500" />
                            My Dashboard
                        </Link>
                        <Link href={route('profile.edit')} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition hover:bg-slate-50" role="menuitem">
                            <Settings className="h-4 w-4 text-slate-500" />
                            Profile Settings
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50" role="menuitem">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
function MobileBottomNavigation({ auth, cartCount, compareCount, compareHref, enabled = true, bgColor = '#102f58', textColor = '#ffffff', badgeBgColor = '#ff4b19', badgeTextColor = '#ffffff', fontWeight = 'semibold', showHome = true, showMenu = true, showCart = true, showCompare = true, showSearch = true, showAccount = true, onCartOpen, onMenuOpen, onSearchOpen, primaryColor = '#102f58' }) {
    const [accountOpen, setAccountOpen] = useState(false);
    const user = auth?.user;
    const dashboardRoute = user?.role === 'admin' ? 'admin.dashboard' : 'customer.dashboard';
    const avatar = userAvatar(user);
    const displayName = user?.name || 'Account';
    const items = [
        showHome ? { label: 'Home', icon: Home, href: route('home') } : null,
        showMenu ? { label: 'Menu', icon: Menu, action: onMenuOpen } : null,
        showCart ? { label: 'Cart', icon: ShoppingCart, action: onCartOpen, count: cartCount } : null,
        showCompare ? { label: 'Compare', icon: GitCompare, href: compareHref, count: compareCount } : null,
        showSearch ? { label: 'Search', icon: Search, action: onSearchOpen } : null,
        showAccount ? (user ? { label: 'Account', icon: User, action: () => setAccountOpen((open) => !open) } : { label: 'Account', icon: User, href: route('login') }) : null,
    ].filter(Boolean);

    const weightClass = { medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' }[fontWeight] || 'font-semibold';
    const itemClass = `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] uppercase tracking-wide transition active:scale-95 ${weightClass}`;

    if (!enabled || items.length === 0) return null;

    return (
        <>
            {user && accountOpen && (
                <div className="fixed inset-x-3 bottom-[78px] z-[70] mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-950/5 md:hidden">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                            {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : <span className="text-sm font-black">{userInitials(user)}</span>}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-slate-900">{displayName}</p>
                            {user.email && <p className="truncate text-xs font-medium text-slate-500">{user.email}</p>}
                        </div>
                        <button type="button" onClick={() => setAccountOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-sm" aria-label="Close account menu">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid gap-1 p-2">
                        <Link href={route(dashboardRoute)} onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-slate-50">
                            <LayoutDashboard className="h-4 w-4 text-slate-500" />
                            My Dashboard
                        </Link>
                        <Link href={route('profile.edit')} onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-slate-50">
                            <Settings className="h-4 w-4 text-slate-500" />
                            Profile Settings
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </div>
                </div>
            )}

            <nav className="fixed inset-x-0 bottom-0 z-[65] border-t border-white/20 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] md:hidden" style={{ backgroundColor: bgColor, color: textColor }} aria-label="Mobile bottom navigation">
                <div className="mx-auto flex h-[68px] max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
                    {items.map(({ label, icon: Icon, href, action, count }) => {
                        const content = (
                            <>
                                <span className="relative grid h-7 w-7 place-items-center">
                                    <Icon className="h-6 w-6" strokeWidth={2.3} />
                                    {Number(count || 0) > 0 && (
                                        <span className="absolute -right-2 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black leading-none shadow-sm" style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}>
                                            {count > 99 ? '99+' : count}
                                        </span>
                                    )}
                                </span>
                                <span className="truncate">{label}</span>
                            </>
                        );

                        return href ? (
                            <Link key={label} href={href} className={itemClass}>
                                {content}
                            </Link>
                        ) : (
                            <button key={label} type="button" onClick={action} className={itemClass}>
                                {content}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
function DesktopCategoryMenu({ categories, open, setOpen, primaryColor = '#102f58' }) {
    const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
    const hoveredCategory = categories.find((category) => category.id === hoveredCategoryId);
    const hasSubcategories = hoveredCategory?.children?.length > 0;

    const closeMenu = () => {
        setOpen(false);
        setHoveredCategoryId(null);
    };

    return (
        <div className="relative hidden shrink-0 lg:block" onMouseEnter={() => setOpen(true)} onMouseLeave={closeMenu}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-[42px] xl:h-[46px] items-center gap-1.5 xl:gap-2 rounded-full px-3.5 xl:px-5 text-xs xl:text-sm font-bold text-white whitespace-nowrap transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Menu className="h-4 w-4" />
                Categories
                <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 flex items-stretch pt-2" role="menu">
                    <div className={`w-72 border border-slate-200 bg-white py-2 shadow-2xl ${hasSubcategories ? 'rounded-l-2xl' : 'rounded-2xl'}`}>
                        {categories.length > 0 ? categories.map((category) => {
                            const active = hoveredCategoryId === category.id;
                            const childrenCount = category.children?.length || 0;
                            return (
                                <div key={category.id} onMouseEnter={() => setHoveredCategoryId(category.id)} onFocus={() => setHoveredCategoryId(category.id)}>
                                    <Link
                                        href={category.slug ? route('category.show', { slug: category.slug }) : '#'}
                                        className={`flex min-h-11 items-center justify-between gap-3 px-5 py-3 text-sm font-semibold transition ${active ? 'bg-slate-50 text-[#ff4b19]' : 'text-slate-800 hover:bg-slate-50 hover:text-[#ff4b19]'}`}
                                    >
                                        <span className="min-w-0 flex-1 truncate">{category.name}</span>
                                        {childrenCount > 0 && <ChevronRight className={`h-4 w-4 shrink-0 transition ${active ? 'translate-x-0.5 text-[#ff4b19]' : 'text-slate-400'}`} />}
                                    </Link>
                                </div>
                            );
                        }) : <p className="px-5 py-4 text-sm text-slate-500">No featured categories</p>}
                    </div>

                    {hasSubcategories && (
                        <div className="flex w-80 flex-col rounded-r-2xl border border-l-0 border-slate-200 bg-white p-5 shadow-2xl">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#ff4b19]">Sub categories</p>
                            <h3 className="mt-1.5 text-base font-extrabold text-[#102f58]">{hoveredCategory.name}</h3>
                            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                                {hoveredCategory.children.map((child) => (
                                    <Link key={child.id} href={child.slug ? route('category.show', { slug: child.slug }) : '#'} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-[#fff4f0] hover:text-[#ff4b19]">
                                        <span className="min-w-0 flex-1 truncate">{child.name}</span>
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                    </Link>
                                ))}
                            </div>
                            <Link href={hoveredCategory?.slug ? route('category.show', { slug: hoveredCategory.slug }) : '#'} className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-[#102f58] hover:text-[#ff4b19]">
                                View all in {hoveredCategory.name} <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MobileMenu({ categories, items, expanded, setExpanded, onClose }) {
    return <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm" onClick={onClose}><aside className="h-full w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b pb-4"><strong className="text-lg text-[#102f58]">Menu</strong><button onClick={onClose} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div><div className="py-3">{items.map((item) => <Link key={item.label} href={item.href} onClick={onClose} className="block border-b py-3 text-sm font-bold">{item.label}</Link>)}</div><h3 className="mt-4 text-xs font-extrabold uppercase text-slate-500">Browse categories</h3>{categories.map((category) => <div key={category.id} className="border-b"><div className="flex items-center"><Link href={category.slug ? route('category.show', { slug: category.slug }) : '#'} className="flex-1 py-3 text-sm font-semibold">{category.name}</Link>{category.children?.length > 0 && <button onClick={() => setExpanded(expanded === category.id ? null : category.id)} className="p-3"><ChevronDown className="h-4 w-4" /></button>}</div>{expanded === category.id && category.children?.map((child) => <Link key={child.id} href={child.slug ? route('category.show', { slug: child.slug }) : '#'} className="block py-2 pl-4 text-sm text-slate-500">{child.name}</Link>)}</div>)}</aside></div>;
}

function CartDrawer({ items, subtotal, onClose, remove, update, money }) {
    const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/55" onClick={onClose}>
            <aside
                className="ml-auto flex h-full w-full max-w-[450px] flex-col bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-[#ff4b19]" />
                        <h2 className="text-lg font-black text-slate-800">Shopping Cart ({cartCount})</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close cart"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {items.length === 0 ? (
                        <Empty icon={ShoppingCart} text="Your cart is empty" />
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
                                return (
                                    <div key={item.cartId} className="grid grid-cols-[66px_1fr_auto] gap-3">
                                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-slate-50 object-cover" />
                                        <div className="min-w-0">
                                            <Link href={route('product.show', { slug: item.slug })} onClick={onClose} className="line-clamp-1 text-sm font-black text-slate-800 hover:text-[#ff4b19]">
                                                {item.name}
                                            </Link>
                                            <div className="mt-3 inline-flex h-7 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                                <button type="button" onClick={() => update(item.cartId, item.quantity - 1)} className="grid w-8 place-items-center text-slate-500 hover:bg-white">
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="grid min-w-8 place-items-center border-x border-slate-200 px-2 text-sm font-bold text-slate-700">{item.quantity}</span>
                                                <button type="button" onClick={() => update(item.cartId, item.quantity + 1)} className="grid w-8 place-items-center text-slate-500 hover:bg-white">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between gap-3">
                                            <button type="button" onClick={() => remove(item.cartId)} className="text-slate-300 transition hover:text-red-500" aria-label="Remove item">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <span className="whitespace-nowrap text-sm font-black text-slate-800">{money(lineTotal)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Promo Code (LAUNCH15)"
                            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-[#ff4b19] focus:ring-2 focus:ring-orange-100"
                        />
                        <button type="button" className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-[#102f58]">
                            Apply
                        </button>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-700">{money(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Estimated Delivery</span>
                            <span className="text-xs italic text-slate-400">Calculated at Checkout</span>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-base font-black text-slate-800">Total</span>
                        <span className="text-xl font-black text-[#ff4b19]">{money(subtotal)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                        <Link href={route('cart.index')} onClick={onClose} className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:h-14 sm:text-sm sm:font-bold">
                            View Full Cart
                        </Link>
                        <Link href={route('checkout.index')} onClick={onClose} className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[#ff6a13] px-2 text-xs font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-[#f04f12] sm:h-14 sm:gap-2 sm:text-sm sm:font-bold">
                            <span className="sm:hidden">Checkout</span><span className="hidden sm:inline">Proceed to Checkout</span> <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    );
}
function WishlistDrawer({ items, onClose, onRemove, money }) {
    return <div className="fixed inset-0 z-[70] bg-slate-950/60" onClick={onClose}><aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white" onClick={(e) => e.stopPropagation()}><DrawerTitle title="My Wishlist" onClose={onClose} /><div className="flex-1 overflow-y-auto p-5">{items.length === 0 ? <Empty icon={Heart} text="No saved products yet" /> : <div className="space-y-3">{items.map((item) => <div key={item.wishlistId} className="flex items-center gap-3 rounded-2xl border p-3"><img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" /><Link href={route('product.show', { slug: item.slug })} className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-semibold">{item.name}</h3><p className="text-sm font-bold text-[#ff4b19]">{money(item.price)}</p></Link><button onClick={() => onRemove(item.wishlistId)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></div>)}</div>}</div></aside></div>;
}

function DrawerTitle({ title, onClose }) { return <div className="flex items-center justify-between border-b p-5"><h2 className="font-bold text-[#102f58]">{title}</h2><button onClick={onClose} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div>; }
function Empty({ icon: Icon, text }) { return <div className="grid h-full place-items-center text-center"><div><Icon className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-3 font-semibold">{text}</p></div></div>; }














