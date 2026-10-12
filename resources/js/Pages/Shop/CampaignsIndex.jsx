import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock, PackageOpen, Sparkles, Tag } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import ModernProductCard from '../../Components/ModernProductCard';
import { useCart } from '../../Contexts/CartContext';
import { useStoreName } from '../../Hooks/useStoreName';

const fallbackBanner = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&auto=format&fit=crop&q=80';

function formatDate(value) {
    if (!value) return null;
    try {
        return new Intl.DateTimeFormat('en-BD', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
    } catch {
        return null;
    }
}

function campaignStatus(campaign) {
    const end = campaign.ends_at ? new Date(campaign.ends_at) : null;
    if (!end) return 'Limited time';

    const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Ending today';
    if (diffDays <= 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    return 'Active campaign';
}

export default function CampaignsIndex({ campaigns = [], settings = {} }) {
    const storeName = useStoreName();
    const { addToCart } = useCart();
    const { global_settings = {} } = usePage().props;
    const mergedSettings = { ...global_settings, ...settings };
    const featuredCampaign = campaigns[0];

    return (
        <ShopLayout>
            <Head title={`Promotions & Campaigns | ${storeName}`} />

            <main className="bg-slate-50">
                <section className="store-container py-6 md:py-10">
                    <div className="relative overflow-hidden rounded-[28px] bg-[#102f58] px-5 py-8 text-white shadow-xl md:px-10 md:py-12">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,75,25,0.35),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.3),transparent_36%)]" />
                        {featuredCampaign?.banner_image && (
                            <img
                                src={featuredCampaign.banner_image}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
                            />
                        )}
                        <div className="relative max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white ring-1 ring-white/15">
                                <Sparkles className="h-3.5 w-3.5 text-[#ff7046]" />
                                Promotions hub
                            </span>
                            <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                                Shop active campaigns, seasonal deals, and curated collections
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/80 md:text-base">
                                Browse limited-time campaign pages, discover highlighted products, and jump straight into the collections your customers care about most.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="store-container pb-12">
                    {campaigns.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-16">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                                <PackageOpen className="h-7 w-7" />
                            </div>
                            <h2 className="mt-5 text-xl font-black text-slate-900">No active campaigns right now</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                New promotional collections will appear here when they are enabled from the admin campaign manager.
                            </p>
                            <Link href={route('shop.index')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#e63f12]">
                                Browse products <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {campaigns.map((campaign, index) => {
                                const startDate = formatDate(campaign.starts_at);
                                const endDate = formatDate(campaign.ends_at);
                                const products = campaign.products || [];
                                const activeCount = Number(campaign.active_products_count || products.length || 0);

                                return (
                                    <article key={campaign.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                                        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                                            <Link href={route('shop.campaign', { slug: campaign.slug })} className="group relative min-h-[260px] overflow-hidden bg-slate-900 md:min-h-[340px]">
                                                <img
                                                    src={campaign.banner_image || fallbackBanner}
                                                    alt={campaign.title}
                                                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent" />
                                                <div className="relative flex h-full min-h-[260px] flex-col justify-between p-6 text-white md:min-h-[340px] md:p-8">
                                                    <div>
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                                            <Tag className="h-3.5 w-3.5" />
                                                            Campaign #{index + 1}
                                                        </span>
                                                        <h2 className="mt-4 max-w-lg text-2xl font-black leading-tight md:text-4xl">{campaign.title}</h2>
                                                        {campaign.description && (
                                                            <p className="mt-3 line-clamp-3 max-w-xl text-sm font-medium leading-6 text-white/85">{campaign.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-bold">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {campaignStatus(campaign)}
                                                        </span>
                                                        {(startDate || endDate) && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                                                                <CalendarDays className="h-3.5 w-3.5" />
                                                                {startDate || 'Now'} - {endDate || 'Ongoing'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="flex flex-col p-5 md:p-6">
                                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff4b19]">Featured collection</p>
                                                        <h3 className="mt-1 text-lg font-black text-[#102f58]">Campaign products</h3>
                                                    </div>
                                                    <Link href={route('shop.campaign', { slug: campaign.slug })} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-900 transition hover:bg-[#102f58] hover:text-white">
                                                        View campaign <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
                                                    {products.length > 0 ? products.map((product) => (
                                                        <ModernProductCard
                                                            key={product.id}
                                                            product={product}
                                                            onAddToCart={addToCart}
                                                            settings={{
                                                                ...mergedSettings,
                                                                card_show_buy_now: false,
                                                            }}
                                                        />
                                                    )) : (
                                                        <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                                            No active products attached yet.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                                                    <span>{activeCount} active product{activeCount === 1 ? '' : 's'}</span>
                                                    <Link href={route('shop.campaign', { slug: campaign.slug })} className="text-[#ff4b19] hover:underline">Shop now</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </ShopLayout>
    );
}
