import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Grid2X2, Layers3, Sparkles } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useStoreName } from '../../Hooks/useStoreName';

export default function MainCategories({ mainCategories = [], stats = {} }) {
    const storeName = useStoreName();

    return (
        <ShopLayout>
            <Head title={`All Categories | ${storeName}`} />

            <div className="store-container py-6 sm:py-8 lg:py-10">
                <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ffede7] blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                            <div className="max-w-2xl">
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#ff4b19]">Main categories</span>
                                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#102f58] sm:text-3xl">All Categories</h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">The category hub brings together the full storefront structure with cards, quick links and a direct path to every product collection.</p>
                            </div>
                            <Link href={route('shop.index')} className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-[#102f58] px-5 text-xs font-bold text-white transition hover:bg-[#173f73]">
                                Browse all products <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <Stat icon={Grid2X2} label="Active categories" value={stats.active_categories ?? mainCategories.length} />
                            <Stat icon={Layers3} label="Sub categories" value={stats.sub_categories ?? 0} />
                            <Stat icon={Sparkles} label="Browse focus" value="Curated" />
                        </div>
                    </div>
                </section>

                {mainCategories.length > 0 ? (
                    <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mainCategories.map((category, index) => (
                            <Link
                                key={category.id}
                                href={category?.slug ? route('category.show', { slug: category.slug }) : '#'}
                                className="group relative flex min-h-44 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#ffb29b] hover:shadow-md"
                            >
                                <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${index % 5 === 1 ? 'bg-[#ff4b19]' : 'bg-transparent'} transition group-hover:bg-[#ff4b19]`} />
                                {category.image && <img src={category.image} alt="" className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full object-cover opacity-[0.07] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.12]" />}
                                <div className="relative flex items-start justify-between gap-3">
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Category</span>
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-[#ffb29b] group-hover:bg-[#fff4f0] group-hover:text-[#ff4b19]">
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <h2 className="relative mt-4 line-clamp-2 text-base font-extrabold leading-5 text-[#102f58]">{category.name}</h2>
                                {category.description && <p className="relative mt-1.5 line-clamp-2 text-xs leading-[18px] text-slate-500">{category.description}</p>}
                                <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><i className="h-1.5 w-1.5 rounded-full bg-[#ff7046]" />Explore category</span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{category.children_count || 0} sub</span>
                                </div>
                            </Link>
                        ))}
                    </section>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <h2 className="font-bold text-[#102f58]">No categories are available yet</h2>
                        <p className="mt-1 text-sm text-slate-500">Active categories will appear here automatically.</p>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}

function Stat({ icon: Icon, label, value }) {
    return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#ff4b19] shadow-sm"><Icon className="h-4 w-4" /></span><div><p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-0.5 text-base font-extrabold text-[#102f58]">{value}</p></div></div>;
}
