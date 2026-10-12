import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Breadcrumb from '../Components/Breadcrumb';
import AdminFooter from '../Components/AdminFooter';
import { 
    LayoutDashboard, ShoppingBag, FolderOpen, Truck, LayoutTemplate, Settings, 
    Home, LogOut, Menu, X, User, Users, ChevronDown, ChevronRight, ChevronLeft, Package, Circle, 
    CreditCard, Ticket, Zap, Calendar, Megaphone, FileText, Palette, Bell, ExternalLink, Check, Search, Sparkles, ArrowRight, Ruler, BadgeCheck,
    MessageSquare
} from 'lucide-react';

/**
 * AnimatedAccordion — renders children in a max-height animated container
 * so the submenu slides open/closed smoothly without jarring jumps.
 */
function AnimatedAccordion({ isOpen, children }) {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen]);

    return (
        <div
            style={{
                maxHeight: `${height}px`,
                overflow: 'hidden',
                transition: 'max-height 280ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
}

const themes = {
    sunset: {
        name: 'Sunset Glow',
        primary: '#f97316',
        primaryHover: '#ea580c',
        primaryLight: 'rgba(249, 115, 22, 0.1)',
        primaryShadow: 'rgba(249, 115, 22, 0.2)',
        accent: '#14b8a6',
        accentLight: 'rgba(20, 184, 166, 0.1)',
        sidebarBg: '#0f172a', // slate-900
        sidebarHover: '#1e293b', // slate-800
        sidebarText: '#94a3b8', // slate-400
        sidebarActiveBg: '#f97316', // orange-500
        sidebarActiveText: '#ffffff',
        cardHeader: '#f8fafc',
    },
    emerald: {
        name: 'Emerald Forest',
        primary: '#10b981',
        primaryHover: '#059669',
        primaryLight: 'rgba(16, 185, 129, 0.1)',
        primaryShadow: 'rgba(16, 185, 129, 0.2)',
        accent: '#06b6d4',
        accentLight: 'rgba(6, 182, 212, 0.1)',
        sidebarBg: '#064e3b', // emerald-950
        sidebarHover: '#0f766e', // teal-700
        sidebarText: '#a7f3d0', // emerald-200
        sidebarActiveBg: '#10b981',
        sidebarActiveText: '#ffffff',
        cardHeader: '#f0fdf4',
    },
    ocean: {
        name: 'Ocean Breeze',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryLight: 'rgba(59, 130, 246, 0.1)',
        primaryShadow: 'rgba(59, 130, 246, 0.2)',
        accent: '#ec4899',
        accentLight: 'rgba(236, 72, 153, 0.1)',
        sidebarBg: '#172554', // blue-950
        sidebarHover: '#1e40af', // blue-800
        sidebarText: '#bfdbfe', // blue-200
        sidebarActiveBg: '#3b82f6',
        sidebarActiveText: '#ffffff',
        cardHeader: '#eff6ff',
    },
    purple: {
        name: 'Purple Dusk',
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryLight: 'rgba(139, 92, 246, 0.1)',
        primaryShadow: 'rgba(139, 92, 246, 0.2)',
        accent: '#f43f5e',
        accentLight: 'rgba(244, 63, 94, 0.1)',
        sidebarBg: '#2e1065', // violet-950
        sidebarHover: '#4c1d95', // violet-900
        sidebarText: '#ddd6fe', // violet-200
        sidebarActiveBg: '#8b5cf6',
        sidebarActiveText: '#ffffff',
        cardHeader: '#faf5ff',
    },
    dark: {
        name: 'Nordic Charcoal',
        primary: '#a78bfa', // light violet
        primaryHover: '#8b5cf6',
        primaryLight: 'rgba(167, 139, 250, 0.15)',
        primaryShadow: 'rgba(167, 139, 250, 0.25)',
        accent: '#f43f5e',
        accentLight: 'rgba(244, 63, 94, 0.15)',
        sidebarBg: '#090d16', // pitch dark
        sidebarHover: '#1e293b',
        sidebarText: '#cbd5e1',
        sidebarActiveBg: '#8b5cf6',
        sidebarActiveText: '#ffffff',
        cardHeader: '#1e293b',
    }
};

export default function AdminLayout({ children }) {
    const { auth, flash, global_settings, admin_notifications = [] } = usePage().props;
    const storeName = global_settings?.theme_name || global_settings?.store_name || global_settings?.site_title || global_settings?.header_logo_text || 'Online Store';
    const storeIcon = global_settings?.store_logo || global_settings?.favicon || global_settings?.header_logo_image || '';
    const [storeIconFailed, setStoreIconFailed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('govaly-admin-sidebar-collapsed') === 'true';
        }
        return false;
    });
    const [currentTheme, setCurrentTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('govaly-admin-theme');
            if (saved && themes[saved]) return saved;
        }
        return 'sunset';
    });

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isQuicklinksOpen, setIsQuicklinksOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState(null);

    useEffect(() => {
        setStoreIconFailed(false);
    }, [storeIcon]);
    const [flashToast, setFlashToast] = useState(null);
    const isSizeChartsRoute = route().current('admin.size-charts') || route().current('admin.size-charts.create') || route().current('admin.size-charts.edit');

    const [notifications, setNotifications] = useState(admin_notifications || []);

    useEffect(() => {
        setNotifications(admin_notifications || []);
    }, [admin_notifications]);

    const [expandedGroups, setExpandedGroups] = useState({
        'Catalog': route().current('admin.products') || route().current('admin.categories') || route().current('admin.brands') || route().current('admin.price-units') || route().current('admin.weight-units') || route().current('admin.reviews') || isSizeChartsRoute,
        'Sales & Orders': route().current('admin.orders') || route().current('admin.orders.show') || route().current('admin.quotation-requests') || route().current('admin.couriers') || route().current('admin.shipping-methods') || route().current('admin.order-statuses') || route().current('admin.invoices'),
        'Theme Customizer': route().current('admin.theme-customize') || route().current('admin.page-builder') || route().current('admin.pages')
    });

    useEffect(() => {
        // Add window listener to close dropdowns when clicking outside
        const closeDropdowns = () => {
            setIsNotificationOpen(false);
            setIsProfileOpen(false);
            setIsQuicklinksOpen(false);
            setIsColorPickerOpen(false);
        };
        window.addEventListener('click', closeDropdowns);
        return () => window.removeEventListener('click', closeDropdowns);
    }, []);

    useEffect(() => {
        if (flash?.success) {
            setFlashToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setFlashToast({ type: 'error', message: flash.error });
        } else {
            return;
        }

        const timer = setTimeout(() => {
            setFlashToast(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [flash]);

    const toggleGroup = (name) => {
        setExpandedGroups(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleSidebarToggle = () => {
        const nextState = !isSidebarCollapsed;
        setIsSidebarCollapsed(nextState);
        localStorage.setItem('govaly-admin-sidebar-collapsed', String(nextState));
    };

    const selectTheme = (themeKey, e) => {
        e.stopPropagation();
        setCurrentTheme(themeKey);
        localStorage.setItem('govaly-admin-theme', themeKey);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('admin-theme-changed'));
        }
    };

    const markAllNotificationsRead = (e) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const toggleNotification = (e) => {
        e.stopPropagation();
        setIsNotificationOpen(prev => !prev);
        setIsProfileOpen(false);
        setIsQuicklinksOpen(false);
        setIsColorPickerOpen(false);
    };

    const toggleProfile = (e) => {
        e.stopPropagation();
        setIsProfileOpen(prev => !prev);
        setIsNotificationOpen(false);
        setIsQuicklinksOpen(false);
        setIsColorPickerOpen(false);
    };

    const toggleQuicklinks = (e) => {
        e.stopPropagation();
        setIsQuicklinksOpen(prev => !prev);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsColorPickerOpen(false);
    };

    const toggleColorPicker = (e) => {
        e.stopPropagation();
        setIsColorPickerOpen(prev => !prev);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsQuicklinksOpen(false);
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'admin.dashboard' },
        { 
            name: 'Catalog', 
            icon: ShoppingBag, 
            subItems: [
                { name: 'Products Catalog', route: 'admin.products' },
                { name: 'Categories Manager', route: 'admin.categories' },
                { name: 'Brands Manager', route: 'admin.brands', icon: BadgeCheck },
                { name: 'Price Unit', route: 'admin.price-units', icon: Circle },
                { name: 'Weight Unit', route: 'admin.weight-units', icon: Circle },
                { name: 'Product Reviews', route: 'admin.reviews' },
                { name: 'Size Charts', route: ['admin.size-charts', 'admin.size-charts.create', 'admin.size-charts.edit'], icon: Ruler }
            ] 
        },
        { 
            name: 'Sales & Orders', 
            icon: Truck, 
            subItems: [
                { name: 'All Orders', route: 'admin.orders', icon: Package },
                { name: 'Quotation Requests', route: 'admin.quotation-requests', icon: FileText },
                { name: 'Order Statuses', route: 'admin.order-statuses', icon: FolderOpen },
                { name: 'Shipping Methods', route: 'admin.shipping-methods', icon: Truck },
                { name: 'Couriers', route: 'admin.couriers', icon: Truck },
                { name: 'Invoices', route: 'admin.invoices', icon: FileText }
            ] 
        },
        { name: 'Users', icon: Users, route: 'admin.users' },
        { name: 'Payments', icon: CreditCard, route: 'admin.payment-methods' },
        { name: 'Coupons', icon: Ticket, route: 'admin.coupons' },
        { name: 'Flash Sales', icon: Zap, route: 'admin.flash-sales' },
        { name: 'Campaigns', icon: Calendar, route: 'admin.campaigns' },
        { name: 'Marketing Suite', icon: Megaphone, route: 'admin.marketing' },
        { 
            name: 'Theme Customizer', 
            icon: Palette, 
            subItems: [
                { name: 'Theme Customize', route: 'admin.theme-customize' },
                { name: 'Homepage Builder', route: 'admin.page-builder' },
                { name: 'Pages', route: 'admin.pages', icon: FileText }
            ] 
        },
        { 
            name: 'Store Settings', 
            icon: Settings, 
            subItems: [
                { name: 'General Settings', route: 'admin.settings', icon: Settings },
                { name: 'Multiple Chat Plugin', route: 'admin.settings', params: { tab: 'chat_plugin' }, icon: MessageSquare }
            ] 
        }
    ];

    const theme = themes[currentTheme] || themes.sunset;

    const routeMatches = (routeDef) => {
        if (Array.isArray(routeDef)) {
            return routeDef.some(name => route().current(name));
        }

        return route().current(routeDef);
    };

    const inlineThemeStyles = {
        '--admin-primary': theme.primary,
        '--admin-primary-hover': theme.primaryHover,
        '--admin-primary-light': theme.primaryLight,
        '--admin-primary-shadow': theme.primaryShadow,
        '--admin-accent': theme.accent,
        '--admin-accent-light': theme.accentLight,
        '--admin-sidebar-bg': theme.sidebarBg,
        '--admin-sidebar-hover': theme.sidebarHover,
        '--admin-sidebar-text': theme.sidebarText,
        '--admin-sidebar-active-bg': theme.sidebarActiveBg,
        '--admin-sidebar-active-text': theme.sidebarActiveText,
        '--admin-card-header': theme.cardHeader,
    };

    const renderMenuItem = (item, idx, onMobileClick = () => {}) => {
        const hasSubItems = !!item.subItems;
        const isGroupOpen = expandedGroups[item.name];
        const isActive = item.route && route().current(item.route);

        if (!hasSubItems) {
            return (
                <div key={idx} className="relative">
                    <Link
                        href={route(item.route)}
                        onClick={onMobileClick}
                        className={`flex items-center rounded-xl text-sm font-semibold transition-all admin-sidebar-item ${
                            isActive ? 'admin-sidebar-active-item' : ''
                        } ${isSidebarCollapsed ? 'justify-center w-full p-3' : 'gap-3 px-4 py-3'}`}
                        title={isSidebarCollapsed ? item.name : ''}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                </div>
            );
        }

        const isAnyChildActive = item.subItems.some(sub => routeMatches(sub.route));

        return (
            <div 
                key={idx} 
                className="relative flex flex-col gap-1"
                onMouseEnter={() => isSidebarCollapsed && setHoveredIdx(idx)}
                onMouseLeave={() => isSidebarCollapsed && setHoveredIdx(null)}
            >
                <button
                    onClick={() => !isSidebarCollapsed && toggleGroup(item.name)}
                    className={`flex items-center rounded-xl text-sm font-semibold transition-all admin-sidebar-item w-full ${
                        isAnyChildActive ? 'text-white font-bold' : ''
                    } ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}`}
                    title={isSidebarCollapsed ? item.name : ''}
                >
                    {isSidebarCollapsed ? (
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <>
                            <div className="flex items-center gap-3 min-w-0">
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate text-left">{item.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 admin-chevron flex-shrink-0 ${expandedGroups[item.name] ? 'open' : ''}`} />
                        </>
                    )}
                </button>
                
                {/* Collapsed Hover Submenu (popover) */}
                {hoveredIdx === idx && isSidebarCollapsed && (
                    <div 
                        className="absolute left-16 ml-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1"
                        style={{ 
                            backgroundColor: theme.sidebarBg, 
                            borderColor: theme.sidebarHover,
                            top: '0px'
                        }}
                    >
                        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1" style={{ borderColor: theme.sidebarHover }}>
                            {item.name}
                        </div>
                            {item.subItems.map((sub, subIdx) => {
                                const currentTabParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
                                const isSubActive = sub.params?.tab
                                    ? (routeMatches(sub.route) && currentTabParam === sub.params.tab)
                                    : (routeMatches(sub.route) && (!currentTabParam || currentTabParam === 'general'));
                                const SubIcon = sub.icon || Circle;
                                return (
                                    <Link
                                        key={subIdx}
                                        href={route(Array.isArray(sub.route) ? sub.route[0] : sub.route, sub.params || {})}
                                        onClick={onMobileClick}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all admin-sub-item"
                                        style={isSubActive ? { color: theme.accent, backgroundColor: `${theme.sidebarHover}50` } : {}}
                                >
                                    <SubIcon className="w-3.5 h-3.5 opacity-70" />
                                    {sub.name}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Expanded Sidebar Submenu — animated accordion */}
                {!isSidebarCollapsed && (
                    <AnimatedAccordion isOpen={!!isGroupOpen}>
                        <div className="pl-4 flex flex-col gap-0.5 pt-1 pb-1.5">
                            {item.subItems.map((sub, subIdx) => {
                                const currentTabParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
                                const isSubActive = sub.params?.tab
                                    ? (routeMatches(sub.route) && currentTabParam === sub.params.tab)
                                    : (routeMatches(sub.route) && (!currentTabParam || currentTabParam === 'general'));
                                const SubIcon = sub.icon || Circle;
                                return (
                                    <Link
                                        key={subIdx}
                                        href={route(Array.isArray(sub.route) ? sub.route[0] : sub.route, sub.params || {})}
                                        onClick={onMobileClick}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all admin-sub-item group`}
                                        style={isSubActive ? { color: '#ffffff', backgroundColor: `${theme.sidebarHover}50` } : {}}
                                    >
                                        <ArrowRight
                                            className="w-3 h-3 flex-shrink-0 opacity-50 transition-transform duration-150 group-hover:translate-x-1"
                                            style={isSubActive ? { color: '#ffffff', opacity: 1 } : {}}
                                        />
                                        {sub.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </AnimatedAccordion>
                )}
            </div>
        );
    };

    const unreadNotificationsCount = notifications.filter(n => n.unread).length;

    return (
        <div className="admin-panel min-h-screen bg-white flex font-sans transition-all duration-300" style={inlineThemeStyles}>
            {flashToast && (
                <div className="fixed right-6 top-6 z-[100] w-[min(92vw,420px)] rounded-2xl border bg-white px-4 py-3 shadow-2xl backdrop-blur-md animate-fadeIn"
                    style={{
                        borderColor: flashToast.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full"
                            style={{
                                backgroundColor: flashToast.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: flashToast.type === 'success' ? '#059669' : '#dc2626',
                            }}
                        >
                            {flashToast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
                                {flashToast.type === 'success' ? 'Success' : 'Error'}
                            </div>
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                                {flashToast.message}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFlashToast(null)}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Dismiss notification"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Dynamic CSS Overrides Injector */}
            <style dangerouslySetInnerHTML={{__html: `
                .admin-panel {
                    --primary-color: ${theme.primary} !important;
                }
                .admin-sidebar-item {
                    color: ${theme.sidebarText};
                }
                .admin-sidebar-item:hover {
                    background-color: ${theme.sidebarHover} !important;
                    color: #ffffff !important;
                }
                .admin-sidebar-active-item {
                    background-color: ${theme.sidebarActiveBg} !important;
                    color: ${theme.sidebarActiveText} !important;
                    box-shadow: 0 10px 15px -3px ${theme.primaryShadow}, 0 4px 6px -4px ${theme.primaryShadow} !important;
                }
                .admin-sub-item {
                    color: ${theme.sidebarText}dd;
                }
                .admin-sub-item:hover {
                    background-color: ${theme.sidebarHover} !important;
                    color: #ffffff !important;
                }

                /* Animated chevron rotation */
                .admin-chevron {
                    transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
                    flex-shrink: 0;
                }
                .admin-chevron.open {
                    transform: rotate(90deg);
                }

                /* Sidebar item hover micro-animation */
                .admin-sidebar-item {
                    transition: background-color 150ms ease, color 150ms ease, transform 120ms ease !important;
                }
                .admin-sidebar-item:active {
                    transform: scale(0.97);
                }

                /* Hide scrollbars during collapse transition */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                /* Slight box shadow & border for white cards to be clearly visible on pure white background */
                .admin-panel .bg-white {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04) !important;
                    border-color: #e2e8f0 !important;
                }

                /* Class overrides for child components across all pages */
                .admin-panel .bg-orange-500,
                .admin-panel .bg-orange-550,
                .admin-panel .bg-orange-600,
                .admin-panel .bg-\[\#2d7cb6\],
                .admin-panel .bg-\[\#337ab7\],
                .admin-panel .bg-blue-600,
                .admin-panel .bg-blue-500,
                .admin-panel .bg-indigo-600 {
                    background-color: var(--admin-primary) !important;
                }

                .admin-panel .hover\\:bg-orange-500\\/90:hover,
                .admin-panel .hover\\:bg-orange-600:hover,
                .admin-panel .hover\\:bg-\[\#256c9f\]:hover,
                .admin-panel .hover\\:bg-\[\#286090\]:hover,
                .admin-panel .hover\\:bg-blue-700:hover,
                .admin-panel .hover\\:bg-indigo-700:hover {
                    background-color: var(--admin-primary-hover) !important;
                }

                .admin-panel .text-orange-500,
                .admin-panel .text-orange-600,
                .admin-panel .text-orange-650,
                .admin-panel .text-orange-655,
                .admin-panel .text-orange-700,
                .admin-panel .text-orange-755,
                .admin-panel .text-blue-600,
                .admin-panel .text-blue-500,
                .admin-panel .text-indigo-600 {
                    color: var(--admin-primary) !important;
                }

                .admin-panel .border-orange-500,
                .admin-panel .border-orange-400,
                .admin-panel .border-orange-200,
                .admin-panel .border-blue-500,
                .admin-panel .border-blue-600 {
                    border-color: var(--admin-primary) !important;
                }

                .admin-panel .bg-orange-100,
                .admin-panel .bg-orange-50,
                .admin-panel .bg-blue-50 {
                    background-color: var(--admin-primary-light) !important;
                }

                .admin-panel .shadow-orange-500\\/10 {
                    box-shadow: 0 4px 6px -1px var(--admin-primary-shadow), 0 2px 4px -1px var(--admin-primary-shadow) !important;
                }
                .admin-panel .shadow-orange-500\\/20 {
                    box-shadow: 0 10px 15px -3px var(--admin-primary-shadow), 0 4px 6px -4px var(--admin-primary-shadow) !important;
                }
                .admin-panel .accent-orange-500 {
                    accent-color: var(--admin-primary) !important;
                }
                .admin-panel .focus\\:ring-orange-500:focus,
                .admin-panel .focus\\:ring-blue-500:focus {
                    --tw-ring-color: var(--admin-primary) !important;
                    border-color: var(--admin-primary) !important;
                }
                .admin-panel .focus\\:border-orange-500:focus,
                .admin-panel .focus\\:border-blue-500:focus {
                    border-color: var(--admin-primary) !important;
                }
                .admin-panel .active-tab-nav {
                    border-bottom-color: var(--admin-primary) !important;
                    color: var(--admin-primary) !important;
                }
            `}} />
            
            {/* Sidebar Navigation (Desktop) */}
            <aside 
                className="hidden lg:flex flex-col flex-shrink-0 z-30 border-r border-slate-800 h-screen sticky top-0"
                style={{ 
                    backgroundColor: theme.sidebarBg, 
                    borderColor: theme.sidebarHover,
                    width: isSidebarCollapsed ? '5rem' : '16rem',
                    transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                }}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800" style={{ borderColor: theme.sidebarHover }}>
                    {!isSidebarCollapsed ? (
                        <>
                            <span className="min-w-0 text-lg font-black text-white tracking-tight flex items-center gap-2">
                                {storeIcon && !storeIconFailed ? (
                                    <img
                                        src={storeIcon}
                                        alt={`${storeName} icon`}
                                        onError={() => setStoreIconFailed(true)}
                                        className="h-8 w-8 flex-shrink-0 rounded-lg bg-white/10 object-contain p-0.5"
                                    />
                                ) : (
                                    <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: theme.primary }} />
                                )}
                                <span className="truncate" title={`${storeName}.Admin`}>{storeName}<span style={{ color: theme.primary }}>.</span>Admin</span>
                            </span>
                            <button 
                                onClick={handleSidebarToggle}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4.5 h-4.5" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex justify-center items-center">
                            <button 
                                onClick={handleSidebarToggle}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Expand Sidebar"
                            >
                                <Menu className="w-5 h-5" style={{ color: theme.primary }} />
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Menu items */}
                <div className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                    {menuItems.map((item, idx) => renderMenuItem(item, idx))}
                </div>

                {/* Footer links */}
                <div className={`p-3 border-t border-slate-800 flex flex-col gap-1.5 ${isSidebarCollapsed ? 'items-center' : ''}`} style={{ borderColor: theme.sidebarHover }}>
                    <Link 
                        href={route('home')} 
                        className={`flex items-center rounded-xl text-xs font-semibold hover:text-white text-slate-400 admin-sidebar-item ${isSidebarCollapsed ? 'justify-center w-full p-3' : 'gap-3 px-3 py-2.5'}`}
                        title={isSidebarCollapsed ? "View Live Store" : ""}
                    >
                        <Home className="w-4 h-4 flex-shrink-0" />
                        {!isSidebarCollapsed && <span>View Live Store</span>}
                    </Link>
                </div>
            </aside>

            {/* Mobile Navigation Drawer */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <div className="w-64 bg-slate-900 text-slate-450 h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.sidebarBg }}>
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800" style={{ borderColor: theme.sidebarHover }}>
                            <span className="min-w-0 text-lg font-black text-white tracking-tight flex items-center gap-2">
                                {storeIcon && !storeIconFailed ? (
                                    <img
                                        src={storeIcon}
                                        alt={`${storeName} icon`}
                                        onError={() => setStoreIconFailed(true)}
                                        className="h-8 w-8 flex-shrink-0 rounded-lg bg-white/10 object-contain p-0.5"
                                    />
                                ) : (
                                    <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: theme.primary }} />
                                )}
                                <span className="truncate">{storeName}.Admin</span>
                            </span>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
                            {menuItems.map((item, idx) => renderMenuItem(item, idx, () => setIsSidebarOpen(false)))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Navbar (Top bar) */}
                <header 
                    className="h-16 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 border-b"
                    style={{ 
                        backgroundColor: theme.sidebarBg,
                        borderColor: theme.sidebarHover,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: theme.sidebarText }}>
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        {/* Search Bar / Panel Title */}
                        <div 
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors w-64"
                            style={{ backgroundColor: theme.sidebarHover, color: theme.sidebarText, border: `1px solid ${theme.sidebarHover}` }}
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Quick search products/orders...</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        
                        {/* Color Scheme Picker Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleColorPicker}
                                className="flex items-center gap-1.5 text-xs px-3 rounded-xl font-bold transition-all cursor-pointer border"
                                style={{ color: theme.sidebarText, backgroundColor: theme.sidebarHover, borderColor: `${theme.sidebarHover}80`, height: '38px' }}
                                title="Change color scheme"
                            >
                                <span
                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 inline-block"
                                    style={{ backgroundColor: theme.primary }}
                                />
                                <span className="hidden sm:inline">Theme</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isColorPickerOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-0.5 border"
                                    style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarHover }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b mb-1" style={{ color: theme.sidebarText, borderColor: theme.sidebarHover }}>
                                        Color Scheme
                                    </div>
                                    {Object.entries(themes).map(([key, t]) => (
                                        <button
                                            key={key}
                                            onClick={(e) => { selectTheme(key, e); setIsColorPickerOpen(false); }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer w-full text-left`}
                                            style={currentTheme === key
                                                ? { color: '#fff', backgroundColor: theme.sidebarHover }
                                                : { color: theme.sidebarText }}
                                        >
                                            <span
                                                className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: t.primary }}
                                            >
                                                {currentTheme === key && (
                                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                                                )}
                                            </span>
                                            <span>{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quicklinks Menu */}
                        <div className="relative">
                            <button
                                onClick={toggleQuicklinks}
                                className="flex items-center gap-1.5 text-xs px-3 rounded-xl font-bold transition-all cursor-pointer border"
                                style={{ color: theme.sidebarText, backgroundColor: theme.sidebarHover, borderColor: `${theme.sidebarHover}80`, height: '38px' }}
                            >
                                <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                                <span>Quick Links</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isQuicklinksOpen && (
                                <div 
                                    className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-0.5 border"
                                    style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarHover }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.sidebarText }}>
                                        Shortcuts
                                    </div>
                                    <Link 
                                        href={route('admin.products')} 
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <ShoppingBag className="w-4 h-4" style={{ color: theme.sidebarText, opacity: 0.5 }} />
                                        <span>Product Catalog</span>
                                    </Link>
                                    <Link 
                                        href={route('admin.orders')} 
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Package className="w-4 h-4" style={{ color: theme.sidebarText, opacity: 0.5 }} />
                                        <span>Orders Desk</span>
                                    </Link>
                                    <Link 
                                        href={route('admin.theme-customize')} 
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Palette className="w-4 h-4" style={{ color: theme.sidebarText, opacity: 0.5 }} />
                                        <span>Brand Customizer</span>
                                    </Link>
                                    <Link 
                                        href={route('admin.page-builder')} 
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LayoutTemplate className="w-4 h-4" style={{ color: theme.sidebarText, opacity: 0.5 }} />
                                        <span>Homepage Builder</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleNotification}
                                className="relative p-1.5 rounded-xl cursor-pointer transition-colors border flex items-center justify-center"
                                style={{ color: theme.sidebarText, backgroundColor: theme.sidebarHover, borderColor: `${theme.sidebarHover}80`, width: '38px', height: '38px' }}
                            >
                                <Bell className="w-4.5 h-4.5" />
                                {unreadNotificationsCount > 0 && (
                                    <span
                                        className="absolute flex items-center justify-center bg-red-500 text-white font-bold rounded-full animate-bounce"
                                        style={{ top: '-2px', right: '-2px', minWidth: '16px', height: '16px', fontSize: '9px', lineHeight: 1, padding: '0 2px', border: `2px solid ${theme.sidebarBg}` }}
                                    >
                                        {unreadNotificationsCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden border"
                                    style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarHover }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: theme.sidebarHover, backgroundColor: `${theme.sidebarHover}60` }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black" style={{ color: '#fff' }}>Notifications</span>
                                            {unreadNotificationsCount > 0 && (
                                                <span
                                                    className="text-[9px] font-bold text-white rounded-full px-1.5 py-0.5"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    {unreadNotificationsCount} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadNotificationsCount > 0 && (
                                            <button
                                                onClick={markAllNotificationsRead}
                                                className="text-[10px] font-semibold cursor-pointer transition-colors"
                                                style={{ color: theme.sidebarText }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col max-h-80 overflow-y-auto">
                                        {notifications.length === 0 && (
                                            <div className="px-4 py-6 text-center text-[11px] font-semibold" style={{ color: theme.sidebarText }}>
                                                No new notifications
                                            </div>
                                        )}
                                        {notifications.map((n, nIdx) => (
                                            <div
                                                key={n.id}
                                                className={`px-4 py-3 flex gap-3 items-start transition-colors border-b last:border-0`}
                                                style={{ borderColor: theme.sidebarHover, backgroundColor: n.unread ? 'transparent' : `${theme.sidebarHover}30`, opacity: n.unread ? 1 : 0.7 }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{
                                                        backgroundColor: n.type === 'order' ? 'rgba(16,185,129,0.15)' : n.type === 'stock' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)'
                                                    }}
                                                >
                                                    {n.type === 'order' && <ShoppingBag className="w-4 h-4 text-emerald-400" />}
                                                    {n.type === 'stock' && <Zap className="w-4 h-4 text-amber-400" />}
                                                    {n.type === 'courier' && <Truck className="w-4 h-4 text-blue-400" />}
                                                    {!['order', 'stock', 'courier'].includes(n.type) && <Bell className="w-4 h-4 text-blue-400" />}
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold truncate" style={{ color: '#fff' }}>{n.title}</span>
                                                        {n.unread && (
                                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: theme.primary }} />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] leading-relaxed" style={{ color: theme.sidebarText }}>{n.description}</p>
                                                    <span className="text-[9px] mt-0.5 font-semibold" style={{ color: `${theme.sidebarText}99` }}>{n.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2.5 border-t" style={{ borderColor: theme.sidebarHover, backgroundColor: `${theme.sidebarHover}40` }}>
                                        <Link
                                            href={route('admin.orders')}
                                            className="text-[10px] font-bold text-center block w-full transition-colors"
                                            style={{ color: theme.primary }}
                                        >
                                            View All Activity
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleProfile}
                                className="flex items-center gap-2 cursor-pointer px-2 rounded-xl transition-colors border"
                                style={{ backgroundColor: theme.sidebarHover, borderColor: `${theme.sidebarHover}80`, height: '38px' }}
                            >
                                <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    {auth.user?.avatar ? (
                                        <img src={auth.user.avatar} alt={auth.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        auth.user?.name?.charAt(0)
                                    )}
                                </div>
                                <span className="text-xs font-bold hidden sm:inline" style={{ color: theme.sidebarText }}>{auth.user?.name}</span>
                                <ChevronDown className="w-3 h-3" style={{ color: theme.sidebarText, opacity: 0.6 }} />
                            </button>

                            {isProfileOpen && (
                                <div 
                                    className="absolute right-0 mt-2 w-60 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1 border"
                                    style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarHover }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-3.5 py-3 border-b mb-1 flex items-center gap-2.5" style={{ borderColor: theme.sidebarHover }}>
                                        <div 
                                            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white overflow-hidden"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            {auth.user?.avatar ? (
                                                <img src={auth.user.avatar} alt={auth.user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                auth.user?.name?.charAt(0)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold truncate" style={{ color: '#fff' }}>{auth.user?.name}</div>
                                            <div className="text-[10px] font-semibold truncate mt-0.5" style={{ color: theme.sidebarText }}>{auth.user?.email}</div>
                                            <div 
                                                className="text-[9px] font-bold py-0.5 px-2 rounded-full inline-block mt-1" 
                                                style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                                            >
                                                Role: {auth.user?.role === 'admin' ? 'Admin Manager' : 'Customer'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link 
                                        href={route('home')} 
                                        className="flex items-center justify-between px-3.5 py-2 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Home className="w-4 h-4" style={{ opacity: 0.5 }} />
                                            <span>View Live Store</span>
                                        </span>
                                        <ExternalLink className="w-3 h-3" style={{ opacity: 0.4 }} />
                                    </Link>
                                    <Link 
                                        href={route('profile.edit')} 
                                        className="flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <User className="w-4 h-4" style={{ opacity: 0.5 }} />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link 
                                        href={route('admin.settings')} 
                                        className="flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl transition-all"
                                        style={{ color: theme.sidebarText }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.sidebarHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Settings className="w-4 h-4" style={{ opacity: 0.5 }} />
                                        <span>Store Settings</span>
                                    </Link>
                                    <div className="border-t my-1" style={{ borderColor: theme.sidebarHover }}></div>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left font-bold"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span>Logout Session</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content body */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
                    <div>
                        {!route().current('admin.dashboard') && (
                            <Breadcrumb activeColor={theme.primary} />
                        )}
                        {children}
                    </div>
                    <AdminFooter theme={theme} storeName={storeName} />
                </main>

            </div>

        </div>
    );
}
