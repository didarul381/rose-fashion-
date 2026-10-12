import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Save } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useStoreName } from '../../Hooks/useStoreName';

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'closed', label: 'Closed' },
];

export default function QuotationRequestEdit({ quotationRequest }) {
    const storeName = useStoreName();
    const form = useForm({
        name: quotationRequest.name || '',
        company: quotationRequest.company || '',
        email: quotationRequest.email || '',
        phone: quotationRequest.phone || '',
        address: quotationRequest.address || '',
        product_name: quotationRequest.product_name || firstLine(quotationRequest.products) || '',
        quantity: quotationRequest.quantity || 1,
        price: quotationRequest.price || '',
        product_description: quotationRequest.product_description || quotationRequest.products || '',
        delivery_time: quotationRequest.delivery_time || '',
        advance_payment: quotationRequest.advance_payment || '',
        at_delivery_payment: quotationRequest.at_delivery_payment || '',
        brand_preference: quotationRequest.brand_preference || '',
        message: quotationRequest.message || '',
        status: quotationRequest.status || 'pending',
        admin_notes: quotationRequest.admin_notes || '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.quotation-requests.update', { id: quotationRequest.id }), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Quotation | ${storeName} Admin`} />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center">
                    <div>
                        <Link href={route('admin.quotation-requests')} className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to quotations</Link>
                        <h1 className="text-xl font-extrabold text-slate-900">Edit Quotation</h1>
                        <p className="mt-1 text-xs text-slate-400">Update quotation details before downloading the PDF.</p>
                    </div>
                    <a href={route('admin.quotation-requests.download', { id: quotationRequest.id })} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-950">
                        <Download className="h-4 w-4" /> Download PDF
                    </a>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Name" error={form.errors.name}><input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputClass(form.errors.name)} /></Field>
                        <Field label="Email" error={form.errors.email}><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={inputClass(form.errors.email)} /></Field>
                        <Field label="Phone" error={form.errors.phone}><input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className={inputClass(form.errors.phone)} /></Field>
                        <Field label="Address" error={form.errors.address}><input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className={inputClass(form.errors.address)} /></Field>
                        <Field label="Company" error={form.errors.company}><input value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} className={inputClass(form.errors.company)} /></Field>
                        <Field label="Brand Preference" error={form.errors.brand_preference}><input value={form.data.brand_preference} onChange={(e) => form.setData('brand_preference', e.target.value)} className={inputClass(form.errors.brand_preference)} /></Field>
                        <Field label="Product Name" error={form.errors.product_name}><input value={form.data.product_name} onChange={(e) => form.setData('product_name', e.target.value)} className={inputClass(form.errors.product_name)} /></Field>
                        <Field label="Quantity" error={form.errors.quantity}><input type="number" min="1" value={form.data.quantity} onChange={(e) => form.setData('quantity', e.target.value)} className={inputClass(form.errors.quantity)} /></Field>
                        <Field label="Price" error={form.errors.price}><input type="number" min="0" step="0.01" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className={inputClass(form.errors.price)} /></Field>
                        <Field label="Status" error={form.errors.status}>
                            <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className={inputClass(form.errors.status)}>
                                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </Field>
                    </div>

                    <div className="mt-5 grid gap-5">
                        <Field label="Product Description" error={form.errors.product_description}><textarea rows="5" value={form.data.product_description} onChange={(e) => form.setData('product_description', e.target.value)} className={inputClass(form.errors.product_description, 'min-h-28 resize-y')} /></Field>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <Field label="Delivery Time" error={form.errors.delivery_time}><input value={form.data.delivery_time} onChange={(e) => form.setData('delivery_time', e.target.value)} className={inputClass(form.errors.delivery_time)} /></Field>
                        <Field label="Advance Payment" error={form.errors.advance_payment}><input value={form.data.advance_payment} onChange={(e) => form.setData('advance_payment', e.target.value)} className={inputClass(form.errors.advance_payment)} /></Field>
                        <Field label="At Delivery Payment" error={form.errors.at_delivery_payment}><input value={form.data.at_delivery_payment} onChange={(e) => form.setData('at_delivery_payment', e.target.value)} className={inputClass(form.errors.at_delivery_payment)} /></Field>
                    </div>

                    <div className="mt-5 grid gap-5">
                        <Field label="Customer Message" error={form.errors.message}><textarea rows="4" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} className={inputClass(form.errors.message, 'min-h-24 resize-y')} /></Field>
                        <Field label="Admin Notes" error={form.errors.admin_notes}><textarea rows="4" value={form.data.admin_notes} onChange={(e) => form.setData('admin_notes', e.target.value)} className={inputClass(form.errors.admin_notes, 'min-h-24 resize-y')} /></Field>
                    </div>

                    <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
                        <a href={route('admin.quotation-requests.download', { id: quotationRequest.id })} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-400 px-5 text-xs font-extrabold text-white hover:bg-slate-500">
                            <Download className="h-4 w-4" /> Download PDF
                        </a>
                        <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff4b19] px-6 text-xs font-extrabold text-white shadow-sm hover:bg-[#e63f12] disabled:opacity-60">
                            <Save className="h-4 w-4" /> Update
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-700">{label}</span>
            <span className="mt-2 block">{children}</span>
            {error && <span className="mt-1 block text-[10px] font-semibold text-red-500">{error}</span>}
        </label>
    );
}

function inputClass(error, extra = '') {
    return `w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-1 ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-250 focus:border-[#173a64] focus:ring-[#173a64]'} ${extra}`;
}

function firstLine(text) {
    if (!text) return '';
    return String(text).split(/\r?\n/)[0] || '';
}