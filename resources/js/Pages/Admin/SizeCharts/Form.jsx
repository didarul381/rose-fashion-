import { useStoreName } from '../../../Hooks/useStoreName';
import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowDown, ArrowUp, Eye, Image, ImagePlus, Plus, Ruler, Save, Trash2 } from 'lucide-react';

const createKey = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildInitialState = (sizeChart) => {
    if (!sizeChart) {
        const columns = [{ key: createKey('col'), name: 'Chest' }];
        const rows = [{ key: createKey('row'), label: 'S' }];
        return {
            name: '',
            description: '',
            type: 'clothing',
            unit: 'cm',
            status: 'draft',
            image: null,
            image_url: '',
            measurement_instructions: '',
            columns,
            rows,
            values: { [rows[0].key]: { [columns[0].key]: '' } },
        };
    }

    const columns = (sizeChart.columns || []).map((column) => ({
        key: `col-${column.id}`,
        id: column.id,
        name: column.name,
    }));

    const rows = (sizeChart.rows || []).map((row) => ({
        key: `row-${row.id}`,
        id: row.id,
        label: row.label,
    }));

    const values = {};
    (sizeChart.rows || []).forEach((row) => {
        const rowKey = `row-${row.id}`;
        values[rowKey] = {};
        (sizeChart.columns || []).forEach((column) => {
            const columnKey = `col-${column.id}`;
            const value = row.values?.find((item) => item.size_chart_column_id === column.id)?.value || '';
            values[rowKey][columnKey] = value;
        });
    });

    return {
        name: sizeChart.name || '',
        description: sizeChart.description || '',
        type: sizeChart.type || 'clothing',
        unit: sizeChart.unit || 'cm',
        status: sizeChart.status || 'draft',
        image: null,
        image_url: sizeChart.image_path || '',
        measurement_instructions: sizeChart.measurement_instructions || '',
        columns: columns.length > 0 ? columns : [{ key: createKey('col'), name: 'Chest' }],
        rows: rows.length > 0 ? rows : [{ key: createKey('row'), label: 'S' }],
        values: Object.keys(values).length > 0 ? values : {},
    };
};

const moveItem = (items, fromIndex, toIndex) => {
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
};

