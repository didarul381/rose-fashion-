import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgePercent, ChevronDown, ChevronLeft, ChevronRight, Clock, Flame, Heart, RefreshCw, ShoppingCart, Star, TimerReset, Truck, Zap } from 'lucide-react';
import ShopLayout from '../Layouts/ShopLayout';
import { useCart } from '../Contexts/CartContext';
import { getWishlistItems, toggleWishlistProduct } from '../Services/Wishlist';
import { useStoreName } from '../Hooks/useStoreName';
import ModernProductCard from '../Components/ModernProductCard';

export default function Welcome({ sections = [], settings = {}, home_categories = [], all_products = [], active_flash_sale }) {
    const storeName = useStoreName();
    const { global_settings = {} } = usePage().props;
    const { addToCart } = useCart();
    const flashProducts = useMemo(() => (active_flash_sale?.products || [])
        .map((item) => applyFlashSalePrice(item))
        .filter(Boolean), [active_flash_sale]);

    const handleAdd = (product) => {
        if (product.type === 'variable' && product.variants?.length) return;
        addToCart(product, null, 1);
    };
    const normalizeProducts = (products = []) => Array.isArray(products) ? products : Object.values(products || {});

    const selectProducts = (sectionSettings = {}) => {
        const limit = Math.max(1, Number(sectionSettings.product_limit || sectionSettings.limit || 10));
        const serverProducts = normalizeProducts(sectionSettings.products);
        if (serverProducts.length) return serverProducts.slice(0, limit);

        const source = sectionSettings.product_source || sectionSettings.source || 'latest';
        let selected = [...all_products];
        if (source === 'featured') selected = all_products.filter((product) => product.is_featured);
        if (source === 'latest' || source === 'new_arrivals') selected.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));
        if (source === 'flash_sale') selected = flashProducts;
        if (source === 'sale' || source === 'discounted') selected = all_products.filter((product) => product.sale_price && Number(product.sale_price) < Number(product.price));
        if (sectionSettings.category_slug) selected = selected.filter((product) => product.categories?.some((category) => category.slug === sectionSettings.category_slug));
        return selected.slice(0, limit);
    };

    const renderSection = (section) => {
        const sectionSettings = section.settings || {};
        switch (section.type) {
            case 'hero_slider':
                return <Hero key={section.id} settings={sectionSettings} />;
            case 'feature_badges':
                return <SectionWrap key={section.id}><FeatureBadges settings={sectionSettings} /></SectionWrap>;
            case 'product_shelf':
                return <SectionWrap key={section.id}><ProductShelf settings={sectionSettings} cardSettings={global_settings || settings} products={selectProducts(sectionSettings)} activeFlashSale={active_flash_sale} onAdd={handleAdd} /></SectionWrap>;
            case 'products_tabs':
                return <SectionWrap key={section.id}><ProductsTabsBlock settings={sectionSettings} cardSettings={global_settings || settings} all_products={normalizeProducts(sectionSettings.products).length ? normalizeProducts(sectionSettings.products) : all_products} categories={home_categories} onAdd={handleAdd} /></SectionWrap>;
            case 'category_grid':
                return <SectionWrap key={section.id}><CategorySection categories={home_categories} settings={sectionSettings} /></SectionWrap>;
            case 'signature_banners':
                return <SectionWrap key={section.id}><SplitBanners settings={sectionSettings} /></SectionWrap>;
            case 'cosmetics_banner':
                return <SectionWrap key={section.id}><PromoBanner settings={sectionSettings} /></SectionWrap>;
            case 'top_brands':
                return <SectionWrap key={section.id}><BrandSection settings={sectionSettings} /></SectionWrap>;
            case 'campaign_grid':
            case 'experience_features':
                return <SectionWrap key={section.id}><ExperienceSection storeName={storeName} settings={sectionSettings} /></SectionWrap>;
            case 'content_columns':
                return <SectionWrap key={section.id}><ContentColumns storeName={storeName} settings={sectionSettings} /></SectionWrap>;
            default:
                return null;
        }
    };

    return (
        <ShopLayout>
            <Head title={settings.site_title || global_settings.site_title || storeName} />
            <div className="pb-14">{sections.map(renderSection)}</div>
            {sections.length === 0 && <div className="store-container py-24 text-center"><h1 className="text-2xl font-extrabold text-[#102f58]">Your homepage is ready to build</h1><p className="mt-2 text-sm text-slate-500">Add and enable sections from the Admin Page Builder.</p></div>}
        </ShopLayout>
    );
}

function SectionWrap({ children }) { return <div className="store-container mt-7 first:mt-0">{children}</div>; }

function applyFlashSalePrice(item) {
    const product = item?.product;
    if (!product) return null;

    const originalPrice = Number(product.price || 0);
    const discountValue = Number(item.discount_value || 0);
    let flashPrice = Number(product.sale_price || product.price || 0);

    if (originalPrice > 0 && discountValue > 0) {
        flashPrice = item.discount_type === 'fixed'
            ? Math.max(0, originalPrice - discountValue)
            : Math.max(0, originalPrice - ((originalPrice * discountValue) / 100));
    }

    return {
        ...product,
        sale_price: flashPrice < originalPrice ? flashPrice : product.sale_price,
        flash_discount_type: item.discount_type,
        flash_discount_value: item.discount_value,
    };
}

