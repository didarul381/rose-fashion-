import { usePage } from '@inertiajs/react';

export function resolveStoreName(settings = {}) {
    return settings?.theme_name
        || settings?.store_name
        || settings?.site_title
        || settings?.header_logo_text
        || 'Online Store';
}

export function useStoreName() {
    const { global_settings = {} } = usePage().props;
    return resolveStoreName(global_settings);
}