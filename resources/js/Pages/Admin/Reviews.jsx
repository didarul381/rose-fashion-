import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Plus, Trash2, Edit3, CheckCircle2, X, Search, Eye, EyeOff } from 'lucide-react';

export default function AdminReviews({ reviews, products, users, filters = {} }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [productId, setProductId] = useState(filters.product_id || '');

    const form = useForm({
        id: '',
        product_id: '',
        user_id: '',
        rating: 5,
        comment: '',
        is_approved: false,
    });

    useEffect(() => {
        setSearch(filters.search || '');
        setStatus(filters.status || '');
        setProductId(filters.product_id || '');
    }, [filters]);

    const applyFilters = (override = {}) => {
        router.get(route('admin.reviews'), {
            search: override.search !== undefined ? override.search : search,
            status: override.status !== undefined ? override.status : status,
            product_id: override.product_id !== undefined ? override.product_id : productId,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            applyFilters({ search });
        }, 400);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            product_id: '',
            user_id: '',
            rating: 5,
            comment: '',
            is_approved: false,
        });
        setIsFormOpen(true);
    };

    const handleEditClick = (review) => {
        form.setData({
            id: review.id,
            product_id: review.product_id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment || '',
            is_approved: review.is_approved,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        router.post(route('admin.reviews.save'), form.data, {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this review?')) {
            router.delete(route('admin.reviews.delete', { id }));
        }
    };

    const handleApprovalToggle = (review) => {
        router.post(route('admin.reviews.approve', { id: review.id }), {
            is_approved: !review.is_approved,
        });
    };

    return (
        <AdminLayout>
            <Head title={`Product Reviews Moderation | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#e51b75]" />
                            Product Reviews Moderation
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Approve, edit, or delete reviews before they appear on product pages.
                        </p>
                    </div>
                    <button
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-[#e51b75] hover:bg-[#c2185b] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Add Review
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center gap-3">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search reviews, products or users"
                            className="w-full border-0 outline-none text-xs text-slate-700"
                        />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Review Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Filter product</label>
                        <select
                            value={productId}
                            onChange={(e) => {
                                setProductId(e.target.value);
                                applyFilters({ product_id: e.target.value });
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="">All products</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-slate-500">
                        <thead>
                            <tr className="border-b border-slate-150 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                <th className="py-4">Reviewer</th>
                                <th className="py-4">Product</th>
                                <th className="py-4">Rating</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Comment</th>
                                <th className="py-4">Submitted</th>
                                <th className="py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                            {reviews.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-slate-400 italic">
                                        No reviews found. Adjust filters or create a new review.
                                    </td>
                                </tr>
                            ) : (
                                reviews.data.map(review => (
                                    <tr key={review.id} className="hover:bg-slate-50">
                                        <td className="py-4 pr-4">
                                            <div className="text-slate-800 font-bold">{review.user?.name || 'Guest'}</div>
                                            <div className="text-[10px] text-slate-400">User ID {review.user_id}</div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="text-slate-800 font-semibold">{review.product?.name || 'Unknown product'}</div>
                                            <div className="text-[10px] text-slate-400">Product ID {review.product_id}</div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                                                {review.rating} ★
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            {review.is_approved ? (
                                                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold">Approved</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] uppercase font-bold">Pending</span>
                                            )}
                                        </td>
                                        <td className="py-4 pr-4 max-w-xl">
                                            <p className="line-clamp-2 text-slate-700">{review.comment || 'No comment'}</p>
                                        </td>
                                        <td className="py-4 pr-4 text-[10px] text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString()}<br />{new Date(review.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="py-4 text-right space-x-1 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleApprovalToggle(review)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                {review.is_approved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {review.is_approved ? 'Unpublish' : 'Approve'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEditClick(review)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(review.id)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {form.data.id ? 'Edit Review' : 'Add New Review'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Reviews can be approved before they appear on the storefront.</p>
                                </div>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Product</label>
                                        <select
                                            value={form.data.product_id}
                                            onChange={e => form.setData('product_id', e.target.value)}
                                            className="w-full mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                                            required
                                        >
                                            <option value="">Select product</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Reviewer</label>
                                        <select
                                            value={form.data.user_id}
                                            onChange={e => form.setData('user_id', e.target.value)}
                                            className="w-full mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                                            required
                                        >
                                            <option value="">Select user</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Rating</label>
                                        <select
                                            value={form.data.rating}
                                            onChange={e => form.setData('rating', parseInt(e.target.value, 10))}
                                            className="w-full mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                                            required
                                        >
                                            {[5, 4, 3, 2, 1].map(value => (
                                                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Approval</label>
                                        <select
                                            value={form.data.is_approved ? '1' : '0'}
                                            onChange={e => form.setData('is_approved', e.target.value === '1')}
                                            className="w-full mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                                        >
                                            <option value="1">Approved</option>
                                            <option value="0">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Comment</label>
                                    <textarea
                                        value={form.data.comment}
                                        onChange={e => form.setData('comment', e.target.value)}
                                        rows={4}
                                        className="w-full mt-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-3xl bg-[#e51b75] px-5 py-3 text-xs font-bold text-white hover:bg-[#c2185b]"
                                    >
                                        Save Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
