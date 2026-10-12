import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, X, Save, Ticket, Percent } from 'lucide-react';

export default function Coupons({ coupons }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form setup
    const form = useForm({
        id: '',
        code: '',
        type: 'fixed',
        value: '',
        min_spend: '0.00',
        max_discount: '',
        starts_at: '',
        expires_at: '',
        usage_limit: '',
        is_active: true
    });

    const handleEditClick = (coupon) => {
        form.setData({
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_spend: coupon.min_spend || '0.00',
            max_discount: coupon.max_discount || '',
            starts_at: coupon.starts_at ? coupon.starts_at.substring(0, 16) : '',
            expires_at: coupon.expires_at ? coupon.expires_at.substring(0, 16) : '',
            usage_limit: coupon.usage_limit || '',
            is_active: coupon.is_active === 1 || coupon.is_active === true
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            code: '',
            type: 'fixed',
            value: '',
            min_spend: '0.00',
            max_discount: '',
            starts_at: '',
            expires_at: '',
            usage_limit: '',
            is_active: true
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.coupons.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this coupon? This cannot be undone.')) {
            router.delete(route('admin.coupons.delete', { id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Coupon Codes Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-orange-500" />
                            Coupon Codes Manager
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Create and manage active promo codes, percentages, fixed value discount rates.
                        </p>
                    </div>
                    <button 
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Create Coupon
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                        Active Promo List
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Code</th>
                                    <th className="pb-4 pt-2">Discount Value</th>
                                    <th className="pb-4 pt-2">Type</th>
                                    <th className="pb-4 pt-2">Min Spend</th>
                                    <th className="pb-4 pt-2">Max Disc.</th>
                                    <th className="pb-4 pt-2">Usage count</th>
                                    <th className="pb-4 pt-2">Status</th>
                                    <th className="pb-4 pt-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                                            No discount coupons found. Click "Create Coupon" to register one.
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-slate-50/50">
                                            <td className="py-4">
                                                <span className="font-extrabold text-slate-800 text-sm px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                                                    {coupon.code}
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-800 font-bold">
                                                {coupon.type === 'percent' ? `${coupon.value}%` : `৳${coupon.value}`}
                                            </td>
                                            <td className="py-4 uppercase text-[10px] font-extrabold text-slate-400">
                                                {coupon.type}
                                            </td>
                                            <td className="py-4 text-slate-650">
                                                ৳{coupon.min_spend}
                                            </td>
                                            <td className="py-4 text-slate-650">
                                                {coupon.max_discount ? `৳${coupon.max_discount}` : 'Unlimited'}
                                            </td>
                                            <td className="py-4">
                                                <span className="font-bold text-slate-700">{coupon.usage_count}</span>
                                                {coupon.usage_limit ? <span className="text-slate-400"> / {coupon.usage_limit}</span> : ' (Unlimited)'}
                                            </td>
                                            <td className="py-4">
                                                {coupon.is_active ? (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-extrabold uppercase border border-emerald-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-extrabold uppercase border border-red-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => handleEditClick(coupon)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(coupon.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete status"
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
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Coupon Code</label>
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={e => form.setData('code', e.target.value.toUpperCase())}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs uppercase font-extrabold focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. EXTRA50"
                                        required
                                    />
                                    {form.errors.code && <div className="text-red-550 mt-1 font-bold">{form.errors.code}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Coupon Type</label>
                                        <select
                                            value={form.data.type}
                                            onChange={e => form.setData('type', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        >
                                            <option value="fixed">Fixed BDT</option>
                                            <option value="percent">Percentage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Discount Value</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.value}
                                            onChange={e => form.setData('value', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="e.g. 50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Min Spend (৳)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.min_spend}
                                            onChange={e => form.setData('min_spend', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Max Discount (৳)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.max_discount}
                                            onChange={e => form.setData('max_discount', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="Leave blank for unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Starts At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.starts_at}
                                            onChange={e => form.setData('starts_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Expires At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.expires_at}
                                            onChange={e => form.setData('expires_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={form.data.usage_limit}
                                        onChange={e => form.setData('usage_limit', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Leave blank for unlimited"
                                    />
                                </div>

                                <div className="flex items-center pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={e => form.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        ACTIVE & ELIGIBLE FOR DISCOUNTS
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Coupon Code
                                </button>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
