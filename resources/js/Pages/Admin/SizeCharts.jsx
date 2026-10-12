import { useStoreName } from '../../Hooks/useStoreName';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Copy, Eye, Plus, Search, Ruler, Trash2, ToggleLeft, ToggleRight, Edit3, ArrowUpDown } from 'lucide-react';

export default function AdminSizeCharts(rawProps) {
    const storeName = useStoreName();

    const props = rawProps || {};
    const sizeCharts = props.sizeCharts || { data: [], links: [], total: 0, last_page: 1 };
    const filters = props.filters || {};
    const typeOptions = Array.isArray(props.typeOptions) ? props.typeOptions : [];
    const statusOptions = Array.isArray(props.statusOptions) ? props.statusOptions : [];
    const initialSearch = typeof filters.search === 'string' ? filters.search : '';
    const initialStatus = typeof filters.status === 'string' ? filters.status : '';
    const initialType = typeof filters.type === 'string' ? filters.type : '';
    const initialSort = typeof filters.sort === 'string' ? filters.sort : 'updated_desc';

    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [type, setType] = useState(initialType);
    const [sort, setSort] = useState(initialSort);
    const [pendingDelete, setPendingDelete] = useState(null);

    useEffect(() => {
        setSearch(typeof filters.search === 'string' ? filters.search : '');
        setStatus(typeof filters.status === 'string' ? filters.status : '');
        setType(typeof filters.type === 'string' ? filters.type : '');
        setSort(typeof filters.sort === 'string' ? filters.sort : 'updated_desc');
    }, [filters]);

    const applyFilters = (overrides = {}) => {
        router.get(route('admin.size-charts'), {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : status,
            type: overrides.type !== undefined ? overrides.type : type,
            sort: overrides.sort !== undefined ? overrides.sort : sort,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters({ search });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const deleteChart = (force = false) => {
        if (!pendingDelete) return;

        router.delete(route('admin.size-charts.delete', { id: pendingDelete.id, force: force ? 1 : 0 }), {
            preserveScroll: true,
            onSuccess: () => setPendingDelete(null),
        });
    };

    const openDeleteFlow = (chart) => {
        if (chart.products_count > 0) {
            setPendingDelete(chart);
            return;
        }

        if (window.confirm(`Delete "${chart.name}"?`)) {
            router.delete(route('admin.size-charts.delete', { id: chart.id }), {
                preserveScroll: true,
            });
        }
    };

    const currentTypeLabel = (value) => typeOptions.find(option => option.value === value)?.label || value;
    const currentStatusLabel = (value) => statusOptions.find(option => option.value === value)?.label || value;

    return (
        <AdminLayout>
            <Head title={`Size Charts | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">
                            <Ruler className="w-3.5 h-3.5" />
                            Catalog
                        </div>
                        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Size Charts</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Create and manage reusable size charts for your products.
                        </p>
                    </div>

                    <Link
                        href={route('admin.size-charts.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
                    >
                        <Plus className="w-4 h-4" />
                        Create Size Chart
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Search</label>
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by chart name"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                        >
                            <option value="">All</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Type</label>
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                applyFilters({ type: e.target.value });
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                        >
                            <option value="">All</option>
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-500">
                        {sizeCharts.total ?? sizeCharts.data?.length ?? 0} size charts
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                applyFilters({ sort: e.target.value });
                            }}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none"
                        >
                            <option value="updated_desc">Recently updated</option>
                            <option value="created_desc">Newest first</option>
                            <option value="created_asc">Oldest first</option>
                            <option value="name_asc">Name A-Z</option>
                            <option value="name_desc">Name Z-A</option>
                            <option value="products_desc">Most used products</option>
                            <option value="products_asc">Least used products</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Type / Category</th>
                                    <th className="px-6 py-4">Sizes</th>
                                    <th className="px-6 py-4">Products</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(sizeCharts.data || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-14 text-center">
                                            <div className="mx-auto max-w-md">
                                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                                    <Ruler className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900">No size charts yet.</h3>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Create reusable size charts to help customers choose the correct product size.
                                                </p>
                                                <Link
                                                    href={route('admin.size-charts.create')}
                                                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Size Chart
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sizeCharts.data.map((chart) => (
                                        <tr key={chart.id} className="transition-colors hover:bg-slate-50/80">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-900">{chart.name}</div>
                                                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                                                    <span>ID {chart.id}</span>
                                                    {chart.description && <span className="max-w-[220px] truncate">{chart.description}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                                                        {currentTypeLabel(chart.type)}
                                                    </span>
                                                    <span className="text-xs text-slate-400">Unit: {chart.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                                                    {chart.rows_count || 0} sizes
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                    {chart.products_count || 0} products
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                                                    chart.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : chart.status === 'inactive'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {currentStatusLabel(chart.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-500">
                                                {new Date(chart.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.size-charts.edit', { id: chart.id })}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.size-charts.duplicate', { id: chart.id }))}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.size-charts.toggle', { id: chart.id }))}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
                                                    >
                                                        {chart.status === 'active' ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                                                        {chart.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteFlow(chart)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sizeCharts.last_page > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 border-t border-slate-100 px-6 py-5">
                            {sizeCharts.links.map((link, idx) => {
                                if (!link.url) return null;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => router.visit(link.url)}
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                            link.active
                                                ? 'border-orange-500 bg-orange-500 text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900">Delete size chart?</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    "{pendingDelete.name}" is currently assigned to {pendingDelete.products_count} products.
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    You can remove those assignments and delete this chart, or view the assigned products first.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <Link
                                href={route('admin.products', { size_chart_id: pendingDelete.id })}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                onClick={() => setPendingDelete(null)}
                            >
                                View Products
                            </Link>
                            <button
                                type="button"
                                onClick={() => deleteChart(true)}
                                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                            >
                                Remove Assignments & Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
