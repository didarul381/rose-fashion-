import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, Home, Sparkles } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, global_settings } = usePage().props;
    const user = auth.user;
    const storeName = global_settings?.header_logo_text || global_settings?.theme_name || global_settings?.store_name || global_settings?.site_title || 'Online Store';

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_22%,#eef2ff_100%)]">
            <nav className="border-b border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between gap-4">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-black uppercase tracking-[0.24em] text-slate-950">
                                        {storeName}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-400">
                                        Your account center
                                    </div>
                                </div>
                            </Link>

                            <div className="hidden items-center gap-2 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('profile.edit')}
                                    active={route().current('profile.edit')}
                                >
                                    Profile
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 sm:flex">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                            >
                                <Home className="h-4 w-4" />
                                Store
                            </Link>
                            <div className="relative ms-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-full">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none"
                                            >
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        user.name?.charAt(0)
                                                    )}
                                                </span>
                                                <span className="hidden md:block">{user.name}</span>
                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-100 bg-white'}>
                    <div className="space-y-1 px-4 pb-3 pt-3">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('profile.edit')}
                            active={route().current('profile.edit')}
                        >
                            Profile
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-4">
                        <div className="text-base font-semibold text-slate-900">
                            {user.name}
                        </div>
                        <div className="text-sm text-slate-500">
                            {user.email}
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            <ResponsiveNavLink href={route('home')}>
                                Store
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-white/60 bg-white/70 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
