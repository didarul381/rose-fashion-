import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, X, Save, FolderOpen, Palette } from 'lucide-react';

export default function OrderStatuses({ statuses }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form setup
    const form = useForm({
        id: '',
        name: '',
        color: '#6b7280',
        sort_order: 0,
        is_default: false
    });

    const handleEditClick = (status) => {
        form.setData({
            id: status.id,
            name: status.name,
            color: status.color || '#6b7280',
            sort_order: status.sort_order || 0,
            is_default: status.is_default === 1 || status.is_default === true
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            name: '',
            color: '#3b82f6',
            sort_order: statuses.length > 0 ? Math.max(...statuses.map(s => s.sort_order)) + 1 : 0,
            is_default: false
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.order-statuses.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this order status? Orders with this status may need status reassignment.')) {
            router.delete(route('admin.order-statuses.delete', { id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Order Statuses Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-orange-500" />
                            Order Statuses
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Manage order lifecycle stages, tab colors, and display order priorities.
                        </p>
                    </div>
                    <button 
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Status
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                        Order Status List
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Order Status Name</th>
                                    <th className="pb-4 pt-2">Color</th>
                                    <th className="pb-4 pt-2">Sort Order</th>
                                    <th className="pb-4 pt-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {statuses.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400 italic">
                                            No order statuses found. Click "Add New" to register a status.
                                        </td>
                                    </tr>
                                ) : (
                                    statuses.map((status) => (
                                        <tr key={status.id} className="hover:bg-slate-50/50">
                                            <td className="py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {status.name}
                                                    </span>
                                                    {status.is_default && (
                                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-extrabold uppercase border border-orange-200">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-xs inline-block"
                                                        style={{ backgroundColor: status.color || '#6b7280' }}
                                                    />
                                                    <span className="font-mono text-[10px] text-slate-450 uppercase">
                                                        {status.color || '#6b7280'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <input 
                                                    type="number"
                                                    value={status.sort_order}
                                                    readOnly
                                                    className="w-16 px-2 py-1 text-center border border-slate-200 roundedbg-slate-50 text-slate-600 font-bold focus:outline-none"
                                                />
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => handleEditClick(status)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {!status.is_default && (
                                                        <button 
                                                            onClick={() => handleDeleteClick(status.id)}
                                                            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                            title="Delete status"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
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
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Order Status' : 'Add New Order Status'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Status Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. Processing"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Sort Order</label>
                                        <input
                                            type="number"
                                            value={form.data.sort_order}
                                            onChange={e => form.setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Badge Color</label>
                                        <div className="flex gap-2 items-center mt-1">
                                            <input
                                                type="color"
                                                value={form.data.color}
                                                onChange={e => form.setData('color', e.target.value)}
                                                className="w-10 h-10 p-0.5 border border-slate-200 rounded-lg cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={form.data.color}
                                                onChange={e => form.setData('color', e.target.value)}
                                                className="w-full px-2.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_default}
                                            onChange={e => form.setData('is_default', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        SET AS DEFAULT STATUS FOR NEW ORDERS
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Order Status
                                </button>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
