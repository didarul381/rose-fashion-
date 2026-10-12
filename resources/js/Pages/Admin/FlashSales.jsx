import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, X, Save, Zap, Clock } from 'lucide-react';

export default function FlashSales({ flashSales, products }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form setup
    const form = useForm({
        id: '',
        title: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
        products: []
    });

    const handleEditClick = (sale) => {
        form.setData({
            id: sale.id,
            title: sale.title,
            starts_at: sale.starts_at ? sale.starts_at.substring(0, 16) : '',
            ends_at: sale.ends_at ? sale.ends_at.substring(0, 16) : '',
            is_active: sale.is_active === 1 || sale.is_active === true,
            products: sale.products.map(p => ({
                product_id: p.product_id,
                discount_type: p.discount_type,
                discount_value: p.discount_value
            }))
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            title: '',
            starts_at: '',
            ends_at: '',
            is_active: true,
            products: [{ product_id: products[0]?.id || '', discount_type: 'percent', discount_value: '10' }]
        });
        setIsFormOpen(true);
    };

    const handleAddProduct = () => {
        form.setData('products', [
            ...form.data.products,
            { product_id: products[0]?.id || '', discount_type: 'percent', discount_value: '10' }
        ]);
    };

    const handleRemoveProduct = (index) => {
        const newProducts = [...form.data.products];
        newProducts.splice(index, 1);
        form.setData('products', newProducts);
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...form.data.products];
        newProducts[index][field] = value;
        form.setData('products', newProducts);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.flash-sales.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this flash sale? This will also remove the discounted prices.')) {
            router.delete(route('admin.flash-sales.delete', { id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Flash Sales Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                            Flash Sales Manager
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Set up limited-time countdown sales for specific products with custom discount rates.
                        </p>
                    </div>
                    <button 
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Create Flash Sale
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                        Flash Sales List
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Title</th>
                                    <th className="pb-4 pt-2">Starts</th>
                                    <th className="pb-4 pt-2">Ends</th>
                                    <th className="pb-4 pt-2">Items Count</th>
                                    <th className="pb-4 pt-2">Status</th>
                                    <th className="pb-4 pt-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {flashSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                            No flash sales found. Click "Create Flash Sale" to register one.
                                        </td>
                                    </tr>
                                ) : (
                                    flashSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50/50">
                                            <td className="py-4 font-bold text-slate-800 text-sm">
                                                {sale.title}
                                            </td>
                                            <td className="py-4 text-slate-650 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {new Date(sale.starts_at).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-slate-650">
                                                {new Date(sale.ends_at).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-slate-700 font-bold">
                                                {sale.products?.length || 0} Products
                                            </td>
                                            <td className="py-4">
                                                {sale.is_active ? (
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
                                                        onClick={() => handleEditClick(sale)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(sale.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete sale"
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

                {/* Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Flash Sale' : 'Create Flash Sale'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Flash Sale Title</label>
                                    <input
                                        type="text"
                                        value={form.data.title}
                                        onChange={e => form.setData('title', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. Summer Mega Deals"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Starts At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.starts_at}
                                            onChange={e => form.setData('starts_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Ends At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.ends_at}
                                            onChange={e => form.setData('ends_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Flash Sale Products Selection */}
                                <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/50">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-700">Associated Products</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            className="px-3 py-1 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-lg text-[10px] font-bold"
                                        >
                                            + Add Product
                                        </button>
                                    </div>

                                    {form.data.products.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded-lg">
                                            <select
                                                value={item.product_id}
                                                onChange={e => handleProductChange(idx, 'product_id', e.target.value)}
                                                className="w-2/5 p-2 border border-slate-200 rounded-lg text-[11px]"
                                                required
                                            >
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={item.discount_type}
                                                onChange={e => handleProductChange(idx, 'discount_type', e.target.value)}
                                                className="w-1/5 p-2 border border-slate-200 rounded-lg text-[11px]"
                                                required
                                            >
                                                <option value="percent">Percent (%)</option>
                                                <option value="fixed">Fixed BDT</option>
                                            </select>

                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.discount_value}
                                                onChange={e => handleProductChange(idx, 'discount_value', e.target.value)}
                                                className="w-1/5 p-2 border border-slate-200 rounded-lg text-[11px]"
                                                placeholder="Value"
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                disabled={form.data.products.length <= 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={e => form.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        ACTIVE & PUBLISHED ON STOREFRONT
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Flash Sale
                                </button>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
