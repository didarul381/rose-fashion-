import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Send, CheckCircle2 } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useStoreName } from '../../Hooks/useStoreName';

export default function QuotationRequest({ brands = [] }) {
    const storeName = useStoreName();
    const form = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        product_name: '',
        quantity: 1,
        products: '',
        brand_preference: '',
        message: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('quotation.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <ShopLayout>
            <Head title={`Quotation Request | ${storeName}`} />

            <div className="store-container py-6 sm:py-8 lg:py-10">
                <section className="rounded-[22px] bg-[#173a64] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-8">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-slate-300">B2B Request</span>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Quotation Request</h1>
                    <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-200 sm:text-sm">Quotation form layout for bulk order workflows and project purchases.</p>
                </section>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <form onSubmit={submit} className="space-y-4 text-xs">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Full name" error={form.errors.name}>
                                    <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Your name" className={inputClass(form.errors.name)} />
                                </Field>
                                <Field label="Company" error={form.errors.company}>
                                    <input value={form.data.company} onChange={(event) => form.setData('company', event.target.value)} placeholder="Company / organization" className={inputClass(form.errors.company)} />
                                </Field>
                                <Field label="Email" error={form.errors.email}>
                                    <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="name@company.com" className={inputClass(form.errors.email)} />
                                </Field>
                                <Field label="Phone" error={form.errors.phone}>
                                    <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="01XXXXXXXXX" className={inputClass(form.errors.phone)} />
                                </Field>
                                <Field label="Address" error={form.errors.address}>
                                    <input value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} placeholder="Delivery address / city" className={inputClass(form.errors.address)} />
                                </Field>
                                <Field label="Product name" error={form.errors.product_name}>
                                    <input value={form.data.product_name} onChange={(event) => form.setData('product_name', event.target.value)} placeholder="Product or project item name" className={inputClass(form.errors.product_name)} />
                                </Field>
                                <Field label="Quantity" error={form.errors.quantity}>
                                    <input type="number" min="1" value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} placeholder="1" className={inputClass(form.errors.quantity)} />
                                </Field>
                            </div>

                            <Field label="Interested products" error={form.errors.products}>
                                <textarea value={form.data.products} onChange={(event) => form.setData('products', event.target.value)} rows="5" placeholder="List the items, quantity and any specification details" className={inputClass(form.errors.products, 'min-h-32 resize-y')} />
                            </Field>

                            <Field label="Brand preference" error={form.errors.brand_preference}>
                                <select value={form.data.brand_preference} onChange={(event) => form.setData('brand_preference', event.target.value)} className={inputClass(form.errors.brand_preference)}>
                                    <option value="">Any suitable brand</option>
                                    {brands.map((brand) => <option key={brand.id} value={brand.slug}>{brand.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Message" error={form.errors.message}>
                                <textarea value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} rows="5" placeholder="Tell us about the project timeline, delivery location and special requirements" className={inputClass(form.errors.message, 'min-h-32 resize-y')} />
                            </Field>

                            <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 rounded-full bg-[#ff4b19] px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#e63f12] disabled:opacity-60">
                                <Send className="h-4 w-4" />
                                Request quotation
                            </button>
                        </form>
                    </section>

                    <aside className="space-y-4">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <h2 className="text-sm font-extrabold text-[#102f58]">What to include</h2>
                            <div className="mt-4 space-y-3">
                                {['Product names or item links', 'Required quantity and delivery area', 'Budget range or target pricing', 'Preferred brand or alternative brands'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-[11px] font-semibold text-slate-500">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-[#ff4b19]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-[#173a64] p-5 text-white shadow-sm">
                            <h2 className="text-base font-extrabold">Bulk buying support</h2>
                            <p className="mt-2 text-xs leading-6 text-slate-200">This form is designed for project procurement, wholesale requests and quotation processing.</p>
                        </section>
                    </aside>
                </div>
            </div>
        </ShopLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="font-bold text-slate-700">{label}</span>
            <span className="mt-1 block">{children}</span>
            {error && <span className="mt-1 block text-[10px] font-semibold text-red-500">{error}</span>}
        </label>
    );
}

function inputClass(error, extra = '') {
    return `w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-700 outline-none transition focus:ring-1 ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-250 focus:border-[#173a64] focus:ring-[#173a64]'} ${extra}`;
}