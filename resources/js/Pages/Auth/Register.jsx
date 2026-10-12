import React, { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Gift, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Tracker } from '../../Services/Tracker';

export default function Register() {
    const { global_settings } = usePage().props;
    const storeName = global_settings?.store_name || global_settings?.theme_name || global_settings?.site_title || global_settings?.header_logo_text || 'Online Store';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            setData('referral_code', refCode);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onSuccess: () => {
                Tracker.trackRegister('website');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={`Register | ${storeName}`} />

            <div className="space-y-6 text-slate-900">
                <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-sky-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        Create your account
                    </span>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-950">Join {storeName} today</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Shop faster, track every order, and save your details for a smoother checkout.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <span>Faster checkout for returning customers</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <Gift className="mt-0.5 h-4 w-4 text-pink-500" />
                        <span>Exclusive offers and cart reminders</span>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Full name" className="text-slate-700" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Phone number" className="text-slate-700" />
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="e.g. 01712345678"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email address" className="text-slate-700" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-700" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm password"
                                className="text-slate-700"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="referral_code" value="Referral code (optional)" className="text-slate-700" />
                        <TextInput
                            id="referral_code"
                            name="referral_code"
                            value={data.referral_code}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            placeholder="e.g. REF-XXXXXX"
                            onChange={(e) => setData('referral_code', e.target.value)}
                        />
                        <InputError message={errors.referral_code} className="mt-2" />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                            Already have an account?
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-40"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Register
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-sky-500" />
                        Your account is protected with secure password encryption and profile settings
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
