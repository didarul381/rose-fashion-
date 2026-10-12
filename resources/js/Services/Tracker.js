export const Tracker = {
    settings: {},

    init(settings) {
        this.settings = settings || {};

        const gtmId = this.getSetting([
            'marketing_integrations.google_tag_manager.gtm_id',
            'google_tag_manager_id',
        ]);
        if (this.isEnabled([
            'marketing_integrations.google_tag_manager.enabled',
            'google_tag_manager_enabled',
        ], !!gtmId) && gtmId && !window.gtm_initialized) {
            window.gtm_initialized = true;
            (function (w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
                var f = d.getElementsByTagName(s)[0];
                var j = d.createElement(s);
                var dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', gtmId);
        }

        const ga4Id = this.getSetting([
            'marketing_integrations.google_analytics_4.measurement_id',
            'google_analytics_id',
        ]);
        if (this.isEnabled([
            'marketing_integrations.google_analytics_4.enabled',
            'google_analytics_enabled',
        ], !!ga4Id) && ga4Id && !window.ga4_initialized) {
            window.ga4_initialized = true;
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', ga4Id);
        }

        const metaPixelId = this.getSetting([
            'marketing_integrations.meta_pixel.pixel_id',
            'meta_pixel_id',
            'facebook_pixel_id',
        ]);
        if (this.isEnabled([
            'marketing_integrations.meta_pixel.enabled',
            'facebook_pixel_enabled',
        ], !!metaPixelId) && metaPixelId && !window.meta_initialized) {
            window.meta_initialized = true;
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return;
                n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = true;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', metaPixelId);
            window.fbq('track', 'PageView');
        }

        const tiktokPixelId = this.getSetting([
            'marketing_integrations.tiktok_pixel.pixel_id',
            'tiktok_pixel_id',
        ]);
        if (this.isEnabled([
            'marketing_integrations.tiktok_pixel.enabled',
            'tiktok_pixel_enabled',
        ], !!tiktokPixelId) && tiktokPixelId && !window.tiktok_initialized) {
            window.tiktok_initialized = true;
            !function (w, d, t) {
                w.TiktokAnalyticsObject = t;
                var ttq = w[t] = w[t] || [];
                ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
                ttq.setAndDefer = function (t, e) {
                    t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
                };
                for (var e = 0; e < ttq.methods.length; e++) ttq.setAndDefer(ttq, ttq.methods[e]);
                ttq.instance = function (t) {
                    for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                    return e;
                };
                ttq.load = function (e, n) {
                    var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                    ttq._i = ttq._i || {};
                    ttq._i[e] = [];
                    ttq._i[e]._u = r;
                    ttq._t = ttq._t || {};
                    ttq._t[e] = +new Date();
                    ttq._o = ttq._o || {};
                    ttq._o[e] = n || {};
                    var a = d.createElement('script');
                    a.type = 'text/javascript';
                    a.async = true;
                    a.src = r + '?sdkid=' + e + '&lib=' + t;
                    var i = d.getElementsByTagName('script')[0];
                    i.parentNode.insertBefore(a, i);
                };
            }(window, document, 'ttq');
            window.ttq.load(tiktokPixelId);
            window.ttq.page();
        }

        const snapId = this.getSetting(['snapchat_pixel_id']);
        if (snapId && !window.snapchat_initialized) {
            window.snapchat_initialized = true;
            (function (e, t, n) {
                if (e.snaptr) return;
                var a = e.snaptr = function () {
                    a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
                };
                a.queue = [];
                var s = t.createElement(n);
                s.async = true;
                s.src = 'https://sc-static.net/sce/sem/pixel.js';
                var r = t.getElementsByTagName(n)[0];
                r.parentNode.insertBefore(s, r);
            })(window, document, 'script');
            window.snaptr('init', snapId);
            window.snaptr('track', 'PAGE_VIEW');
        }

        const pinId = this.getSetting(['pinterest_pixel_id']);
        if (pinId && !window.pinterest_initialized) {
            window.pinterest_initialized = true;
            if (!window.pintr) {
                window.pintr = function () { window.pintr.queue.push(arguments); };
                window.pintr.queue = [];
                window.pintr.version = '3.0';
                var script = document.createElement('script');
                script.async = true;
                script.src = 'https://s.pinterest.com/js/pinit.js';
                var first = document.getElementsByTagName('script')[0];
                first.parentNode.insertBefore(script, first);
            }
            window.pintr('load', pinId);
            window.pintr('page');
        }

        const liId = this.getSetting(['linkedin_insight_id']);
        if (liId && !window.linkedin_initialized) {
            window.linkedin_initialized = true;
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(liId);
            (function (l) {
                if (!l) {
                    window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
                    window.lintrk.q = [];
                }
                var s = document.getElementsByTagName('script')[0];
                var b = document.createElement('script');
                b.type = 'text/javascript';
                b.async = true;
                b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
                s.parentNode.insertBefore(b, s);
            })(window.lintrk);
        }
    },

    track(eventName, data = {}, eventId = null) {
        const payload = { ...data };

        if (eventName === 'view_item') {
            this.dispatchBrowserEvent('view_item', payload, eventId);
        } else if (eventName === 'add_to_cart') {
            this.dispatchBrowserEvent('add_to_cart', payload, eventId);
        } else if (eventName === 'begin_checkout') {
            this.dispatchBrowserEvent('begin_checkout', payload, eventId);
        } else if (eventName === 'purchase') {
            this.dispatchBrowserEvent('purchase', payload, eventId);
        } else if (eventName === 'lead') {
            this.dispatchBrowserEvent('lead', payload, eventId);
        }

        this.trackCustom(eventName, payload);
    },

    trackViewContent(product, eventId = null) {
        const price = parseFloat(product.sale_price || product.price || 0);
        const category = product.categories?.[0]?.name || 'General';
        const payload = {
            content_name: product.name,
            content_category: category,
            content_ids: [product.id],
            content_type: 'product',
            value: price,
            currency: 'BDT',
            items: [{
                item_id: product.id,
                item_name: product.name,
                price,
                item_category: category,
                quantity: 1,
            }],
        };

        this.track('view_item', payload, eventId);
    },

    trackAddToCart(product, quantity = 1, eventId = null) {
        const price = parseFloat(product.sale_price || product.price || product.priceDisplay || 0);
        const payload = {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: price * quantity,
            currency: 'BDT',
            quantity,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price,
                quantity,
            }],
        };

        this.track('add_to_cart', payload, eventId);
    },

    trackInitiateCheckout(cartItems, subtotal, eventId = null) {
        const payload = {
            content_ids: cartItems.map(item => item.id),
            content_type: 'product',
            value: parseFloat(subtotal),
            currency: 'BDT',
            num_items: cartItems.length,
            items: cartItems.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: parseFloat(item.price),
                quantity: item.quantity,
            })),
        };

        this.track('begin_checkout', payload, eventId);
    },

    trackPurchase(order, items = [], eventId = null) {
        const payload = {
            order_id: order.order_number || order.id,
            content_ids: items.map(item => item.product_id || item.id),
            content_type: 'product',
            value: parseFloat(order.total),
            currency: 'BDT',
            transaction_id: order.order_number || order.id,
            tax: parseFloat(order.tax || 0),
            shipping: parseFloat(order.shipping_cost || 0),
            items: items.map(item => ({
                item_id: item.product_id || item.id,
                item_name: item.name,
                price: parseFloat(item.price),
                quantity: item.quantity,
            })),
        };

        this.track('purchase', payload, eventId);
    },

    trackLead(type, detail = {}) {
        this.track('lead', { type, ...detail });
    },

    trackSearch(query) {
        if (window.fbq) window.fbq('track', 'Search', { search_string: query });
        if (window.gtag) window.gtag('event', 'search', { search_term: query });
        this.trackCustom('Search', { query });
    },

    trackLogin(method = 'website') {
        if (window.gtag) window.gtag('event', 'login', { method });
        this.trackCustom('Login', { method });
    },

    trackRegister(method = 'website') {
        if (window.fbq) window.fbq('track', 'CompleteRegistration');
        if (window.gtag) window.gtag('event', 'sign_up', { method });
        this.trackCustom('Registration', { method });
    },

    dispatchBrowserEvent(eventName, payload, eventId = null) {
        const metaEnabled = this.isEnabled([
            'marketing_integrations.meta_pixel.enabled',
            'facebook_pixel_enabled',
        ], !!window.fbq);
        const gaEnabled = this.isEnabled([
            'marketing_integrations.google_analytics_4.enabled',
            'google_analytics_enabled',
        ], !!window.gtag);
        const gtmEnabled = this.isEnabled([
            'marketing_integrations.google_tag_manager.enabled',
            'google_tag_manager_enabled',
        ], !!window.dataLayer);
        const tiktokEnabled = this.isEnabled([
            'marketing_integrations.tiktok_pixel.enabled',
            'tiktok_pixel_enabled',
        ], !!window.ttq);

        if (gtmEnabled && window.dataLayer) {
            window.dataLayer.push(this.buildGtmEvent(eventName, payload));
        }

        if (gaEnabled && window.gtag) {
            window.gtag('event', eventName, this.buildGa4Payload(eventName, payload));
        }

        if (metaEnabled && window.fbq) {
            window.fbq('track', this.metaEventName(eventName), this.buildMetaPayload(eventName, payload), eventId ? { eventID: eventId } : undefined);
        }

        if (tiktokEnabled && window.ttq) {
            window.ttq.track(this.tiktokEventName(eventName), this.buildTikTokPayload(eventName, payload));
        }
    },

    buildGtmEvent(eventName, payload) {
        const ecommerce = {
            currency: payload.currency,
            value: payload.value,
            items: payload.items || [],
        };

        if (eventName === 'purchase') {
            ecommerce.transaction_id = payload.transaction_id;
            ecommerce.tax = payload.tax;
            ecommerce.shipping = payload.shipping;
        }

        return {
            event: eventName,
            ecommerce,
        };
    },

    buildGa4Payload(eventName, payload) {
        const gaPayload = {
            currency: payload.currency,
            value: payload.value,
            items: payload.items || [],
        };

        if (eventName === 'purchase') {
            gaPayload.transaction_id = payload.transaction_id;
            gaPayload.tax = payload.tax;
            gaPayload.shipping = payload.shipping;
        }

        return gaPayload;
    },

    buildMetaPayload(eventName, payload) {
        if (eventName === 'view_item') {
            return {
                content_name: payload.content_name,
                content_category: payload.content_category,
                content_ids: payload.content_ids,
                content_type: payload.content_type,
                value: payload.value,
                currency: payload.currency,
            };
        }

        if (eventName === 'add_to_cart' || eventName === 'begin_checkout') {
            return {
                content_name: payload.content_name,
                content_ids: payload.content_ids,
                content_type: payload.content_type,
                value: payload.value,
                currency: payload.currency,
                num_items: payload.num_items || payload.quantity,
            };
        }

        if (eventName === 'purchase') {
            return {
                content_ids: payload.content_ids,
                content_type: payload.content_type,
                value: payload.value,
                currency: payload.currency,
                order_id: payload.order_id,
                num_items: payload.items?.length || 0,
            };
        }

        return payload;
    },

    buildTikTokPayload(eventName, payload) {
        if (eventName === 'purchase') {
            return {
                contents: (payload.items || []).map(item => ({
                    content_id: String(item.item_id),
                    content_name: item.item_name,
                    content_type: 'product',
                    price: item.price,
                    quantity: item.quantity,
                })),
                value: payload.value,
                currency: payload.currency,
            };
        }

        if (eventName === 'view_item') {
            return {
                contents: [{
                    content_id: String(payload.items?.[0]?.item_id || payload.content_ids?.[0] || ''),
                    content_name: payload.content_name,
                    content_type: 'product',
                    price: payload.value,
                    quantity: 1,
                }],
                value: payload.value,
                currency: payload.currency,
            };
        }

        return {
            contents: (payload.items || []).map(item => ({
                content_id: String(item.item_id),
                content_name: item.item_name,
                content_type: 'product',
                price: item.price,
                quantity: item.quantity,
            })),
            value: payload.value,
            currency: payload.currency,
        };
    },

    metaEventName(eventName) {
        switch (eventName) {
            case 'view_item':
                return 'ViewContent';
            case 'add_to_cart':
                return 'AddToCart';
            case 'begin_checkout':
                return 'InitiateCheckout';
            case 'purchase':
                return 'Purchase';
            case 'lead':
                return 'Lead';
            default:
                return eventName;
        }
    },

    tiktokEventName(eventName) {
        switch (eventName) {
            case 'view_item':
                return 'ViewContent';
            case 'add_to_cart':
                return 'AddToCart';
            case 'begin_checkout':
                return 'InitiateCheckout';
            case 'purchase':
                return 'CompletePayment';
            case 'lead':
                return 'Lead';
            default:
                return eventName;
        }
    },

    getSetting(keys, defaultValue = null) {
        const list = Array.isArray(keys) ? keys : [keys];

        for (const key of list) {
            if (this.settings && Object.prototype.hasOwnProperty.call(this.settings, key)) {
                const value = this.settings[key];
                if (value !== undefined && value !== null && value !== '') {
                    return value;
                }
            }
        }

        return defaultValue;
    },

    isEnabled(keys, defaultValue = false) {
        const value = this.getSetting(keys, defaultValue);

        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'number') {
            return value === 1;
        }

        if (typeof value === 'string') {
            return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
        }

        return Boolean(value);
    },

    trackCustom(eventName, data = {}) {
        const event = new CustomEvent('govaly_tracking_event', { detail: { name: eventName, data } });
        window.dispatchEvent(event);
    },
};
