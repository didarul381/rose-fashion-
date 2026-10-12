import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import { 
    Plus, Trash2, Edit3, X, Save, BadgeCheck, Loader2, RotateCcw, AlertCircle 
} from 'lucide-react';

function BrandsTableSkeleton({ rowsCount = 8 }) {
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
                    {/* Brand Details */}
                    <td className="py-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-44 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5">
                        <div className="h-3 w-20 bg-slate-200 rounded font-mono"></div>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3.5">
                        <div className="h-3.5 w-6 bg-slate-200 rounded"></div>
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

export default function AdminBrands({ brands = { data: [] }, filters = {} }) {
    const storeName = useStoreName();
    const safeFilters = (filters && !Array.isArray(filters) && typeof filters === 'object') ? filters : {};

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Filters state
    const [search, setSearch] = useState(typeof safeFilters.search === 'string' ? safeFilters.search : '');
    const [status, setStatus] = useState(typeof safeFilters.status === 'string' ? safeFilters.status : '');
    const [sort, setSort] = useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : 'order_index_asc');

    // Sync filters with props
    useEffect(() => {
        const currentFilters = (filters && !Array.isArray(filters) && typeof filters === 'object') ? filters : {};
        setSearch(typeof currentFilters.search === 'string' ? currentFilters.search : '');
        setStatus(typeof currentFilters.status === 'string' ? currentFilters.status : '');
        setSort(typeof currentFilters.sort === 'string' ? currentFilters.sort : 'order_index_asc');
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
        router.get(route('admin.brands'), {
            search: newFilters.search !== undefined ? newFilters.search : search,
            status: newFilters.status !== undefined ? newFilters.status : status,
            sort: newFilters.sort !== undefined ? newFilters.sort : sort,
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
            const currentSearch = (filters && typeof filters.search === 'string') ? filters.search : '';
            if (search !== currentSearch) {
                applyFilters({ search });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setSort('order_index_asc');
        setIsFiltering(true);
        router.get(route('admin.brands'), {}, {
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

    const hasActiveFilters = Boolean(
        search || 
        status || 
        (sort && sort !== 'order_index_asc')
    );

    const form = useForm({
        id: '',
        name: '',
        slug: '',
        description: '',
        logo: null,
        logo_url: '',
        order_index: 0,
        is_active: true,
    });

    const handleNewClick = () => {
        form.reset();
        form.setData({
            id: '',
            name: '',
            slug: '',
            description: '',
            logo: null,
            logo_url: '',
            order_index: 0,
            is_active: true,
        });
        setIsFormOpen(true);
    };

    const handleEditClick = (brand) => {
        form.setData({
            id: brand.id,
            name: brand.name || '',
            slug: brand.slug || '',
            description: brand.description || '',
            logo: null,
            logo_url: brand.logo || '',
            order_index: brand.order_index || 0,
            is_active: brand.is_active === 1 || brand.is_active === true,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post(route('admin.brands.save'), {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
            },
        });
    };

    const [selectedBrandIds, setSelectedBrandIds] = useState([]);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this brand? Existing products will keep their saved brand value.')) {
            router.delete(route('admin.brands.delete', { id }));
        }
    };

    const currentPageBrandIds = (brands?.data || []).map(brand => brand.id);
    const allCurrentPageSelected = currentPageBrandIds.length > 0 && currentPageBrandIds.every(id => selectedBrandIds.includes(id));

    const toggleBrandSelection = (id) => {
        setSelectedBrandIds(prev => (
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        ));
    };

    const toggleCurrentPageSelection = () => {
        setSelectedBrandIds(prev => {
            if (allCurrentPageSelected) {
                return prev.filter(id => !currentPageBrandIds.includes(id));
            }

            return [...new Set([...prev, ...currentPageBrandIds])];
        });
    };

    const handleBulkDelete = () => {
        if (!selectedBrandIds.length) return;

        if (confirm(`Are you sure you want to delete ${selectedBrandIds.length} selected brand(s)? Existing products will keep their saved brand value.`)) {
            router.delete(route('admin.brands.bulk-delete'), {
                data: { ids: selectedBrandIds },
                preserveScroll: true,
                onSuccess: () => setSelectedBrandIds([]),
            });
        }
    };

    const showSkeleton = isLoading || isFiltering;
    const brandList = brands?.data || [];

    return (
        <AdminLayout>
            <Head title={`Brands Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                <BadgeCheck className="h-5 w-5 text-orange-500" />
                                Brands Manager
                            </h1>
                            {isFiltering && (
                                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 animate-pulse border border-orange-100">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Updating...
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Create brand records for product assignment and homepage brand sections.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedBrandIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-xs font-bold text-red-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-100"
                                title="Delete selected brands"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>{selectedBrandIds.length}</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleNewClick}
                            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-orange-600"
                        >
                            <Plus className="h-4 w-4" />
                            Create Brand
                        </button>
                    </div>
                </div>

                {/* Filter Controls Row */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {/* Search Query */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
                            <input
                                type="text"
                                placeholder="Search by brand name, slug, description..."
                                value={search}
                                disabled={isFiltering}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            />
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

                        {/* Sort Order */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
                            <select
                                value={sort}
                                disabled={isFiltering}
                                onChange={e => {
                                    setSort(e.target.value);
                                    applyFilters({ sort: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
                            >
                                <option value="order_index_asc">Sort Order (Ascending)</option>
                                <option value="name_asc">Brand Name (A-Z)</option>
                                <option value="name_desc">Brand Name (Z-A)</option>
                                <option value="newest">Recently Created</option>
                            </select>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            disabled={isFiltering}
                            className="h-[38px] px-4 py-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-stretch md:self-auto justify-center"
                            title="Reset all filters"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            Reset Filters
                        </button>
                    )}
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs md:items-center" onClick={() => setIsFormOpen(false)}>
                        <div className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:my-8 md:max-h-[calc(100dvh-4rem)] md:p-8" onClick={(event) => event.stopPropagation()}>
                            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-base font-bold text-slate-800">{form.data.id ? 'Edit Brand' : 'Create New Brand'}</h3>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded p-1 hover:bg-slate-50">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold uppercase text-slate-600">Brand Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-250 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Example: BMH"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="font-bold uppercase text-slate-600">Brand Slug</label>
                                    <input
                                        type="text"
                                        value={form.data.slug}
                                        onChange={(event) => form.setData('slug', event.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-250 px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Auto-generated if blank, e.g. bmh"
                                    />
                                    <p className="mt-1 text-[10px] font-medium text-slate-400">This slug is used for links like /shop?b=bmh.</p>
                                </div>

                                <div>
                                    <label className="font-bold uppercase text-slate-600">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(event) => form.setData('description', event.target.value)}
                                        rows="3"
                                        className="mt-1 w-full rounded-xl border border-slate-250 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Short note about this brand..."
                                    />
                                </div>

                                <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Brand Logo</h4>
                                    <div>
                                        <label className="font-bold uppercase text-slate-655">Upload Logo File</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => form.setData('logo', event.target.files[0])}
                                            className="mt-1 w-full rounded-xl border border-slate-250 bg-white px-3 py-1.5 text-xs focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold uppercase text-slate-655">Or Logo URL</label>
                                        <input
                                            type="text"
                                            value={form.data.logo_url}
                                            onChange={(event) => form.setData('logo_url', event.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-250 px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    {form.data.logo_url && (
                                        <div className="mt-2 flex items-center gap-3">
                                            <AdminImage src={form.data.logo_url} alt="Brand logo preview" className="h-10 w-10 object-contain" wrapperClassName="h-10 w-10 rounded-lg border bg-white" size="sm" />
                                            <span className="max-w-xs truncate text-[10px] text-slate-400">{form.data.logo_url}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="font-bold uppercase text-slate-600">Sort Order</label>
                                        <input
                                            type="number"
                                            value={form.data.order_index}
                                            onChange={(event) => form.setData('order_index', event.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-250 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-150 bg-white p-3">
                                        <input
                                            type="checkbox"
                                            id="brand_is_active"
                                            checked={form.data.is_active}
                                            onChange={(event) => form.setData('is_active', event.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <label htmlFor="brand_is_active" className="cursor-pointer select-none font-bold text-slate-700">Status: Active</label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-md transition-all hover:bg-orange-600"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    Save Brand Details
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
                                    <th className="px-2 py-3 text-center w-[52px]">
                                        <input
                                            type="checkbox"
                                            checked={allCurrentPageSelected}
                                            onChange={toggleCurrentPageSelection}
                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                            aria-label="Select all brands on this page"
                                        />
                                    </th>
                                    <th className="px-2 py-3 text-center w-[60px]">SL</th>
                                    <th className="px-2 py-3">Brand Details</th>
                                    <th className="px-2 py-3">Slug</th>
                                    <th className="px-2 py-3">Sort</th>
                                    <th className="px-2 py-3">Status</th>
                                    <th className="px-2 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            {showSkeleton ? (
                                <BrandsTableSkeleton rowsCount={8} />
                            ) : (
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {brandList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <AlertCircle className="w-8 h-8 text-slate-300" />
                                                    <p className="font-semibold text-slate-600">
                                                        {hasActiveFilters ? 'No matching brands found' : 'No brands found'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 max-w-sm">
                                                        {hasActiveFilters 
                                                            ? 'Try adjusting your search query or clear the active filters.' 
                                                            : 'Get started by adding your first brand record.'}
                                                    </p>
                                                    {hasActiveFilters && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetFilters}
                                                            className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600 underline"
                                                        >
                                                            Reset all filters
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        brandList.map((brand, index) => (
                                            <tr key={brand.id} className={`hover:bg-slate-55/30 ${selectedBrandIds.includes(brand.id) ? 'bg-orange-50/40' : ''}`}>
                                                <td className="px-2 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrandIds.includes(brand.id)}
                                                        onChange={() => toggleBrandSelection(brand.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                        aria-label={`Select ${brand.name}`}
                                                    />
                                                </td>
                                                <td className="px-2 py-3.5 text-center font-mono text-[11px] font-bold text-slate-400">
                                                    {(brands?.from || 1) + index}
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-1">
                                                            {brand.logo ? (
                                                                <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                                                            ) : (
                                                                <span className="text-[10px] font-black text-slate-400">{brand.name?.slice(0, 2).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex min-w-0 flex-col">
                                                            <span className="max-w-[220px] truncate font-bold text-slate-800">{brand.name}</span>
                                                            <span className="mt-0.5 max-w-[260px] truncate text-[10px] text-slate-400">{brand.description || 'No description provided.'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 font-mono font-bold text-slate-500">{brand.slug}</td>
                                                <td className="py-3.5 font-bold text-slate-600">{brand.order_index}</td>
                                                <td className="py-3.5">
                                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${brand.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                        {brand.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="flex justify-end gap-1.5 py-3.5 text-right">
                                                    <button type="button" onClick={() => handleEditClick(brand)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-slate-350 hover:bg-slate-50 hover:text-slate-750" title="Edit brand">
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(brand.id)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500" title="Delete brand">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {brands?.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {brands.links?.map((link, index) => {
                                if (link.url === null) return null;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={isFiltering}
                                        onClick={() => {
                                            if (!link.active && link.url) {
                                                setIsFiltering(true);
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
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
                                            }
                                        }}
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${link.active ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'} ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
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