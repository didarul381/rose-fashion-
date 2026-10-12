import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, X, Save, Truck, Search, ArrowUpDown } from 'lucide-react';

export default function ShippingMethods({ shippingMethods, filters }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const form = useForm({
        id: '',
        name: '',
        charge: '',
        weight_based_enabled: false,
        weight_rates: '',
        status: 'active',
        sort_order: 0,
    });

    const handleEditClick = (method) => {
        form.setData({
            id: method.id,
            name: method.name,
            charge: method.charge,
            weight_based_enabled: Boolean(method.weight_based_enabled),
            weight_rates: method.weight_rates || '',
            status: method.status || 'active',
            sort_order: method.sort_order ?? 0,
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            name: '',
            charge: '',
            weight_based_enabled: false,
            weight_rates: '0.5:60,1:70,2:90,3:105,4:120,5:135,6:150,7:265,8:180,9:195,10:210,9999999999:225',
            status: 'active',
            sort_order: shippingMethods?.data?.length ? shippingMethods.data.length + 1 : 0,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.shipping-methods.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Delete this shipping method?')) {
            router.delete(route('admin.shipping-methods.delete', { id }));
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.shipping-methods'), { search }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title={`Shipping Methods | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-orange-500" />
                            Shipping Methods
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Create delivery options with price, status, and sort order for checkout.
                        </p>
                    </div>
                    <button
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Add Shipping Method
                    </button>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex justify-between items-center">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search shipping methods..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Method</th>
                                    <th className="pb-4 pt-2">Charge</th>
                                    <th className="pb-4 pt-2">Weight Based</th>
                                    <th className="pb-4 pt-2">Status</th>
                                    <th className="pb-4 pt-2">Sort Order</th>
                                    <th className="pb-4 pt-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {shippingMethods.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                            No shipping methods found. Click "Add Shipping Method" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    shippingMethods.data.map((method) => (
                                        <tr key={method.id} className="hover:bg-slate-50/50">
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{method.name}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase mt-0.5 font-mono">{method.slug}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-700 font-bold text-sm">{"\u09F3"}{parseFloat(method.charge).toFixed(2)}</td>
                                            <td className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                        method.weight_based_enabled
                                                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {method.weight_based_enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    {method.weight_based_enabled && method.weight_rates && (
                                                        <span className="max-w-48 truncate text-[10px] text-slate-400 font-mono" title={method.weight_rates}>{method.weight_rates}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider inline-flex items-center gap-1 ${
                                                    method.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${method.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {method.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-700 font-bold text-sm">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                                    {method.sort_order}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEditClick(method)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit shipping method"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(method.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete shipping method"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-lg bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Shipping Method' : 'Add Shipping Method'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-550" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. Delivery Inside Dhaka"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Charge ({"\u09F3"})</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.charge}
                                            onChange={e => form.setData('charge', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="80"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Sort Order</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={form.data.sort_order}
                                            onChange={e => form.setData('sort_order', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                    <label className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3">
                                        <div>
                                            <span className="block font-bold text-slate-700 uppercase">Weight Based Shipping</span>
                                            <span className="mt-1 block text-[10px] font-medium text-slate-400">When enabled, charge is calculated from total cart weight in kg.</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.data.weight_based_enabled)}
                                            onChange={e => form.setData('weight_based_enabled', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                        />
                                    </label>

                                    {form.data.weight_based_enabled && (
                                        <div>
                                            <label className="font-bold text-slate-600 uppercase">Rates <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">?</span></label>
                                            <textarea
                                                value={form.data.weight_rates}
                                                onChange={e => form.setData('weight_rates', e.target.value)}
                                                rows="5"
                                                placeholder="0.5:60,1:70,2:90,3:105,9999999999:225"
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                                            />
                                            <p className="mt-1 text-[10px] text-slate-400">Format: max weight kg:charge. Example 2:90 means up to 2kg costs {"\u09F3"}90.</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Status</label>
                                    <select
                                        value={form.data.status}
                                        onChange={e => form.setData('status', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Shipping Method
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
