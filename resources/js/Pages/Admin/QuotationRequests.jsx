import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Download, Edit3, FileText, Trash2, Save } from 'lucide-react';

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'closed', label: 'Closed' },
];

export default function AdminQuotationRequests({ quotationRequests, filters = {} }) {
    const storeName = useStoreName();
    const filterForm = useForm({ status: filters.status || '', search: filters.search || '' });

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('admin.quotation-requests'), filterForm.data, { preserveState: true, replace: true });
    };

    const updateStatus = (requestItem, status) => {
        router.post(route('admin.quotation-requests.update', { id: requestItem.id }), { status }, { preserveScroll: true });
    };

    const deleteRequest = (id) => {
        if (confirm('Delete this quotation request?')) {
            router.delete(route('admin.quotation-requests.delete', { id }), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Quotation Requests | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800"><FileText className="h-5 w-5 text-orange-500" /> Quotation Requests</h1>
                        <p className="mt-1 text-xs text-slate-400">Review bulk order, project purchase and procurement requests.</p>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-end">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search</label>
                        <input value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} placeholder="Name, email, phone, company..." className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                        <select value={filterForm.data.status} onChange={(event) => filterForm.setData('status', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500">
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white"><Save className="h-4 w-4" /> Apply</button>
                </form>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-100 font-bold uppercase text-slate-400">
                                    <th className="py-3">Requester</th>
                                    <th className="py-3">Products</th>
                                    <th className="py-3">Brand</th>
                                    <th className="py-3">Message</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {quotationRequests.data.length === 0 ? (
                                    <tr><td colSpan="6" className="py-8 text-center font-semibold italic text-slate-400">No quotation requests found.</td></tr>
                                ) : quotationRequests.data.map((item) => (
                                    <tr key={item.id} className="align-top hover:bg-slate-50/50">
                                        <td className="py-4">
                                            <div className="font-bold text-slate-800">{item.name}</div>
                                            <div className="mt-1 text-[10px] text-slate-400">{item.company || 'No company'}</div>
                                            <div className="mt-1 text-[10px] text-slate-500">{item.email}</div>
                                            <div className="text-[10px] text-slate-500">{item.phone}</div>
                                            <div className="mt-1 text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="max-w-xs py-4"><p className="line-clamp-4 whitespace-pre-line text-slate-600">{item.products}</p></td>
                                        <td className="py-4 font-mono text-[11px] font-bold text-slate-600">{item.brand_preference || 'Any'}</td>
                                        <td className="max-w-sm py-4"><p className="line-clamp-4 whitespace-pre-line text-slate-600">{item.message}</p></td>
                                        <td className="py-4">
                                            <select value={item.status} onChange={(event) => updateStatus(item, event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500">
                                                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.quotation-requests.edit', { id: item.id })} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500" title="Edit quotation">
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                                <a href={route('admin.quotation-requests.download', { id: item.id })} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500" title="Download PDF">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                                <button type="button" onClick={() => deleteRequest(item.id)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500" title="Delete request">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {quotationRequests.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {quotationRequests.links.map((link, index) => link.url ? (
                                <button key={index} onClick={() => router.visit(link.url)} className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${link.active ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : null)}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}