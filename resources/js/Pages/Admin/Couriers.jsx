import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, X, Save, Truck, Info, Search, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export default function Couriers({ couriers, filters }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    // Form setup
    const form = useForm({
        id: '',
        name: '',
        code: '',
        inside_city_charge: '',
        outside_city_charge: '',
        is_default: false,
        is_active: true,
        api_key: '',
        secret_key: ''
    });

    const handleEditClick = (courier) => {
        form.setData({
            id: courier.id,
            name: courier.name,
            code: courier.code,
            inside_city_charge: courier.inside_city_charge,
            outside_city_charge: courier.outside_city_charge,
            is_default: courier.is_default === 1 || courier.is_default === true,
            is_active: courier.is_active === 1 || courier.is_active === true,
            api_key: courier.api_key || '',
            secret_key: courier.secret_key || ''
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.couriers.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this courier configuration?')) {
            router.delete(route('admin.couriers.delete', { id }));
        }
    };

    const handleToggleDefault = (courier) => {
        router.post(route('admin.couriers.save'), {
            id: courier.id,
            name: courier.name,
            code: courier.code,
            inside_city_charge: courier.inside_city_charge,
            outside_city_charge: courier.outside_city_charge,
            is_default: !courier.is_default,
            is_active: courier.is_active,
            api_key: courier.api_key,
            secret_key: courier.secret_key
        }, { preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.couriers'), { search }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title={`Couriers | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-orange-500" />
                            Couriers
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Set up courier integrations, delivery zones, and API credentials.
                        </p>
                    </div>
                    <button 
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Courier
                    </button>
                </div>

                {/* Filters / Search Bar */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex justify-between items-center">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search couriers..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                    </form>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Courier</th>
                                    <th className="pb-4 pt-2">Inside City</th>
                                    <th className="pb-4 pt-2">Outside City</th>
                                    <th className="pb-4 pt-2">Default</th>
                                    <th className="pb-4 pt-2">Status</th>
                                    <th className="pb-4 pt-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {couriers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                            No couriers found. Click "Add New" to register a courier integration.
                                        </td>
                                    </tr>
                                ) : (
                                    couriers.data.map((courier) => (
                                        <tr key={courier.id} className="hover:bg-slate-50/50">
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{courier.name}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase mt-0.5 font-mono">{courier.code}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-700 font-bold text-sm">৳{parseFloat(courier.inside_city_charge).toFixed(0)}</td>
                                            <td className="py-4 text-slate-700 font-bold text-sm">৳{parseFloat(courier.outside_city_charge).toFixed(0)}</td>
                                            <td className="py-4">
                                                <button 
                                                    onClick={() => handleToggleDefault(courier)}
                                                    className="focus:outline-none"
                                                    title={courier.is_default ? "Default method" : "Set as default"}
                                                >
                                                    {courier.is_default ? (
                                                        <div className="w-10 h-6 bg-emerald-600 rounded-full p-1 flex items-center justify-end transition-all">
                                                            <div className="w-4 h-4 bg-white rounded-full shadow" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-6 bg-slate-350 rounded-full p-1 flex items-center justify-start transition-all">
                                                            <div className="w-4 h-4 bg-white rounded-full shadow" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                    courier.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {courier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => handleEditClick(courier)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(courier.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete courier"
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

                {/* Creation / Editing Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-lg bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Courier Configuration' : 'Add New Courier'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-550" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Courier Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. Steadfast Courier"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">System Code</label>
                                        <input
                                            type="text"
                                            value={form.data.code}
                                            onChange={e => form.setData('code', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="e.g. steadfast"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end pb-3 gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_default}
                                                onChange={e => form.setData('is_default', e.target.checked)}
                                                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                            />
                                            SET DEFAULT
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_active}
                                                onChange={e => form.setData('is_active', e.target.checked)}
                                                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                            />
                                            ACTIVE
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Inside City Charge (৳)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.inside_city_charge}
                                            onChange={e => form.setData('inside_city_charge', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="80"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Outside City Charge (৳)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.outside_city_charge}
                                            onChange={e => form.setData('outside_city_charge', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="120"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                                    <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                        <Info className="w-4 h-4 text-slate-400" />
                                        API Credentials (Optional)
                                    </div>
                                    
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">API Key</label>
                                        <input
                                            type="text"
                                            value={form.data.api_key}
                                            onChange={e => form.setData('api_key', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="Paste API credentials for delivery syncing"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Secret / Client ID</label>
                                        <input
                                            type="password"
                                            value={form.data.secret_key}
                                            onChange={e => form.setData('secret_key', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Courier Settings
                                </button>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
