import React, { useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    ArrowLeft,
    CheckCircle2,
    Save,
    Shield,
    PlayCircle,
    AlertCircle,
    ToggleLeft,
    ToggleRight,
    Code2,
    LineChart,
    ShieldPlus,
    Video,
    Megaphone,
    Eye,
    EyeOff,
    Lock,
} from 'lucide-react';

const iconMap = {
    'code-2': Code2,
    'line-chart': LineChart,
    shield: Shield,
    'shield-plus': ShieldPlus,
    video: Video,
};

export default function MarketingIntegration({ integration, integration_groups = [], user_count = 0 }) {
    const [isEnabled, setIsEnabled] = useState(!!integration.enabled);

    const saveForm = useForm({
        enabled: !!integration.enabled,
        ...buildInitialValues(integration),
    });

    useEffect(() => {
        const enabled = !!integration.enabled;
        setIsEnabled(enabled);
        saveForm.setData('enabled', enabled);
    }, [integration.enabled]);

    const Icon = iconMap[integration.icon] || Megaphone;
    const supportsTest = integration.type === 'server';

    const handleSubmit = (e) => {
        e.preventDefault();
        saveForm.post(route('admin.marketing.integrations.save', { integration: integration.slug }), {
            preserveScroll: true,
        });
    };

    const handleStatusToggle = (checked) => {
        setIsEnabled(checked);
        saveForm.setData('enabled', checked);
        router.post(route('admin.marketing.integrations.toggle', { integration: integration.slug }), {
            enabled: checked,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
            },
            onError: () => {
                setIsEnabled(!checked);
            },
        });
    };

    const handleTest = () => {
        if (!supportsTest) return;
        saveForm.post(route('admin.marketing.integrations.test', { integration: integration.slug }), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title={`${integration.name} | Marketing Integration`} />

            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 items-start">
                <aside className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <Link href={route('admin.marketing')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Integrations
                    </Link>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-slate-900">{integration.name}</h1>
                                <p className="text-[11px] text-slate-500">{integration.category}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <StatusBadge enabled={isEnabled} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                {integration.status_label || integration.type}
                            </span>
                        </div>

                        <p className="mt-3 text-xs leading-6 text-slate-600">{integration.description}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {integration_groups.map((group) => (
                            <div key={group.category} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{group.category}</div>
                                <div className="mt-2 space-y-1">
                                    {group.integrations.map((item) => (
                                        <Link
                                            key={item.key}
                                            href={route('admin.marketing.integrations.show', { integration: item.slug })}
                                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                                                item.slug === integration.slug
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                            }`}
                                        >
                                            <span>{item.name}</span>
                                            <span className="text-[10px] uppercase tracking-[0.16em] opacity-80">
                                                {item.enabled ? 'On' : 'Off'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="space-y-6">
                    <section className="rounded-3xl border border-emerald-100 bg-white p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Dedicated integration page
                                </div>
                                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                                    Configure {integration.name}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Toggle this integration independently, save its settings, and test server-side delivery where applicable.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                {isEnabled ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                                <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
                                    <span>Enabled</span>
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={(e) => handleStatusToggle(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {Object.entries(integration.public_fields || {}).map(([field, meta]) => {
                                if (field === 'enabled') return null;

                                const value = saveForm.data[field] ?? integration.config?.[field] ?? '';

                                return (
                                    <Field
                                        key={field}
                                        label={meta.label || field}
                                        value={value}
                                        type={meta.type === 'boolean' ? 'checkbox' : 'text'}
                                        placeholder={meta.placeholder || ''}
                                        description={meta.type === 'boolean' ? 'Toggle this option for the integration.' : 'Public configuration is safe to keep in the browser.'}
                                        onChange={(nextValue) => saveForm.setData(field, nextValue)}
                                    />
                                );
                            })}

                            {Object.entries(integration.secret_fields || {}).map(([field, meta]) => {
                                const isSet = !!integration.config?.[`${field}_is_set`];
                                const preview = integration.config?.[`${field}_preview`] || '';

                                return (
                                    <Field
                                        key={field}
                                        label={meta.label || field}
                                        value={saveForm.data[field] ?? ''}
                                        type="password"
                                        placeholder={isSet ? '••••••••••••••••••••••••••••••••' : (meta.placeholder || 'Paste access token here')}
                                        description={
                                            isSet
                                                ? 'A secret token is already saved and active in the database. Leave blank to keep it, or paste a new token here to update it.'
                                                : 'Leave blank to keep the current secret. The value is encrypted at rest.'
                                        }
                                        onChange={(nextValue) => saveForm.setData(field, nextValue)}
                                        secure
                                        isConfigured={isSet}
                                        preview={preview}
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
                            <div className="text-xs text-slate-500">
                                {supportsTest ? 'Server-side integration test will send a diagnostic event.' : 'This integration only supports browser-side verification.'}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {supportsTest && (
                                    <button
                                        type="button"
                                        onClick={handleTest}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-emerald-200 hover:text-emerald-700"
                                    >
                                        <PlayCircle className="h-4 w-4" />
                                        Test Integration
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={saveForm.processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </form>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoCard
                            title="Event support"
                            value="Centralized"
                            description="All ecommerce events flow through the shared event manager."
                        />
                        <InfoCard
                            title="Secret handling"
                            value="Encrypted"
                            description="Access tokens are stored server-side and never exposed to the browser."
                        />
                        <InfoCard
                            title="Audience"
                            value={`${user_count} users`}
                            description="Admin context stays available while the storefront tracker remains lightweight."
                        />
                    </section>
                </main>
            </div>
        </AdminLayout>
    );
}

function buildInitialValues(integration) {
    const values = {};

    Object.entries(integration.public_fields || {}).forEach(([field]) => {
        if (field !== 'enabled') {
            values[field] = integration.config?.[field] ?? '';
        }
    });

    Object.entries(integration.secret_fields || {}).forEach(([field]) => {
        values[field] = '';
    });

    return values;
}

function Field({ label, value, type, placeholder, description, onChange, secure = false, isConfigured = false, preview = '' }) {
    const [showPlain, setShowPlain] = useState(false);

    if (type === 'checkbox') {
        return (
            <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                    <div className="text-sm font-bold text-slate-900">{label}</div>
                    <div className="text-[11px] leading-5 text-slate-500">{description}</div>
                </div>
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
            </label>
        );
    }

    return (
        <div className={`rounded-2xl border ${secure ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-100 bg-slate-50'} p-4`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {secure && <Lock className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{label}</span>
                </label>
                {secure && isConfigured && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved & Active</span>
                    </span>
                )}
            </div>

            {secure && isConfigured && (
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs">
                    <span className="text-[11px] font-medium text-emerald-800">
                        Current Token:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-emerald-200 shadow-xs">
                        {preview || '••••••••••••••••'}
                    </span>
                </div>
            )}

            <div className="relative mt-2.5">
                <input
                    type={secure ? (showPlain ? 'text' : 'password') : type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-mono"
                />
                {secure && (
                    <button
                        type="button"
                        onClick={() => setShowPlain(!showPlain)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                        title={showPlain ? "Hide input" : "Show input"}
                    >
                        {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <div className="mt-2 text-[11px] leading-5 text-slate-500">{description}</div>
        </div>
    );
}

function StatusBadge({ enabled }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {enabled ? 'Connected' : 'Disabled'}
        </span>
    );
}

function InfoCard({ title, value, description }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</div>
            <div className="mt-2 text-lg font-black text-slate-900">{value}</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
    );
}
