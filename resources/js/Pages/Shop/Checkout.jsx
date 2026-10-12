import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Contexts/CartContext';
import { 
    CreditCard, MapPin, Phone, User, Mail, ShieldCheck, Ticket, 
    Coins, Wallet, ShoppingBag, ArrowRight, Truck, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';

import { Tracker } from '../../Services/Tracker';

export default function CheckoutPage({ settings, user, shippingMethods = [], defaultShippingMethod = 'legacy_inside_dhaka' }) {
    const storeName = useStoreName();
    const { 
        cartItems, subtotal, appliedCoupon, setAppliedCoupon, shippingCost, setShippingCost, clearCart 
    } = useCart();

    const hasTrackedCheckout = React.useRef(false);
    useEffect(() => {
        if (cartItems.length > 0 && !hasTrackedCheckout.current) {
            hasTrackedCheckout.current = true;
            Tracker.trackInitiateCheckout(cartItems, subtotal);
        }
    }, [cartItems, subtotal]);

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        notes: '',
        city: '',
        shipping_method: defaultShippingMethod,
        payment_method: 'cod',
        use_wallet: false,
        use_loyalty_points: false
    });

    const activeShippingMethods = shippingMethods.length > 0
        ? shippingMethods
        : [
            { key: 'legacy_inside_dhaka', label: 'Delivery Inside Dhaka', price: 0 },
            { key: 'legacy_outside_dhaka', label: 'Delivery Outside Dhaka', price: 0 },
        ];

    const { flash } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [orderSuccessData, setOrderSuccessData] = useState(null);
    const showCheckoutCoupon = settings?.checkout_coupon_status !== '0';
    const isCheckoutFieldEnabled = (field) => settings?.[`checkout_${field}_status`] !== '0';
    const [isCouponOpen, setIsCouponOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Watch for flash redirect errors
    useEffect(() => {
        if (flash?.error) {
            setValidationError(flash.error);
        }
    }, [flash]);

    // Dynamically set default payment method based on settings
    useEffect(() => {
        const activeMethods = [];
        if (settings?.payment_cod_status !== '0') activeMethods.push('cod');
        if (settings?.payment_bkash_status === '1') activeMethods.push('bkash');
        if (settings?.payment_nagad_status === '1') activeMethods.push('nagad');
        if (settings?.payment_stripe_status === '1') activeMethods.push('stripe');
        if (user) activeMethods.push('wallet');

        if (activeMethods.length > 0 && !activeMethods.includes(form.payment_method)) {
            setForm(prev => ({ ...prev, payment_method: activeMethods[0] }));
        }
    }, [settings, user]);

    useEffect(() => {
        if (!activeShippingMethods.length) return;

        const hasValidShippingMethod = activeShippingMethods.some(method => String(method.key) === String(form.shipping_method));
        if (!hasValidShippingMethod) {
            setForm(prev => ({ ...prev, shipping_method: String(activeShippingMethods[0].key) }));
        }
    }, [activeShippingMethods, form.shipping_method]);

    const normalizeWeightKg = (item) => {
        const weight = Number(item.weight || 0) * Number(item.quantity || 1);
        const unit = String(item.weight_unit || 'kg').toLowerCase();
        if (unit === 'g' || unit === 'gram' || unit === 'grams') return weight / 1000;
        if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') return weight * 0.453592;
        if (unit === 'ton' || unit === 'tons') return weight * 1000;
        return weight;
    };

    const totalWeightKg = cartItems.reduce((sum, item) => sum + normalizeWeightKg(item), 0);
    const selectedShippingMethod = activeShippingMethods.find(method => String(method.key) === String(form.shipping_method));

    // Keep shipping total aligned with the selected method and cart weight
    useEffect(() => {
        const selected = activeShippingMethods.find(method => String(method.key) === String(form.shipping_method));
        if (!selected) return;

        if (!selected.weight_based_enabled) {
            setShippingCost(Number(selected.price || 0));
            return;
        }

        const controller = new AbortController();
        fetch(route('api.cart.shipping'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            signal: controller.signal,
            body: JSON.stringify({
                city: form.city || 'Dhaka',
                shipping_method: form.shipping_method,
                weight: totalWeightKg,
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) setShippingCost(Number(data.cost || 0));
            })
            .catch(() => setShippingCost(Number(selected.price || 0)));

        return () => controller.abort();
    }, [activeShippingMethods, form.shipping_method, form.city, totalWeightKg, setShippingCost]);

    // Totals calculations
    const couponDiscount = appliedCoupon?.discount || 0;
    
    // Loyalty points save (100 points = 10 BDT discount)
    const maxLoyaltyDiscount = user?.loyalty_points ? Math.floor(user.loyalty_points * 0.1) : 0;
    const loyaltyDiscount = form.use_loyalty_points ? Math.min(maxLoyaltyDiscount, subtotal - couponDiscount) : 0;
    
    const taxPercent = parseFloat(settings?.tax_percentage || 5);
    const tax = Math.max(0, (subtotal - couponDiscount - loyaltyDiscount) * (taxPercent / 100));

    const total = Math.max(0, (subtotal - couponDiscount - loyaltyDiscount) + shippingCost + tax);
    const formattedTotal = total % 1 === 0 ? total.toFixed(0) : total.toFixed(2);

    const handleFieldChange = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();

        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code.');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');

        try {
            const response = await fetch(route('api.cart.coupon'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    code: couponCode.trim().toUpperCase(),
                    subtotal
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAppliedCoupon(data);
                setCouponCode('');
                setCouponError('');
                setIsCouponOpen(true);
            } else {
                setAppliedCoupon(null);
                setCouponError(data.message || 'Coupon could not be applied.');
            }
        } catch (error) {
            setCouponError('Unable to apply coupon. Please try again.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        setIsCouponOpen(false);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setValidationError('');
        
        if (cartItems.length === 0) {
            setValidationError('Your shopping cart is empty.');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch(route('checkout.place'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    ...form,
                    cart_items: cartItems,
                    coupon_code: appliedCoupon?.code || null
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Clear cart state
                clearCart();
                // Redirect to success route or external bKash payment URL
                if (data.redirect_url.startsWith('http') && !data.redirect_url.includes(window.location.host)) {
                    window.location.href = data.redirect_url;
                } else {
                    router.visit(data.redirect_url);
                }
            } else {
                setValidationError(data.message || 'Validation failed. Check your shipping input details.');
                setIsProcessing(false);
            }
        } catch (err) {
            setValidationError('Server connection error. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <ShopLayout hideMobileBottomNav={true}>
            <Head title={`Secure One Page Checkout | ${storeName}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-28 lg:pb-8">
                {/* <div className="text-center mb-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">Checkout Details</h3>
                    <p className="text-sm text-slate-400 mt-1.5">Secure payment & order delivery processing</p>
                </div> */}

                {validationError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                        <span>⚠️ {validationError}</span>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1 & 2: Billing details form */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Shipping Address */}
                        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                Delivery Shipping Address
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isCheckoutFieldEnabled('name') && (
                                    <div className={isCheckoutFieldEnabled('phone') ? '' : 'sm:col-span-2'}>
                                    <label className="text-xs font-bold text-slate-655 uppercase">Recipient Name</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => handleFieldChange('name', e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                                )}

                                {isCheckoutFieldEnabled('phone') && (
                                    <div className={isCheckoutFieldEnabled('name') ? '' : 'sm:col-span-2'}>
                                    <label className="text-xs font-bold text-slate-655 uppercase">Contact Phone Number</label>
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => handleFieldChange('phone', e.target.value)}
                                            placeholder="e.g. 01712345678"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                                )}

                                {isCheckoutFieldEnabled('email') && (
                                    <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-655 uppercase">Email Address (Optional)</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                )}

                                {isCheckoutFieldEnabled('address') && (
                                    <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-655 uppercase">Street Address</label>
                                    <textarea
                                        value={form.address}
                                        onChange={e => handleFieldChange('address', e.target.value)}
                                        placeholder="House number, flat, village name, road details..."
                                        rows="2"
                                        className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                )}

                                {isCheckoutFieldEnabled('notes') && (
                                    <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-655 uppercase">
                                        Special Notes <span className="text-slate-400 normal-case">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => handleFieldChange('notes', e.target.value.slice(0, 90))}
                                        placeholder="Add delivery or order instructions..."
                                        rows="1"
                                        maxLength={90}
                                        className="w-full mt-1 p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                                    />
                                    <div className="mt-1 text-xs text-slate-500">
                                        {form.notes.length} / 90 characters
                                    </div>
                                </div>
                                )}

                                {isCheckoutFieldEnabled('city') && (
                                    <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-655 uppercase">City / District</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={e => handleFieldChange('city', e.target.value)}
                                        placeholder="Dhaka, Chittagong, Sylhet..."
                                        className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Used for your delivery address and order tracking.</span>
                                </div>
                                )}

                                <div className="sm:col-span-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Truck className="w-4 h-4 text-orange-500" />
                                        <label className="text-xs font-bold text-slate-655 uppercase">Choose Shipping Method</label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeShippingMethods.map((method) => {
                                            const isSelected = form.shipping_method === method.key;
                                            return (
                                                <label
                                                    key={method.key}
                                                    className={`border rounded-2xl px-4 py-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                                        isSelected
                                                            ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/10'
                                                            : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            name="shipping_method"
                                                            value={method.key}
                                                            checked={isSelected}
                                                            onChange={e => handleFieldChange('shipping_method', e.target.value)}
                                                            className="mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-slate-800">{method.label}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">
                                                                {method.weight_based_enabled ? ('Weight based · Cart weight ' + totalWeightKg.toFixed(2) + ' kg') : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-800 whitespace-nowrap">
                                                        {method.weight_based_enabled && String(method.key) === String(form.shipping_method) ? ('৳' + shippingCost.toFixed(2)) : ('৳' + Number(method.price || 0).toFixed(2))}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                                Payment Method
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {(() => {
                                    const paymentMethods = [];
                                    if (settings?.payment_cod_status !== '0') {
                                        paymentMethods.push({ id: 'cod', label: 'Cash on Delivery', desc: 'Pay on package arrival' });
                                    }
                                    if (settings?.payment_bkash_status === '1') {
                                        paymentMethods.push({ id: 'bkash', label: 'bKash Checkout', desc: 'Instant mobile bKash wallet' });
                                    }
                                    if (settings?.payment_nagad_status === '1') {
                                        paymentMethods.push({ id: 'nagad', label: 'Nagad Pay', desc: 'Instant mobile Nagad wallet' });
                                    }
                                    if (settings?.payment_stripe_status === '1') {
                                        paymentMethods.push({ id: 'stripe', label: 'Credit Card / Visa', desc: 'Secure Stripe processing' });
                                    }
                                    // if (user) {
                                    //     paymentMethods.push({ id: 'wallet', label: 'My Wallet Pay', desc: `Balance: ৳${user?.wallet_balance || 0}` });
                                    // }

                                    if (paymentMethods.length === 0) {
                                        paymentMethods.push({ id: 'cod', label: 'Cash on Delivery', desc: 'Pay on package arrival' });
                                    }

                                    return paymentMethods.map((pm) => {
                                        const isDisabled = pm.id === 'wallet' && (!user || user.wallet_balance < total);
                                        return (
                                            <label
                                                key={pm.id}
                                                className={`border rounded-2xl p-4 flex flex-col gap-1 cursor-pointer transition-all ${
                                                    isDisabled 
                                                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                                                        : form.payment_method === pm.id
                                                            ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/10'
                                                            : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={pm.id}
                                                    checked={form.payment_method === pm.id}
                                                    onChange={e => !isDisabled && handleFieldChange('payment_method', e.target.value)}
                                                    className="sr-only"
                                                    disabled={isDisabled}
                                                />
                                                <span className="text-sm font-bold text-slate-800">{pm.label}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{pm.desc}</span>
                                            </label>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div>

                    {/* Column 3: Cart Items & Totals Breakdown */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Order Summary */}
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Order Items ({cartItems.length})
                            </h2>

                            <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="flex gap-3 py-3 first:pt-0">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-150 flex-shrink-0 bg-slate-50">
                                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                                            {item.variantDescription && (
                                                <p className="text-[10px] text-slate-400">Opt: {item.variantDescription}</p>
                                            )}
                                            <span className="text-xs font-semibold text-slate-400">{item.quantity} x ৳{item.price}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 self-center">৳{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {showCheckoutCoupon && (
                                <div className="mt-5 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setIsCouponOpen(prev => !prev)}
                                    className="flex w-full items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-left transition hover:bg-rose-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-rose-500" />
                                        <span className="text-sm font-bold text-rose-600">
                                            Have Coupon / Voucher?
                                        </span>
                                    </div>
                                    {isCouponOpen ? (
                                        <ChevronUp className="h-4 w-4 text-rose-500" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-rose-500" />
                                    )}
                                </button>

                                <div
                                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                                        isCouponOpen || appliedCoupon ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
                                    }`}
                                >
                                    <div className="min-h-0">
                                        {!appliedCoupon ? (
                                            <form onSubmit={handleApplyCoupon} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Coupon Code
                                                </label>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={e => setCouponCode(e.target.value)}
                                                        placeholder="Enter coupon or voucher code"
                                                        className="w-full flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isApplyingCoupon}
                                                        className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                                                    >
                                                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                                    </button>
                                                </div>
                                                {couponError && (
                                                    <p className="mt-2 text-xs font-medium text-red-500">{couponError}</p>
                                                )}
                                            </form>
                                        ) : (
                                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                                        <div>
                                                            <p className="text-sm font-bold text-emerald-700">
                                                                Coupon {appliedCoupon.code} applied
                                                            </p>
                                                            <p className="mt-1 text-xs font-medium text-emerald-600">
                                                                You saved ৳{Number(appliedCoupon.discount || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveCoupon}
                                                        className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                            )}

                            {/* Loyalty/Points Redeem box (members only) */}
                            {/* {user && user.loyalty_points > 0 && (
                                <div className="mt-5 bg-orange-50/50 border border-orange-100 p-3 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-orange-500" />
                                        <span className="text-[10px] font-bold text-slate-700">
                                            Use {user.loyalty_points} Loyalty Points (Save ৳{maxLoyaltyDiscount})
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={form.use_loyalty_points}
                                        onChange={e => handleFieldChange('use_loyalty_points', e.target.checked)}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded border-slate-350"
                                    />
                                </div>
                            )} */}

                            {/* Price Summary */}
                            <div className="space-y-2.5 pt-5 border-t border-slate-100 mt-5 text-xs text-slate-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-800">৳{subtotal.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-orange-655 font-semibold">
                                        <span>Promo Discount ({appliedCoupon.code})</span>
                                        <span>-৳{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-orange-655 font-semibold">
                                        <span>Loyalty Discount</span>
                                        <span>-৳{loyaltyDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Tax ({settings?.tax_percentage || 5}%)</span>
                                    <span className="font-semibold text-slate-800">৳{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping Fee{selectedShippingMethod?.weight_based_enabled ? (' (' + totalWeightKg.toFixed(2) + ' kg)') : ''}</span>
                                    <span className="font-semibold text-slate-800">৳{shippingCost.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-4 text-slate-900">
                                    <span>Total Payable</span>
                                    <span className="text-base font-extrabold text-orange-500">৳{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="hidden lg:flex w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-2xl font-bold items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    'Processing Order...'
                                ) : (
                                    <>
                                        <span>Confirm Order</span>
                                        <span className="font-extrabold">(৳{formattedTotal})</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {/* <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-450 uppercase">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Secured SSL Encription Standard
                            </div> */}
                        </div>

                    </div>

                    {/* Mobile Sticky Order Button Bar */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md pt-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] lg:hidden">
                        <div className="max-w-7xl mx-auto">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    'Processing Order...'
                                ) : (
                                    <>
                                        <span>Confirm Order</span>
                                        <span className="font-extrabold">(৳{formattedTotal})</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </ShopLayout>
    );
}
