import { useStoreName } from '../../Hooks/useStoreName';
import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import BreadcrumbSchema from '../../Components/BreadcrumbSchema';
import ModernProductCard from '../../Components/ModernProductCard';
import { useCart } from '../../Contexts/CartContext';
import { ShoppingCart, Star, Filter, ArrowUpDown, X } from 'lucide-react';

export default function CategoryPage({ category, products, siblings = [], filters = {}, listing_route = 'category.show', breadcrumbs = [] }) {
    const storeName = useStoreName();
    const { addToCart } = useCart();
    const { global_settings } = usePage().props;
    
    // Check if filters is an array (PHP empty associative array serialization issue)
    const listingHref = listing_route === 'shop.index'
        ? route('shop.index')
        : (category?.slug ? route('category.show', { slug: category.slug }) : '#');
    const safeFilters = Array.isArray(filters) ? {} : filters;
    
    // Filters state
    const [minPrice, setMinPrice] = useState(safeFilters?.min_price || '');
    const [maxPrice, setMaxPrice] = useState(safeFilters?.max_price || '');
    const [sortOption, setSortOption] = useState(safeFilters?.sort || 'newest');
    const brandFilter = safeFilters?.b || '';
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (!isFilterOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsFilterOpen(false);
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isFilterOpen]);
    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        setIsFilterOpen(false);
        router.get(listingHref, {
            min_price: minPrice,
            max_price: maxPrice,
            sort: sortOption,
            b: brandFilter || undefined
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSortChange = (newSort) => {
        setSortOption(newSort);
        router.get(listingHref, {
            min_price: minPrice,
            max_price: maxPrice,
            sort: newSort,
            b: brandFilter || undefined
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setIsFilterOpen(false);
        setMinPrice('');
        setMaxPrice('');
        setSortOption('newest');
        router.get(listingHref, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const isHeaderDisabled = global_settings?.breadcrumb_status === 'disabled' && global_settings?.category_header_status === 'disabled';

    const isShopListing = listing_route === 'shop.index' || !category?.slug;
    const categoryHref = category?.slug
        ? route('category.show', { slug: category.slug })
        : (isShopListing ? route('shop.index') : '#');

    const resolvedBreadcrumbs = breadcrumbs && breadcrumbs.length > 0
        ? breadcrumbs
        : [
            { name: 'Home', href: route('home') },
            ...(isShopListing
                ? [{ name: category?.name || 'Shop', href: route('shop.index') }]
                : [
                    { name: 'Categories', href: route('categories.index') },
                    ...(category?.name ? [{ name: category.name, href: categoryHref }] : [])
                ]
            )
        ];

    return (
        <ShopLayout>
            <Head title={`${category?.name || 'Shop'} | ${storeName}`} />
            <BreadcrumbSchema items={resolvedBreadcrumbs} />

            {global_settings?.breadcrumb_status !== 'disabled' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <Breadcrumb
                        items={resolvedBreadcrumbs}
                        activeColor={global_settings?.breadcrumb_active_color || global_settings?.primary_color}
                        textColor={global_settings?.breadcrumb_text_color || '#475569'}
                        separatorColor={global_settings?.breadcrumb_separator_color || '#94a3b8'}
                        backgroundColor={global_settings?.breadcrumb_bg_color || '#f8fafc'}
                        borderRadius={global_settings?.breadcrumb_border_radius || 'rounded-xl'}
                        shadowLevel={global_settings?.breadcrumb_shadow_level || 'shadow-sm'}
                        design={global_settings?.breadcrumb_design || 'default'}
                        className="mb-0"
                    />
                </div>
            )}

            {/* Category Hero Header Banner */}
            {global_settings?.category_header_status !== 'disabled' && (
                <div className={`relative py-16 md:py-24 overflow-hidden border-b ${
                    global_settings?.category_header_design === 'light'
                        ? 'bg-slate-100 text-slate-900 border-slate-200'
                        : global_settings?.category_header_design === 'dark'
                            ? 'bg-black text-white border-slate-900'
                            : 'bg-slate-900 text-white border-slate-800'
                }`}>
                    <div className="absolute inset-0 bg-black/60 z-1"></div>
                    {category.image && (
                        <img src={category.image} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" alt="" />
                    )}
                    <div className="relative max-w-7xl mx-auto px-6 md:px-8 z-10 flex flex-col items-center text-center gap-2">
                        <h1 className="text-3xl md:text-5xl font-black">{category.name}</h1>
                        <p className="text-sm md:text-base text-slate-350 max-w-xl font-medium mt-2">{category.description || 'Premium curated collection'}</p>
                    </div>
                </div>
            )}

            {/* Product Directory Layout */}
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${global_settings?.category_header_status === 'disabled' ? 'pt-4 pb-10 md:pb-14' : 'py-10 md:py-14'}`}>
                <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 lg:hidden"
                    aria-controls="mobile-category-filters"
                    aria-expanded={isFilterOpen}
                >
                    <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-orange-500" />
                        Filters & Categories
                    </span>
                    <span className="text-xs font-medium text-slate-400">Open</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Filter Sidebar */}
                    <div
                        id="mobile-category-filters"
                        className={`${isFilterOpen ? 'fixed inset-0 z-50 flex bg-slate-950/55 backdrop-blur-[2px]' : 'hidden'} lg:static lg:z-auto lg:block lg:h-fit lg:bg-transparent lg:backdrop-blur-none lg:sticky lg:top-24`}
                        onClick={() => setIsFilterOpen(false)}
                    >
                        <aside
                            className="ml-auto flex h-[100dvh] w-full max-w-sm flex-col gap-5 overflow-y-auto bg-slate-50 p-4 shadow-2xl animate-slideInRight lg:h-auto lg:max-w-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none lg:animate-none"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 lg:hidden">
                                <div>
                                    <p className="text-base font-black text-slate-900">Shop Filters</p>
                                    <p className="text-xs text-slate-500">Browse categories or filter by price</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100"
                                    aria-label="Close filters"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        {/* Subcategories/Departments List */}
                        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 underline decoration-2 underline-offset-4">Categories</h3>
                            <Link href={route('categories.index')} onClick={() => setIsFilterOpen(false)} className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-[#102f58] transition hover:bg-orange-50 hover:text-orange-600">
                                All main categories <span aria-hidden="true">&rarr;</span>
                            </Link>
                            <div className="flex flex-col gap-2.5">
                                {siblings.map((sib) => (
                                    <Link
                                        key={sib.id}
                                        href={sib.slug ? route('category.show', { slug: sib.slug }) : '#'}
                                        onClick={() => setIsFilterOpen(false)}
                                        className={`flex items-center justify-between gap-3 text-sm py-1.5 px-3 rounded-lg font-medium transition-all ${
                                            sib.id === category?.id
                                                ? 'bg-orange-50 text-orange-600 font-bold'
                                                : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {sib.name}
                                        {sib.products_count !== undefined && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">{sib.products_count}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter Form */}
                        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="w-4 h-4 text-orange-500" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Filter By Price</h3>
                            </div>
                            
                            <form onSubmit={handleApplyFilters} className="space-y-4">
                                <div className="flex gap-2.5">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-450">Min (৳)</label>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-450">Max (৳)</label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="submit" className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all">
                                        Apply
                                    </button>
                                    <button type="button" onClick={handleReset} className="px-3 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-lg transition-all">
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        </aside>
                    </div>

                    {/* Product Grid & Sorting options */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* Header bar: Count & Sorting */}
                        <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-850">{products.data.length}</span> of <span className="font-bold text-slate-850">{products.total}</span> products
                            </span>

                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                <select
                                    value={sortOption}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50/50 text-slate-700"
                                >
                                    <option value="newest">Sort By: Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="popularity">Popularity</option>
                                </select>
                            </div>
                        </div>

                        {/* Products list */}
                        {products.data.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                                <h3 className="text-base font-bold text-slate-700">No products found</h3>
                                <p className="text-sm text-slate-450 mt-1.5">No products matched your filters. Try clearing your settings.</p>
                                <button onClick={handleReset} className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold transition-all shadow-md">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                {products.data.map((prod) => (
                                    <ModernProductCard
                                        key={prod.id}
                                        product={prod}
                                        onAddToCart={addToCart}
                                        settings={global_settings || {}}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination component */}
                        {products.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-1.5">
                                {products.links.map((link, idx) => {
                                    if (link.url === null) return null;
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                                                link.active 
                                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </ShopLayout>
    );
}
