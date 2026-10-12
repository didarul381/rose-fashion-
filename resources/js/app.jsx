import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { CartProvider } from './Contexts/CartContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const initialScrollStorageKey = `initial-scroll:${window.location.pathname}${window.location.search}`;

const rememberInitialScroll = () => {
    try {
        sessionStorage.setItem(initialScrollStorageKey, JSON.stringify([window.scrollX, window.scrollY]));
    } catch {}
};

const restoreInitialScroll = (callback) => {
    try {
        const [left, top] = JSON.parse(sessionStorage.getItem(initialScrollStorageKey) || 'null') || [];

        if (!Number.isFinite(left) || !Number.isFinite(top)) {
            callback();
            return;
        }

        let frames = 0;
        const restore = () => {
            window.scrollTo(left, top);
            if (++frames < 3) {
                requestAnimationFrame(restore);
                return;
            }
            callback();
        };
        requestAnimationFrame(restore);
    } catch {
        callback();
    }
};

window.addEventListener('pagehide', rememberInitialScroll);

const dismissInitialLoader = (appElement) => {
    const loader = document.getElementById('initial-page-loader');

    if (!loader) return;

    const dismiss = () => {
        restoreInitialScroll(() => {
            loader.classList.add('initial-page-loader--hidden');
            loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        });
    };

    const observer = new MutationObserver(() => {
        if (!appElement.childElementCount) return;

        observer.disconnect();
        requestAnimationFrame(dismiss);
    });

    observer.observe(appElement, { childList: true });

    if (appElement.childElementCount) {
        observer.disconnect();
        requestAnimationFrame(dismiss);
    }
};

createInertiaApp({
    title: (title) => title,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <CartProvider>
                    <App {...props} />
                </CartProvider>
            );
            return;
        }

        createRoot(el).render(
            <CartProvider>
                <App {...props} />
            </CartProvider>
        );

        dismissInitialLoader(el);
    },
    progress: {
        color: '#4B5563',
    },
});
