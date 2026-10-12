import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, GitCompare, Star, Trash2, X } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import { clearCompareItems, compareIds, getCompareItems, removeCompareProduct } from '../../Services/Compare';

const money = (value) => `৳ ${Number(value || 0).toLocaleString('en-BD')}`;
const plain = (value) => String(value || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const imageOf = (product) => product.primary_image?.image_path || product.primaryImage?.image_path || product.images?.[0]?.image_path || '';
const priceUnitOf = (product) => product.price_unit?.code || product.priceUnit?.code || 'pcs';

function parseCustomSpecs(product) {
    const raw = product.settings?.comparison_specs || product.settings?.product_compare_specs || '';
    return String(raw || '')
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const [label, ...rest] = line.split(':');
            return rest.length ? [label.trim(), rest.join(':').trim()] : [line, 'Yes'];
        })
        .filter(([label]) => label);
}

function variantSpecs(product) {
    const map = new Map();
    (product.variants || []).forEach(variant => {
        const values = variant.attribute_values || variant.attributeValues || [];
        values.forEach(item => {
            const label = item.attribute?.name || item.attribute?.code;
            if (!label) return;
            const current = map.get(label) || new Set();
            current.add(item.value);
            map.set(label, current);
        });
    });
    return Array.from(map.entries()).map(([label, values]) => [label, Array.from(values).join(', ')]);
}

function defaultSpecs(product) {
    const settings = product.settings || {};
    const rows = [
        ['SKU', product.sku || `G-${product.id}`],
        ['Brand', product.brand || 'N/A'],
        ['Category', product.categories?.map(category => category.name).join(', ') || 'N/A'],
        ['Type', product.type || 'simple'],
        ['Availability', Number(product.stock || 0) > 0 || product.type === 'digital' ? 'In stock' : 'Out of stock'],
        ['Stock', product.type === 'digital' ? 'Digital product' : `${Number(product.stock || 0)} units`],
        ['Weight', product.weight ? `${product.weight} ${product.weight_unit?.code || product.weightUnit?.code || ''}`.trim() : 'N/A'],
        ['Return', [settings.product_info_return_label, settings.product_info_return_value].filter(Boolean).join(': ')],
        ['Exchange', [settings.product_info_exchange_label, settings.product_info_exchange_value].filter(Boolean).join(': ')],
        ['Delivery', [settings.product_info_delivery_label, settings.product_info_delivery_value].filter(Boolean).join(': ')],
        ['Payment', [settings.product_info_payment_label, settings.product_info_payment_value].filter(Boolean).join(': ')],
    ].filter(([, value]) => value && value !== ': ');

    return [...rows, ...variantSpecs(product), ...parseCustomSpecs(product)];
}

function ratingInfo(product) {
    const reviews = (product.reviews || []).filter(review => review?.is_approved !== false);
    if (!reviews.length) return { average: 0, count: 0 };
    const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    return { average, count: reviews.length };
}

