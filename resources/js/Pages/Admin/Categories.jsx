import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import { 
    Plus, Trash2, Edit3, X, Save, FolderOpen, AlertCircle, Sparkles, Loader2, RotateCcw, Filter 
} from 'lucide-react';

function CategoriesTableSkeleton({ rowsCount = 8 }) {
    return (
        <tbody className="divide-y divide-slate-50 font-medium animate-pulse">
            {Array.from({ length: rowsCount }).map((_, idx) => (
                <tr key={idx} className="hover:bg-slate-55/30">
                    <td className="px-2 py-3.5 text-center">
                        <div className="mx-auto h-4 w-4 rounded border border-slate-200 bg-slate-100"></div>
                    </td>
                    <td className="px-2 py-3.5 text-center">
                        <div className="mx-auto h-3 w-4 rounded bg-slate-200"></div>
                    </td>
                    {/* Category Details */}
                    <td className="px-2 py-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div className="h-3.5 w-36 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-48 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Slug / Path */}
                    <td className="py-3.5">
                        <div className="h-3 w-24 bg-slate-200 rounded font-mono"></div>
                    </td>

                    {/* Category Level */}
                    <td className="py-3.5">
                        <div className="h-5 w-24 bg-slate-100 rounded-full"></div>
                    </td>

                    {/* Home Page Visibility */}
                    <td className="py-3.5">
                        <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
                    </td>

                    {/* Header Menu */}
                    <td className="py-3.5">
                        <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                        <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                            <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

export default function AdminCategories({ categories, parentCategories = [], filters = {} }) {
    const storeName = useStoreName();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || '');
    const [parentId, setParentId] = useState(filters.parent_id || '');
    const [showOnHome, setShowOnHome] = useState(filters.show_on_home || '');
    const [isFeatured, setIsFeatured] = useState(filters.is_featured || '');
    const [status, setStatus] = useState(filters.status || '');

    // Sync filters with props
    useEffect(() => {
        setSearch(filters.search || '');
        setLevel(filters.level || '');
        setParentId(filters.parent_id || '');
        setShowOnHome(filters.show_on_home || '');
        setIsFeatured(filters.is_featured || '');
        setStatus(filters.status || '');
    }, [filters]);

    // Initial load transition
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    const applyFilters = (newFilters = {}) => {
        setIsFiltering(true);
        router.get(route('admin.categories'), {
            search: newFilters.search !== undefined ? newFilters.search : search,
            level: newFilters.level !== undefined ? newFilters.level : level,
            parent_id: newFilters.parent_id !== undefined ? newFilters.parent_id : parentId,
            show_on_home: newFilters.show_on_home !== undefined ? newFilters.show_on_home : showOnHome,
            is_featured: newFilters.is_featured !== undefined ? newFilters.is_featured : isFeatured,
            status: newFilters.status !== undefined ? newFilters.status : status,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsFiltering(true),
            onFinish: () => {
                setIsFiltering(false);
                setIsLoading(false);
            },
            onError: () => {
                setIsFiltering(false);
                setIsLoading(false);
            }
        });
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Category form state
    const form = useForm({
        id: '',
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        image: null,
        image_url: '',
        is_featured: false,
        show_on_home: false,
        is_active: true
    });

    const handleEditClick = (category) => {
        form.setData({
            id: category.id,
            name: category.name,
            slug: category.slug || '',
            parent_id: category.parent_id || '',
            description: category.description || '',
            image: null,
            image_url: category.image || '',
            is_featured: category.is_featured === 1 || category.is_featured === true,
            show_on_home: category.show_on_home === 1 || category.show_on_home === true,
            is_active: category.is_active === 1 || category.is_active === true
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        form.post(route('admin.categories.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            }
        });
    };

    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this category? All subcategories associated with it will also be deleted.')) {
            router.delete(route('admin.categories.delete', { id }));
        }
    };

    const currentPageCategoryIds = categories.data?.map(category => category.id) || [];
    const allCurrentPageSelected = currentPageCategoryIds.length > 0 && currentPageCategoryIds.every(id => selectedCategoryIds.includes(id));

    const toggleCategorySelection = (id) => {
        setSelectedCategoryIds(prev => (
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        ));
    };

    const toggleCurrentPageSelection = () => {
        setSelectedCategoryIds(prev => {
            if (allCurrentPageSelected) {
                return prev.filter(id => !currentPageCategoryIds.includes(id));
            }

            return [...new Set([...prev, ...currentPageCategoryIds])];
        });
    };

    const handleBulkDelete = () => {
        if (!selectedCategoryIds.length) return;

        if (confirm(`Are you sure you want to delete ${selectedCategoryIds.length} selected category(ies)? All subcategories associated with them will also be deleted.`)) {
            router.delete(route('admin.categories.bulk-delete'), {
                data: { ids: selectedCategoryIds },
                preserveScroll: true,
                onSuccess: () => setSelectedCategoryIds([]),
            });
        }
    };

    const showSkeleton = isLoading || isFiltering;
    const hasActiveFilters = search || level || parentId || showOnHome || isFeatured || status;

    return (
        <AdminLayout>
            <Head title={`Categories & Subcategories Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-orange-500" />
                                Categories & Subcategories
                            </h1>
                            {isFiltering && (
                                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 animate-pulse border border-orange-100">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Updating...
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Set up shop navigation, catalog hierarchy, and feature banners.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedCategoryIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-xs font-bold text-red-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-100"
                                title="Delete selected categories"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>{selectedCategoryIds.length}</span>
                            </button>
                        )}
                        <button 
                            onClick={handleNewClick}
                            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Create Category
                        </button>
                    </div>
                </div>

                {/* Filter Controls Row */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        
                        {/* Search Query */}
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name/slug..."
                                value={search}
                                disabled={isFiltering}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            />
                        </div>

                        {/* Level Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Level</label>
                            <select
                                value={level}
                                disabled={isFiltering}
                                onChange={e => {
                                    setLevel(e.target.value);
                                    applyFilters({ level: e.target.value, parent_id: e.target.value === 'main' ? '' : parentId });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="">All Levels</option>
                                <option value="main">Main Categories Only</option>
                                <option value="sub">Subcategories Only</option>
                            </select>
                        </div>

                        {/* Parent Category Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Category</label>
                            <select
                                value={parentId}
                                disabled={isFiltering || level === 'main'}
                                onChange={e => {
                                    setParentId(e.target.value);
                                    applyFilters({ parent_id: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="">All Parent Categories</option>
                                {parentCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Home Page Visibility Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Home Page</label>
                            <select
                                value={showOnHome}
                                disabled={isFiltering}
                                onChange={e => {
                                    setShowOnHome(e.target.value);
                                    applyFilters({ show_on_home: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="">All Visibility</option>
                                <option value="1">Visible on Home</option>
                                <option value="0">Hidden on Home</option>
                            </select>
                        </div>

                        {/* Header Menu Featured Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Header Menu</label>
                            <select
                                value={isFeatured}
                                disabled={isFiltering}
                                onChange={e => {
                                    setIsFeatured(e.target.value);
                                    applyFilters({ is_featured: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="">All Headers</option>
                                <option value="1">Featured in Header</option>
                                <option value="0">Standard</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                                value={status}
                                disabled={isFiltering}
                                onChange={e => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Disabled</option>
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            disabled={isFiltering}
                            onClick={() => {
                                setSearch('');
                                setLevel('');
                                setParentId('');
                                setShowOnHome('');
                                setIsFeatured('');
                                setStatus('');
                                applyFilters({
                                    search: '',
                                    level: '',
                                    parent_id: '',
                                    show_on_home: '',
                                    is_featured: '',
                                    status: '',
                                });
                            }}
                            className={`px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                isFiltering ? 'cursor-wait opacity-60' : ''
                            }`}
                        >
                            <RotateCcw className={`w-3.5 h-3.5 ${isFiltering ? 'animate-spin text-slate-700' : ''}`} />
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Center Modal Dialog */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative my-4" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                                <h3 className="text-base font-bold text-slate-800">
                                    {form.data.id ? 'Edit Category' : 'Create New Category'}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Category Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. Electronics, Smart Watches"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Slug / Path <span className="text-slate-400 normal-case">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={form.data.slug}
                                        onChange={e => form.setData('slug', e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
                                        className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="e.g. smart-electronics"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">
                                        Leave empty to auto-create from category name. Used in links like /category/smart-electronics.
                                    </p>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Parent Category (For Sub-categories)</label>
                                    <select
                                        value={form.data.parent_id}
                                        onChange={e => form.setData('parent_id', e.target.value)}
                                        className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none"
                                    >
                                        <option value="">None (Make Main Parent Category)</option>
                                        {parentCategories
                                            .filter(cat => cat.id !== form.data.id) // Prevent self-referencing parent loops
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))
                                        }
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">
                                        Select a parent category if this is a subcategory (e.g. "Smartphones" under "Electronics").
                                    </p>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 uppercase">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)}
                                        rows="3"
                                        className="w-full mt-1 p-3 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Brief description of products in this category..."
                                    />
                                </div>

                                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Category Icon / Banner</h4>
                                    
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Upload Image file</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => form.setData('image', e.target.files[0])}
                                            className="w-full mt-1 px-3 py-1.5 border border-slate-250 rounded-xl text-xs bg-white focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Or Image URL</label>
                                        <input
                                            type="text"
                                            value={form.data.image_url}
                                            onChange={e => form.setData('image_url', e.target.value)}
                                            placeholder="https://images.unsplash.com/photo-..."
                                            className="w-full mt-1 px-3.5 py-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                    
                                    {form.data.image_url && (
                                        <div className="mt-2 flex items-center gap-3">
                                            <img src={form.data.image_url} className="w-10 h-10 object-cover rounded-lg border bg-white" alt="preview" />
                                            <span className="text-[10px] text-slate-400 truncate max-w-xs">{form.data.image_url}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="flex items-start gap-2 p-3 border border-slate-150 rounded-xl bg-white">
                                        <input
                                            type="checkbox"
                                            id="show_on_home"
                                            checked={form.data.show_on_home}
                                            onChange={e => form.setData('show_on_home', e.target.checked)}
                                            className="mt-0.5 w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="show_on_home" className="cursor-pointer select-none">
                                            <span className="block font-bold text-slate-700">Show category on Home Page</span>
                                            <span className="mt-0.5 block text-[9px] leading-3 text-slate-400">Displays in Shop By Category.</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 border border-slate-150 rounded-xl bg-white">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={form.data.is_featured}
                                            onChange={e => form.setData('is_featured', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_featured" className="cursor-pointer select-none">
                                            <span className="block font-bold text-slate-700">Featured on Home</span>
                                            <span className="mt-0.5 block text-[9px] leading-3 text-slate-400">Displays in the header Categories menu.</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 border border-slate-150 rounded-xl bg-white">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={form.data.is_active}
                                            onChange={e => form.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_active" className="font-bold text-slate-700 cursor-pointer select-none">
                                            Status: Active
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Category Details
                                </button>

                            </form>

                        </div>
                    </div>
                )}

                {/* Categories Inventory Grid Table */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                                    <th className="px-2 py-3 text-center w-[52px]">
                                        <input
                                            type="checkbox"
                                            checked={allCurrentPageSelected}
                                            onChange={toggleCurrentPageSelection}
                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                            aria-label="Select all categories on this page"
                                        />
                                    </th>
                                    <th className="px-2 py-3 text-center w-[60px]">SL</th>
                                    <th className="px-2 py-3">Category Details</th>
                                    <th className="px-2 py-3">Slug / Path</th>
                                    <th className="px-2 py-3">Category Level</th>
                                    <th className="px-2 py-3">Home Page</th>
                                    <th className="px-2 py-3">Header</th>
                                    <th className="px-2 py-3">Status</th>
                                    <th className="px-2 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            {showSkeleton ? (
                                <CategoriesTableSkeleton rowsCount={8} />
                            ) : (
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="py-12 text-center text-slate-400">
                                                <p className="text-sm font-semibold text-slate-600">No categories found</p>
                                                <p className="text-xs mt-1 text-slate-400">Try adjusting your search criteria or click "Create Category" to add one.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.data.map((cat, index) => (
                                            <tr key={cat.id} className={`hover:bg-slate-55/30 ${selectedCategoryIds.includes(cat.id) ? 'bg-orange-50/40' : ''}`}>
                                                <td className="px-2 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategoryIds.includes(cat.id)}
                                                        onChange={() => toggleCategorySelection(cat.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                        aria-label={`Select ${cat.name}`}
                                                    />
                                                </td>
                                                <td className="px-2 py-3.5 text-center font-mono text-[11px] font-bold text-slate-400">
                                                    {(categories.from || 1) + index}
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                                                            <AdminImage
                                                                src={cat.image}
                                                                alt={cat.name}
                                                                className="w-full h-full object-cover"
                                                                wrapperClassName="w-full h-full rounded-lg"
                                                                size="sm"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-slate-800 truncate max-w-[200px]">{cat.name}</span>
                                                            <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{cat.description || 'No description provided.'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3.5 font-mono text-slate-500 font-bold">{cat.slug}</td>
                                                <td className="px-2 py-3.5">
                                                    {cat.parent ? (
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-[9px] uppercase">
                                                            Sub of {cat.parent.name}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full font-bold text-[9px] uppercase">
                                                            Main Category
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                        cat.show_on_home
                                                            ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {cat.show_on_home ? 'Visible' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                        cat.is_featured 
                                                            ? 'bg-amber-100 text-amber-850 border border-amber-200' 
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {cat.is_featured ? 'Featured' : 'Standard'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                        cat.is_active 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {cat.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5 text-right flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => handleEditClick(cat)}
                                                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                        title="Edit category details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(cat.id)}
                                                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {categories.links.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <button
                                        key={idx}
                                        disabled={isFiltering}
                                        onClick={() => {
                                            if (isFiltering) return;
                                            setIsFiltering(true);
                                            router.visit(link.url, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                onStart: () => setIsFiltering(true),
                                                onFinish: () => setIsFiltering(false),
                                                onError: () => setIsFiltering(false),
                                            });
                                        }}
                                        className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-orange-500 border-orange-500 text-white' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        } ${isFiltering ? 'cursor-wait opacity-70' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}


