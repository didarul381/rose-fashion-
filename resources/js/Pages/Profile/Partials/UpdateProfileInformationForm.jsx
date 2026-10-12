import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { 
    User, Mail, Phone, Camera, Trash2, CheckCircle2, 
    AlertCircle, RefreshCw, Upload, Sparkles
} from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth?.user || {};
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: null,
            remove_avatar: false,
        });

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                avatar: file,
                remove_avatar: false,
            }));
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-7">
                {/* Profile Image / Avatar Uploader */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="relative group flex-shrink-0">
                            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white text-3xl font-black">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="bg-gradient-to-tr from-slate-900 to-slate-700 h-full w-full flex items-center justify-center text-white">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus:outline-none"
                                title="Upload profile photo"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">Profile Photo</h4>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                                    Avatar
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Upload a friendly photo to personalize your account across your orders and store activity. Max size 5MB (JPG, PNG, or WEBP).
                            </p>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                                className="hidden"
                            />

                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Choose Photo
                                </button>

                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                )}
                            </div>

                            <InputError message={errors.avatar} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <User className="h-4 w-4" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Your full name"
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                            />
                        </div>
                        <InputError className="mt-1.5" message={errors.name} />
                    </div>

                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Mail className="h-4 w-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="name@example.com"
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                            />
                        </div>
                        <InputError className="mt-1.5" message={errors.email} />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Mobile Phone Number
                        </label>
                        <div className="relative mt-1.5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Phone className="h-4 w-4" />
                            </div>
                            <input
                                id="phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="tel"
                                placeholder="+880 1712-345678"
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Used for courier delivery notifications & order updates.</p>
                        <InputError className="mt-1" message={errors.phone} />
                    </div>

                    {/* Account Role & Code Info */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Account Type & Referral
                        </label>
                        <div className="mt-1.5 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                            <span className="font-bold text-slate-800 capitalize">
                                {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-500">
                                {user.referral_code || 'N/A'}
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Assigned by the system for referral & security tracking.</p>
                    </div>
                </div>

                {/* Email verification notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">
                                    Your email address is unverified.
                                </p>
                                <p className="mt-0.5 text-xs text-amber-700">
                                    Verify your email address to ensure you never lose access to your order invoices and receipts.
                                </p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-950"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Click here to re-send the verification email
                                </Link>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" />
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button & Feedback */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-slate-950/15 hover:bg-slate-800 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                        {processing && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>Save Changes</span>
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
                            Profile updated successfully
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
