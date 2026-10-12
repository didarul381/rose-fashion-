<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <!-- SEO Meta Tags -->
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="{{ url()->current() }}">

        @php
            $siteTitle = \App\Models\Setting::get('site_title', \App\Models\Setting::get('theme_name', 'Online Store'));
            $favicon = \App\Models\Setting::get('favicon');
            $fontFamily = \App\Models\Setting::get('font_family', 'Outfit');
            $fontQuery = str_replace(' ', '+', $fontFamily) . ':wght@300;400;500;600;700;800';
            $loaderEnabled = \App\Models\Setting::get('loader_toggle', 'enabled') === 'enabled';
            $loaderColor = \App\Models\Setting::get('primary_color', '#f97316');
            $loaderColor = preg_match('/^#[0-9a-fA-F]{6}$/', $loaderColor) ? $loaderColor : '#f97316';
            $googleSearchConsoleCode = trim((string) \App\Models\Setting::get('google_search_console_code', ''));
            $microsoftClarityCode = preg_replace('/[^A-Za-z0-9_-]/', '', trim((string) \App\Models\Setting::get('microsoft_clarity_code', '')));
        @endphp

        <title inertia>{{ $siteTitle }}</title>
        @if($favicon)
            <link rel="icon" href="{{ $favicon }}">
            <link rel="shortcut icon" href="{{ $favicon }}">
            <link rel="apple-touch-icon" href="{{ $favicon }}">
        @endif
        @if($googleSearchConsoleCode)
            <meta name="google-site-verification" content="{{ $googleSearchConsoleCode }}" />
        @endif

        <!-- Fonts (Dynamic Theme Selection + Playfair Display & Inter) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family={{ $fontQuery }}&display=swap" rel="stylesheet">

        <style>
            html {
                overflow-y: scroll;
                scrollbar-gutter: stable;
            }

            .initial-page-loader {
                align-items: center;
                background: #f4f7fb;
                display: flex;
                inset: 0;
                justify-content: center;
                position: fixed;
                transition: opacity 180ms ease, visibility 180ms ease;
                z-index: 2147483647;
            }
            .initial-page-loader--hidden {
                opacity: 0;
                pointer-events: none;
                visibility: hidden;
            }
            .initial-page-loader__content {
                align-items: center;
                color: #172033;
                display: flex;
                flex-direction: column;
                font: 600 14px/1.4 system-ui, sans-serif;
                gap: 14px;
            }
            .initial-page-loader__spinner {
                animation: initial-page-loader-spin 700ms linear infinite;
                border: 3px solid rgba(23, 32, 51, .14);
                border-radius: 50%;
                border-top-color: {{ $loaderColor }};
                height: 28px;
                width: 28px;
            }
            @keyframes initial-page-loader-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                .initial-page-loader, .initial-page-loader__spinner { animation: none; transition: none; }
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        @php
            $gtmEnabled = \App\Services\Marketing\MarketingIntegrationRegistry::isEnabled('google_tag_manager');
            $gaEnabled = \App\Services\Marketing\MarketingIntegrationRegistry::isEnabled('google_analytics_4');
            $metaPixelEnabled = \App\Services\Marketing\MarketingIntegrationRegistry::isEnabled('meta_pixel');
            $tiktokPixelEnabled = \App\Services\Marketing\MarketingIntegrationRegistry::isEnabled('tiktok_pixel');

            $gtmId = \App\Services\Marketing\MarketingIntegrationRegistry::readValue('google_tag_manager', 'gtm_id', \App\Models\Setting::get('google_tag_manager_id'));
            $gaTrackingId = \App\Services\Marketing\MarketingIntegrationRegistry::readValue('google_analytics_4', 'measurement_id', \App\Models\Setting::get('google_analytics_id'));
            $fbPixelId = \App\Services\Marketing\MarketingIntegrationRegistry::readValue('meta_pixel', 'pixel_id', \App\Models\Setting::get('facebook_pixel_id') ?: \App\Models\Setting::get('meta_pixel_id'));
            $tiktokPixelId = \App\Services\Marketing\MarketingIntegrationRegistry::readValue('tiktok_pixel', 'pixel_id', \App\Models\Setting::get('tiktok_pixel_id'));
        @endphp

        <!-- Server-Side Tracking Pixels Integration -->
        @if($gtmEnabled && $gtmId)
            <!-- Google Tag Manager -->
            <script>window.gtm_initialized = true;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{{ $gtmId }}');</script>
            <!-- End Google Tag Manager -->
        @endif

        @if($metaPixelEnabled && $fbPixelId)
            <!-- Facebook Pixel Code -->
            <script>
            window.meta_initialized = true;
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '{{ $fbPixelId }}');
            fbq('track', 'PageView');
            </script>
            <noscript><img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id={{ $fbPixelId }}&ev=PageView&noscript=1"
            /></noscript>
            <!-- End Facebook Pixel Code -->
        @endif

        @if($gaEnabled && $gaTrackingId)
            <!-- Google Analytics (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaTrackingId }}"></script>
            <script>
            window.ga4_initialized = true;
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $gaTrackingId }}');
            </script>
        @endif

        @if($microsoftClarityCode)
            <!-- Microsoft Clarity -->
            <script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "{{ $microsoftClarityCode }}");
            </script>
        @endif

        @if($tiktokPixelEnabled && $tiktokPixelId)
            <!-- TikTok Pixel Code -->
            <script>
            window.tiktok_initialized = true;
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.mixpool;w[t].type="use_cookie",w[t].enable_cookie=true,w[t].mixpool=o;var a=d.createElement("script");a.type="text/javascript",a.async=!0,a.src=r;var c=d.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
            ttq.load('{{ $tiktokPixelId }}');
            ttq.page();
            }(window, document, 'ttq');
            </script>
        @endif

        {!! \App\Models\Setting::get('custom_header_scripts', '') !!}
    </head>
    <body class="font-sans antialiased text-slate-800 bg-slate-50/50">
        @if($gtmEnabled && $gtmId)
            <!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmId }}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
        @endif

        @if($loaderEnabled)
            <div id="initial-page-loader" class="initial-page-loader" role="status" aria-live="polite" aria-label="Loading {{ $siteTitle }}">
                <div class="initial-page-loader__content">
                    <span class="initial-page-loader__spinner" aria-hidden="true"></span>
                    <span>Loading...</span>
                </div>
            </div>
        @endif
        @inertia
        
        {!! \App\Models\Setting::get('custom_footer_scripts', '') !!}
    </body>
</html>
