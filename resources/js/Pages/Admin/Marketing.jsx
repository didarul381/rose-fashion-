import { useStoreName } from '../../Hooks/useStoreName';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    ArrowRight,
    CheckCircle2,
    Code2,
    Shield,
    ShieldPlus,
    Sparkles,
    Tv2,
    Video,
    LineChart,
    Megaphone,
} from 'lucide-react';

const iconMap = {
    'code-2': Code2,
    'line-chart': LineChart,
    facebook: Shield,
    shield: Shield,
    'shield-plus': ShieldPlus,
    video: Video,
};

export default function Marketing({ integration_groups = [], user_count = 0 }) {
    const storeName = useStoreName();

    const standardEvents = [
        { name: 'page_view', description: 'Page load and navigation tracking.' },
        { name: 'view_item', description: 'Product detail views.' },
        { name: 'add_to_cart', description: 'Cart additions.' },
        { name: 'begin_checkout', description: 'Checkout starts.' },
        { name: 'purchase', description: 'Completed orders.' },
        { name: 'lead', description: 'Lead and subscription events.' },
    ];

    return (
        <AdminLayout>
            <Head title={`Marketing Integrations | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-50 p-6 md:p-8 shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.10),transparent_32%)]" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Marketing Suite
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
                                Integration marketplace for analytics, pixels, and server events.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                Each integration is independent, configurable, and safe to disable without affecting the others. Secrets stay server-side, while the browser only receives public IDs and enable flags.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <Metric label="Integrations" value={integration_groups.reduce((sum, group) => sum + (group.integrations?.length || 0), 0)} />
                            <Metric label="Subscribers" value={user_count} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
                    <div className="space-y-6">
                        {integration_groups.map((group) => (
                            <section key={group.category} className="rounded-3xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-800">{group.category}</h2>
                                        <p className="mt-1 text-xs text-slate-500">Independent integrations for {group.category.toLowerCase()} workflows.</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                                        {group.integrations?.length || 0} items
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(group.integrations || []).map((integration) => {
                                        const Icon = iconMap[integration.icon] || Megaphone;
                                        const enabled = !!integration.enabled;
                                        return (
                                            <article key={integration.key} className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="text-sm font-extrabold text-slate-900">{integration.name}</h3>
                                                                <Badge enabled={enabled} />
                                                            </div>
                                                            <p className="mt-1 text-xs leading-5 text-slate-500">{integration.description}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        {integration.status_label || integration.type}
                                                    </div>
                                                    <Link
                                                        href={route('admin.marketing.integrations.show', { integration: integration.slug })}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600"
                                                    >
                                                        {enabled ? 'Manage' : 'Configure'}
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Tv2 className="h-4 w-4 text-emerald-600" />
                                <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-800">Event System</h2>
                            </div>
                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                The storefront emits standard ecommerce events once. Each integration translates them into its own platform format.
                            </p>

                            <div className="mt-4 space-y-2">
                                {standardEvents.map((event) => (
                                    <div key={event.name} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">{event.name}</div>
                                            <div className="text-[11px] leading-5 text-slate-500">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-slate-950 p-6 text-white shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">Build once, extend later</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Adding a future integration means registering a new definition, adding fields, and mapping its event translator. The admin UI will render it as a new card.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
        </div>
    );
}

function Badge({ enabled }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
        >
            {enabled ? 'Connected' : 'Disabled'}
        </span>
    );
}
