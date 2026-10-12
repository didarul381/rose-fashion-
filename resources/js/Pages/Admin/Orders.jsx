import { useStoreName } from '../../Hooks/useStoreName';
import React, { useEffect, useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import { Eye, Edit3, X, Save, FileText, CheckCircle2, Send, User, Phone, MapPin, ExternalLink, MessageSquare, Info, Truck, ChevronDown, ChevronUp, Check, Plus, Printer, Calendar, ArrowRight, Clock3, Wallet, Package, ClipboardCopy, Search, SlidersHorizontal, XCircle, Loader2 } from 'lucide-react';

function OrdersTableSkeleton({ rowsCount = 8 }) {
    return (
        <tbody className="divide-y divide-slate-100 font-medium animate-pulse">
            {Array.from({ length: rowsCount }).map((_, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                    {/* Checkbox */}
                    <td className="py-4 px-3">
                        <div className="w-4 h-4 bg-slate-200 rounded"></div>
                    </td>

                    {/* Order ID */}
                    <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="h-4 w-12 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-3 text-left">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-slate-200 rounded-full shrink-0"></div>
                                <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                                <div className="h-3 w-8 bg-emerald-100 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-slate-100 rounded-full shrink-0"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-slate-100 rounded-full shrink-0"></div>
                                <div className="h-3 w-36 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </td>

                    {/* Products */}
                    <td className="py-4 px-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-slate-200 rounded shrink-0"></div>
                            <div className="flex flex-col gap-1.5">
                                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                                <div className="h-2.5 w-12 bg-emerald-100 rounded"></div>
                            </div>
                        </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-3">
                        <div className="h-7 w-[125px] bg-slate-200 rounded"></div>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-3 text-left">
                        <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Courier */}
                    <td className="py-4 px-3 text-left">
                        <div className="flex flex-col gap-1.5">
                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Assign User */}
                    <td className="py-4 px-3">
                        <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
                    </td>

                    {/* Created By */}
                    <td className="py-4 px-3">
                        <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
                    </td>

                    {/* Date Added */}
                    <td className="py-4 px-3 text-left">
                        <div className="flex flex-col gap-1.5">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-14 bg-slate-100 rounded"></div>
                        </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-right">
                        <div className="flex flex-col gap-1 items-end">
                            <div className="flex gap-0.5">
                                <div className="w-6 h-6 bg-slate-100 rounded"></div>
                                <div className="w-6 h-6 bg-slate-100 rounded"></div>
                            </div>
                            <div className="flex gap-0.5">
                                <div className="w-6 h-6 bg-slate-100 rounded"></div>
                                <div className="w-6 h-6 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

export default function AdminOrders({ orders = { data: [] }, statuses = [], statusCounts = {}, couriers = [], users = [], totalSales = 0, totalOrders = 0, totalProducts = 0, filters = {} }) {
    const storeName = useStoreName();
    const safeFilters = (filters && !Array.isArray(filters) && typeof filters === 'object') ? filters : {};

    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    const { flash } = usePage().props;
    const [activeOrder, setActiveOrder] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [selectedCourier, setSelectedCourier] = useState('');

    const [assignedUserId, setAssignedUserId] = useState('');
    const [search, setSearch] = useState(typeof safeFilters.search === 'string' ? safeFilters.search : '');
    const [paymentStatus, setPaymentStatus] = useState(typeof safeFilters.payment_status === 'string' ? safeFilters.payment_status : '');
    const [courierStatus, setCourierStatus] = useState(typeof safeFilters.courier_status === 'string' ? safeFilters.courier_status : '');
    const [assignedUserFilter, setAssignedUserFilter] = useState(typeof safeFilters.assigned_user_id === 'string' ? safeFilters.assigned_user_id : '');
    const [dateStart, setDateStart] = useState(typeof safeFilters.date_start === 'string' ? safeFilters.date_start : '');
    const [dateEnd, setDateEnd] = useState(typeof safeFilters.date_end === 'string' ? safeFilters.date_end : '');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);

    // Sync filters with props
    useEffect(() => {
        const currentFilters = (filters && !Array.isArray(filters) && typeof filters === 'object') ? filters : {};
        setSearch(typeof currentFilters.search === 'string' ? currentFilters.search : '');
        setPaymentStatus(typeof currentFilters.payment_status === 'string' ? currentFilters.payment_status : '');
        setCourierStatus(typeof currentFilters.courier_status === 'string' ? currentFilters.courier_status : '');
        setAssignedUserFilter(typeof currentFilters.assigned_user_id === 'string' ? currentFilters.assigned_user_id : '');
        setDateStart(typeof currentFilters.date_start === 'string' ? currentFilters.date_start : '');
        setDateEnd(typeof currentFilters.date_end === 'string' ? currentFilters.date_end : '');
    }, [filters]);

    // Initial load transition
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    const buildFilterQuery = (overrides = {}) => {
        const query = {
            search,
            status: filters.status || '',
            payment_status: paymentStatus,
            courier_status: courierStatus,
            assigned_user_id: assignedUserFilter,
            date_start: dateStart,
            date_end: dateEnd,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === '' || query[key] === null || query[key] === undefined) {
                delete query[key];
            }
        });

        return query;
    };

    const applyFilters = (overrides = {}) => {
        setIsFiltering(true);
        router.get(route('admin.orders'), buildFilterQuery(overrides), {
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

    const paymentStatusLabel = (value) => {
        const labels = {
            pending: 'Pending Collections',
            paid: 'Paid (Collected)',
            failed: 'Failed',
            refunded: 'Refunded',
        };
        return labels[value] || value || 'Unknown';
    };

    const getCourierName = (code) => {
        if (!code) return '';
        return couriers.find((courier) => courier.code === code)?.name || code;
    };

    const getTrackingUrl = (order) => {
        if (!order?.tracking_number) return null;

        return `https://steadfast.com.bd/t/${order.tracking_number}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const copyToClipboard = async (value) => {
        if (!value || !navigator?.clipboard) return;
        await navigator.clipboard.writeText(value);
    };

    const getCustomerNote = (order) => {
        if (!order?.notes) return '';

        if (typeof order.notes === 'string') {
            const trimmed = order.notes.trim();
            if (!trimmed) return '';

            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === 'object') {
                    return parsed.original_notes || parsed.note || '';
                }
            } catch (error) {
                return trimmed;
            }

            return trimmed;
        }

        if (typeof order.notes === 'object') {
            return order.notes.original_notes || order.notes.note || '';
        }

        return '';
    };

    const applyDateFilter = () => {
        applyFilters({ date_start: dateStart, date_end: dateEnd });
        setShowDatePicker(false);
    };

    const clearDateFilter = () => {
        setDateStart('');
        setDateEnd('');
        applyFilters({ date_start: '', date_end: '' });
        setShowDatePicker(false);
    };

    const clearAllFilters = () => {
        setSearch('');
        setPaymentStatus('');
        setCourierStatus('');
        setAssignedUserFilter('');
        setDateStart('');
        setDateEnd('');
        setShowDatePicker(false);
        setIsFiltering(true);
        router.get(route('admin.orders'), {}, {
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

    const toggleFilterPanel = () => {
        setFiltersCollapsed(prev => !prev);
        setShowDatePicker(false);
    };

    const handleAssignUser = (e) => {
        const userId = e.target.value;
        setAssignedUserId(userId);
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order to assign.');
            setAssignedUserId('');
            return;
        }
        if (!userId) return;
        
        router.post(route('admin.orders.bulk-assign-user'), {
            order_ids: selectedOrderIds,
            user_id: userId
        }, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setAssignedUserId('');
            }
        });
    };

    const handleBulkPrint = () => {
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order to print.');
            return;
        }
        const ids = selectedOrderIds.join(',');
        window.open(route('admin.orders.bulk-invoice') + `?ids=${ids}`, '_blank');
    };

    const handleSendToCourierBulk = () => {
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order to send to courier.');
            return;
        }
        const courierCode = selectedCourier || (couriers.length > 0 ? couriers[0].code : 'steadfast');
        router.post(route('admin.orders.send-to-courier'), {
            order_ids: selectedOrderIds,
            courier_id: courierCode
        }, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setSelectedCourier('');
            }
        });
    };

    const handleBulkStatusChangeBulk = () => {
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order to change status.');
            return;
        }
        
        let targetStatus = bulkStatus;
        if (!targetStatus) {
            const options = statuses.map(s => `${s.slug}: ${s.name}`).join('\n');
            const chosen = prompt(`Enter target status slug:\n\n${options}`);
            if (!chosen) return;
            targetStatus = chosen.trim();
        }

        router.post(route('admin.orders.bulk-update-status'), {
            order_ids: selectedOrderIds,
            status: targetStatus
        }, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setBulkStatus('');
            }
        });
    };

    const form = useForm({
        status: 'pending',
        payment_status: 'pending',
        tracking_number: ''
    });

    const handleEditClick = (order) => {
        setActiveOrder(order);
        form.setData({
            status: order.status,
            payment_status: order.payment_status,
            tracking_number: order.tracking_number || ''
        });
    };

    const openOrderDetails = (orderId) => {
        router.visit(route('admin.orders.show', { id: orderId }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.orders.update', { id: activeOrder.id }), {
            onSuccess: () => {
                setActiveOrder(null);
            }
        });
    };

    // Inline status update via dropdown
    const handleRowStatusChange = (orderId, newStatus, currentPaymentStatus, currentTrackingNumber) => {
        router.post(route('admin.orders.update', { id: orderId }), {
            status: newStatus,
            payment_status: currentPaymentStatus,
            tracking_number: currentTrackingNumber || ''
        }, {
            preserveScroll: true
        });
    };

    // Bulk selection handlers
    const handleSelectToggle = (id) => {
        setSelectedOrderIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllToggle = () => {
        if (selectedOrderIds.length === orders.data.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.data.map(ord => ord.id));
        }
    };

    // Bulk actions
    const handleBulkStatusChange = () => {
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order.');
            return;
        }
        if (!bulkStatus) {
            alert('Please select a target status.');
            return;
        }
        router.post(route('admin.orders.bulk-update-status'), {
            order_ids: selectedOrderIds,
            status: bulkStatus
        }, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setBulkStatus('');
            }
        });
    };

    const handleSendToCourier = () => {
        if (selectedOrderIds.length === 0) {
            alert('Please select at least one order.');
            return;
        }
        if (!selectedCourier) {
            alert('Please select a courier.');
            return;
        }
        router.post(route('admin.orders.send-to-courier'), {
            order_ids: selectedOrderIds,
            courier_id: selectedCourier
        }, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setSelectedCourier('');
            }
        });
    };

    // Date formatter helper
    const formatOrderDate = (dateString) => {
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const h = String(hours).padStart(2, '0');

        return {
            date: `${d}/${m}/${y}`,
            time: `${h}:${minutes}:${seconds} ${ampm}`
        };
    };

    // Days ago helper
    const calculateDaysAgo = (dateString) => {
        const created = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const formatFilterDate = (value) => {
        if (!value) return '';
        const date = new Date(`${value}T00:00:00`);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const activeFilterCount = [
        search,
        filters.status,
        paymentStatus,
        courierStatus,
        assignedUserFilter,
        dateStart,
        dateEnd,
    ].filter(Boolean).length;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const showSkeleton = isLoading || isFiltering;

    return (
        <AdminLayout>
            <Head title={`Orders Dispatcher | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Modern Filter Workspace */}
                <div className="bg-white border border-slate-200 rounded-[28px] shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 md:px-6">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </span>
                                    <span>Orders control center</span>
                                </div>
                                <h1 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                                    <span>Orders</span>
                                    {isFiltering && (
                                        <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 animate-pulse border border-orange-100">
                                            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Updating...
                                        </span>
                                    )}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Search, filter, and batch manage orders like a modern ecommerce dashboard.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={toggleFilterPanel}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    {filtersCollapsed ? <SlidersHorizontal className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
                                    {filtersCollapsed ? 'Expand filters' : 'Collapse filters'}
                                </button>

                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Clear all
                                    </button>
                                )}

                                <div className="relative">
                                    <button
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        {dateStart && dateEnd
                                            ? `${formatFilterDate(dateStart)} - ${formatFilterDate(dateEnd)}`
                                            : 'Select date range'}
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>

                                    {showDatePicker && (
                                        <div className="absolute right-0 z-20 mt-2 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                                            <div className="mb-3">
                                                <h4 className="text-sm font-bold text-slate-800">Filter by date range</h4>
                                                <p className="mt-0.5 text-xs text-slate-400">Narrow orders by their created date.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Start date</label>
                                                    <input
                                                        type="date"
                                                        value={dateStart}
                                                        onChange={(e) => setDateStart(e.target.value)}
                                                        className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">End date</label>
                                                    <input
                                                        type="date"
                                                        value={dateEnd}
                                                        onChange={(e) => setDateEnd(e.target.value)}
                                                        className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-between gap-2">
                                                <button
                                                    onClick={clearDateFilter}
                                                    className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={applyDateFilter}
                                                    className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                                                >
                                                    Apply range
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!filtersCollapsed ? (
                        <div className="space-y-5 px-5 py-5 md:px-6">
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                                <label className="relative block">
                                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Search</span>
                                    <Search className="pointer-events-none absolute left-4 top-[2.35rem] h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Order ID, phone, email, customer, SKU..."
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                                    />
                                </label>

                                <label>
                                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Payment status</span>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => {
                                            setPaymentStatus(e.target.value);
                                            applyFilters({ payment_status: e.target.value });
                                        }}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">All payment statuses</option>
                                        <option value="pending">Pending Collections</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </label>

                                <label>
                                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Courier status</span>
                                    <select
                                        value={courierStatus}
                                        onChange={(e) => {
                                            setCourierStatus(e.target.value);
                                            applyFilters({ courier_status: e.target.value });
                                        }}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">All courier states</option>
                                        <option value="tracked">Tracked / Dispatched</option>
                                        <option value="untracked">Not yet dispatched</option>
                                    </select>
                                </label>

                                <label>
                                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Assigned user</span>
                                    <select
                                        value={assignedUserFilter}
                                        onChange={(e) => {
                                            setAssignedUserFilter(e.target.value);
                                            applyFilters({ assigned_user_id: e.target.value });
                                        }}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">All assignees</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Delivery status</h2>
                                        <p className="text-[11px] text-slate-400">Tap a chip to filter like a commerce admin.</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                        {filters.status ? 'Filtered' : 'All orders'}
                                    </span>
                                </div>

                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    <button
                                        onClick={() => applyFilters({ status: '' })}
                                        className={`whitespace-nowrap rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                            !filters.status
                                                ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        All ({totalOrders})
                                    </button>

                                    {statuses.map((status) => {
                                        const count = statusCounts[status.slug] || 0;
                                        const isActive = filters.status === status.slug;
                                        return (
                                            <button
                                                key={status.id}
                                                onClick={() => applyFilters({ status: status.slug })}
                                                className="whitespace-nowrap rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all"
                                                style={{
                                                    backgroundColor: isActive ? status.color || '#0f172a' : '#ffffff',
                                                    color: isActive ? '#ffffff' : '#475569',
                                                    borderColor: isActive ? status.color || '#0f172a' : '#e2e8f0',
                                                }}
                                            >
                                                {status.name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-white p-3">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Active filters</span>
                                    {search && (
                                        <button
                                            onClick={() => {
                                                setSearch('');
                                                applyFilters({ search: '' });
                                            }}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Search: {search}
                                        </button>
                                    )}
                                    {filters.status && (
                                        <button
                                            onClick={() => applyFilters({ status: '' })}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Status: {statuses.find((s) => s.slug === filters.status)?.name || filters.status}
                                        </button>
                                    )}
                                    {paymentStatus && (
                                        <button
                                            onClick={() => {
                                                setPaymentStatus('');
                                                applyFilters({ payment_status: '' });
                                            }}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Payment: {paymentStatusLabel(paymentStatus)}
                                        </button>
                                    )}
                                    {courierStatus && (
                                        <button
                                            onClick={() => {
                                                setCourierStatus('');
                                                applyFilters({ courier_status: '' });
                                            }}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Courier: {courierStatus === 'tracked' ? 'Tracked' : 'Not tracked'}
                                        </button>
                                    )}
                                    {assignedUserFilter && (
                                        <button
                                            onClick={() => {
                                                setAssignedUserFilter('');
                                                applyFilters({ assigned_user_id: '' });
                                            }}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Assigned: {users.find((u) => String(u.id) === String(assignedUserFilter))?.name || 'User'}
                                        </button>
                                    )}
                                    {(dateStart || dateEnd) && (
                                        <button
                                            onClick={clearDateFilter}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Date: {dateStart && dateEnd ? `${formatFilterDate(dateStart)} - ${formatFilterDate(dateEnd)}` : 'Custom range'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button 
                                        onClick={handleSelectAllToggle}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                                        title="Select / deselect all"
                                    >
                                        <Check className="w-4 h-4 text-slate-500" />
                                        Select all
                                    </button>

                                    <select 
                                        value={assignedUserId}
                                        onChange={handleAssignUser}
                                        className="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">Assign selected to user</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>

                                    <select
                                        value={bulkStatus}
                                        onChange={e => setBulkStatus(e.target.value)}
                                        className="min-w-[150px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">Batch status</option>
                                        {statuses.map(st => (
                                            <option key={st.id} value={st.slug}>{st.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedCourier}
                                        onChange={e => setSelectedCourier(e.target.value)}
                                        className="min-w-[150px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400"
                                    >
                                        <option value="">Select Courier</option>
                                        {couriers.map(cr => (
                                            <option key={cr.id} value={cr.code}>{cr.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* <Link
                                        href={route('checkout.index')}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                        title="Create Order"
                                    >
                                        <Plus className="w-4 h-4 text-slate-500" />
                                        Create
                                    </Link> */}

                                    <button 
                                        onClick={handleSendToCourierBulk}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700"
                                        title="Send Selected to Courier"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Send to courier
                                    </button>

                                    <button 
                                        onClick={handleBulkPrint}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                                        title="Print Invoices for Selected"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-4 md:px-6">
                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        Filters collapsed
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'No filters applied'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleFilterPanel}
                                        className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                                    >
                                        Expand filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-rose-55 border border-rose-250 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <X className="w-4 h-4 text-rose-600" />
                        {flash.error}
                    </div>
                )}

                {/* Metric Summary Box like first image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#2d7cb6] hover:bg-[#256c9f] transition-all text-white font-bold py-3 px-6 rounded-md shadow-xs flex items-center justify-center gap-1.5 uppercase text-xs">
                        Orders: <span className="text-white text-sm font-black">{totalOrders}</span>
                    </div>
                    <div className="bg-[#2d7cb6] hover:bg-[#256c9f] transition-all text-white font-bold py-3 px-6 rounded-md shadow-xs flex items-center justify-center gap-1.5 uppercase text-xs">
                        Sales: <span className="text-white text-sm font-black">{totalSales.toFixed(4)}</span>
                    </div>
                    <div className="bg-[#2d7cb6] hover:bg-[#256c9f] transition-all text-white font-bold py-3 px-6 rounded-md shadow-xs flex items-center justify-center gap-1.5 uppercase text-xs">
                        Products: <span className="text-white text-sm font-black">{totalProducts}</span>
                    </div>
                </div>

                {/* Edit modal drawer */}
                {activeOrder && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex justify-end" onClick={() => setActiveOrder(null)}>
                        <div className="w-full max-w-[460px] bg-slate-50 h-full shadow-2xl overflow-y-auto border-l border-slate-200" onClick={e => e.stopPropagation()}>
                            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-6 pt-6 pb-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                            Quick Update
                                        </span>
                                        <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">
                                            Order #{activeOrder.order_number}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Fast status edits without opening the full order page.
                                        </p>
                                    </div>
                                    <button onClick={() => setActiveOrder(null)} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-100">
                                        <X className="w-4.5 h-4.5" />
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {statuses.find(st => st.slug === activeOrder.status) && (
                                        <span
                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                                            style={{ backgroundColor: statuses.find(st => st.slug === activeOrder.status)?.color || '#475569' }}
                                        >
                                            {statuses.find(st => st.slug === activeOrder.status)?.name}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                        {paymentStatusLabel(activeOrder.payment_status)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                                        {activeOrder.tracking_number ? 'Tracked' : 'No Tracking'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-6 space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Order Total</p>
                                        <p className="mt-2 text-lg font-black text-slate-900">৳{parseFloat(activeOrder.total).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Created</p>
                                        <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{formatDateTime(activeOrder.created_at)}</p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-4 text-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Customer</p>
                                                <p className="mt-1 truncate text-base font-black">
                                                    {activeOrder.shipping_address?.name || activeOrder.phone || 'Guest'}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-300">
                                                    {activeOrder.shipping_address?.city || activeOrder.shipping_address?.address || 'No address saved'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(activeOrder.order_number)}
                                                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/15"
                                                    title="Copy Order ID"
                                                >
                                                    <ClipboardCopy className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={route('admin.orders.show', { id: activeOrder.id })}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-900 transition hover:bg-slate-100"
                                                >
                                                    View Details
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 p-4">
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-500">Customer</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {activeOrder.shipping_address?.name || activeOrder.phone || 'Guest'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-500">Phone</span>
                                            </div>
                                            <span className="font-mono text-sm font-semibold text-slate-800">{activeOrder.phone || activeOrder.shipping_address?.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-500">Products</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">{activeOrder.items?.length || 0} item(s)</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Delivery Status</label>
                                        <select
                                            value={form.data.status}
                                            onChange={e => form.setData('status', e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                                        >
                                            {statuses.map(st => (
                                                <option key={st.id} value={st.slug}>{st.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Payment Status</label>
                                        <select
                                            value={form.data.payment_status}
                                            onChange={e => form.setData('payment_status', e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                                        >
                                            <option value="pending">Pending Collections</option>
                                            <option value="paid">Paid (Collected)</option>
                                            <option value="failed">Failed</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Courier Tracking ID</label>
                                        <input
                                            type="text"
                                            value={form.data.tracking_number}
                                            onChange={e => form.setData('tracking_number', e.target.value)}
                                            placeholder="e.g. TRK-123456"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                                        />
                                        <span className="mt-2 block text-[11px] text-slate-400">Visible to customer on tracking page.</span>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
                                        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                            <Clock3 className="w-3.5 h-3.5" />
                                            Quick Actions
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => window.open(route('admin.orders.invoice', { id: activeOrder.id }), '_blank')}
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/15"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                Invoice
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(activeOrder.tracking_number)}
                                                disabled={!activeOrder.tracking_number}
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <ClipboardCopy className="w-3.5 h-3.5" />
                                                Copy Tracking
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const trackUrl = getTrackingUrl(activeOrder);
                                                    if (trackUrl) {
                                                        window.open(trackUrl, '_blank');
                                                    }
                                                }}
                                                disabled={!getTrackingUrl(activeOrder)}
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Track
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-full rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 py-3.5 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:from-slate-900 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <Save className="w-4.5 h-4.5" />
                                            {form.processing ? 'Saving...' : 'Update Order'}
                                        </span>
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                )}

                {/* Orders table list card */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-4 px-3 w-8">
                                        <input
                                            type="checkbox"
                                            checked={orders.data.length > 0 && selectedOrderIds.length === orders.data.length}
                                            onChange={handleSelectAllToggle}
                                            className="w-4 h-4 text-orange-500 border-slate-350 rounded focus:ring-orange-500"
                                        />
                                    </th>
                                    <th className="py-4 px-3 text-[#2d7cb6] font-bold text-left hover:underline cursor-pointer">Order ID</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Customer</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Products</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Status</th>
                                    <th className="py-4 px-3 text-[#2d7cb6] font-bold text-left">Total</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Courier</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Assign User</th>
                                    <th className="py-4 px-3 font-bold text-left text-slate-700">Created By</th>
                                    <th className="py-4 px-3 text-[#2d7cb6] font-bold text-left">Date Added</th>
                                    <th className="py-4 px-3 font-bold text-right text-slate-700">Action</th>
                                </tr>
                            </thead>
                            {showSkeleton ? (
                                <OrdersTableSkeleton rowsCount={8} />
                            ) : (
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {orders.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="py-8 text-center text-slate-400 italic">
                                                No orders found for this filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.data.map((ord) => {
                                        const shipping = ord.shipping_address || {};
                                        const customerNote = getCustomerNote(ord);
                                        return (
                                            <tr key={ord.id} className="hover:bg-slate-50/50">
                                                {/* Checkbox */}
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrderIds.includes(ord.id)}
                                                        onChange={() => handleSelectToggle(ord.id)}
                                                        className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                    />
                                                </td>

                                                {/* Order ID */}
                                                <td className="py-4 px-3 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Link href={route('admin.orders.show', { id: ord.id })} className="text-slate-800 font-bold text-[13px] hover:text-orange-500 transition-colors">
                                                            {ord.id}
                                                        </Link>
                                                        <span className="text-[10px] text-slate-400 mt-1">{calculateDaysAgo(ord.created_at)}</span>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="py-4 px-3 text-left max-w-xs">
                                                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                                            <span>{shipping.name || ord.phone || 'Guest'}</span>
                                                            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-[3px] text-[8px] font-extrabold tracking-wider">NEW</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold font-mono">
                                                            <Phone className="w-3.5 h-3.5 text-rose-500" />
                                                            <span>{ord.phone || shipping.phone || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-start gap-1.5 text-slate-550 leading-normal">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                            <span className="text-[11px]">{shipping.address || ''}, {shipping.city || ''}</span>
                                                        </div>
                                                        {customerNote && (
                                                            <div className="flex items-start gap-1.5 text-amber-700 leading-normal">
                                                                <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                                <span className="text-[11px]">{customerNote}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Products */}
                                                <td className="py-4 px-3 text-left">
                                                    <div className="flex flex-col gap-2">
                                                        {ord.items && ord.items.map((item, idx) => {
                                                            const imgUrl = item.product?.primary_image?.image_path 
                                                                        || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60';
                                                            return (
                                                                <div key={idx} className="flex items-center gap-2 max-w-[200px]">
                                                                    <AdminImage
                                                                        src={item.product?.primary_image?.image_path}
                                                                        alt={item.name}
                                                                        className="w-10 h-10 object-cover rounded border border-slate-200 shadow-xs shrink-0"
                                                                        wrapperClassName="w-10 h-10 rounded border border-slate-200 shrink-0"
                                                                        size="sm"
                                                                    />
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="font-bold text-slate-800 text-[11px] truncate" title={item.name}>
                                                                            {item.name}
                                                                        </span>
                                                                        <div className="mt-1">
                                                                            <span className="px-1.5 py-0.5 bg-emerald-650 text-white font-extrabold rounded text-[8px] tracking-wide inline-block">
                                                                                Qty: {item.quantity}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Status Dropdown */}
                                                <td className="py-4 px-3">
                                                    {(() => {
                                                        const matchedStatus = statuses.find(s => s.slug === ord.status);
                                                        const statusColor = matchedStatus ? matchedStatus.color : '#f97316';
                                                        return (
                                                            <div className="relative inline-block w-[125px]">
                                                                <select
                                                                    value={ord.status}
                                                                    onChange={e => handleRowStatusChange(ord.id, e.target.value, ord.payment_status, ord.tracking_number)}
                                                                    style={{ 
                                                                        backgroundColor: statusColor,
                                                                        color: '#ffffff'
                                                                    }}
                                                                    className="w-full text-[11px] font-bold uppercase rounded py-1.5 pl-3.5 pr-8 appearance-none border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-350"
                                                                >
                                                                    {statuses.map(st => (
                                                                        <option key={st.id} value={st.slug} className="bg-white text-slate-800 uppercase font-bold text-[11px]">
                                                                            {st.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-white text-[10px]">
                                                                    ▼
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Total */}
                                                <td className="py-4 px-3 text-left">
                                                    <div className="flex flex-col text-xs text-slate-700 leading-relaxed font-semibold">
                                                        <span>Total: ৳{parseFloat(ord.total).toLocaleString()}</span>
                                                        <span className="text-slate-400 text-[11px] font-medium mt-0.5">Delivery: ৳{parseFloat(ord.shipping_cost || 0).toFixed(0)}</span>
                                                    </div>
                                                </td>

                                                {/* Courier */}
                                                <td className="py-4 px-3 text-left">
                                                    <div className="flex flex-col text-[11px] text-slate-700 gap-1 font-semibold">
                                                        {ord.tracking_number && (
                                                            <span className="font-bold">
                                                                {ord.courier_code ? getCourierName(ord.courier_code) : 'Dispatched'}
                                                            </span>
                                                        )}
                                                        {ord.tracking_number && (
                                                            <>
                                                                <span className="font-mono text-slate-500">{ord.tracking_number}</span>
                                                                <a 
                                                                    href={getTrackingUrl(ord) || '#'} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="p-1 bg-[#2d7cb6] hover:bg-[#205b87] text-white rounded w-6 h-6 flex items-center justify-center transition-all mt-0.5 shadow-xs"
                                                                    title="Track Order"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Assign User & Created By */}
                                                <td className="py-4 px-3 text-slate-700 text-xs font-semibold">{ord.assigned_user ? ord.assigned_user.name : <span className="text-slate-400 italic">Unassigned</span>}</td>
                                                <td className="py-4 px-3 text-slate-700 text-xs font-semibold">{ord.creator ? ord.creator.name : <span className="text-slate-400 italic">Customer</span>}</td>

                                                {/* Date Added */}
                                                <td className="py-4 px-3 text-left">
                                                    {(() => {
                                                        const formatted = formatOrderDate(ord.created_at);
                                                        return (
                                                            <div className="flex flex-col text-slate-650 font-medium text-[11px] leading-relaxed">
                                                                <span>{formatted.date}</span>
                                                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{formatted.time}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Action Panel Grid */}
                                                <td className="py-4 px-3 text-right">
                                                    <div className="flex flex-col gap-1 items-end">
                                                        {/* Row 1 */}
                                                        <div className="flex gap-0.5">
                                                            {/* <button 
                                                                onClick={() => alert(`SMS notification for Order #${ord.order_number}`)}
                                                                className="p-1 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="Send SMS"
                                                            >
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                            </button> */}
                                                            <button 
                                                                onClick={() => window.open(route('admin.orders.invoice', { id: ord.id }), '_blank')}
                                                                className="p-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="Print Invoice"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </button>
                                                            {/* <button 
                                                                onClick={() => openOrderDetails(ord.id)}
                                                                className="p-1 bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="View Order"
                                                            >
                                                                <Info className="w-3.5 h-3.5" />
                                                            </button> */}
                                                            <button 
                                                                onClick={() => openOrderDetails(ord.id)}
                                                                className="p-1 bg-[#5cb85c] hover:bg-[#449d44] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        {/* Row 2 */}
                                                        <div className="flex gap-0.5">
                                            {/* <button 
                                                onClick={() => {
                                                    setSelectedOrderIds([ord.id]);
                                                    setSelectedCourier(selectedCourier || (couriers[0]?.code || 'steadfast'));
                                                    router.post(route('admin.orders.send-to-courier'), {
                                                        order_ids: [ord.id],
                                                        courier_id: selectedCourier || (couriers[0]?.code || 'steadfast')
                                                    });
                                                }}
                                                                className="p-1 bg-[#5cb85c] hover:bg-[#449d44] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="Send to Courier"
                                                            >
                                                                <Truck className="w-3.5 h-3.5" />
                                                            </button> */}
                                                            <button 
                                                                onClick={() => handleEditClick(ord)}
                                                                className="p-1 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="Edit Details"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEditClick(ord)}
                                                                className="p-1 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-[10px] transition-all flex items-center justify-center w-6 h-6 shadow-xs"
                                                                title="Quick Update"
                                                            >
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders?.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {orders.links?.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <button
                                        key={idx}
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
                                        className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-orange-500 border-orange-500 text-white' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
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