export default function Compare({ products = [], seo = {} }) {
    const [items, setItems] = useState(products);

    useEffect(() => {
        if (products.length) return;
        const ids = compareIds();
        if (ids.length) router.visit(`${route('compare.index')}?ids=${ids.join(',')}`, { replace: true });
    }, []);

    useEffect(() => {
        setItems(products);
    }, [products]);

    const rows = useMemo(() => {
        const labels = new Set();
        items.forEach(product => defaultSpecs(product).forEach(([label]) => labels.add(label)));
        return Array.from(labels).map(label => {
            const values = items.map(product => {
                const found = defaultSpecs(product).find(([itemLabel]) => itemLabel === label);
                return found?.[1] || '—';
            });
            const unique = new Set(values.map(value => String(value).trim().toLowerCase()));
            return { label, values, different: unique.size > 1 };
        });
    }, [items]);

    const removeItem = (id) => {
        const remaining = removeCompareProduct(id);
        const ids = remaining.map(item => item.id).filter(Boolean);
        setItems(current => current.filter(product => Number(product.id) !== Number(id)));
        router.visit(ids.length ? `${route('compare.index')}?ids=${ids.join(',')}` : route('compare.index'), { replace: true, preserveScroll: true });
    };

    const clearAll = () => {
        clearCompareItems();
        setItems([]);
        router.visit(route('compare.index'), { replace: true });
    };

    const localSnapshots = !items.length ? getCompareItems() : [];

    return (
        <ShopLayout>
            <Head title={seo.title || 'Compare Products'} />
            <div className="store-container py-8 md:py-12">
                <div className="rounded-[28px] bg-[#102f58] p-6 text-white md:p-9">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-orange-300">Product comparison</p>
                            <h1 className="mt-2 text-2xl font-black md:text-4xl">Compare Products Side by Side</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Review price, rating, availability, variants, policies and admin-defined specifications in one clean table.</p>
                        </div>
                        {items.length > 0 && (
                            <button onClick={clearAll} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-[#102f58] transition hover:bg-slate-100">
                                <Trash2 className="h-4 w-4" /> Clear comparison
                            </button>
                        )}
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-[#102f58]"><GitCompare className="h-7 w-7" /></div>
                        <h2 className="mt-4 text-xl font-black text-slate-900">No products selected yet</h2>
                        <p className="mt-2 text-sm text-slate-500">Add products from product cards or product detail pages to compare them here.</p>
                        {localSnapshots.length > 0 && <p className="mt-2 text-xs font-bold text-orange-600">Loading your saved comparison...</p>}
                        <Link href={route('shop.index')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-6 py-3 text-xs font-black text-white">Browse products <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <div className="min-w-[760px]" style={{ gridTemplateColumns: `190px repeat(${items.length}, minmax(190px, 1fr))` }}>
                                <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `190px repeat(${items.length}, minmax(190px, 1fr))` }}>
                                    <div className="bg-slate-50 p-4 text-xs font-black uppercase tracking-wider text-slate-500">Products</div>
                                    {items.map(product => {
                                        const rating = ratingInfo(product);
                                        const hasSale = product.sale_price && Number(product.sale_price) < Number(product.price);
                                        return (
                                            <div key={product.id} className="relative border-l border-slate-200 p-4">
                                                <button onClick={() => removeItem(product.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button>
                                                <Link href={route('product.show', { slug: product.slug })} className="block pr-8">
                                                    <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                                                        {imageOf(product) ? <img src={imageOf(product)} alt={product.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
                                                    </div>
                                                    <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-black text-[#102f58]">{product.name}</h3>
                                                </Link>
                                                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                                    <span className="text-lg font-black text-[#ff4b19]">{money(product.sale_price || product.price)} / {priceUnitOf(product)}</span>
                                                    {hasSale && <span className="text-xs text-slate-400 line-through">{money(product.price)}</span>}
                                                </div>
                                                <div className="mt-2 flex items-center gap-1 text-[#ff4b19]">
                                                    {[0, 1, 2, 3, 4].map(index => <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(rating.average) ? 'fill-current' : 'text-slate-300'}`} />)}
                                                    <span className="ml-1 text-[11px] font-bold text-slate-500">{rating.count ? `${rating.average.toFixed(1)} (${rating.count})` : 'No reviews'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {rows.map(row => (
                                    <div key={row.label} className="grid border-b border-slate-100 last:border-b-0" style={{ gridTemplateColumns: `190px repeat(${items.length}, minmax(190px, 1fr))` }}>
                                        <div className={`p-4 text-xs font-black uppercase tracking-wider ${row.different ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>{row.label}</div>
                                        {row.values.map((value, index) => (
                                            <div key={`${row.label}-${index}`} className={`border-l border-slate-100 p-4 text-sm font-semibold leading-6 ${row.different ? 'bg-orange-50/40 text-slate-900' : 'text-slate-600'}`}>{value}</div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
