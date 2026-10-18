import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight, 
    Flame,
    GitCompare, 
    Heart, 
    Home, 
    Info, 
    LayoutDashboard, 
    LogOut,
    Mail, 
    MapPin, 
    Menu, 
    Minus, 
    Phone, 
    Plus, 
    Search, 
    Settings,
    ShieldCheck,
    ShoppingBag, 
    ShoppingCart, 
    Sparkles,
    Tag,
    Trash2, 
    Truck,
    User, 
    X 
} from 'lucide-react';
import { useCart } from '../Contexts/CartContext';
import { getWishlistItems, removeWishlistProduct } from '../Services/Wishlist';
import { compareUrl, getCompareItems } from '../Services/Compare';
import { Tracker } from '../Services/Tracker';
import MultipleChatPlugin from '../Components/MultipleChatPlugin';
const defaultRoseNavItems = [
    { title: 'Home', link: '/', visible: true },
    { title: 'Collections', link: '/main-categories', visible: true },
    { title: 'Jamdani Sarees', link: '/category/jamdani', visible: true },
    { title: 'Lehengas', link: '/category/lehengas', visible: true },
    { title: 'About Us', link: '#about', visible: true },
    { title: 'Contact', link: '#contact', visible: true },
];

const parseHeaderNavItems = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return defaultRoseNavItems;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length ? parsed : defaultRoseNavItems;
    } catch {
        return defaultRoseNavItems;
    }
};

const getNavMeta = (title = '') => {
    const lower = String(title || '').toLowerCase();
    if (lower.includes('home')) {
        return { icon: Home, badge: null };
    }
    if (lower.includes('jamdani')) {
        return { icon: Sparkles, badge: { text: 'Exclusive', color: 'bg-amber-50 text-amber-700 border-amber-200' } };
    }
    if (lower.includes('lehenga')) {
        return { icon: Flame, badge: { text: 'Trending', color: 'bg-rose-50 text-rose-700 border-rose-200' } };
    }
    if (lower.includes('collection') || lower.includes('category') || lower.includes('saree')) {
        return { icon: Sparkles, badge: { text: 'New', color: 'bg-purple-50 text-purple-700 border-purple-200' } };
    }
    if (lower.includes('about')) {
        return { icon: Info, badge: null };
    }
    if (lower.includes('contact')) {
        return { icon: Phone, badge: null };
    }
    return { icon: Tag, badge: null };
};

