import React, { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Lock, Eye, EyeOff, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                {/* Security tip badge */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold text-sky-950">Password Security Recommendations</h4>
                        <p className="mt-0.5 text-xs text-sky-800/80 leading-relaxed">
                            Use at least 8 characters with a blend of uppercase letters, numbers, and symbols. Avoid reusing passwords across accounts.
                        </p>
                    </div>
                </div>

                {/* Current Password */}
                <div>
                    <label htmlFor="current_password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Enter your current password"
                            className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.current_password} className="mt-1.5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showNewPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Create a strong password"
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Confirm New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Repeat your new password"
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1.5" />
                    </div>
                </div>

                {/* Submit button & notification */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-slate-950/15 hover:bg-slate-800 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                        {processing && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>Update Password</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            Password updated successfully
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