function useCountdown(endAt) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!endAt) return undefined;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [endAt]);

    const diffMs = endAt ? Math.max(0, new Date(endAt).getTime() - now) : 0;
    const totalSeconds = Math.floor(diffMs / 1000);

    return {
        expired: Boolean(endAt) && diffMs <= 0,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

function formatShortDate(value) {
    if (!value) return 'Limited time';
    try {
        return new Intl.DateTimeFormat('en-BD', { month: 'short', day: 'numeric' }).format(new Date(value));
    } catch {
        return 'Limited time';
    }
}

function getSectionBorderStyle(settings = {}) {
    const style = settings.border_style || 'none';
    if (style === 'none') {
        return {
            borderWidth: 0,
            borderStyle: 'none'
        };
    }
    const color = settings.border_color || '#e2e8f0';
    if (style === 'thick') {
        return {
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: color
        };
    }
    return {
        borderWidth: '1px',
        borderStyle: style,
        borderColor: color
    };
}

function Hero({ settings }) {
    const slides = settings.slides?.length ? settings.slides : [{ image: '', title: 'Everything you need, all in one place', subtitle: 'Quality products · Reliable delivery', link: '#products' }];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length < 2 || settings.autoplay === 'no') return;
        const timer = setInterval(() => setCurrent((value) => (value + 1) % slides.length), Number(settings.autoplay_speed) || 5000);
        return () => clearInterval(timer);
    }, [slides.length, settings.autoplay, settings.autoplay_speed]);

    const go = (offset) => setCurrent((value) => (value + offset + slides.length) % slides.length);

    // Resolve side banners:
    // 1) From settings.side_banners if configured with items
    // 2) Otherwise fallback from slides (skipping index 0 or index 1, 2, 3)
    const configuredSideBanners = Array.isArray(settings.side_banners) && settings.side_banners.length > 0
        ? settings.side_banners
        : [];
    const fallbackSideBanners = slides.length > 1 ? slides.slice(1) : [];
    const effectiveSideBanners = configuredSideBanners.length > 0 ? configuredSideBanners : fallbackSideBanners;

    let layoutType = settings.layout_type || 'two_columns';
    if (layoutType === 'auto') {
        if (effectiveSideBanners.length >= 3) layoutType = 'three_banners';
        else if (effectiveSideBanners.length === 2) layoutType = 'two_columns';
        else if (effectiveSideBanners.length === 1) layoutType = 'one_banner';
        else layoutType = 'single';
    }

    const sideOne = effectiveSideBanners[0] || slides[1] || slides[0];
    const sideTwo = effectiveSideBanners[1] || slides[2] || slides[0];
    const sideThree = effectiveSideBanners[2] || slides[3] || slides[1] || slides[0];

    const borderRadius = settings.border_radius || 'rounded-2xl';
    const shadowClass = settings.shadow || 'shadow-none';
    const sectionBg = settings.section_background_color || settings.background_color;
    const borderStyle = getSectionBorderStyle(settings);

    return (
        <section className="relative pb-3 pt-2 sm:pt-3" style={sectionBg ? { backgroundColor: sectionBg } : undefined}>
            <div className="store-container">
                {/* 1. SINGLE SLIDER (Full Width) */}
                {layoutType === 'single' && (
                    <div className="relative h-[240px] sm:h-[340px] lg:h-[460px] w-full">
                        <HeroPanel
                            slide={slides[current]}
                            className={`h-full w-full ${borderRadius} ${shadowClass}`}
                            style={borderStyle}
                            prominent
                            buttonText={settings.button_text}
                        />
                        <SliderNavControls
                            slides={slides}
                            current={current}
                            go={go}
                            setCurrent={setCurrent}
                            navigationStyle={settings.navigation_style}
                        />
                    </div>
                )}

                {/* 2. ONE SIDE BANNER */}
                {layoutType === 'one_banner' && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3.5 sm:gap-4 items-stretch">
                            <div className="relative h-[210px] sm:h-[280px] lg:h-[450px] w-full">
                                <HeroPanel
                                    slide={slides[current]}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    prominent
                                    buttonText={settings.button_text}
                                />
                                <SliderNavControls
                                    slides={slides}
                                    current={current}
                                    go={go}
                                    setCurrent={setCurrent}
                                    navigationStyle={settings.navigation_style}
                                />
                            </div>
                            <div className="hidden lg:block h-[450px]">
                                <HeroPanel
                                    slide={sideOne}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    buttonText={settings.button_text}
                                />
                            </div>
                        </div>

                        {/* Mobile Side Banner (Below Slider) */}
                        <div className="mt-2 sm:mt-2.5 lg:hidden">
                            <HeroPanel
                                slide={sideOne}
                                className={`h-[95px] sm:h-[120px] w-full ${borderRadius} ${shadowClass}`}
                                style={borderStyle}
                                compact
                                buttonText={settings.button_text}
                            />
                        </div>
                    </div>
                )}

                {/* 3. TWO SIDE BANNERS (Stacked on Desktop, 2 Side-by-Side on Mobile) */}
                {layoutType === 'two_columns' && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-3.5 sm:gap-4 items-stretch">
                            <div className="relative h-[210px] sm:h-[280px] lg:h-[450px] w-full">
                                <HeroPanel
                                    slide={slides[current]}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    prominent
                                    buttonText={settings.button_text}
                                />
                                <SliderNavControls
                                    slides={slides}
                                    current={current}
                                    go={go}
                                    setCurrent={setCurrent}
                                    navigationStyle={settings.navigation_style}
                                />
                            </div>
                            <div className="hidden lg:grid lg:grid-rows-2 gap-3.5 h-[450px]">
                                <HeroPanel
                                    slide={sideOne}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    buttonText={settings.button_text}
                                />
                                <HeroPanel
                                    slide={sideTwo}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    buttonText={settings.button_text}
                                />
                            </div>
                        </div>

                        {/* Mobile Side Banners (2 Side-by-Side below slider like 1st img) */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-2 sm:mt-2.5 lg:hidden">
                            <HeroPanel
                                slide={sideOne}
                                className={`h-[95px] sm:h-[120px] w-full ${borderRadius} ${shadowClass}`}
                                style={borderStyle}
                                compact
                                buttonText={settings.button_text}
                            />
                            <HeroPanel
                                slide={sideTwo}
                                className={`h-[95px] sm:h-[120px] w-full ${borderRadius} ${shadowClass}`}
                                style={borderStyle}
                                compact
                                buttonText={settings.button_text}
                            />
                        </div>
                    </div>
                )}

                {/* 4. THREE SIDE BANNERS (Malamal Style: 1 Top + 2 Bottom on Desktop, 2 Side-by-Side on Mobile) */}
                {(layoutType === 'three_banners' || layoutType === 'malamal') && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-3.5 sm:gap-4 items-stretch">
                            {/* Left: Main Hero Slider */}
                            <div className="relative h-[210px] sm:h-[280px] lg:h-[450px] w-full">
                                <HeroPanel
                                    slide={slides[current]}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    prominent
                                    buttonText={settings.button_text}
                                />
                                <SliderNavControls
                                    slides={slides}
                                    current={current}
                                    go={go}
                                    setCurrent={setCurrent}
                                    navigationStyle={settings.navigation_style}
                                />
                            </div>

                            {/* Right: 3 Banners on Desktop */}
                            <div className="hidden lg:grid lg:grid-rows-[1.15fr_1fr] gap-3.5 h-[450px]">
                                <HeroPanel
                                    slide={sideOne}
                                    className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                    style={borderStyle}
                                    buttonText={settings.button_text}
                                />
                                <div className="grid grid-cols-2 gap-3.5 h-full">
                                    <HeroPanel
                                        slide={sideTwo}
                                        className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                        style={borderStyle}
                                        compact
                                        buttonText={settings.button_text}
                                    />
                                    <HeroPanel
                                        slide={sideThree}
                                        className={`h-full w-full ${borderRadius} ${shadowClass}`}
                                        style={borderStyle}
                                        compact
                                        buttonText={settings.button_text}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Side Banners (2 Side-by-Side below slider - EXACTLY like 1st img!) */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-2 sm:mt-2.5 lg:hidden">
                            <HeroPanel
                                slide={sideTwo || sideOne}
                                className={`h-[95px] sm:h-[120px] w-full ${borderRadius} ${shadowClass}`}
                                style={borderStyle}
                                compact
                                buttonText={settings.button_text}
                            />
                            <HeroPanel
                                slide={sideThree || sideTwo || sideOne}
                                className={`h-[95px] sm:h-[120px] w-full ${borderRadius} ${shadowClass}`}
                                style={borderStyle}
                                compact
                                buttonText={settings.button_text}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function SliderNavControls({ slides, current, go, setCurrent, navigationStyle }) {
    if (slides.length <= 1 || navigationStyle === 'hidden') return null;

    return (
        <>
            {navigationStyle !== 'dots' && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }}
                        className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95 border border-slate-200/60"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }}
                        className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95 border border-slate-200/60"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </>
            )}

            {navigationStyle !== 'arrows' && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-950/40 px-2.5 py-1 sm:px-3 sm:py-1.5 backdrop-blur-sm">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(idx); }}
                            className={`transition-all duration-300 ${idx === current ? 'h-1.5 sm:h-2 w-5 sm:w-6 rounded-full bg-[#ff4b19]' : 'h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-white/70 hover:bg-white'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function HeroPanel({ slide, className = '', prominent = false, compact = false, buttonText, style }) {
    const hasImage = Boolean(slide?.image);
    const hasText = Boolean(slide?.title || slide?.subtitle);
    const href = slide?.link || '#products';

    return (
        <Link
            href={href}
            className={`group relative block overflow-hidden bg-[#102f58] transition duration-300 hover:shadow-lg ${className}`}
            style={style}
        >
            {hasImage && (
                <img
                    src={slide.image}
                    alt={slide.title || 'Promotion'}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
            )}
            {hasText ? (
                <>
                    <div className={`absolute inset-0 ${hasImage ? 'bg-gradient-to-r from-slate-950/75 via-slate-950/30 to-transparent' : 'bg-gradient-to-br from-[#102f58] to-[#1e568f]'}`} />
                    <div className={`absolute inset-0 flex flex-col items-start justify-end text-white ${compact ? 'p-3.5 sm:p-4' : (prominent ? 'p-6 sm:p-8' : 'p-4 sm:p-6')}`}>
                        {slide?.subtitle && (
                            <span className={`mb-1.5 rounded-full bg-[#ff4b19] font-extrabold uppercase tracking-widest text-white shadow-xs ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'}`}>
                                {slide.subtitle}
                            </span>
                        )}
                        {slide?.title && (
                            <h2 className={`font-extrabold leading-tight ${compact ? 'max-w-[170px] text-xs sm:text-sm line-clamp-2' : (prominent ? 'max-w-xl text-2xl sm:text-3xl lg:text-4xl' : 'max-w-sm text-base sm:text-lg lg:text-xl line-clamp-2')}`}>
                                {slide.title}
                            </h2>
                        )}
                        <span className={`inline-flex items-center gap-1.5 font-bold text-white transition group-hover:translate-x-1 ${compact ? 'mt-2 text-[10px]' : 'mt-3 sm:mt-4 text-xs'}`}>
                            {slide?.button_text || buttonText || 'Shop now'} <ArrowRight className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                        </span>
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/5" />
            )}
        </Link>
    );
}

function featureBadgeIcon(title = '', index = 0) {
    const label = String(title).toLowerCase();
    if (label.includes('cash') || label.includes('cod') || label.includes('delivery')) return Truck;
    if (label.includes('return') || label.includes('refund') || label.includes('exchange')) return RefreshCw;
    if (label.includes('price') || label.includes('deal') || label.includes('discount')) return Flame;
    if (label.includes('secure') || label.includes('payment')) return BadgePercent;
    return [Truck, RefreshCw, Clock, Flame][index % 4];
}

function FeatureBadges({ settings }) {
    const defaults = [
        { title: settings.badge_1_title || 'Cash On Delivery', text: settings.badge_1_desc || 'Pay after receiving product' },
        { title: settings.badge_2_title || 'Instant Return', text: settings.badge_2_desc || '7 days return policy' },
        { title: settings.badge_3_title || 'Delivery Within 48hrs', text: settings.badge_3_desc || 'Fastest nationwide service' },
        { title: settings.badge_4_title || 'Best Price Deal', text: settings.badge_4_desc || 'Affordable & direct pricing' },
    ];
    const items = settings.items?.length ? settings.items : defaults;
    const radius = settings.border_radius || 'rounded-2xl';
    const shadowClass = settings.shadow || 'shadow-sm';
    const sectionBgColor = settings.section_background_color || settings.background_color || '#ffffff';
    const borderColor = settings.item_border_color || '#e2e8f0';
    const iconColor = settings.icon_color || settings.title_color || '#db2777';
    const iconBgColor = settings.icon_background_color || '#ecfeff';
    const titleColor = settings.title_color || '#0f172a';
    const textColor = settings.text_color || '#94a3b8';
    const borderStyle = getSectionBorderStyle(settings);

    return (
        <section id={settings.anchor_id || 'service'} className="scroll-mt-36">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                {items.map((item, index) => {
                    const Icon = featureBadgeIcon(item.title, index);
                    return (
                        <div
                            key={`${item.title}-${index}`}
                            className={`group flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 md:p-5 border transition hover:-translate-y-0.5 hover:shadow-md ${radius} ${shadowClass}`}
                            style={{ backgroundColor: sectionBgColor, borderColor, ...borderStyle }}
                        >
                            <span
                                className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 place-items-center rounded-full transition group-hover:scale-105"
                                style={{ backgroundColor: iconBgColor, color: iconColor }}
                            >
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2.4} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <h3 className="text-xs font-bold leading-tight sm:text-sm md:text-base sm:leading-snug" style={{ color: titleColor }}>
                                    {item.title}
                                </h3>
                                <p className="mt-0.5 sm:mt-1 text-[10px] leading-tight text-slate-400 sm:text-xs sm:leading-5" style={{ color: textColor }}>
                                    {item.text || item.desc}
                                </p>
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function ProductShelf({ settings, cardSettings = {}, products, activeFlashSale, onAdd }) {
    if (!products.length) return null;
    const source = settings.product_source || settings.source || 'latest';
    if (source === 'flash_sale') {
        return <FlashSaleShelf settings={settings} cardSettings={cardSettings} products={products} activeFlashSale={activeFlashSale} onAdd={onAdd} />;
    }

    const showButton = settings.show_button !== 'no';
    const radius = settings.border_radius || 'rounded-[24px]';
    const shadowClass = settings.shadow || 'shadow-sm';
    const sectionBg = settings.section_background_color || settings.background_color || '#ffffff';
    const borderStyle = getSectionBorderStyle(settings);
    const titleSize = settings.title_font_size || 'text-lg md:text-xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';

    return <section id={settings.anchor_id || 'products'} className={`scroll-mt-36 p-4 md:p-6 ${radius} ${shadowClass}`} style={{ backgroundColor: sectionBg, ...borderStyle }}><div className="mb-4 sm:mb-5 flex items-center justify-between gap-3"><h2 className={`min-w-0 ${titleSize} ${titleWeight}`} style={{ color: settings.title_color || '#102f58' }}>{settings.title || 'Products'}</h2>{showButton && <Link href={settings.button_link || '#categories'} className="inline-flex h-8 sm:h-9 shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-blue-700 transition hover:bg-blue-100"><span>{settings.button_text || 'More Products'}</span><ArrowRight className="h-3.5 w-3.5" /></Link>}</div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">{products.map((product) => (
                <ModernProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAdd}
                    settings={cardSettings}
                />
            ))}</div></section>;
}

function FlashSaleShelf({ settings, cardSettings = {}, products, activeFlashSale, onAdd }) {
    const countdown = useCountdown(activeFlashSale?.ends_at);
    const showButton = settings.show_button !== 'no';
    const countdownItems = [
        { label: 'Days', value: countdown.days },
        { label: 'Hours', value: countdown.hours },
        { label: 'Mins', value: countdown.minutes },
        { label: 'Secs', value: countdown.seconds },
    ];
    const maxDiscount = products.reduce((max, product) => {
        const price = Number(product.price || 0);
        const sale = Number(product.sale_price || product.price || 0);
        if (!price || sale >= price) return max;
        return Math.max(max, Math.round(((price - sale) / price) * 100));
    }, 0);

    return (
        <section id={settings.anchor_id || 'flash-sale'} className="scroll-mt-36 overflow-hidden rounded-[30px] bg-slate-950 shadow-2xl ring-1 ring-slate-900/10">
            <div className="relative overflow-hidden px-4 py-5 text-white md:px-7 md:py-7">
                <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#ff4b19]/35 blur-3xl" />
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#ff4b19]/25 to-transparent" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4b19] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-950/25">
                                <Flame className="h-3.5 w-3.5 fill-current" /> Live flash sale
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/15">
                                <Zap className="h-3.5 w-3.5 text-yellow-300" /> Limited stock
                            </span>
                        </div>
                        <h2 className="text-2xl font-black leading-tight md:text-4xl" style={{ color: settings.title_color && settings.title_color !== '#102f58' ? settings.title_color : undefined }}>
                            {settings.title || activeFlashSale?.title || 'Flash Deals'}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-white/70">
                            Grab these limited-time offers before the clock runs out. Prices update automatically from your active flash sale setup.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center lg:min-w-[520px]">
                        <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
                            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                                <TimerReset className="h-4 w-4 text-[#ff7046]" /> Ends in
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {countdownItems.map((item) => (
                                    <div key={item.label} className="rounded-2xl bg-white px-2 py-2 text-center text-slate-950 shadow-sm">
                                        <div className="text-lg font-black tabular-nums md:text-2xl">{String(item.value).padStart(2, '0')}</div>
                                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:w-44 sm:grid-cols-1">
                            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-white/65"><BadgePercent className="h-4 w-4 text-[#ff7046]" /> Max off</div>
                                <div className="mt-1 text-xl font-black">{maxDiscount ? `${maxDiscount}%` : 'Hot'}</div>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-white/65"><Clock className="h-4 w-4 text-[#ff7046]" /> Sale period</div>
                                <div className="mt-1 text-sm font-black">{formatShortDate(activeFlashSale?.starts_at)} - {formatShortDate(activeFlashSale?.ends_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-t-[28px] bg-white p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{products.length} deal{products.length === 1 ? '' : 's'} available now</p>
                    {showButton && <Link href={settings.button_link || route('shop.index')} className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-50 px-4 text-xs font-black text-[#ff4b19] transition hover:bg-[#ff4b19] hover:text-white">
                        {settings.button_text || 'View all deals'} <ArrowRight className="h-4 w-4" />
                    </Link>}
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                    {products.map((product) => (
                        <ModernProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAdd}
                            settings={{ ...cardSettings, card_button_bg_color: cardSettings.card_button_bg_color || '#ff4b19', card_badge_bg_color: cardSettings.card_badge_bg_color || '#dc2626' }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
function ReferenceProductCard({ product, onAdd }) {
    const [wishlisted, setWishlisted] = useState(false);
    const original = Number(product.price || 0);
    const price = Number(product.sale_price || product.price || 0);
    const sale = Boolean(product.sale_price) && price < original;
    const discount = sale && original ? Math.round((1 - price / original) * 100) : 0;
    const image = product.primary_image?.image_path || product.images?.[0]?.image_path;
    const reviews = (product.reviews || []).filter((review) => review.is_approved !== false);
    const rating = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 5;
    const category = product.categories?.[0]?.name || 'Online Store';
    const variable = product.type === 'variable' && product.variants?.length;
    const out = variable ? !product.variants.some((variant) => Number(variant.stock) > 0) : product.type !== 'digital' && Number(product.stock) <= 0;
    useEffect(() => {
        const sync = () => setWishlisted(getWishlistItems().some((item) => item.wishlistId === `p-${product.id}`));
        sync();
        window.addEventListener('govaly-wishlist-changed', sync);
        return () => window.removeEventListener('govaly-wishlist-changed', sync);
    }, [product.id]);
    return <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-square overflow-hidden bg-slate-100"><Link href={route('product.show', { slug: product.slug })} className="block h-full">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-xs text-slate-400">Product image</div>}</Link>{sale && <span className="absolute left-2 top-2 rounded-full bg-[#ff4b19] px-2.5 py-1 text-[9px] font-extrabold text-white">-{discount}%</span>}<button onClick={() => { const result = toggleWishlistProduct(product); setWishlisted(result.added); }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow"><Heart className={`h-4 w-4 ${wishlisted ? 'fill-[#ff4b19] text-[#ff4b19]' : 'text-slate-500'}`} /></button></div><div className="flex flex-1 flex-col p-3.5"><Link href={route('product.show', { slug: product.slug })}><h3 className="line-clamp-2 min-h-[40px] text-[13px] font-bold leading-5">{product.name}</h3></Link><div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-400"><span className="truncate">Brand: {category}</span><span>SKU: {product.sku || product.id}</span></div><div className="mt-2 flex items-center gap-0.5 text-[#ff4b19]">{[0,1,2,3,4].map((star) => <Star key={star} className={`h-3 w-3 ${star < Math.round(rating) ? 'fill-current' : ''}`} />)}<span className="ml-1 text-[10px] text-slate-400">({reviews.length || 5})</span></div><div className="mt-2 flex items-baseline gap-2"><span className="text-sm font-extrabold text-[#ff4b19]">à§³ {price.toLocaleString('en-BD')} / pcs</span>{sale && <span className="text-[10px] text-slate-400 line-through">à§³ {original.toLocaleString('en-BD')}</span>}</div><div className="mt-3 flex justify-between text-[10px] text-slate-500"><span>{out ? 'Out of stock' : `${product.stock || ''} In stock`}</span><span>In catalog</span></div><div className="mt-auto space-y-2 pt-4">{variable ? <Link href={route('product.show', { slug: product.slug })} className="flex h-10 items-center justify-center rounded-full bg-[#ff4b19] text-[11px] font-bold text-white">Select options</Link> : <button disabled={out} onClick={() => onAdd(product)} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#ff4b19] text-[11px] font-bold text-white disabled:bg-slate-300"><ShoppingCart className="h-4 w-4" />{out ? 'Out of stock' : 'Add to cart'}</button>}<Link href={route('product.show', { slug: product.slug })} className="flex h-10 items-center justify-center rounded-full border bg-slate-50 text-[11px] font-bold">View</Link></div></div></article>;
}

function CategorySection({ categories, settings }) {
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const manual = settings.items?.filter((item) => item.name) || [];
    const catalog = categories.slice(0, Number(settings.limit || 8)).map((category) => ({
        ...category,
        link: route('category.show', { slug: category.slug }),
        sub_count: category.children?.length || 0,
    }));
    const items = settings.use_catalog_categories === 'no' && manual.length ? manual : catalog;
    if (!items.length) return null;

    const isMobileSlider = settings.mobile_layout !== 'grid';

    const checkScroll = () => {
        if (!sliderRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [items.length]);

    const scroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = direction === 'left' ? -220 : 220;
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const showButton = settings.show_button !== 'no';
    const moreLink = !settings.button_link || settings.button_link === '#' ? route('categories.index') : settings.button_link;
    const titleColor = settings.title_color || '#102f58';
    const titlePosition = settings.title_position || 'left';
    const designStyle = settings.design_style || 'cards';
    const sectionRadius = settings.border_radius || 'rounded-2xl';
    const sectionShadow = settings.shadow || 'shadow-sm';
    const sectionBgColor = settings.section_background_color || settings.background_color || '#ffffff';
    const borderStyle = getSectionBorderStyle(settings);
    const itemRadius = settings.item_border_radius || 'rounded-2xl';
    const itemBgColor = settings.item_background_color || '#f8fafc';
    const itemBorderColor = settings.item_border_color || '#e2e8f0';
    const itemFontColor = settings.item_font_color || '#334155';
    const titleSize = settings.title_font_size || 'text-lg md:text-xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';
    const itemTextSize = settings.item_font_size || 'text-xs md:text-sm';
    const categoryButtonClass = 'inline-flex h-8 sm:h-9 shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-blue-700 transition hover:bg-blue-100';

    if (designStyle === 'circles') {
        return (
            <section id={settings.anchor_id || 'categories'} className={`scroll-mt-36 px-4 py-3.5 sm:px-6 sm:py-7 md:px-8 md:py-8 ${sectionRadius} ${sectionShadow}`} style={{ backgroundColor: sectionBgColor, ...borderStyle }}>
                <div className={`mb-3 sm:mb-6 flex items-center justify-between gap-3 ${titlePosition === 'center' ? 'sm:relative sm:justify-center' : ''}`}>
                    <h2 className={`min-w-0 ${titleSize} ${titleWeight} uppercase tracking-[0.14em]`} style={{ color: titleColor }}>
                        {settings.title || 'Shop By Department'}
                    </h2>
                    {showButton && (
                        <Link href={moreLink} className={`${titlePosition === 'center' ? 'sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2' : ''} ${categoryButtonClass}`}>
                            <span>{settings.button_text || 'More Products'}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                {/* Mobile View: Horizontal Touch Slider */}
                {isMobileSlider ? (
                    <>
                        <div className="relative sm:hidden">
                            {/* Prev Button (Floating Left) */}
                            {items.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('left')}
                                    disabled={!canScrollLeft}
                                    className="absolute -left-2 top-[36px] -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Previous departments"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}

                            <div
                                ref={sliderRef}
                                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-2 pt-1 -mx-2 px-2 scroll-smooth"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {items.map((item, index) => {
                                    const subCount = Number(item.sub_count ?? item.children?.length ?? 0);
                                    return (
                                        <Link
                                            key={item.id || `${item.name}-${index}`}
                                            href={item.link || '#'}
                                            className="group flex w-[76px] shrink-0 snap-start flex-col items-center text-center"
                                        >
                                            <span
                                                className={`relative grid h-[72px] w-[72px] place-items-center border-2 bg-white p-0.5 shadow-xs transition duration-300 group-active:scale-95 ${itemRadius}`}
                                                style={{ borderColor: itemBorderColor || titleColor }}
                                            >
                                                <span className={`h-full w-full overflow-hidden bg-slate-100 ${itemRadius}`}>
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <span className="grid h-full place-items-center text-base font-black" style={{ color: titleColor }}>
                                                            {String(item.name || 'C').slice(0, 1)}
                                                        </span>
                                                    )}
                                                </span>
                                                {subCount > 0 && (
                                                    <span className="absolute -right-1 bottom-0 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500 shadow ring-1 ring-slate-200">
                                                        {subCount} sub
                                                    </span>
                                                )}
                                            </span>
                                            <h3
                                                className="mt-2 line-clamp-2 text-[11px] font-bold leading-tight"
                                                style={{ color: itemFontColor }}
                                            >
                                                {item.name}
                                            </h3>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Next Button (Floating Right) */}
                            {items.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('right')}
                                    disabled={!canScrollRight}
                                    className="absolute -right-2 top-[36px] -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Next departments"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Desktop & Tablet: Clean Grid (matches Image 1) */}
                        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-6 lg:gap-x-3">
                            {items.map((item, index) => {
                                const subCount = Number(item.sub_count ?? item.children?.length ?? 0);
                                return (
                                    <Link key={item.id || `${item.name}-${index}`} href={item.link || '#'} className="group flex flex-col items-center text-center">
                                        <span className={`relative grid h-24 w-24 place-items-center border-2 bg-white p-1 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg md:h-28 md:w-28 ${itemRadius}`} style={{ borderColor: itemBorderColor || titleColor }}>
                                            <span className={`h-full w-full overflow-hidden bg-slate-100 ${itemRadius}`}>
                                                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /> : <span className="grid h-full place-items-center text-lg font-black" style={{ color: titleColor }}>{String(item.name || 'C').slice(0, 1)}</span>}
                                            </span>
                                            {subCount > 0 && <span className="absolute -right-1 bottom-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 shadow ring-1 ring-slate-200">{subCount} sub</span>}
                                        </span>
                                        <h3 className={`mt-3 line-clamp-2 font-bold ${itemTextSize}`} style={{ color: itemFontColor }}>{item.name}</h3>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
                        {items.map((item, index) => {
                            const subCount = Number(item.sub_count ?? item.children?.length ?? 0);
                            return (
                                <Link key={item.id || `${item.name}-${index}`} href={item.link || '#'} className="group flex flex-col items-center text-center">
                                    <span className={`relative grid h-24 w-24 place-items-center border-2 bg-white p-1 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg md:h-28 md:w-28 ${itemRadius}`} style={{ borderColor: itemBorderColor || titleColor }}>
                                        <span className={`h-full w-full overflow-hidden bg-slate-100 ${itemRadius}`}>
                                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /> : <span className="grid h-full place-items-center text-lg font-black" style={{ color: titleColor }}>{String(item.name || 'C').slice(0, 1)}</span>}
                                        </span>
                                        {subCount > 0 && <span className="absolute -right-1 bottom-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 shadow ring-1 ring-slate-200">{subCount} sub</span>}
                                    </span>
                                    <h3 className={`mt-3 line-clamp-2 font-bold ${itemTextSize}`} style={{ color: itemFontColor }}>{item.name}</h3>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        );
    }

    return (
        <section id={settings.anchor_id || 'categories'} className={`scroll-mt-36 p-4 sm:p-5 md:p-7 ${sectionRadius} ${sectionShadow}`} style={{ backgroundColor: sectionBgColor, ...borderStyle }}>
            <div className={`mb-4 sm:mb-5 flex items-center justify-between gap-3 ${titlePosition === 'center' ? 'sm:relative sm:justify-center' : ''}`}>
                <h2 className={`min-w-0 leading-tight ${titleSize} ${titleWeight}`} style={{ color: titleColor }}>{settings.title || 'Shop By Category'}</h2>
                <div className={`flex items-center gap-2 ${titlePosition === 'center' ? 'sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2' : ''}`}>
                    {showButton && <Link href={moreLink} className={categoryButtonClass}><span>{settings.button_text || 'More Products'}</span><ArrowRight className="h-3.5 w-3.5" /></Link>}
                </div>
            </div>
            <div className={`${isMobileSlider ? 'flex sm:grid overflow-x-auto sm:overflow-visible no-scrollbar snap-x pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0' : 'grid'} grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
                {items.map((item, index) => {
                    const subCount = Number(item.sub_count ?? item.children?.length ?? 0);
                    return (
                        <Link
                            key={item.id || `${item.name}-${index}`}
                            href={item.link || '#'}
                            className={`group relative flex ${isMobileSlider ? 'w-[260px] sm:w-auto shrink-0 sm:shrink snap-start' : ''} min-h-44 sm:min-h-48 overflow-hidden border transition hover:-translate-y-0.5 hover:shadow-md ${itemRadius}`}
                            style={{ backgroundColor: itemBgColor, borderColor: itemBorderColor }}
                        >
                            <div className="relative z-10 flex w-[64%] min-w-0 flex-col p-4 sm:p-5 sm:w-[62%]" style={{ backgroundColor: itemBgColor }}>
                                <span className="w-fit rounded-full border border-slate-200 bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Category</span>
                                <h3 className={`mt-3 sm:mt-4 font-extrabold leading-5 sm:leading-6 ${itemTextSize}`} style={{ color: itemFontColor }}>{item.name}</h3>
                                {item.description && <p className="mt-1.5 line-clamp-2 text-xs leading-[18px] text-slate-500">{item.description}</p>}
                                <div className="mt-auto pt-3 sm:pt-4">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">Explore category <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                                </div>
                            </div>
                            {item.image && <img src={item.image} alt="" className="absolute right-0 top-0 h-full w-[42%] object-cover transition duration-500 group-hover:scale-105" />}
                            <span className="absolute bottom-5 sm:bottom-7 right-3 sm:right-4 z-20 shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 shadow-sm">{subCount} sub</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
function SplitBanners({ settings }) {
    const buttonColor = settings.button_color || '#c2005f';
    const radiusClass = settings.border_radius || 'rounded-2xl';
    const shadowClass = settings.shadow || 'shadow-sm';
    const sectionBg = settings.section_background_color || settings.background_color;
    const borderStyle = getSectionBorderStyle(settings);
    const legacyItems = [
        { title: settings.men_title || 'SIGNATURE MEN', subtitle: settings.men_subtitle || 'Panjabis, Polos, Caps & Active Footwear', image: settings.men_image, link: settings.men_link, button_text: settings.men_button_text || 'Shop Men' },
        { title: settings.women_title || 'SIGNATURE WOMEN', subtitle: settings.women_subtitle || 'Sarees, Shalwars, Kurtis & Premium Sandals', image: settings.women_image, link: settings.women_link, button_text: settings.women_button_text || 'Shop Women' },
    ];
    const items = (settings.items?.length ? settings.items : legacyItems).filter((item) => item.title);

    const renderTitle = (title) => {
        const words = String(title || '').trim().split(/\s+/);
        const last = words.pop();
        return <>{words.join(' ')} {last && <span style={{ color: buttonColor }}>{last}</span>}</>;
    };

    const titleSize = settings.title_font_size || 'text-xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';

    return <section className={sectionBg ? 'p-4 md:p-6 rounded-2xl' : ''} style={{ ...(sectionBg ? { backgroundColor: sectionBg } : {}), ...borderStyle }}>
        {settings.title && <h2 className={`mb-5 ${titleSize} ${titleWeight}`} style={{ color: settings.title_color || '#102f58' }}>{settings.title}</h2>}
        <div className="grid gap-5 lg:grid-cols-2">
            {items.map((item, index) => <Link
                key={`${item.title}-${index}`}
                href={item.link || '#'}
                className={`group relative min-h-[220px] overflow-hidden border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${radiusClass} ${shadowClass}`}
                style={{ borderColor: settings.item_border_color || '#e2e8f0' }}
            >
                {item.image && <img src={item.image} alt={item.title || ''} className="absolute inset-y-0 right-0 h-full w-[58%] object-cover transition duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/5" />
                <div className="relative z-10 flex min-h-[220px] max-w-[64%] flex-col justify-center px-6 py-7 md:px-9">
                    <h3 className="text-2xl font-black uppercase leading-tight tracking-[0.08em] text-[#07172f] md:text-4xl">{renderTitle(item.title)}</h3>
                    {item.subtitle && <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-slate-500 md:text-base">{item.subtitle}</p>}
                    <span className="mt-5 inline-flex w-fit items-center justify-center rounded-lg px-5 py-3 text-sm font-extrabold text-white shadow-md transition group-hover:-translate-y-0.5" style={{ backgroundColor: buttonColor }}>{item.button_text || 'Shop Now'}</span>
                </div>
            </Link>)}
        </div>
    </section>;
}

function PromoBanner({ settings }) {
    const radius = settings.border_radius || 'rounded-[24px]';
    const shadowClass = settings.shadow || 'shadow-none';
    const bgColor = settings.section_background_color || settings.background_color || '#102f58';
    const borderStyle = getSectionBorderStyle(settings);
    const titleSize = settings.title_font_size || 'text-2xl md:text-3xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';

    return <section className={`relative min-h-64 overflow-hidden ${radius} ${shadowClass}`} style={{ backgroundColor: bgColor, ...borderStyle }}>{settings.image && <img src={settings.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-950/10" /><div className="relative flex min-h-64 max-w-2xl flex-col justify-center p-8 text-white"><span className="text-xs font-bold uppercase tracking-widest text-[#ff7046]">{settings.subtitle}</span><h2 className={`mt-2 ${titleSize} ${titleWeight}`}>{settings.title}</h2><Link href={settings.link || '#'} className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#ff4b19] px-5 py-3 text-xs font-bold">{settings.btn_text || 'Explore'}<ArrowRight className="h-3.5 w-3.5" /></Link></div></section>;
}

function BrandSection({ settings }) {
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const manual = settings.items?.filter((item) => item.title || item.name) || [];
    const names = (settings.brands || '').split(',').map((brand) => brand.trim()).filter(Boolean);
    const items = (manual.length ? manual : [...new Set(names)].map((title) => ({ title }))).slice(0, Number(settings.limit || 16));
    if (!items.length) return null;

    const isMobileSlider = settings.mobile_layout !== 'grid';

    const checkScroll = () => {
        if (!sliderRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [items.length]);

    const scroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = direction === 'left' ? -220 : 220;
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const moreLink = !settings.button_link || settings.button_link === '#' ? route('brands.index') : settings.button_link;
    const titlePosition = settings.title_position || 'left';
    const isCentered = titlePosition === 'center';
    const cleanStrip = settings.brand_design_style === 'strip';
    const radius = settings.border_radius || 'rounded-[24px]';
    const shadowClass = settings.shadow || 'shadow-sm';
    const sectionBg = settings.section_background_color || settings.background_color || '#ffffff';
    const borderStyle = getSectionBorderStyle(settings);
    const titleSize = settings.title_font_size || (cleanStrip ? 'text-2xl' : 'text-xl');
    const titleWeight = settings.title_font_weight || 'font-extrabold';

    return (
        <section id={settings.anchor_id || 'brands'} className={`scroll-mt-36 px-4 py-3.5 sm:p-6 md:p-10 ${radius} ${shadowClass}`} style={{ backgroundColor: sectionBg, ...borderStyle }}>
            <div className={`mb-3 sm:mb-6 flex items-center justify-between gap-3 ${isCentered ? 'sm:relative sm:justify-center' : ''}`}>
                <h2 className={`min-w-0 ${titleSize} ${titleWeight} ${cleanStrip ? 'uppercase tracking-[0.14em]' : ''}`} style={{ color: settings.title_color || '#102f58' }}>
                    {settings.title || 'Shop By Brands'}
                </h2>
                {settings.show_button !== 'no' && (
                    <Link
                        href={moreLink}
                        className={`${isCentered ? 'sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2' : ''} inline-flex h-8 sm:h-9 shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-blue-700 transition hover:bg-blue-100`}
                    >
                        <span>{settings.button_text || 'More Brands'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                )}
            </div>

            {cleanStrip ? (
                isMobileSlider ? (
                    <>
                        <div className="relative sm:hidden">
                            {items.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('left')}
                                    disabled={!canScrollLeft}
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Previous brands"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}

                            <div
                                ref={sliderRef}
                                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2.5 pb-2 pt-1 -mx-2 px-2 scroll-smooth"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {items.map((item, index) => (
                                    <div key={`${item.title || item.name}-${index}`} className="shrink-0 snap-start">
                                        <BrandStripCard item={item} borderColor={settings.item_border_color || settings.title_color || '#42bce8'} />
                                    </div>
                                ))}
                            </div>

                            {items.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('right')}
                                    disabled={!canScrollRight}
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Next brands"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
                            {items.map((item, index) => (
                                <BrandStripCard key={`${item.title || item.name}-${index}`} item={item} borderColor={settings.item_border_color || settings.title_color || '#42bce8'} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-6">
                        {items.map((item, index) => <BrandStripCard key={`${item.title || item.name}-${index}`} item={item} borderColor={settings.item_border_color || settings.title_color || '#42bce8'} />)}
                    </div>
                )
            ) : (
                isMobileSlider ? (
                    <>
                        <div className="relative sm:hidden">
                            {items.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('left')}
                                    disabled={!canScrollLeft}
                                    className="absolute -left-2 top-[44px] -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Previous brands"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}

                            <div
                                ref={sliderRef}
                                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-2 pt-1 -mx-2 px-2 scroll-smooth"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {items.map((item, index) => {
                                    const name = item.title || item.name;
                                    const href = item.link && item.link !== '#' ? item.link : route('shop.index', { b: slugifyBrand(item.brand || name) });
                                    const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
                                    return (
                                        <Link
                                            key={`${item.title || item.name}-${index}`}
                                            href={href}
                                            className="group flex w-[96px] shrink-0 snap-start flex-col items-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-xs transition duration-300 active:scale-95 hover:border-[#ff9c7f]"
                                        >
                                            <div className="grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                                                {item.image ? (
                                                    <img src={item.image} alt={name} className="h-full w-full object-contain" />
                                                ) : (
                                                    <span className="text-sm font-black tracking-tight text-[#102f58]">{initials}</span>
                                                )}
                                            </div>
                                            <h3 className="mt-2 line-clamp-1 text-[11px] font-bold text-[#102f58] group-hover:text-[#ff4b19]">{name}</h3>
                                            <span className="mt-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-500">View</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {items.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => scroll('right')}
                                    disabled={!canScrollRight}
                                    className="absolute -right-2 top-[44px] -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                    aria-label="Next brands"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {items.map((item, index) => <BrandCard key={`${item.title || item.name}-${index}`} item={item} />)}
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                        {items.map((item, index) => <BrandCard key={`${item.title || item.name}-${index}`} item={item} />)}
                    </div>
                )
            )}
        </section>
    );
}

function BrandStripCard({ item, borderColor }) {
    const name = item.title || item.name;
    const href = item.link && item.link !== '#' ? item.link : route('shop.index', { b: slugifyBrand(item.brand || name) });

    return <Link href={href} className="group flex min-h-[48px] sm:min-h-[66px] min-w-[130px] sm:min-w-0 items-center justify-center rounded-lg border bg-slate-50 px-3 sm:px-4 text-center shadow-xs transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md" style={{ borderColor }}>
        <span className="line-clamp-1 text-sm sm:text-base font-black uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-[#102f58] md:text-lg">{name}</span>
    </Link>;
}

function BrandCard({ item }) {
    const name = item.title || item.name;
    const href = item.link && item.link !== '#' ? item.link : route('shop.index', { b: slugifyBrand(item.brand || name) });
    const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();

    return <Link href={href} className="group flex min-h-48 flex-col items-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#ff9c7f] hover:bg-[#fffaf8] hover:shadow-md">
        <div className="grid h-[90px] w-[90px] place-items-center overflow-hidden rounded-[20px] border border-slate-200 bg-white p-3 transition group-hover:border-[#ffb29b]">
            {item.image ? <img src={item.image} alt={name} className="h-full w-full object-contain" /> : <span className="text-base font-black tracking-tight text-[#102f58]">{initials}</span>}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#102f58] transition group-hover:text-[#ff4b19]">{name}</h3>
        <span className="mt-auto rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 transition group-hover:border-[#ffb29b] group-hover:bg-white group-hover:text-[#ff4b19]">View brand</span>
    </Link>;
}

function slugifyBrand(name) {
    return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ExperienceSection({ storeName, settings }) {
    const items = settings.items?.length ? settings.items : [['Best Deals', 'Find value-for-money products faster'], ['Compare Products', 'Review choices side by side'], ['Save Wishlist', 'Keep favorites for later'], ['Easy Shopping', 'Add to cart with confidence']].map(([title, text]) => ({ title, text }));
    const radius = settings.border_radius || 'rounded-[24px]';
    const shadowClass = settings.shadow || 'shadow-none';
    const bgColor = settings.section_background_color || settings.background_color || '#102f58';
    const borderStyle = getSectionBorderStyle(settings);
    const titleSize = settings.title_font_size || 'text-2xl md:text-3xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';

    return <section className={`overflow-hidden px-6 py-10 text-white md:px-10 ${radius} ${shadowClass}`} style={{ backgroundColor: bgColor, ...borderStyle }}><span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#ff7046]">{settings.eyebrow || 'Built for your shopping journey'}</span><h2 className={`mt-3 max-w-2xl ${titleSize} ${titleWeight}`}>{settings.title || 'Catalog, cart and checkout flows are all covered here.'}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{settings.description || `${storeName} keeps product discovery and checkout aligned for a dependable experience.`}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="text-sm font-bold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-300">{item.text || item.description}</p></div>)}</div></section>;
}

function ContentColumns({ storeName, settings }) {
    const items = settings.items?.length ? settings.items : [];
    const radius = settings.border_radius || 'rounded-[24px]';
    const shadowClass = settings.shadow || 'shadow-none';
    const bgColor = settings.section_background_color || settings.background_color || '#ffffff';
    const borderStyle = getSectionBorderStyle(settings);
    const titleSize = settings.title_font_size || 'text-2xl';
    const titleWeight = settings.title_font_weight || 'font-extrabold';

}

function ProductsTabsBlock({ settings, cardSettings = {}, all_products = [], categories = [], onAdd }) {
    const configuredCategories = useMemo(() => {
        if (settings.categories && typeof settings.categories === 'string') {
            const list = settings.categories.split(',').map(s => s.trim()).filter(Boolean);
            if (list.length > 0) return list;
        }
        if (categories && categories.length > 0) {
            return categories.slice(0, 8).map(c => c.name);
        }
        return ['All Products'];
    }, [settings.categories, categories]);

    const [activeTab, setActiveTab] = useState(configuredCategories[0] || '');
    const sectionRef = useRef(null);
    const tabRef = useRef(null);
    const [fixedTabs, setFixedTabs] = useState(false);
    const [tabHeight, setTabHeight] = useState(0);
    const [showAllProducts, setShowAllProducts] = useState(false);

    useEffect(() => {
        if (configuredCategories.length > 0 && !configuredCategories.includes(activeTab)) {
            setActiveTab(configuredCategories[0]);
        }
    }, [configuredCategories]);

    useEffect(() => {
        setShowAllProducts(false);
    }, [activeTab]);

    useEffect(() => {
        if (settings.is_sticky === 'no') {
            setFixedTabs(false);
            setTabHeight(0);
            return undefined;
        }

        const updateStickyTabs = () => {
            const section = sectionRef.current;
            const tab = tabRef.current;
            if (!section || !tab) return;

            const header = document.querySelector('header');
            const headerHeight = header?.getBoundingClientRect().height || 0;
            const topOffset = headerHeight;
            const sectionRect = section.getBoundingClientRect();
            const tabHeightValue = tab.offsetHeight;
            const shouldFix = sectionRect.top <= topOffset - 2 && sectionRect.bottom > topOffset + tabHeightValue + 40;

            setTabHeight(tabHeightValue);
            setFixedTabs(prev => (prev === shouldFix ? prev : shouldFix));
        };

        updateStickyTabs();
        window.addEventListener('scroll', updateStickyTabs, { passive: true });
        window.addEventListener('resize', updateStickyTabs);
        return () => {
            window.removeEventListener('scroll', updateStickyTabs);
            window.removeEventListener('resize', updateStickyTabs);
        };
    }, [settings.is_sticky, configuredCategories.length, settings.title]);

    const filteredProducts = useMemo(() => {
        if (!activeTab || activeTab.toLowerCase() === 'all' || activeTab.toLowerCase() === 'all products') {
            return all_products;
        }
        const lowerTab = activeTab.trim().toLowerCase();
        const matches = all_products.filter(p => 
            p.categories?.some(c => 
                c.name?.trim().toLowerCase() === lowerTab || 
                c.slug?.trim().toLowerCase() === lowerTab
            )
        );
        return matches.length > 0 ? matches : all_products;
    }, [all_products, activeTab]);

    const limit = Math.max(1, Number(settings.product_limit || 18));
    const hasMoreProducts = filteredProducts.length > limit;
    const displayProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, limit);
    const buttonLink = String(settings.button_link || '').trim();
    const shouldNavigateButton = buttonLink !== '' && buttonLink !== '#';

    const showButton = settings.show_button !== 'no' && (shouldNavigateButton || hasMoreProducts);
    const titleColor = settings.title_color || '#42bce8';
    const activeBg = settings.active_tab_bg_color || '#42bce8';
    const activeText = settings.active_tab_text_color || '#ffffff';
    const inactiveText = settings.inactive_tab_text_color || settings.item_border_color || '#42bce8';
    const borderColor = settings.item_border_color || '#42bce8';
    
    const tabRadius = settings.border_radius || 'rounded-full';
    const activeTabRadius = settings.active_border_radius || tabRadius;
    const containerRadius = settings.container_border_radius || 'rounded-3xl';
    const shadowClass = settings.shadow || 'shadow-xs';
    const sectionBg = settings.section_background_color || settings.background_color || '#ffffff';
    const borderStyle = getSectionBorderStyle(settings);
    const isSticky = settings.is_sticky !== 'no';
    const headerHeight = typeof document !== 'undefined' ? (document.querySelector('header')?.getBoundingClientRect().height || 0) : 0;
    const stickyTop = headerHeight;

    return (
        <section ref={sectionRef} className={`scroll-mt-36 p-4 md:p-6 ${containerRadius} ${shadowClass}`} style={{ backgroundColor: sectionBg, ...borderStyle }}>
            {settings.title && (
                <div className="text-center mb-4">
                    <h2
                        className={`inline-block text-center uppercase tracking-widest ${settings.title_font_size || 'text-sm md:text-base'} ${settings.title_font_weight || 'font-bold'}`}
                        style={{ color: titleColor }}
                    >
                        {settings.title}
                    </h2>
                </div>
            )}

            {fixedTabs && <div aria-hidden="true" style={{ height: tabHeight }} />}
            <div
                ref={tabRef}
                className={`${fixedTabs ? 'fixed left-0 right-0 z-30 border-b border-slate-100 bg-white/95 shadow-md backdrop-blur-md' : ''} ${isSticky ? 'py-2 -mx-4 px-4 md:-mx-6 md:px-6' : 'mb-6'}`}
                style={fixedTabs ? { top: stickyTop } : undefined}
            >
                {configuredCategories.length > 0 && (
                    <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
                        {configuredCategories.map((catName) => {
                            const isActive = catName === activeTab;
                            return (
                                <button
                                    key={catName}
                                    type="button"
                                    onClick={() => setActiveTab(catName)}
                                    className={`shrink-0 whitespace-nowrap px-4 py-1.5 text-[11px] font-bold transition-colors border ${
                                        isActive ? activeTabRadius : tabRadius
                                    }`}
                                    style={
                                        isActive
                                            ? { backgroundColor: activeBg, color: activeText, borderColor: borderColor }
                                            : { backgroundColor: '#ffffff', color: inactiveText, borderColor: borderColor }
                                    }
                                >
                                    {catName}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3.5">
                {displayProducts.map((product) => (
                    <ModernProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAdd}
                        settings={cardSettings}
                    />
                ))}
            </div>

            {showButton && (
                <div className="mt-8 flex justify-center">
                    {shouldNavigateButton ? (
                        <Link
                            href={buttonLink}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-6 py-2.5 text-[11px] font-extrabold text-slate-700 transition-all hover:bg-slate-50 uppercase tracking-wider"
                        >
                            <span>{settings.button_text || 'VIEW MORE PRODUCTS'}</span>
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowAllProducts(value => !value)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-6 py-2.5 text-[11px] font-extrabold text-slate-700 transition-all hover:bg-slate-50 uppercase tracking-wider"
                        >
                            <span>{showAllProducts ? 'SHOW LESS PRODUCTS' : (settings.button_text || 'VIEW MORE PRODUCTS')}</span>
                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showAllProducts ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}












