import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import BreadcrumbSchema from './BreadcrumbSchema';

/**
 * Reusable Breadcrumb Component for Admin and Application Pages
 *
 * @param {Array} items - Optional custom array of breadcrumb items: [{ name: 'Catalog', href: '/...', url: '/...' }, { name: 'Products' }]
 * @param {String} activeColor - Optional accent/theme color for active breadcrumb text or icons
 * @param {String} design - Optional style preset for the breadcrumb container
 * @param {Boolean} withSchema - If true, outputs Google JSON-LD BreadcrumbList structured data
 */
export default function Breadcrumb({
    items = [],
    activeColor,
    backgroundColor = 'transparent',
    textColor = '',
    separatorColor = '',
    borderRadius = '',
    shadowLevel = '',
    design = 'default',
    className = '',
    withSchema = false
}) {
    // Generate default breadcrumb items from current route if no items prop passed
    let breadcrumbItems = items;

    if (!breadcrumbItems || breadcrumbItems.length === 0) {
        breadcrumbItems = [{ name: 'Admin', routeName: 'admin.dashboard' }];

        try {
            const currentRouteName = route().current();
            
            const routeMap = {
                'admin.products': [{ name: 'Catalog' }, { name: 'Products Catalog' }],
                'admin.categories': [{ name: 'Catalog' }, { name: 'Categories Manager' }],
                'admin.price-units': [{ name: 'Catalog' }, { name: 'Price Unit' }],
                'admin.weight-units': [{ name: 'Catalog' }, { name: 'Weight Unit' }],
                'admin.size-charts': [{ name: 'Catalog' }, { name: 'Size Charts' }],
                'admin.size-charts.create': [{ name: 'Catalog' }, { name: 'Size Charts' }, { name: 'Create Size Chart' }],
                'admin.size-charts.edit': [{ name: 'Catalog' }, { name: 'Size Charts' }, { name: 'Edit Size Chart' }],
                'admin.orders': [{ name: 'Sales & Orders' }, { name: 'All Orders' }],
                'admin.orders.show': [{ name: 'Sales & Orders' }, { name: 'Order Details' }],
                'admin.quotation-requests': [{ name: 'Sales & Orders' }, { name: 'Quotation Requests' }],
                'admin.quotation-requests.edit': [{ name: 'Sales & Orders' }, { name: 'Quotation Requests', route: 'admin.quotation-requests' }, { name: 'Edit Quotation' }],
                'admin.order-statuses': [{ name: 'Sales & Orders' }, { name: 'Order Statuses' }],
                'admin.shipping-methods': [{ name: 'Sales & Orders' }, { name: 'Shipping Methods' }],
                'admin.couriers': [{ name: 'Sales & Orders' }, { name: 'Couriers' }],
                'admin.invoices': [{ name: 'Sales & Orders' }, { name: 'Invoices' }],
                'admin.payment-methods': [{ name: 'Payments' }],
                'admin.coupons': [{ name: 'Coupons' }],
                'admin.flash-sales': [{ name: 'Flash Sales' }],
                'admin.campaigns': [{ name: 'Campaigns' }],
                'admin.marketing': [{ name: 'Marketing Suite' }],
                'admin.theme-customize': [{ name: 'Theme Customizer' }, { name: 'Theme Customize' }],
                'admin.page-builder': [{ name: 'Theme Customizer' }, { name: 'Homepage Builder' }],
                'admin.settings': [{ name: 'Store Settings' }],
                'profile.edit': [{ name: 'User Profile' }],
            };

            if (currentRouteName && routeMap[currentRouteName]) {
                breadcrumbItems = [...breadcrumbItems, ...routeMap[currentRouteName]];
            } else if (currentRouteName && currentRouteName !== 'admin.dashboard') {
                const pageTitle = currentRouteName
                    .replace(/^admin\./, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());
                breadcrumbItems.push({ name: pageTitle });
            }
        } catch (e) {
            // Fallback if route() helper is not available
        }
    }

    if (breadcrumbItems.length === 0) return null;

    const shadowMap = {
        'none': 'none',
        'shadow-sm': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'shadow-md': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
        'shadow-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)'
    };

    const baseClasses = ['flex flex-wrap items-center gap-1.5 text-xs font-medium mb-5', className];
    const designClasses = {
        default: 'py-2 px-4',
        minimal: 'py-1 px-2 bg-transparent gap-2',
        pill: `px-4 py-2 ${borderRadius || 'rounded-full'}`,
        modern: `px-4 py-3 ${borderRadius || 'rounded-xl'}`,
    };

    const wrapperClasses = [
        ...baseClasses,
        designClasses[design] || designClasses.default,
        design === 'minimal' ? 'bg-transparent' : borderRadius,
    ]
        .filter(Boolean)
        .join(' ');

    const wrapperStyle = {
        backgroundColor: design === 'minimal' ? 'transparent' : backgroundColor || undefined,
        color: textColor || undefined,
        boxShadow: design === 'minimal' ? 'none' : shadowMap[shadowLevel] || undefined,
        padding: design === 'minimal' ? '0.5rem 0.75rem' : undefined,
    };

    return (
        <>
            {withSchema && <BreadcrumbSchema items={breadcrumbItems} />}
            <nav aria-label="Breadcrumb" className={wrapperClasses} style={wrapperStyle}>
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;
                    const linkHref = item.href || item.url || (item.routeName ? route(item.routeName) : null);
                    const itemColor = isLast ? (activeColor || textColor) : (textColor || undefined);
                    const separatorStyle = { color: separatorColor || textColor || '#94a3b8' };
                    const linkStyle = { color: itemColor };

                    return (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={separatorStyle} />
                            )}
                            {linkHref && !isLast ? (
                                <Link
                                    href={linkHref}
                                    className="transition-colors flex items-center gap-1"
                                    style={linkStyle}
                                >
                                    {index === 0 && <Home className="w-3.5 h-3.5 opacity-70" style={linkStyle} />}
                                    <span>{item.name}</span>
                                </Link>
                            ) : (
                                <span
                                    className={`truncate font-semibold ${isLast ? 'font-bold' : ''}`}
                                    style={itemColor ? { color: itemColor } : undefined}
                                >
                                    {index === 0 && !linkHref && <Home className="w-3.5 h-3.5 inline mr-1 opacity-70" style={linkStyle} />}
                                    {item.name}
                                </span>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        </>
    );
}
