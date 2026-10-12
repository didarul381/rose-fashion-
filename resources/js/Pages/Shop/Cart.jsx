import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Contexts/CartContext';
import { ArrowRight, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Ticket, Trash2, Truck } from 'lucide-react';

export default function CartPage() {
    const { global_settings } = usePage().props;
    const storeName = global_settings?.store_name || global_settings?.theme_name || global_settings?.site_title || global_settings?.header_logo_text || 'Online Store';
    const {
        cartItems,
        cartCount,
        subtotal,
        appliedCoupon,
        setAppliedCoupon,
        removeFromCart,
        updateQty,
        clearCart
    } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const discount = appliedCoupon?.discount || 0;
    const total = Math.max(0, subtotal - discount);

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
    };

    return (
        <ShopLayout>
            <Head title={`Shopping Cart | ${storeName}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-5 md:p-6 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600">
                                <Sparkles className="h-3.5 w-3.5" />
                                Cart review
                            </span>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">
                                    Shopping Cart ({cartCount})
                                </h1>
                                <p className="mt-2 text-sm md:text-base leading-6 text-slate-500">
                                    Review items, adjust quantities, apply offers, and head to checkout when you’re ready.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Secure checkout
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                                <Truck className="h-4 w-4 text-sky-500" />
                                Fast delivery
                            </div>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="grid place-items-center rounded-[2rem] border border-slate-200 bg-white p-8 md:p-14 shadow-sm">
                        <div className="max-w-lg text-center">
                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-orange-50 text-orange-500">
                                <ShoppingBag className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
                                Your cart is empty
                            </h2>
                            <p className="mt-3 text-sm md:text-base leading-7 text-slate-500">
                                Start adding products to build your order. Your saved cart will appear here as you shop.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href={route('home')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
                                >
                                    Continue Shopping
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('checkout.index')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Go to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6 lg:gap-8">
                        <div className="space-y-4">
                            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-5 py-4 md:px-6 md:py-5">
                                    <h2 className="text-lg font-black text-slate-900">Cart items</h2>
                                    <p className="mt-1 text-sm text-slate-500">Adjust quantities or remove items before checkout.</p>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {cartItems.map((item) => (
                                        <div key={item.cartId} className="p-4 md:p-6">
                                            <div className="flex gap-4">
                                                <Link
                                                    href={item.slug ? route('product.show', { slug: item.slug }) : route('home')}
                                                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                                                >
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={item.slug ? route('product.show', { slug: item.slug }) : route('home')}
                                                                className="block"
                                                            >
                                                                <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
                                                                    {item.name}
                                                                </h3>
                                                            </Link>
                                                            {item.variantDescription && (
                                                                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                                                    {item.variantDescription}
                                                                </p>
                                                            )}
                                                            <p className="mt-2 text-sm text-slate-500">
                                                                Unit price: <span className="font-semibold text-slate-800">BDT {Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.cartId)}
                                                            className="rounded-full p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQty(item.cartId, item.quantity - 1)}
                                                                className="flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-slate-900"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="min-w-10 px-3 text-center text-sm font-bold text-slate-800">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQty(item.cartId, item.quantity + 1)}
                                                                className="flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-slate-900"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Line total</div>
                                                            <div className="text-lg font-black text-slate-900">
                                                                BDT {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <h3 className="mt-3 text-sm font-bold text-slate-900">Fast checkout</h3>
                                    <p className="mt-1 text-sm text-slate-500">Move to payment in just a few steps.</p>
                                </div>
                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                                    <Ticket className="h-5 w-5 text-orange-500" />
                                    <h3 className="mt-3 text-sm font-bold text-slate-900">Coupon ready</h3>
                                    <p className="mt-1 text-sm text-slate-500">Apply discounts before placing your order.</p>
                                </div>
                                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-sky-500" />
                                    <h3 className="mt-3 text-sm font-bold text-slate-900">Secure by design</h3>
                                    <p className="mt-1 text-sm text-slate-500">Your cart and checkout stay protected.</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-6 h-fit rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-5 py-4 md:px-6 md:py-5">
                                <h2 className="text-lg font-black text-slate-900">Order summary</h2>
                                <p className="mt-1 text-sm text-slate-500">Review your totals before continuing.</p>
                            </div>

                            <div className="space-y-5 px-5 py-5 md:px-6">
                                {!appliedCoupon ? (
                                    <form onSubmit={handleApplyCoupon} className="space-y-3">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Coupon code
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="LAUNCH15"
                                                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isApplyingCoupon}
                                                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs font-medium text-red-500">{couponError}</p>
                                        )}
                                    </form>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                    Coupon applied
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-emerald-900">
                                                    {appliedCoupon.code}
                                                </div>
                                                <div className="mt-1 text-sm text-emerald-800">
                                                    Discount: BDT {Number(discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="text-xs font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-slate-800">
                                            BDT {Number(subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>Discount</span>
                                        <span className="font-semibold text-emerald-600">
                                            -BDT {Number(discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                        <span className="text-sm font-bold text-slate-900">Total</span>
                                        <span className="text-xl font-black text-orange-500">
                                            BDT {Number(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href={route('checkout.index')}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href={route('home')}
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Continue Shopping
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={clearCart}
                                            className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        Safe and fast checkout
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Shipping and delivery charges are calculated during checkout based on your location.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