export default function SizeChartForm({ mode, sizeChart, typeOptions = [], statusOptions = [], unitOptions = [] }) {
    const storeName = useStoreName();

    const initialState = useMemo(() => buildInitialState(sizeChart), [sizeChart]);
    const [previewImage, setPreviewImage] = useState(initialState.image_url || '');

    const form = useForm({
        id: sizeChart?.id || '',
        name: initialState.name,
        description: initialState.description,
        type: initialState.type,
        unit: initialState.unit,
        status: initialState.status,
        image: initialState.image,
        image_url: initialState.image_url,
        measurement_instructions: initialState.measurement_instructions,
        columns: initialState.columns,
        rows: initialState.rows,
        values: initialState.values,
    });

    const submitRoute = mode === 'edit'
        ? route('admin.size-charts.update', { id: sizeChart.id })
        : route('admin.size-charts.store');

    const submitMethod = mode === 'edit' ? 'put' : 'post';

    const setMatrixCell = (rowKey, columnKey, value) => {
        form.setData('values', {
            ...form.data.values,
            [rowKey]: {
                ...(form.data.values[rowKey] || {}),
                [columnKey]: value,
            },
        });
    };

    const addColumn = () => {
        const key = createKey('col');
        form.setData('columns', [...form.data.columns, { key, name: '' }]);
        const nextValues = { ...form.data.values };
        form.data.rows.forEach((row) => {
            nextValues[row.key] = {
                ...(nextValues[row.key] || {}),
                [key]: '',
            };
        });
        form.setData('values', nextValues);
    };

    const addRow = () => {
        const key = createKey('row');
        form.setData('rows', [...form.data.rows, { key, label: '' }]);
        form.setData('values', {
            ...form.data.values,
            [key]: form.data.columns.reduce((carry, column) => {
                carry[column.key] = '';
                return carry;
            }, {}),
        });
    };

    const removeColumn = (index) => {
        const column = form.data.columns[index];
        if (!column) return;
        form.setData('columns', form.data.columns.filter((_, idx) => idx !== index));
        const nextValues = { ...form.data.values };
        Object.keys(nextValues).forEach((rowKey) => {
            delete nextValues[rowKey][column.key];
        });
        form.setData('values', nextValues);
    };

    const removeRow = (index) => {
        const row = form.data.rows[index];
        if (!row) return;
        form.setData('rows', form.data.rows.filter((_, idx) => idx !== index));
        const nextValues = { ...form.data.values };
        delete nextValues[row.key];
        form.setData('values', nextValues);
    };

    const updateColumnName = (index, name) => {
        const next = [...form.data.columns];
        next[index] = { ...next[index], name };
        form.setData('columns', next);
    };

    const updateRowLabel = (index, label) => {
        const next = [...form.data.rows];
        next[index] = { ...next[index], label };
        form.setData('rows', next);
    };

    const moveColumn = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= form.data.columns.length) return;
        form.setData('columns', moveItem(form.data.columns, index, nextIndex));
    };

    const moveRow = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= form.data.rows.length) return;
        form.setData('rows', moveItem(form.data.rows, index, nextIndex));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] || null;
        form.setData('image', file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true };

        if (submitMethod === 'put') {
            form.put(submitRoute, options);
        } else {
            form.post(submitRoute, options);
        }
    };

    const chartLabel = form.data.name || 'Untitled size chart';

    return (
        <AdminLayout>
            <Head title={`${mode === 'edit' ? 'Edit' : 'Create'} Size Chart | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">
                            <Ruler className="w-3.5 h-3.5" />
                            Size Charts
                        </div>
                        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                            {mode === 'edit' ? 'Edit Size Chart' : 'Create Size Chart'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Build reusable measurement tables with fully editable rows, columns, and unit settings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {mode === 'edit' && (
                            <Link
                                href={route('admin.products', { size_chart_id: sizeChart.id })}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                            >
                                <Eye className="w-4 h-4" />
                                View Products
                            </Link>
                        )}
                        <Link
                            href={route('admin.size-charts')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                        >
                            Close
                        </Link>
                    </div>
                </div>

                {mode === 'edit' && sizeChart?.products_count > 0 && (
                    <div className="rounded-3xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-800">
                        Used by {sizeChart.products_count} products.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="xl:col-span-7 flex flex-col gap-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Chart Name</label>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                        placeholder="Men's T-Shirt Size Chart"
                                    />
                                    {form.errors.name && <p className="mt-1 text-xs font-semibold text-red-500">{form.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Category / Type</label>
                                    <select
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        {typeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {form.errors.type && <p className="mt-1 text-xs font-semibold text-red-500">{form.errors.type}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {form.errors.status && <p className="mt-1 text-xs font-semibold text-red-500">{form.errors.status}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Unit</label>
                                    <select
                                        value={form.data.unit}
                                        onChange={(e) => form.setData('unit', e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        {unitOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {form.errors.unit && <p className="mt-1 text-xs font-semibold text-red-500">{form.errors.unit}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                        placeholder="Optional description shown in admin and storefront modal."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Measurement Instructions</label>
                                    <textarea
                                        value={form.data.measurement_instructions}
                                        onChange={(e) => form.setData('measurement_instructions', e.target.value)}
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                        placeholder="How to measure? Add helpful guidance for customers."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Size Chart Builder</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Add rows for sizes and columns for measurements. Reorder them anytime.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Row
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addColumn}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Column
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="border-b border-slate-200 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Size</th>
                                            {form.data.columns.map((column, index) => (
                                                <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <input
                                                            value={column.name}
                                                            onChange={(e) => updateColumnName(index, e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
                                                            placeholder="Measurement"
                                                        />
                                                        <div className="flex shrink-0 flex-col">
                                                            <button type="button" onClick={() => moveColumn(index, -1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                                                <ArrowUp className="w-4 h-4" />
                                                            </button>
                                                            <button type="button" onClick={() => moveColumn(index, 1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                                                <ArrowDown className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <button type="button" onClick={() => removeColumn(index)} className="rounded-lg p-1 text-red-500 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.data.rows.map((row, rowIndex) => (
                                            <tr key={row.key} className="odd:bg-white even:bg-slate-50/40">
                                                <td className="border-b border-slate-100 px-4 py-3 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={row.label}
                                                            onChange={(e) => updateRowLabel(rowIndex, e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
                                                            placeholder="S"
                                                        />
                                                        <div className="flex shrink-0 flex-col">
                                                            <button type="button" onClick={() => moveRow(rowIndex, -1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                                                <ArrowUp className="w-4 h-4" />
                                                            </button>
                                                            <button type="button" onClick={() => moveRow(rowIndex, 1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                                                <ArrowDown className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <button type="button" onClick={() => removeRow(rowIndex)} className="rounded-lg p-1 text-red-500 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                {form.data.columns.map((column) => (
                                                    <td key={`${row.key}-${column.key}`} className="border-b border-slate-100 px-4 py-3">
                                                        <input
                                                            value={form.data.values[row.key]?.[column.key] || ''}
                                                            onChange={(e) => setMatrixCell(row.key, column.key, e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                                                            placeholder="36"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {form.errors.columns && <p className="mt-3 text-xs font-semibold text-red-500">{form.errors.columns}</p>}
                                {form.errors.rows && <p className="mt-2 text-xs font-semibold text-red-500">{form.errors.rows}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-5 flex flex-col gap-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900">Branding / Image</h2>
                            <p className="mt-1 text-sm text-slate-500">Optional size guide image for the storefront modal.</p>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Upload Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="mt-3 w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-500 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-orange-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Or Image URL</label>
                                    <input
                                        value={form.data.image_url}
                                        onChange={(e) => {
                                            form.setData('image_url', e.target.value);
                                            setPreviewImage(e.target.value);
                                        }}
                                        placeholder="https://..."
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Preview Image</div>
                                        <Image className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="aspect-[16/10] bg-slate-100">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Size chart preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <ImagePlus className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900">Live Preview</h2>
                            <p className="mt-1 text-sm text-slate-500">Updates as you change rows, columns, and values.</p>

                            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
                                <div className="border-b border-slate-200 bg-white px-4 py-4">
                                    <h3 className="text-base font-black text-slate-900">{chartLabel}</h3>
                                    <p className="mt-1 text-xs text-slate-500">Unit: {form.data.unit}</p>
                                </div>

                                <div className="overflow-x-auto p-4">
                                    <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="border-b border-slate-200 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    Size
                                                </th>
                                                {form.data.columns.map((column) => (
                                                    <th key={column.key} className="border-b border-slate-200 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        {column.name || 'Measurement'} ({form.data.unit})
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.data.rows.map((row) => (
                                                <tr key={row.key}>
                                                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-900">{row.label || 'Size'}</td>
                                                    {form.data.columns.map((column) => (
                                                        <td key={`${row.key}-${column.key}`} className="border-b border-slate-100 px-4 py-3 text-slate-600">
                                                            {form.data.values[row.key]?.[column.key] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="w-4 h-4" />
                            {mode === 'edit' ? 'Update Size Chart' : 'Save Size Chart'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
