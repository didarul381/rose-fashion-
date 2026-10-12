import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useStoreName } from '../../Hooks/useStoreName';

export default function Brands({ brands = [], directory = {} }) {
    const storeName = useStoreName();

    return <ShopLayout>
        <Head title={`Shop By Brands | ${storeName}`} />
        <div className="store-container py-6 sm:py-8 lg:py-10">
            <section className="relative overflow-hidden rounded-[22px] bg-[#173a64] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
                <div className="relative max-w-3xl">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-slate-300">{directory.eyebrow || 'Brand directory'}</span>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{directory.title || 'Shop By Brands'}</h1>
                    <p className="mt-2 text-xs leading-5 text-slate-200 sm:text-sm">{directory.description || 'Browse every brand available in the store.'}</p>
                </div>
            </section>

            {brands.length ? <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand, index) => <DirectoryBrandCard key={`${brand.name}-${index}`} brand={brand} />)}
            </section> : <section className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h2 className="font-extrabold text-[#102f58]">No brands are available yet</h2>
                <p className="mt-1 text-sm text-slate-500">Add brand items in Admin Page Builder ? Top Brands List.</p>
            </section>}
        </div>
    </ShopLayout>;
}

function DirectoryBrandCard({ brand }) {
    const initials = brand.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();

    return <Link href={brand.link || route('shop.index', { b: slugifyBrand(brand.brand || brand.name) })} className="group flex min-h-44 flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#ff9c7f] hover:bg-[#fffaf8] hover:shadow-md">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition group-hover:border-[#ffb29b]">
            {brand.image ? <img src={brand.image} alt={brand.name} className="h-full w-full object-contain" /> : <span className="text-base font-black tracking-tight text-[#102f58]">{initials}</span>}
        </div>
        <h2 className="mt-3 line-clamp-2 text-sm font-extrabold leading-5 text-[#102f58] transition group-hover:text-[#ff4b19]">{brand.name}</h2>
        <span className="mt-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-bold text-slate-500 transition group-hover:border-[#ffb29b] group-hover:bg-white group-hover:text-[#ff4b19]">View brand products <ArrowRight className="h-3 w-3" /></span>
    </Link>;
}

function slugifyBrand(name) {
    return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
