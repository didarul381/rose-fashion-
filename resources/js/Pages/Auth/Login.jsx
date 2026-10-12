import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Tracker } from '../../Services/Tracker';

export default function Login({ status, canResetPassword }) {
    const { global_settings } = usePage().props;
    const storeName = global_settings?.store_name || global_settings?.theme_name || global_settings?.site_title || global_settings?.header_logo_text || 'Online Store';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onSuccess: () => {
                Tracker.trackLogin('website');
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={`Log in | ${storeName}`} />

            <div className="space-y-6 text-slate-900">
                <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-pink-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        Welcome back
                    </span>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-950">Sign in to {storeName}</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Continue shopping, track orders, and access your account in one place.
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="email" value="Email address" className="text-slate-700" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-pink-500 focus:ring-pink-500/20"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-3 text-sm text-slate-600">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={route('register')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                            New customer? Create account
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-40"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Log in
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Secure access for shopping, orders, and support
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
