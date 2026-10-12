import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import {
    ArrowLeft,
    BadgeInfo,
    CheckCircle2,
    ClipboardCopy,
    Clock3,
    Plus,
    FileDown,
    FileText,
    History,
    Loader2,
    MapPin,
    MessageSquare,
    MoreHorizontal,
    Package,
    Phone,
    Printer,
    Save,
    Send,
    Search,
    Truck,
    User,
    Wallet,
} from 'lucide-react';

const paymentLabels = {
    pending: 'Pending Collections',
    paid: 'Paid (Collected)',
    failed: 'Failed',
    refunded: 'Refunded',
};

const paymentTone = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    refunded: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatMoney = (value) => `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (value) => {
    if (!value) return 'Unknown';
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
};

const parseLegacyNote = (value) => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
            return Object.entries(parsed).map(([key, item]) => ({
                key,
                value: typeof item === 'object' ? JSON.stringify(item) : String(item),
            }));
        }
    } catch (error) {
        // Ignore non-JSON notes and show the raw value instead.
    }

    return [{ key: 'note', value }];
};

export default function OrderDetails({
    order,
    statuses = [],
    paymentStatusOptions = [],
    availableProducts = [],
    trackUrl,
}) {
    const storeName = useStoreName();
    const { flash } = usePage().props;
    const [productSearch, setProductSearch] = useState('');

    const statusForm = useForm({
        status: order.status || 'pending',
        payment_status: order.payment_status || 'pending',
        tracking_number: order.tracking_number || '',
    });

    const itemForm = useForm({
        product_id: '',
        variant_id: '',
        quantity: 1,
    });

    const noteForm = useForm({
        note: '',
    });

    const shipping = order.shipping_address || {};
    const billing = order.billing_address || {};
    const orderNotes = order.order_notes || [];
    const paymentLabel = paymentLabels[order.payment_status] || order.payment_status;
    const paymentClass = paymentTone[order.payment_status] || 'bg-slate-100 text-slate-700 border-slate-200';
    const statusMeta = statuses.find((status) => status.slug === order.status);
    const statusColor = statusMeta?.color || '#475569';
    const statusLookup = Object.fromEntries(statuses.map((status) => [status.slug, status.name]));
    const legacyNotes = parseLegacyNote(order.notes);
    const filteredProducts = availableProducts.filter((product) => {
        const haystack = `${product.name || ''} ${product.sku || ''}`.toLowerCase();
        return haystack.includes(productSearch.toLowerCase());
    });
    const selectedProduct = availableProducts.find((product) => String(product.id) === String(itemForm.data.product_id));
    const selectedVariant = selectedProduct?.variants?.find((variant) => String(variant.id) === String(itemForm.data.variant_id));
    const transactionId =
        legacyNotes.find((entry) => /payment_id|trxid|transaction/i.test(entry.key) || /payment_id|trxid|transaction/i.test(entry.value))?.value ||
        order.notes ||
        'N/A';

    const statusTimeline = statuses.map((status, index) => ({
        id: status.id,
        label: status.name,
        color: status.color || '#64748b',
        active: status.slug === order.status,
        done: statuses.findIndex((item) => item.slug === order.status) > index,
    }));

    const activityEntries = [
        {
            id: 'created',
            kind: 'created',
            title: 'Order created',
            description: `Order placed on ${formatDateTime(order.created_at)}`,
            time: order.created_at,
            icon: Package,
        },
        ...orderNotes.map((note) => ({
            id: note.id,
            kind: note.type || 'note',
            title:
                note.type === 'item_added'
                    ? 'Order item added'
                    : note.type === 'status_update'
                        ? 'Order status updated'
                        : note.type === 'note'
                            ? 'Order note added'
                            : 'Order activity',
            description: note.note,
            time: note.created_at,
            author: note.user?.name || 'Admin',
            metadata: note.metadata || {},
            icon:
                note.type === 'item_added'
                    ? Package
                    : note.type === 'status_update'
                        ? CheckCircle2
                        : note.type === 'note'
                            ? MessageSquare
                            : History,
        })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        statusForm.post(route('admin.orders.update', { id: order.id }), {
            preserveScroll: true,
        });
    };

    const handleNoteSubmit = (e) => {
        e.preventDefault();
        noteForm.post(route('admin.orders.notes.store', { id: order.id }), {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('note'),
        });
    };

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        itemForm.post(route('admin.orders.items.store', { id: order.id }), {
            preserveScroll: true,
            onSuccess: () => {
                itemForm.reset('product_id', 'variant_id', 'quantity');
                itemForm.setData('quantity', 1);
                setProductSearch('');
            },
        });
    };

    const handleProductChange = (productId) => {
        const product = availableProducts.find((item) => String(item.id) === String(productId));
        itemForm.setData('product_id', productId);
        if (product?.variants?.length) {
            itemForm.setData('variant_id', String(product.variants[0].id));
        } else {
            itemForm.setData('variant_id', '');
        }
    };

    const handleVariantChange = (variantId) => {
        itemForm.setData('variant_id', variantId);
    };

    const copyValue = async (value) => {
        if (!value || !navigator?.clipboard) return;
        await navigator.clipboard.writeText(value);
    };

    const openInvoice = () => {
        window.open(route('admin.orders.invoice', { id: order.id }), '_blank');
    };

    const printInvoice = () => {
        openInvoice();
    };

    const openTracking = () => {
        if (trackUrl) {
            window.open(trackUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const itemRows = order.items || [];
    const subtotal = Number(order.subtotal || 0);
    const discount = Number(order.discount || 0);
    const shippingCost = Number(order.shipping_cost || 0);
    const tax = Number(order.tax || 0);
    const grandTotal = Number(order.total || 0);

    return (
        <AdminLayout>
            <Head title={`Order #${order.order_number} | ${storeName} Admin`} />

            <div className="flex flex-col gap-6 pb-10">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                        {flash.error}
                    </div>
                )}

                <div className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white shadow-sm">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-4">
                            <Link href={route('admin.orders')} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Orders
                            </Link>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tight md:text-3xl">Order #{order.order_number}</h1>
                                <span
                                    className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                                    style={{ backgroundColor: statusColor, borderColor: statusColor }}
                                >
                                    {statusMeta?.name || order.status}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${paymentClass}`}>
                                    {paymentLabel}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                <span className="inline-flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    Created: {formatDateTime(order.created_at)}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    Courier: {order.tracking_number ? 'Steadfast' : 'Not assigned'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={printInvoice}
                                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                            >
                                <Printer className="h-4 w-4" />
                                Print Invoice
                            </button>
                            <button
                                onClick={openInvoice}
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                <FileText className="h-4 w-4" />
                                Open Invoice
                            </button>
                            <details className="relative">
                                <summary className="list-none inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                                    <MoreHorizontal className="h-4 w-4" />
                                    More
                                </summary>
                                <div className="absolute right-0 z-10 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                    <button
                                        onClick={() => copyValue(order.order_number)}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <ClipboardCopy className="h-4 w-4 text-slate-400" />
                                        Copy Order ID
                                    </button>
                                    <button
                                        onClick={() => copyValue(order.tracking_number)}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <ClipboardCopy className="h-4 w-4 text-slate-400" />
                                        Copy Tracking ID
                                    </button>
                                    <button
                                        onClick={openTracking}
                                        disabled={!trackUrl}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4 text-slate-400" />
                                        Track Shipment
                                    </button>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Order Total" value={formatMoney(grandTotal)} tone="from-slate-900 to-slate-700" icon={Wallet} />
                    <StatCard label="Payment" value={paymentLabel} tone="from-emerald-600 to-emerald-500" icon={CheckCircle2} />
                    <StatCard label="Delivery" value={statusMeta?.name || order.status} tone="from-sky-600 to-sky-500" icon={Truck} />
                    <StatCard label="Courier" value={order.tracking_number ? 'Steadfast' : 'Not Assigned'} tone="from-amber-600 to-amber-500" icon={Truck} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
                    <div className="flex flex-col gap-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Order Items</h2>
                                    <p className="text-sm text-slate-500">Products, quantities, pricing, and line totals.</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {itemRows.length} item{itemRows.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <form onSubmit={handleAddItemSubmit} className="mb-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">Add Product to Order</h3>
                                        <p className="text-xs text-slate-500">Search the catalog and attach a new line item.</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_120px]">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Search Product</label>
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                placeholder="Type product name or SKU..."
                                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                                            />
                                        </div>
                                        <select
                                            value={itemForm.data.product_id}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                            required
                                        >
                                            <option value="">Select a product</option>
                                            {filteredProducts.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} {product.sku ? `(${product.sku})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Variant</label>
                                        {selectedProduct?.variants?.length ? (
                                            <select
                                                value={itemForm.data.variant_id}
                                                onChange={(e) => handleVariantChange(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                                required
                                            >
                                                <option value="">Select a variant</option>
                                                {selectedProduct.variants.map((variant) => (
                                                    <option key={variant.id} value={variant.id}>
                                                        {variant.sku || `Variant #${variant.id}`} {variant.sale_price || variant.price ? `- ৳${Number(variant.sale_price || variant.price).toLocaleString('en-BD')}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                                                No variant required
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={itemForm.data.quantity}
                                                onChange={(e) => itemForm.setData('quantity', e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                disabled={itemForm.processing}
                                                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {itemForm.processing ? 'Adding...' : 'Add Item'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {selectedProduct && (
                                    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                                        <div className="flex items-center gap-3">
                                            <AdminImage
                                                src={selectedProduct.primary_image?.image_path}
                                                alt={selectedProduct.name}
                                                wrapperClassName="h-14 w-14 shrink-0 rounded-2xl border border-slate-200"
                                                className="h-14 w-14 rounded-2xl object-cover"
                                                size="sm"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900">{selectedProduct.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {selectedVariant ? (
                                                        <>
                                                            Variant: {selectedVariant.sku || `#${selectedVariant.id}`} 
                                                            {' '}| Price: ৳{Number(selectedVariant.sale_price || selectedVariant.price || 0).toLocaleString('en-BD')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            Price: ৳{Number(selectedProduct.sale_price || selectedProduct.price || 0).toLocaleString('en-BD')}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>

                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="hidden grid-cols-[minmax(0,2fr)_110px_90px_80px_90px_110px] gap-4 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
                                    <span>Product</span>
                                    <span>SKU</span>
                                    <span>Price</span>
                                    <span>Qty</span>
                                    <span>Discount</span>
                                    <span>Subtotal</span>
                                </div>

                                <div className="divide-y divide-slate-200">
                                    {itemRows.map((item) => {
                                        const product = item.product;
                                        const image = product?.primary_image?.image_path;
                                        const lineSubtotal = Number(item.total || Number(item.price || 0) * Number(item.quantity || 0));
                                        const lineDiscount = Math.max((Number(item.price || 0) * Number(item.quantity || 0)) - lineSubtotal, 0);

                                        return (
                                            <div key={item.id} className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,2fr)_110px_90px_80px_90px_110px] md:items-center">
                                                <div className="flex items-center gap-3">
                                                    <AdminImage
                                                        src={image}
                                                        alt={item.name}
                                                        wrapperClassName="h-16 w-16 shrink-0 rounded-2xl border border-slate-200"
                                                        className="h-16 w-16 rounded-2xl object-cover"
                                                        size="sm"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-slate-900" title={item.name}>
                                                            {item.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500 md:hidden">
                                                            SKU: {item.sku || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="hidden text-sm font-medium text-slate-600 md:block">{item.sku || 'N/A'}</div>
                                                <div className="text-sm font-semibold text-slate-800">{formatMoney(item.price)}</div>
                                                <div className="text-sm font-semibold text-slate-800">{item.quantity}</div>
                                                <div className="text-sm font-semibold text-slate-500">{lineDiscount > 0 ? `-${formatMoney(lineDiscount)}` : '—'}</div>
                                                <div className="text-sm font-black text-slate-900">{formatMoney(lineSubtotal)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Order Totals</h2>
                                    <p className="text-sm text-slate-500">Subtotal, shipping, discount, tax, and grand total.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <ValueRow label="Subtotal" value={formatMoney(subtotal)} />
                                <ValueRow label="Discount" value={`-${formatMoney(discount)}`} valueClassName="text-rose-600" />
                                <ValueRow label="Shipping" value={formatMoney(shippingCost)} />
                                <ValueRow label="Tax" value={formatMoney(tax)} />
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Grand Total</p>
                                    <p className="text-lg font-black">{formatMoney(grandTotal)}</p>
                                </div>
                                <button
                                    onClick={openInvoice}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Invoice
                                </button>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Order Timeline</h2>
                                    <p className="text-sm text-slate-500">Current delivery flow based on the active order status.</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {statusTimeline.map((step, index) => {
                                    const Icon = step.active || step.done ? CheckCircle2 : Clock3;

                                    return (
                                        <div key={step.id} className="relative flex gap-4">
                                            {index !== statusTimeline.length - 1 && (
                                                <div className={`absolute left-4 top-9 h-[calc(100%+20px)] w-px ${step.done || step.active ? 'bg-slate-300' : 'bg-slate-200'}`} />
                                            )}
                                            <div
                                                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                                                style={{
                                                    borderColor: step.active || step.done ? step.color : '#cbd5e1',
                                                    color: step.active || step.done ? step.color : '#94a3b8',
                                                }}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="pb-1">
                                                <p className={`text-sm font-bold ${step.active ? 'text-slate-900' : 'text-slate-600'}`}>{step.label}</p>
                                                <p className="text-xs text-slate-500">
                                                    {step.active ? 'Current status' : step.done ? 'Completed stage' : 'Pending stage'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Order Notes</h2>
                                    <p className="text-sm text-slate-500">Add internal notes and keep order context in one place.</p>
                                </div>
                            </div>

                            {legacyNotes.length > 0 && (
                                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
                                        <BadgeInfo className="h-4 w-4" />
                                        Legacy order note
                                    </div>
                                    <div className="space-y-1 text-xs text-amber-900">
                                        {legacyNotes.map((entry) => (
                                            <div key={entry.key} className="flex flex-col gap-0.5">
                                                <span className="font-semibold uppercase tracking-wider text-amber-700">{entry.key}</span>
                                                <span className="font-mono">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleNoteSubmit} className="mb-6 flex flex-col gap-3 md:flex-row">
                                <textarea
                                    value={noteForm.data.note}
                                    onChange={(e) => noteForm.setData('note', e.target.value)}
                                    rows="3"
                                    className="min-h-[92px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    placeholder="Write an order note..."
                                />
                                <button
                                    type="submit"
                                    disabled={noteForm.processing}
                                    className="inline-flex h-fit items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {noteForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                                    Add Note
                                </button>
                            </form>

                            <div className="space-y-4">
                                {orderNotes.length === 0 ? (
                                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                        No internal notes yet.
                                    </p>
                                ) : (
                                    orderNotes.map((note) => (
                                        <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                                                    {note.user?.name || 'Admin'}
                                                </span>
                                                <span>{formatDateTime(note.created_at)}</span>
                                                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-600 uppercase">
                                                    {note.type || 'note'}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-6 text-slate-700">{note.note}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="flex flex-col gap-6 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Customer Information</h2>
                                    <p className="text-sm text-slate-500">Buyer identity and contact details.</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <InfoRow icon={User} label="Name" value={shipping.name || order.user?.name || order.phone || 'Guest'} />
                                <InfoRow icon={Phone} label="Phone" value={order.phone || shipping.phone || 'N/A'} />
                                <InfoRow icon={MessageSquare} label="Email" value={order.email || order.user?.email || 'N/A'} />
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Address</p>
                                    <p className="text-sm leading-6 text-slate-700">
                                        {shipping.address || billing.address || 'No shipping address saved.'}
                                        {shipping.city ? `, ${shipping.city}` : ''}
                                        {shipping.postcode ? `, ${shipping.postcode}` : ''}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-lg font-black text-slate-900">Shipping Information</h2>
                                <p className="text-sm text-slate-500">Delivery and courier details.</p>
                            </div>

                            <div className="space-y-4 text-sm">
                                <InfoRow icon={MapPin} label="Name" value={shipping.name || 'N/A'} />
                                <InfoRow icon={Phone} label="Phone" value={shipping.phone || order.phone || 'N/A'} />
                                <InfoRow icon={MapPin} label="Full Address" value={shipping.address || 'N/A'} />
                                <InfoRow icon={MapPin} label="City" value={shipping.city || 'N/A'} />
                                <InfoRow icon={MapPin} label="Area" value={shipping.area || shipping.postcode || 'N/A'} />
                                <InfoRow icon={Truck} label="Shipping Method" value={order.shipping_method_label || 'N/A'} />
                                <InfoRow icon={Truck} label="Courier" value="Steadfast" />
                                <InfoRow icon={Truck} label="Tracking ID" value={order.tracking_number || 'N/A'} mono />
                                <button
                                    onClick={openTracking}
                                    disabled={!trackUrl}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Track Shipment
                                </button>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-lg font-black text-slate-900">Payment Information</h2>
                                <p className="text-sm text-slate-500">Current payment state and method.</p>
                            </div>

                            <div className="space-y-4 text-sm">
                                <InfoRow icon={Wallet} label="Payment Method" value={order.payment_method || 'N/A'} />
                                <InfoRow icon={CheckCircle2} label="Payment Status" value={paymentLabel} />
                                <InfoRow icon={FileText} label="Transaction ID" value={transactionId} />
                                <InfoRow icon={Clock3} label="Payment Date" value={order.updated_at ? formatDateTime(order.updated_at) : 'N/A'} />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-lg font-black text-slate-900">Order Status</h2>
                                <p className="text-sm text-slate-500">Quick update without leaving the detail page.</p>
                            </div>

                            <form onSubmit={handleStatusSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Status</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status.id} value={status.slug}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Payment Status</label>
                                    <select
                                        value={statusForm.data.payment_status}
                                        onChange={(e) => statusForm.setData('payment_status', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        {paymentStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Courier Tracking ID</label>
                                    <input
                                        type="text"
                                        value={statusForm.data.tracking_number}
                                        onChange={(e) => statusForm.setData('tracking_number', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                        placeholder="TRK-955299"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {statusForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Update Status
                                </button>
                            </form>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-lg font-black text-slate-900">Activity</h2>
                                <p className="text-sm text-slate-500">Recent order activity and note history.</p>
                            </div>

                            <div className="space-y-4">
                                {activityEntries.map((entry, index) => {
                                    const Icon = entry.icon;

                                    return (
                                        <div key={entry.id} className="relative flex gap-4">
                                            {index !== activityEntries.length - 1 && (
                                                <div className="absolute left-4 top-9 h-[calc(100%+16px)] w-px bg-slate-200" />
                                            )}
                                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="pb-1">
                                                <p className="text-sm font-bold text-slate-900">{entry.title}</p>
                                                <p className="text-xs text-slate-500">{entry.description}</p>
                                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                    {formatDateTime(entry.time)}{entry.author ? ` • ${entry.author}` : ''}
                                                </p>
                                                {entry.kind === 'status_update' && entry.metadata?.before && entry.metadata?.after && (
                                                    <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                                                        <p>Delivery: {statusLookup[entry.metadata.before.status] || entry.metadata.before.status || 'N/A'} → {statusLookup[entry.metadata.after.status] || entry.metadata.after.status || 'N/A'}</p>
                                                        <p>Payment: {paymentLabels[entry.metadata.before.payment_status] || entry.metadata.before.payment_status || 'N/A'} → {paymentLabels[entry.metadata.after.payment_status] || entry.metadata.after.payment_status || 'N/A'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, tone, icon: Icon }) {
    return (
        <div className={`rounded-3xl bg-gradient-to-br ${tone} p-[1px] shadow-sm`}>
            <div className="rounded-[23px] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                        <p className="mt-3 text-lg font-black text-slate-900">{value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ValueRow({ label, value, valueClassName = 'text-slate-900' }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className={`text-sm font-bold ${valueClassName}`}>{value}</span>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <div className="mt-0.5 rounded-xl bg-white p-2 text-slate-500">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={`mt-1 text-sm font-semibold text-slate-800 ${mono ? 'font-mono break-all' : 'break-words'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
