import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, PackageOpen, Sparkles } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import ModernProductCard from '../../Components/ModernProductCard';
import { useCart } from '../../Contexts/CartContext';
import { useStoreName } from '../../Hooks/useStoreName';

const fallbackBanner = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80';

function formatDate(value) {
    if (!value) return null;
    try {
        return new Intl.DateTimeFormat('en-BD', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
    } catch {
        return null;
    }
}

function campaignStatus(campaign, now = Date.now()) {
    const end = campaign.ends_at ? new Date(campaign.ends_at) : null;
    if (!end) return 'Limited time offer';

    const diffMs = end.getTime() - now;
    if (diffMs <= 0) return 'Ending now';

    const oneDayMs = 1000 * 60 * 60 * 24;
    if (diffMs <= oneDayMs) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`;
    }

    const diffDays = Math.ceil(diffMs / oneDayMs);
    if (diffDays <= 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    return 'Active campaign';
}

function useCampaignCountdown(campaign) {
    const shouldTick = useMemo(() => {
        if (!campaign.ends_at) return false;
        const diffMs = new Date(campaign.ends_at).getTime() - Date.now();
        return diffMs > 0 && diffMs <= 1000 * 60 * 60 * 24;
    }, [campaign.ends_at]);

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!shouldTick) return undefined;

        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [shouldTick]);

    return campaignStatus(campaign, now);
}

export default function CampaignPage({ campaign, settings = {} }) {
    const storeName = useStoreName();
    const { addToCart } = useCart();
    const { global_settings = {} } = usePage().props;
    const mergedSettings = { ...global_settings, ...settings };
    const products = campaign.products || [];
    const startDate = formatDate(campaign.starts_at);
    const endDate = formatDate(campaign.ends_at);
    const countdownLabel = useCampaignCountdown(campaign);

    return (
        <ShopLayout>
            <Head title={`${campaign.title} | ${storeName} Campaigns`} />

            <main className="bg-slate-50">
                <section className="store-container py-6 md:py-10">
                    <div className="relative overflow-hidden rounded-[30px] bg-[#102f58] text-white shadow-xl">
                        <img
                            src={campaign.banner_image || fallbackBanner}
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
                            alt={campaign.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#102f58] via-[#102f58]/85 to-[#102f58]/30" />
                        <div className="relative grid gap-8 px-5 py-8 md:px-10 md:py-12 lg:grid-cols-[1fr_340px] lg:items-end">
                            <div>
                                <Link href={route('campaigns.index')} className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15">
                                    <ArrowLeft className="h-3.5 w-3.5" /> All campaigns
                                </Link>
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] shadow-sm">
                                    <Sparkles className="h-3.5 w-3.5" /> Exclusive campaign
                                </span>
                                <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight md:text-5xl">{campaign.title}</h1>
                                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 md:text-base">
                                    {campaign.description || 'Discover curated deals, bundles, and selected products from this campaign collection.'}
                                </p>
                            </div>
                            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                                <div className="grid gap-3 text-sm font-bold">
                                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                                        <Clock className="h-5 w-5 text-[#ff7046]" />
                                        <span>{countdownLabel}</span>
                                    </div>
                                    {(startDate || endDate) && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                                            <CalendarDays className="h-5 w-5 text-[#ff7046]" />
                                            <span>{startDate || 'Now'} - {endDate || 'Ongoing'}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                                        <PackageOpen className="h-5 w-5 text-[#ff7046]" />
                                        <span>{products.length} product{products.length === 1 ? '' : 's'} in collection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="store-container pb-12 md:pb-16">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff4b19]">Campaign collection</p>
                            <h2 className="mt-1 text-2xl font-black text-[#102f58] md:text-3xl">Products in this campaign</h2>
                        </div>
                        <Link href={route('shop.index')} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-[#102f58] hover:text-white">
                            Browse all products <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {products.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-16">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                                <PackageOpen className="h-7 w-7" />
                            </div>
                            <h3 className="mt-5 text-xl font-black text-slate-900">No active products yet</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Please check back later for exciting campaign launches.</p>
                            <Link href={route('campaigns.index')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#e63f12]">
                                View other campaigns <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {products.map((product) => (
                                <ModernProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                    settings={mergedSettings}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </ShopLayout>
    );
}

