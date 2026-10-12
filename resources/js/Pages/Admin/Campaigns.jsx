import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import { Plus, Trash2, Edit3, X, Save, Calendar, CheckSquare, Square, UploadCloud } from 'lucide-react';

export default function Campaigns({ campaigns, products }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form setup
    const form = useForm({
        id: '',
        title: '',
        slug: '',
        description: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
        banner_image: '',
        banner_file: null,
        product_ids: []
    });

    const handleEditClick = (campaign) => {
        form.setData({
            id: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            description: campaign.description || '',
            starts_at: campaign.starts_at ? campaign.starts_at.substring(0, 16) : '',
            ends_at: campaign.ends_at ? campaign.ends_at.substring(0, 16) : '',
            is_active: campaign.is_active === 1 || campaign.is_active === true,
            banner_image: campaign.banner_image || '',
            banner_file: null,
            product_ids: campaign.products.map(p => p.id)
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            title: '',
            slug: '',
            description: '',
            starts_at: '',
            ends_at: '',
            is_active: true,
            banner_image: '',
            banner_file: null,
            product_ids: []
        });
        setIsFormOpen(true);
    };

    const toggleProductSelection = (productId) => {
        const currentSelected = [...form.data.product_ids];
        const index = currentSelected.indexOf(productId);
        if (index > -1) {
            currentSelected.splice(index, 1);
        } else {
            currentSelected.push(productId);
        }
        form.setData('product_ids', currentSelected);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.campaigns.save'), {
            forceFormData: true,
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            router.delete(route('admin.campaigns.delete', { id }));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Campaigns Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Campaigns Manager
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Manage promotional landing collections (like 11.11, Eid Special campaigns) and products.
                        </p>
                    </div>
                    <button 
                        onClick={handleNewClick}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
                    >
                        <Plus className="w-4 h-4" />
                        Create Campaign
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                        Campaigns List
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-4 pt-2">Banner / Title</th>
                                    <th className="pb-4 pt-2">Slug</th>
                                    <th className="pb-4 pt-2">Products Count</th>
                                    <th className="pb-4 pt-2">Active Period</th>
                                    <th className="pb-4 pt-2">Status</th>
                                    <th className="pb-4 pt-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                                            No campaigns found. Click "Create Campaign" to register one.
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-slate-50/50">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <AdminImage
                                                        src={camp.banner_image}
                                                        alt={camp.title}
                                                        className="w-12 h-6 object-cover rounded-lg border border-slate-200"
                                                        wrapperClassName="w-12 h-6 rounded-lg border border-slate-200"
                                                        size="sm"
                                                    />
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {camp.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono text-[11px] text-slate-500">
                                                {camp.slug}
                                            </td>
                                            <td className="py-4 text-slate-700 font-bold">
                                                {camp.products?.length || 0} Products
                                            </td>
                                            <td className="py-4 text-slate-650">
                                                {camp.starts_at ? new Date(camp.starts_at).toLocaleDateString() : 'N/A'} - {camp.ends_at ? new Date(camp.ends_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="py-4">
                                                {camp.is_active ? (
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
                                                        onClick={() => handleEditClick(camp)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(camp.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete campaign"
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
                                    {form.data.id ? 'Edit Campaign' : 'Create Campaign'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Campaign Title</label>
                                        <input
                                            type="text"
                                            value={form.data.title}
                                            onChange={e => {
                                                form.setData(data => ({
                                                    ...data,
                                                    title: e.target.value,
                                                    slug: e.target.value.toLowerCase().replace(/ /g, '-')
                                                }));
                                            }}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="e.g. Winter Sale 2026"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Campaign Slug</label>
                                        <input
                                            type="text"
                                            value={form.data.slug}
                                            onChange={e => form.setData('slug', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="winter-sale-2026"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        rows="2"
                                        placeholder="Brief details about the campaign"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="font-bold text-slate-600 uppercase">Banner Image</label>
                                    <label className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-all">
                                        <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-orange-500" />
                                        <div>
                                            <p className="text-sm font-extrabold text-slate-800">
                                                {form.data.banner_file?.name || 'Upload campaign banner'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 4MB. Recommended wide banner image.</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => form.setData('banner_file', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {form.errors.banner_file && <p className="text-[11px] font-bold text-red-500">{form.errors.banner_file}</p>}

                                    <div>
                                        <label className="font-bold text-slate-500 uppercase">Or Banner Image URL</label>
                                        <input
                                            type="text"
                                            value={form.data.banner_image}
                                            onChange={e => form.setData('banner_image', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="https://example.com/banner.jpg"
                                        />
                                    </div>

                                    {form.data.banner_image && !form.data.banner_file && (
                                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            <AdminImage
                                                src={form.data.banner_image}
                                                alt="Campaign banner preview"
                                                className="w-full h-28 object-cover"
                                                wrapperClassName="w-full h-28"
                                                size="md"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Starts At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.starts_at}
                                            onChange={e => form.setData('starts_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-600 uppercase">Ends At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.ends_at}
                                            onChange={e => form.setData('ends_at', e.target.value)}
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Product List Selector */}
                                <div className="border border-slate-100 p-4 rounded-xl space-y-2 bg-slate-50/50">
                                    <h4 className="font-bold text-slate-700">Select Campaign Products</h4>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                                        {products.map(p => {
                                            const isSelected = form.data.product_ids.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => toggleProductSelection(p.id)}
                                                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-[11px] ${isSelected ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200' : 'hover:bg-slate-50 text-slate-650'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="w-4 h-4 shrink-0 text-orange-600" /> : <Square className="w-4 h-4 shrink-0 text-slate-350" />}
                                                    <span className="truncate">{p.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={e => form.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        ACTIVE & ELIGIBLE FOR ACCESS
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Campaign
                                </button>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}

