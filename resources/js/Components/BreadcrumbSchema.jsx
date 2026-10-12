import React from 'react';
import { Head } from '@inertiajs/react';

/**
 * BreadcrumbSchema Component
 *
 * Emits Google-compliant BreadcrumbList Schema.org structured data via JSON-LD.
 * Automatically ensures URLs are absolute, positions are 1-based, and JSON is safe.
 *
 * @param {Array<{name: string, url?: string, href?: string}>} items - List of breadcrumb items
 * @returns {JSX.Element|null}
 */
export default function BreadcrumbSchema({ items = [] }) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const getAbsoluteUrl = (url) => {
        if (!url) return undefined;
        const str = String(url).trim();
        if (str.startsWith('http://') || str.startsWith('https://')) {
            return str;
        }
        if (typeof window !== 'undefined' && window.location?.origin) {
            try {
                return new URL(str, window.location.origin).href;
            } catch (e) {
                return str;
            }
        }
        return str;
    };

    const validElements = items
        .filter((item) => item && (item.name || item.title))
        .map((item, index) => {
            const rawUrl = item.url || item.href || item.item;
            const absoluteUrl = getAbsoluteUrl(rawUrl);

            const element = {
                '@type': 'ListItem',
                'position': index + 1, // 1-based index required by Google
                'name': String(item.name || item.title).trim(),
            };

            if (absoluteUrl) {
                element.item = absoluteUrl;
            }

            return element;
        });

    if (validElements.length === 0) {
        return null;
    }

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': validElements,
    };

    // Escape '<' to prevent XSS script injection vulnerabilities
    const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd }}
            />
        </Head>
    );
}
