import { useStoreName } from '../../Hooks/useStoreName';
import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';
import { Edit3, Loader2, Plus, Save, Search, Trash2, Upload } from 'lucide-react';
import SummernoteEditor from '../../Components/SummernoteEditor';

function slugify(value) {
    return String(value || '').toLowerCase().trim().replace(/[\'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function Pages({ pages, filters }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isSlugManual, setIsSlugManual] = useState(false);
    const [uploadingMetaImage, setUploadingMetaImage] = useState(false);
    const metaImageInputRef = useRef(null);
    const pageBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/page/` : '/page/';

    const form = useForm({
        id: '',
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        excerpt: '',
        hero_image: '',
        layout: 'standard',
        status: 'active',
        sort_order: 0,
        show_in_footer: true,
    });

    const handleEditClick = (page) => {
        form.setData({
            id: page.id,
            title: page.title || '',
            slug: page.slug || '',
            content: page.content || '',
            meta_title: page.meta_title || '',
            meta_description: page.meta_description || '',
            excerpt: page.excerpt || '',
            hero_image: page.hero_image || '',
            layout: page.layout || 'standard',
            status: page.status || 'active',
            sort_order: page.sort_order ?? 0,
            show_in_footer: Boolean(page.show_in_footer),
        });
        setIsSlugManual(true);
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            title: '',
            slug: '',
            content: '',
            meta_title: '',
            meta_description: '',
            excerpt: '',
            hero_image: '',
            layout: 'standard',
            status: 'active',
            sort_order: pages?.data?.length ? pages.data.length + 1 : 0,
            show_in_footer: true,
        });
        setIsSlugManual(false);
        setIsEditing(false);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.pages.save'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormOpen(false);
                setIsEditing(false);
                setIsSlugManual(false);
                form.reset();
            },
        });
    };

    const handleDeleteClick = (id) => { if (confirm('Delete this page?')) router.delete(route('admin.pages.delete', { id })); };
    const handleTitleChange = (value) => { form.setData('title', value); if (!isSlugManual) form.setData('slug', slugify(value)); };

    const uploadImage = async (target, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(route('admin.page-builder.upload-image'), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (response.data?.url) {
            form.setData(target, response.data.url);
        }
    };

    const handleMetaImageUpload = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingMetaImage(true);
        try { await uploadImage('hero_image', file); } finally { setUploadingMetaImage(false); if (metaImageInputRef.current) metaImageInputRef.current.value = ''; }
    };

    return (
        <AdminLayout>
            <Head title={`Pages | ${storeName} Admin`} />
            <div className="flex flex-col gap-6">
                {!isFormOpen ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Website Pages</h1>
                            </div>
                            <button
                                onClick={handleNewClick}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Page
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.get(route('admin.pages'), { search }, { preserveState: true, preserveScroll: true });
                                }}
                                className="flex w-full items-center gap-3"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search pages..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                    />
                                </div>
                            </form>

                            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                                            <th className="px-6 py-4">#</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">URL</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pages.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                                    No pages found. Click "Add New Page" to create one.
                                                </td>
                                            </tr>
                                        ) : pages.data.map((page, index) => {
                                            const pageUrl = `${pageBaseUrl}${page.slug}`;
                                            return (
                                                <tr key={page.id} className="hover:bg-slate-50/70">
                                                    <td className="px-6 py-5 text-slate-500">{index + 1}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">{page.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-slate-600">
                                                        <span className="break-all">{pageUrl}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditClick(page)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500 transition-all hover:bg-sky-100"
                                                                title="Edit page"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(page.id)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition-all hover:bg-rose-100"
                                                                title="Delete page"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Page' : 'Add New Page'}</h1>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setIsEditing(false);
                                        setIsSlugManual(false);
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Back to Pages
                                </button>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Page Content</h2>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-8 px-6 py-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-center">
                                        <label className="text-sm font-medium text-slate-900">
                                            Title <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.title}
                                            onChange={e => handleTitleChange(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                            placeholder="Title"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-start">
                                        <label className="pt-3 text-sm font-medium text-slate-900">
                                            Link <span className="text-rose-500">*</span>
                                        </label>
                                        <div>
                                            <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400">
                                                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                                    {pageBaseUrl}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={form.data.slug}
                                                    onChange={e => {
                                                        setIsSlugManual(true);
                                                        form.setData('slug', slugify(e.target.value));
                                                    }}
                                                    className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
                                                    placeholder="Slug"
                                                />
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">Use character, number, hypen only</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-start">
                                        <label className="pt-3 text-sm font-medium text-slate-900">
                                            Add Content <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                            <SummernoteEditor
                                                value={form.data.content}
                                                onChange={(content) => form.setData('content', content)}
                                                placeholder="Content.."
                                                height={420}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h2 className="text-lg font-semibold text-slate-900">Seo Fields</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-center">
                                        <label className="text-sm font-medium text-slate-900">Meta Title</label>
                                        <input
                                            type="text"
                                            value={form.data.meta_title}
                                            onChange={e => form.setData('meta_title', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                            placeholder="Title"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-start">
                                        <label className="pt-3 text-sm font-medium text-slate-900">Meta description</label>
                                        <textarea
                                            value={form.data.meta_description}
                                            onChange={e => form.setData('meta_description', e.target.value)}
                                            className="min-h-[92px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                            placeholder="Description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-start">
                                        <label className="pt-3 text-sm font-medium text-slate-900">Keywords</label>
                                        <div>
                                            <textarea
                                                value={form.data.excerpt}
                                                onChange={e => form.setData('excerpt', e.target.value)}
                                                className="min-h-[92px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                                placeholder="Keyword, Keyword"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">Separate with coma</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[140px_1fr] lg:items-center">
                                        <label className="text-sm font-medium text-slate-900">Meta Image</label>
                                        <div>
                                            <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400">
                                                <button
                                                    type="button"
                                                    onClick={() => metaImageInputRef.current?.click()}
                                                    className="border-r border-slate-200 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
                                                >
                                                    Browse
                                                </button>
                                                <input
                                                    ref={metaImageInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleMetaImageUpload}
                                                />
                                                <input
                                                    type="text"
                                                    value={form.data.hero_image}
                                                    onChange={e => form.setData('hero_image', e.target.value)}
                                                    className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
                                                    placeholder="Choose File"
                                                />
                                            </div>
                                            {form.data.hero_image && (
                                                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                                                    <img src={form.data.hero_image} alt="Meta preview" className="h-40 w-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Page
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