export default function ShopLayout({ children, hideMobileBottomNav = false }) {
    const page = usePage();
    const { auth, flash, global_settings = {} } = page.props;
    const currentUrl = page.url || '/';
    const { cartItems, cartCount, subtotal, removeFromCart, updateQty } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [compareItems, setCompareItems] = useState([]);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [notice, setNotice] = useState(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
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

    const primaryColor = global_settings.primary_color || global_settings.theme_primary || '#e11d48';
    const storeName = global_settings.theme_name || global_settings.store_name || global_settings.site_title || 'Rose Fashion';
    const logo = global_settings.header_logo_image || global_settings.store_logo || global_settings.logo || '/logo.png';
    const phone = global_settings.contact_phone || '+880 1700-000000';
    const email = global_settings.contact_email || 'support@rosefashionbd.com';
    const address = global_settings.store_address_1 || global_settings.contact_address || 'Shop #214 (New Market Area), Dhaka New Market, Dhaka-1205, Bangladesh';
    const headerStickySetting = String(global_settings.header_sticky ?? global_settings.header_sticky_status ?? 'true');
    const headerSticky = !['false', '0', 'no', 'disabled'].includes(headerStickySetting.toLowerCase());

    const mobileBottomNavEnabled = String(global_settings.mobile_bottom_nav_status || 'enabled') !== 'disabled';
    const mobileBottomNavBgColor = global_settings.mobile_bottom_nav_bg_color || '#102f58';
    const mobileBottomNavTextColor = global_settings.mobile_bottom_nav_text_color || '#ffffff';
    const mobileBottomNavBadgeBgColor = global_settings.mobile_bottom_nav_badge_bg_color || '#e11d48';
    const mobileBottomNavBadgeTextColor = global_settings.mobile_bottom_nav_badge_text_color || '#ffffff';
    const mobileBottomNavFontWeight = global_settings.mobile_bottom_nav_font_weight || 'semibold';
    const showMobileNavHome = String(global_settings.mobile_bottom_nav_show_home || 'true') !== 'false';
    const showMobileNavMenu = String(global_settings.mobile_bottom_nav_show_menu || 'true') !== 'false';
    const showMobileNavCart = String(global_settings.mobile_bottom_nav_show_cart || 'true') !== 'false';
    const showMobileNavCompare = String(global_settings.mobile_bottom_nav_show_compare || 'true') !== 'false';
    const showMobileNavSearch = String(global_settings.mobile_bottom_nav_show_search || 'true') !== 'false';
    const showMobileNavAccount = String(global_settings.mobile_bottom_nav_show_account || 'true') !== 'false';

    const facebookUrl = global_settings.footer_facebook || "https://www.facebook.com/share/18Ttrev5mS/";
    const announcementText = global_settings.announcement_text || "✨ Welcome to Rose Fashion (Dhaka New Market)! Enjoy Nationwide Delivery across Bangladesh.";
    const announcementLink = global_settings.announcement_link || facebookUrl;
    const announcementLinkText = global_settings.announcement_link_text || "Message on FB to Order!";

    const navItems = parseHeaderNavItems(global_settings.header_nav_items).filter(item => item.visible !== false);
    const showSocialButton = String(global_settings.header_show_social_button ?? 'true') !== 'false';
    const socialButtonText = global_settings.header_social_button_text || 'FB Page';
    const socialButtonUrl = global_settings.header_social_button_url || facebookUrl;

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
            if (!mobileSearchRef.current?.contains(event.target)) setSuggestions([]);
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
        const unsubscribe = router.on('navigate', () => { 
            setMenuOpen(false); 
            setCartOpen(false); 
            setWishlistOpen(false); 
            setMobileSearchOpen(false); 
        });
        return () => unsubscribe();
    }, [global_settings]);

    useEffect(() => {
        if (!mobileSearchOpen) return;
        window.setTimeout(() => mobileSearchInputRef.current?.focus(), 80);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMobileSearchOpen(false);
                setSuggestions([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileSearchOpen]);

    const submitSearch = (event) => {
        event.preventDefault();
        if (suggestions[0]) {
            setMobileSearchOpen(false);
            router.visit(route('product.show', { slug: suggestions[0].slug }));
        }
    };

    const money = (value) => `${global_settings.currency_symbol || '\u09F3'} ${Number(value || 0).toLocaleString('en-BD')}`;

    const announcementEnabled = String(global_settings.announcement_bar_status || 'enabled') !== 'disabled';

    return (
        <div className={`${mobileBottomNavEnabled ? 'pb-20 md:pb-0' : ''} min-h-screen overflow-x-clip bg-slate-50 text-slate-900`}>
            {/* Top Announcement Bar */}
            {announcementEnabled && announcementText && (
                <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide relative z-40">
                    <span>{announcementText} </span>
                    {announcementLink && (
                        <a
                            href={announcementLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline ml-2 hover:text-rose-200 transition font-semibold"
                        >
                            {announcementLinkText}
                        </a>
                    )}
                </div>
            )}

            {/* Rose Fashion Header */}
            <header ref={headerRef} className={`${headerSticky ? 'sticky top-0' : 'relative'} z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-rose-100/60 transition-all duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 relative">
                        {/* Left: Mobile Menu Toggle on Mobile, Brand Logo on Desktop */}
                        <div className="flex items-center">
                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="lg:hidden p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer active:scale-95"
                                aria-label="Toggle Menu"
                            >
                                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {/* Desktop Brand Logo */}
                            <div className="hidden lg:flex items-center">
                                <Link href={route('home')} className="group flex items-center">
                                    <img
                                        src={logo}
                                        alt={storeName}
                                        onError={(e) => {
                                            if (!e.currentTarget.src.endsWith('/logo.png')) {
                                                e.currentTarget.src = '/logo.png';
                                            }
                                        }}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md group-hover:scale-110 transition duration-300"
                                    />
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Centered Logo */}
                        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto">
                            <Link href={route('home')} className="group flex items-center">
                                <img
                                    src={logo}
                                    alt={storeName}
                                    onError={(e) => {
                                        if (!e.currentTarget.src.endsWith('/logo.png')) {
                                            e.currentTarget.src = '/logo.png';
                                        }
                                    }}
                                    className="w-14 h-14 rounded-full object-cover shadow-md group-hover:scale-110 transition duration-300"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-700">
                            {navItems.map((item, index) => {
                                const isInternal = item.link && item.link.startsWith('/') && !item.link.startsWith('//');
                                const isHome = item.link === '/' || item.link === route('home');
                                const activeClass = isHome ? 'text-rose-600 font-semibold hover:text-rose-700' : 'hover:text-rose-600';

                                if (isInternal) {
                                    return (
                                        <Link
                                            key={`${item.title}-${index}`}
                                            href={item.link}
                                            className={`${activeClass} transition`}
                                        >
                                            {item.title}
                                        </Link>
                                    );
                                }
                                return (
                                    <a
                                        key={`${item.title}-${index}`}
                                        href={item.link}
                                        className={`${activeClass} transition`}
                                    >
                                        {item.title}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Actions: Search, Cart & Desktop Social Pill */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => setMobileSearchOpen(true)}
                                className="p-2.5 text-slate-600 hover:text-rose-600 transition rounded-full hover:bg-rose-50 transform hover:scale-110 cursor-pointer"
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCartOpen(true)}
                                className="relative p-2.5 text-slate-600 hover:text-rose-600 transition rounded-full hover:bg-rose-50 transform hover:scale-110 cursor-pointer"
                                title="Shopping Bag"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow animate-pulse">
                                    {cartCount}
                                </span>
                            </button>

                            {/* Dynamic Social Action Pill Button */}
                            {showSocialButton && (
                                <a
                                    href={socialButtonUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-sm hover:shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span>{socialButtonText}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            {/* Rose Fashion Footer */}
            <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
                        {/* Col 1: Brand Info */}
                        <div className="space-y-4">
                            <img
                                src={logo}
                                alt={storeName}
                                onError={(e) => {
                                    if (!e.currentTarget.src.endsWith('/logo.png')) {
                                        e.currentTarget.src = '/logo.png';
                                    }
                                }}
                                className="w-14 h-14 rounded-full object-cover shadow-md"
                            />
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                Your premium boutique for Jamdani sarees, bridal lehengas, and designer drapes. Located in the heart of Dhaka New Market.
                            </p>
                            <div className="pt-2">
                                <a
                                    href={facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow"
                                >
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span>Follow Facebook Page</span>
                                </a>
                            </div>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div>
                            <h4 className="font-serif text-white font-bold text-base mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href={route('home')} className="hover:text-rose-500 transition">Home</Link></li>
                                <li><a href="#collections" className="hover:text-rose-500 transition">Collections</a></li>
                                <li><a href="#shop-products" className="hover:text-rose-500 transition">Jamdani Sarees</a></li>
                                <li><a href="#shop-products" className="hover:text-rose-500 transition">Bridal Lehengas</a></li>
                                <li><a href="#about" className="hover:text-rose-500 transition">About Us</a></li>
                            </ul>
                        </div>

                        {/* Col 3: Categories / Specialities */}
                        <div>
                            <h4 className="font-serif text-white font-bold text-base mb-4">Our Specialities</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#shop-products" className="hover:text-rose-500 transition">Handloom Jamdani</a></li>
                                <li><a href="#shop-products" className="hover:text-rose-500 transition">Party Lehengas</a></li>
                                <li><a href="#shop-products" className="hover:text-rose-500 transition">Katan & Silk Sarees</a></li>
                            </ul>
                        </div>

                        {/* Col 4: Contact & Location */}
                        <div className="space-y-3">
                            <h4 className="font-serif text-white font-bold text-base mb-4">Store Location</h4>
                            <p className="text-xs sm:text-sm text-slate-400 flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                <span>{address || "Shop #214 (New Market Area), Dhaka New Market, Dhaka-1205, Bangladesh"}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>{phone || "+880 1700-000000"}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>{email || "support@rosefashionbd.com"}</span>
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved. Dhaka New Market.</p>
                        <div className="flex space-x-6 mt-4 sm:mt-0">
                            <a href="#" className="hover:text-rose-400 transition">Privacy Policy</a>
                            <a href="#" className="hover:text-rose-400 transition">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>


            {mobileSearchOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-xs flex flex-col md:items-center md:justify-start md:p-6 md:pt-20 transition-all duration-200"
                    onClick={() => { setMobileSearchOpen(false); setSuggestions([]); }}
                >
                    <div
                        ref={mobileSearchRef}
                        className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[80vh] md:max-w-2xl md:rounded-3xl md:shadow-2xl md:border md:border-slate-100 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 pb-3 pt-4 shadow-xs backdrop-blur md:px-6 md:py-4">
                            <div className="flex items-center gap-3">
                                <form onSubmit={submitSearch} className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-rose-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-600/10">
                                    <Search className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2.2} />
                                    <input
                                        ref={mobileSearchInputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search sarees, lehengas, bridal collection..."
                                        className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] font-medium text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-0"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => { setQuery(''); setSuggestions([]); }}
                                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200/70 text-slate-500 hover:bg-slate-200"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" strokeWidth={2.5} />
                                        </button>
                                    )}
                                </form>
                                <button
                                    type="button"
                                    onClick={() => { setMobileSearchOpen(false); setSuggestions([]); }}
                                    className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                                    aria-label="Close search"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">Search products</h3>
                                    <p className="text-xs font-medium text-slate-400">Find what you need quickly</p>
                                </div>
                                {query && <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{suggestions.length} found</span>}
                            </div>
                            <SearchSuggestions suggestions={suggestions} money={money} onSelect={() => { setSuggestions([]); setMobileSearchOpen(false); }} mobile />
                            {query && suggestions.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-700">No products found for "{query}"</p>
                                    <p className="mt-1 text-xs text-slate-400">Try searching for Jamdani, Lehenga, Silk, etc.</p>
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

            {cartOpen && <CartDrawer items={cartItems} subtotal={subtotal} onClose={() => setCartOpen(false)} remove={removeFromCart} update={updateQty} money={money} />}
            {wishlistOpen && <WishlistDrawer items={wishlistItems} onClose={() => setWishlistOpen(false)} onRemove={(id) => { removeWishlistProduct(id); setWishlistItems(getWishlistItems()); }} money={money} />}
            {menuOpen && (
                <MobileMenuDrawer
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    logo={logo}
                    storeName={storeName}
                    phone={phone}
                    address={address}
                    navItems={navItems}
                    showSocialButton={showSocialButton}
                    socialButtonText={socialButtonText}
                    socialButtonUrl={socialButtonUrl}
                    cartCount={cartCount}
                    onCartOpen={() => setCartOpen(true)}
                    auth={auth}
                />
            )}
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
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-sm font-extrabold text-[#00aeef]">{money(item.sale_price || item.price).replace(/\s+/g, '')}</span>
                                {item.sale_price && Number(item.sale_price) < Number(item.price) && (
                                    <span className="text-xs text-slate-400 line-through">{money(item.price).replace(/\s+/g, '')}</span>
                                )}
                            </div>
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
                    <div className="shrink-0 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#ff4b19]">{money(item.sale_price || item.price)}</span>
                        {item.sale_price && Number(item.sale_price) < Number(item.price) && (
                            <span className="text-xs text-slate-400 line-through">{money(item.price)}</span>
                        )}
                    </div>
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

function MobileMenuDrawer({ 
    open, 
    onClose, 
    logo, 
    storeName, 
    phone, 
    address, 
    navItems, 
    showSocialButton, 
    socialButtonText, 
    socialButtonUrl, 
    cartCount, 
    onCartOpen, 
    auth 
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
            {/* Dark Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Solid Drawer Panel */}
            <div 
                className="relative w-[85vw] max-w-[320px] h-[100dvh] bg-white flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-250"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Compact Branded Header */}
                <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 text-white px-4 py-3 flex items-center justify-between border-b border-rose-800/40 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <img
                            src={logo}
                            alt={storeName}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                            }}
                            className="w-9 h-9 rounded-full object-cover bg-white ring-2 ring-rose-400/50 shadow-sm"
                        />
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-white leading-tight flex items-center gap-1">
                                {storeName}
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            </h3>
                            <p className="text-[10px] text-rose-200/90 font-medium">
                                Dhaka New Market
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-rose-100 flex items-center justify-center transition active:scale-90"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Quick Info Bar */}
                <div className="bg-rose-50/70 border-b border-rose-100/80 px-4 py-1.5 flex items-center justify-between text-xs shrink-0">
                    <a href={`tel:${phone}`} className="flex items-center gap-1.5 font-bold text-rose-700 hover:text-rose-800">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{phone}</span>
                    </a>
                    <button 
                        type="button" 
                        onClick={() => { onClose(); onCartOpen(); }}
                        className="flex items-center gap-1 font-bold text-slate-700 hover:text-rose-600"
                    >
                        <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bag ({cartCount})</span>
                    </button>
                </div>

                {/* Main Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
                    
                    {/* Navigation Menu Links */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2">
                            Menu Navigation
                        </p>
                        <nav className="space-y-1">
                            {navItems.map((item, index) => {
                                const isInternal = item.link && item.link.startsWith('/') && !item.link.startsWith('//');
                                const isHome = item.link === '/' || item.link === route('home');
                                const meta = getNavMeta(item.title);
                                const IconComp = meta.icon;

                                const content = (
                                    <>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                                                isHome ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-700'
                                            }`}>
                                                <IconComp className="w-4 h-4" />
                                            </span>
                                            <span className={`text-[13px] font-bold truncate ${
                                                isHome ? 'text-rose-700 font-extrabold' : 'text-slate-800 group-hover:text-rose-700'
                                            }`}>
                                                {item.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {meta.badge && (
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${meta.badge.color}`}>
                                                    {meta.badge.text}
                                                </span>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </>
                                );

                                if (isInternal) {
                                    return (
                                        <Link
                                            key={`m-${item.title}-${index}`}
                                            href={item.link}
                                            onClick={onClose}
                                            className={`group flex items-center justify-between p-2 rounded-xl transition ${
                                                isHome ? 'bg-rose-50 border border-rose-200/80 shadow-xs' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <a
                                        key={`m-${item.title}-${index}`}
                                        href={item.link}
                                        onClick={onClose}
                                        className="group flex items-center justify-between p-2 rounded-xl transition hover:bg-slate-50"
                                    >
                                        {content}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Popular Categories Chips */}
                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center justify-between">
                            <span>Top Categories</span>
                            <Sparkles className="w-3 h-3 text-rose-500" />
                        </p>
                        <div className="flex flex-wrap gap-1.5 px-0.5">
                            {[
                                { label: 'Jamdani Sarees', link: '/category/jamdani' },
                                { label: 'Bridal Lehengas', link: '/category/lehengas' },
                                { label: 'Designer Sarees', link: '/category/designer-sarees' },
                                { label: 'All Collections', link: '/main-categories' },
                            ].map((chip, idx) => (
                                <Link
                                    key={idx}
                                    href={chip.link}
                                    onClick={onClose}
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition"
                                >
                                    {chip.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Showroom & Delivery Trust Card */}
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 space-y-1.5 text-slate-700">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium leading-snug">
                                {address}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1 text-emerald-700">
                                <Truck className="w-3 h-3" /> Cash on Delivery
                            </span>
                            <span className="flex items-center gap-1 text-rose-700">
                                <ShieldCheck className="w-3 h-3" /> Authentic Quality
                            </span>
                        </div>
                    </div>

                </div>

                {/* Sticky Footer of Drawer */}
                <div className="p-3 border-t border-slate-100 bg-white space-y-2 shrink-0">
                    {showSocialButton && (
                        <a
                            href={socialButtonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition active:scale-98 w-full"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <span>{socialButtonText}</span>
                        </a>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>📞 {phone}</span>
                        <Link
                            href={auth?.user ? route('customer.dashboard') : route('login')}
                            onClick={onClose}
                            className="text-rose-600 font-bold hover:underline"
                        >
                            {auth?.user ? 'My Account' : 'Customer Login'}
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

function CartDrawer({ items, subtotal, onClose, remove, update, money }) {
    const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Dark Backdrop with smooth fade-in */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-in Drawer Panel */}
            <aside
                className="relative ml-auto flex h-[100dvh] w-[86vw] sm:w-full max-w-[420px] flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5 sm:px-6 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <ShoppingBag className="h-5 w-5 text-rose-600" />
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Shopping Cart</h2>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer active:scale-95"
                        aria-label="Close cart"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
                    {items.length === 0 ? (
                        <Empty icon={ShoppingBag} text="Your cart is empty" />
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
                                return (
                                    <div key={item.cartId} className="grid grid-cols-[66px_1fr_auto] gap-3">
                                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-slate-50 object-cover" />
                                        <div className="min-w-0">
                                            <Link href={route('product.show', { slug: item.slug })} onClick={onClose} className="line-clamp-1 text-sm font-bold text-slate-800 hover:text-rose-600">
                                                {item.name}
                                            </Link>
                                            <div className="mt-3 inline-flex h-7 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                                <button type="button" onClick={() => update(item.cartId, item.quantity - 1)} className="grid w-8 place-items-center text-slate-500 hover:bg-white cursor-pointer active:scale-90">
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="grid min-w-8 place-items-center border-x border-slate-200 px-2 text-sm font-bold text-slate-700">{item.quantity}</span>
                                                <button type="button" onClick={() => update(item.cartId, item.quantity + 1)} className="grid w-8 place-items-center text-slate-500 hover:bg-white cursor-pointer active:scale-90">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between gap-3">
                                            <button type="button" onClick={() => remove(item.cartId)} className="text-slate-300 transition hover:text-red-500 cursor-pointer active:scale-90" aria-label="Remove item">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <span className="whitespace-nowrap text-sm font-bold text-slate-900">{money(lineTotal)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-white px-5 sm:px-6 pb-6 pt-5 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Promo Code (ROSE10)"
                            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                        />
                        <button type="button" className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-rose-950 cursor-pointer active:scale-95">
                            Apply
                        </button>
                    </div>

                    <div className="mt-4 space-y-2.5 text-sm">
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-800">{money(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Estimated Delivery</span>
                            <span className="text-xs italic text-slate-400">Calculated at Checkout</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-base font-bold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-rose-600">{money(subtotal)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                        <Link href={route('cart.index')} onClick={onClose} className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:h-14 sm:text-sm sm:font-bold">
                            View Full Cart
                        </Link>
                        <Link href={route('checkout.index')} onClick={onClose} className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 sm:h-14 sm:gap-2 sm:text-sm sm:font-bold active:scale-95">
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














