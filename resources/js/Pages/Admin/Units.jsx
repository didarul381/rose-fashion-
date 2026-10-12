import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';

export default function Units({ units, unitType, title, description, examples = [] }) {
    const storeName = useStoreName();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const isPrice = unitType === 'price';
    const routeBase = isPrice ? 'admin.price-units' : 'admin.weight-units';

    const form = useForm({
        id: '',
        name: '',
        code: '',
        description: '',
        order_index: 0,
        is_active: true,
    });

    const resetForm = () => {
        form.setData({ id: '', name: '', code: '', description: '', order_index: 0, is_active: true });
    };

    const openCreate = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const openEdit = (unit) => {
        form.setData({
            id: unit.id,
            name: unit.name || '',
            code: unit.code || '',
            description: unit.description || '',
            order_index: unit.order_index || 0,
            is_active: unit.is_active === 1 || unit.is_active === true,
        });
        setIsFormOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route(`${routeBase}.save`), {
            onSuccess: () => {
                setIsFormOpen(false);
                resetForm();
            },
        });
    };

    const destroy = (id) => {
        if (confirm(`Delete this ${isPrice ? 'price' : 'weight'} unit? Products using it will keep working without this unit selected.`)) {
            router.delete(route(`${routeBase}.delete`, { id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={`${title} | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Catalog Settings</div>
                        <h1 className="mt-3 text-xl font-black text-slate-900">{title}</h1>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">{description}</p>
                    </div>
                    <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-orange-600">
                        <Plus className="h-4 w-4" /> Create Unit
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {(examples.length ? examples : ['pcs', 'set', 'kg', 'box']).map((example) => (
                        <div key={example} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Example</span>
                            <p className="mt-2 text-lg font-black text-[#102f58]">{example}</p>
                        </div>
                    ))}
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
                            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-base font-bold text-slate-800">{form.data.id ? 'Edit Unit' : 'Create Unit'}</h3>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded p-1 hover:bg-slate-50"><X className="h-5 w-5 text-slate-500" /></button>
                            </div>

                            <form onSubmit={submit} className="space-y-4 text-xs">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Unit Name" error={form.errors.name}>
                                        <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder={isPrice ? 'Piece' : 'Kilogram'} className={inputClass(form.errors.name)} required />
                                    </Field>
                                    <Field label="Short Code" error={form.errors.code}>
                                        <input value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} placeholder={isPrice ? 'pcs' : 'kg'} className={`${inputClass(form.errors.code)} font-mono`} required />
                                    </Field>
                                </div>
                                <Field label="Description" error={form.errors.description}>
                                    <textarea rows="3" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Where this unit should be used..." className={inputClass(form.errors.description, 'resize-y')} />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Sort Order" error={form.errors.order_index}>
                                        <input type="number" value={form.data.order_index} onChange={(event) => form.setData('order_index', event.target.value)} className={inputClass(form.errors.order_index)} />
                                    </Field>
                                    <label className="flex items-center gap-2 rounded-xl border border-slate-150 bg-slate-50 px-4 py-3 font-bold text-slate-700">
                                        <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                        Status: Active
                                    </label>
                                </div>
                                <button type="submit" disabled={form.processing} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-md transition hover:bg-orange-600 disabled:opacity-60">
                                    <Save className="h-4 w-4" /> Save Unit
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-100 font-bold uppercase text-slate-400">
                                    <th className="py-3">Unit Details</th>
                                    <th className="py-3">Code</th>
                                    <th className="py-3">Sort</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {units.data.length === 0 ? (
                                    <tr><td colSpan="5" className="py-8 text-center font-semibold italic text-slate-400">No units found. Create your first unit.</td></tr>
                                ) : units.data.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/50">
                                        <td className="py-4">
                                            <div className="font-bold text-slate-800">{unit.name}</div>
                                            <div className="mt-1 max-w-lg truncate text-[10px] text-slate-400">{unit.description || 'No description provided.'}</div>
                                        </td>
                                        <td className="py-4"><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#102f58]">{unit.code}</span></td>
                                        <td className="py-4 font-bold text-slate-600">{unit.order_index}</td>
                                        <td className="py-4"><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${unit.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{unit.is_active ? 'Active' : 'Disabled'}</span></td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button type="button" onClick={() => openEdit(unit)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" title="Edit unit"><Edit3 className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => destroy(unit.id)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500" title="Delete unit"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {units.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {units.links.map((link, index) => link.url ? <button key={index} type="button" onClick={() => router.visit(link.url)} className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${link.active ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function Field({ label, error, children }) {
    return <label className="block"><span className="font-bold uppercase text-slate-600">{label}</span><span className="mt-1 block">{children}</span>{error && <span className="mt-1 block text-[10px] font-semibold text-red-500">{error}</span>}</label>;
}

function inputClass(error, extra = '') {
    return `w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-700 outline-none transition focus:ring-1 ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-250 focus:border-orange-500 focus:ring-orange-500'} ${extra}`;
}