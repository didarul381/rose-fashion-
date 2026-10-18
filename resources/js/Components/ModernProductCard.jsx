import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, ArrowRight, Star, GitCompare, Eye } from 'lucide-react';
import { getWishlistItems, toggleWishlistProduct } from '../Services/Wishlist';
import { isProductCompared, toggleCompareProduct } from '../Services/Compare';

const radiusMap = {
    'rounded-none': 'rounded-none',
    'rounded-sm': 'rounded-sm',
    'rounded-md': 'rounded-md',
    'rounded-lg': 'rounded-lg',
    'rounded-xl': 'rounded-xl',
    'rounded-2xl': 'rounded-2xl',
    'rounded-3xl': 'rounded-3xl',
    'rounded-full': 'rounded-full'
};

const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
};

const enabled = (settings, key, fallback = true) => {
    if (settings[key] === undefined || settings[key] === null || settings[key] === '') return fallback;
    return String(settings[key]) !== 'false';
};

export default function ModernProductCard({ product, onAddToCart, settings = {} }) {
    const [wishlisted, setWishlisted] = useState(false);
    const [compared, setCompared] = useState(false);
    const hasVariants = (product.type === 'variable' || product.type === 'option') && product.variants?.length > 0;

    const attributesList = React.useMemo(() => {
        if (!hasVariants) return [];
        const attrs = {};
        product.variants.forEach(variant => {
            const valuesArr = variant.attribute_values || variant.attributeValues || [];
            valuesArr.forEach(av => {
                const attrName = av.attribute?.name || av.attribute?.code;
                if (attrName) {
                    if (!attrs[attrName]) attrs[attrName] = [];
                    if (!attrs[attrName].includes(av.value)) attrs[attrName].push(av.value);
                }
            });
            if (variant.attributes && typeof variant.attributes === 'object') {
                Object.entries(variant.attributes).forEach(([k, v]) => {
                    if (!attrs[k]) attrs[k] = [];
                    if (!attrs[k].includes(v)) attrs[k].push(v);
                });
            }
        });

        if (Object.keys(attrs).length === 0 && product.variants.length > 0) {
            const variantNames = product.variants.map(v => v.title || v.name).filter(Boolean);
            if (variantNames.length > 0) {
                attrs['Option'] = Array.from(new Set(variantNames));
            }
        }

        return Object.keys(attrs).map(name => ({
            name,
            values: attrs[name]
        }));
    }, [product, hasVariants]);

    const matchesVariant = (variant, opts) => {
        const valuesArr = variant.attribute_values || variant.attributeValues || [];
        const variantOpts = valuesArr.reduce((acc, av) => {
            const attrName = av.attribute?.name || av.attribute?.code;
            if (attrName) acc[attrName] = av.value;
            return acc;
        }, {});
        if (variant.attributes && typeof variant.attributes === 'object') {
            Object.assign(variantOpts, variant.attributes);
        }
        if (variant.title || variant.name) {
            variantOpts['Option'] = variant.title || variant.name;
        }
        return Object.entries(opts).every(([k, v]) => variantOpts[k] === v);
    };

    const [selectedOptions, setSelectedOptions] = useState(() => {
        if (!hasVariants) return {};
        const initial = {};
        const firstVariant = product.variants.find(v => Number(v.stock || 0) > 0) || product.variants[0];
        if (firstVariant) {
            const valuesArr = firstVariant.attribute_values || firstVariant.attributeValues || [];
            valuesArr.forEach(av => {
                const attrName = av.attribute?.name || av.attribute?.code;
                if (attrName) initial[attrName] = av.value;
            });
            if (firstVariant.attributes && typeof firstVariant.attributes === 'object') {
                Object.entries(firstVariant.attributes).forEach(([k, v]) => {
                    if (!initial[k]) initial[k] = v;
                });
            }
            if (Object.keys(initial).length === 0 && (firstVariant.title || firstVariant.name)) {
                initial['Option'] = firstVariant.title || firstVariant.name;
            }
        }
        return initial;
    });

    const selectedVariant = React.useMemo(() => {
        if (!hasVariants) return null;
        return product.variants.find(v => matchesVariant(v, selectedOptions)) || null;
    }, [hasVariants, product.variants, selectedOptions]);

    const handleOptionSelect = (attrName, val) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attrName]: val
        }));
    };

    const isOptionOutOfStock = (attrName, val) => {
        if (!hasVariants) return false;
        const testOpts = { ...selectedOptions, [attrName]: val };
        const matched = product.variants.find(v => matchesVariant(v, testOpts));
        return matched ? Number(matched.stock || 0) <= 0 : true;
    };

    const isOutOfStock = hasVariants
        ? (selectedVariant ? Number(selectedVariant.stock || 0) <= 0 : !product.variants.some(v => Number(v.stock || 0) > 0))
        : product.stock <= 0 && product.type !== 'digital';

    const cardRadius = radiusMap[settings.card_radius] || 'rounded-2xl';
    const cardShadow = shadowMap[settings.card_shadow] || 'shadow-md';
    const hoverMode = settings.card_hover_style || 'lift';
    const badgePosition = settings.card_badge_position === 'top-right' ? 'right-2.5' : 'left-2.5';

    const showQuickView = enabled(settings, 'card_show_quick_view');
    const showWishlist = enabled(settings, 'card_show_wishlist');
    const showCompare = enabled(settings, 'card_show_compare') && String(product.settings?.comparison_status || 'enabled') !== 'disabled';
    const showCustomBadge = enabled(settings, 'card_show_custom_badge');
    const customBadgeText = product.settings?.custom_badge || product.badge || (Array.isArray(product.labels) ? product.labels[0] : null);
    const showMeta = enabled(settings, 'card_show_category');
    const showBrand = enabled(settings, 'card_show_brand');
    const showSku = enabled(settings, 'card_show_sku');
    const showStock = enabled(settings, 'card_show_stock');
    const showCatalog = enabled(settings, 'card_show_catalog_label');
    const showViewButton = enabled(settings, 'card_show_view_button');
    const showDiscountBadge = enabled(settings, 'card_show_discount_badge');
    const showAddToCart = enabled(settings, 'card_show_add_to_cart');
    const showBuyNow = enabled(settings, 'card_show_buy_now', false);
    const showActionText = settings.card_action_text !== 'icon';
    const showOldPrice = enabled(settings, 'card_show_old_price');
    const showReview = settings.card_show_review !== undefined
        ? String(settings.card_show_review) !== 'false'
        : enabled(settings, 'card_show_rating');

    const pageProps = usePage()?.props || {};
    const globalSettings = pageProps.global_settings || {};
    const sitePrimaryColor = settings.primary_color || globalSettings.primary_color || globalSettings.theme_primary || '#02BCEF';
    const customBadgeBg = settings.card_custom_badge_bg_color || sitePrimaryColor;
    const customBadgeTextColor = settings.card_custom_badge_text_color || '#ffffff';

    const titleColor = settings.card_title_color || '#0f172a';
    const textColor = settings.card_text_color || '#475569';
    const priceColor = settings.card_price_color || '#ff4b19';
    const oldPriceColor = settings.card_old_price_color || '#94a3b8';
    const badgeBgColor = settings.card_badge_bg_color || '#ff4b19';
    const badgeTextColor = settings.card_badge_text_color || '#ffffff';
    const buttonPrimaryBg = settings.card_button_bg_color || '#ff4b19';
    const buttonPrimaryText = settings.card_button_text_color || '#ffffff';
    const buttonSecondaryBg = settings.card_secondary_button_bg_color || '#f8fafc';
    const buttonSecondaryText = settings.card_secondary_button_text_color || '#0f172a';
    const buttonBuyNowBg = settings.card_buy_now_bg_color || settings.card_secondary_button_bg_color || '#0f172a';
    const buttonBuyNowText = settings.card_buy_now_text_color || settings.card_secondary_button_text_color || '#ffffff';
    const buttonSelectOptionBg = settings.card_select_option_bg_color || buttonPrimaryBg;
    const buttonSelectOptionText = settings.card_select_option_text_color || buttonPrimaryText;
    const buttonBorder = settings.card_button_border_color || '#e2e8f0';
    const cardBgColor = settings.card_bg_color || '#ffffff';
    const cardBorderColor = settings.card_border_color || '#e2e8f0';
    const ratingColor = settings.card_rating_color || '#ff4b19';

    const originalPrice = parseFloat(selectedVariant?.price || product.price || 0);
    const salePrice = parseFloat(selectedVariant ? (selectedVariant.sale_price || selectedVariant.price) : (product.sale_price || product.price || 0));
    const priceUnit = product.price_unit?.code || product.priceUnit?.code || 'pcs';
    const hasSale = selectedVariant
        ? (selectedVariant.sale_price && parseFloat(selectedVariant.price) > parseFloat(selectedVariant.sale_price))
        : (!!product.sale_price && salePrice < originalPrice);
    const discountPercent = hasSale && originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    const approvedReviews = (product.reviews || []).filter(review => review?.is_approved !== false);
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
        ? approvedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : 0;

    const brandLabel = product.brand || product.categories?.[0]?.name || 'Catalog';
    const skuLabel = selectedVariant?.sku || product.sku || `G-${product.id}`;
    const stockQty = hasVariants
        ? (selectedVariant ? Number(selectedVariant.stock || 0) : product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0))
        : Number(product.stock || 0);
    const productImage = (selectedVariant?.image_path) || product.primary_image?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

    const handleWishlistClick = (e) => {
        e.preventDefault();
        const { added } = toggleWishlistProduct(product);
        setWishlisted(added);
    };

    const handleCompareClick = (e) => {
        e.preventDefault();
        const result = toggleCompareProduct(product);
        setCompared(!result.removed && isProductCompared(product.id));
    };

    useEffect(() => {
        const syncWishlist = () => {
            const items = getWishlistItems();
            setWishlisted(items.some(item => item.wishlistId === `p-${product.id}`));
        };

        syncWishlist();
        window.addEventListener('govaly-wishlist-changed', syncWishlist);
        return () => window.removeEventListener('govaly-wishlist-changed', syncWishlist);
    }, [product.id]);

    useEffect(() => {
        const syncCompare = () => setCompared(isProductCompared(product.id));
        syncCompare();
        window.addEventListener('malamal-compare-changed', syncCompare);
        return () => window.removeEventListener('malamal-compare-changed', syncCompare);
    }, [product.id]);

    const wrapperClasses = [
        'group relative flex min-w-0 flex-col overflow-hidden border transition-all duration-300',
        cardRadius,
        cardShadow,
        hoverMode === 'lift' ? 'hover:-translate-y-1 hover:shadow-xl' : '',
        hoverMode === 'zoom' ? 'hover:scale-[1.01]' : '',
        hoverMode === 'glow' ? 'hover:shadow-lg hover:border-orange-200' : ''
    ].filter(Boolean).join(' ');

    const buttonRadiusClass = radiusMap[settings.button_radius] || 'rounded-full';
    const buttonHoverEffect = settings.button_hover_effect || 'scale';
    const buttonHoverClass =
        buttonHoverEffect === 'scale' ? 'hover:scale-105' :
        buttonHoverEffect === 'opacity' ? 'hover:opacity-80' :
        buttonHoverEffect === 'slide' ? 'hover:-translate-y-1' : '';
    const buttonAnim = settings.button_animation || 'none';
    const buttonAnimClass =
        buttonAnim === 'pulse' ? 'animate-pulse' :
        buttonAnim === 'bounce' ? 'animate-bounce' : '';

    const commonBtnStyle = `flex h-9 w-full items-center justify-center gap-1.5 px-3 text-[10.5px] font-semibold tracking-tight transition-all shadow-[0_6px_14px_rgba(15,23,42,0.10)] hover:shadow-md md:h-10 md:gap-2 md:text-[12px] md:font-bold ${buttonRadiusClass} ${buttonHoverClass} ${buttonAnimClass}`;

    const primaryAction = isOutOfStock ? (
        <button
            disabled
            className={`${commonBtnStyle} cursor-not-allowed bg-slate-200 text-slate-400`}
        >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.1} />
            <span>Out of stock</span>
        </button>
    ) : (
        <button
            onClick={() => onAddToCart?.(product, selectedVariant, 1)}
            className={`${commonBtnStyle}`}
            style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
        >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.1} />
            {showActionText ? 'Add to cart' : ''}
        </button>
    );

    return (
        <article className={wrapperClasses} style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                <Link href={route('product.show', { slug: product.slug })} className="block h-full">
                    <img
                        src={productImage}
                        className={`h-full w-full object-cover transition-transform duration-500 ${hoverMode === 'zoom' ? 'group-hover:scale-110' : 'group-hover:scale-105'}`}
                        alt={product.name}
                    />
                </Link>

                <div className={`absolute top-2.5 z-20 flex flex-col items-start gap-1.5 ${badgePosition}`}>
                    {showCustomBadge && customBadgeText && (
                        <span
                            className="rounded-xs px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: customBadgeBg, color: customBadgeTextColor }}
                        >
                            {customBadgeText}
                        </span>
                    )}

                    {showDiscountBadge && hasSale && (
                        <span
                            className="rounded-full px-2.5 py-0.5 text-[9px] font-black text-white shadow-sm"
                            style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
                        >
                            -{discountPercent}%
                        </span>
                    )}
                </div>

                <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-2">
                    {showQuickView && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('open-quick-view', { detail: { product } }));
                            }}
                            className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-500 shadow transition hover:text-rose-600 cursor-pointer"
                            aria-label="Quick View"
                            title="Quick View"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    )}
                    {showWishlist && (
                        <button
                            onClick={handleWishlistClick}
                            className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-500 shadow transition hover:text-orange-500"
                            aria-label="Toggle wishlist"
                        >
                            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-[#ff4b19] text-[#ff4b19]' : ''}`} />
                        </button>
                    )}
                    {showCompare && (
                        <button
                            onClick={handleCompareClick}
                            className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow transition ${compared ? 'text-[#ff4b19]' : 'text-slate-500 hover:text-[#ff4b19]'}`}
                            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                            title={compared ? 'Remove from compare' : 'Add to compare'}
                        >
                            <GitCompare className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-3.5 md:p-4">
                <Link href={route('product.show', { slug: product.slug })}>
                    <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-extrabold leading-5 md:text-sm" style={{ color: titleColor }}>
                        {product.name}
                    </h3>
                </Link>

                {showMeta && (showBrand || showSku) && (
                    <div className="mt-2 flex justify-between gap-2 text-[10px] leading-4" style={{ color: textColor, opacity: 0.72 }}>
                        {showBrand && <span className="min-w-0 truncate">Brand: {brandLabel}</span>}
                        {showSku && <span className="shrink-0 text-right">SKU: {skuLabel}</span>}
                    </div>
                )}

                {showReview && reviewCount > 0 && (
                    <div className="mt-2 flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < Math.round(averageRating) ? 'fill-current' : ''}`}
                                style={{ color: ratingColor }}
                            />
                        ))}
                        <span className="ml-1 text-[10px]" style={{ color: textColor, opacity: 0.72 }}>
                            ({reviewCount})
                        </span>
                    </div>
                )}

                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-black leading-none md:text-base" style={{ color: priceColor }}>
                        {"\u09F3"} {Math.round(salePrice).toLocaleString('en-BD')} / {priceUnit}
                    </span>
                    {showOldPrice && hasSale && (
                        <span className="text-[10px] line-through" style={{ color: oldPriceColor }}>
                            {"\u09F3"} {Math.round(originalPrice).toLocaleString('en-BD')}
                        </span>
                    )}
                </div>

                {(showStock || showCatalog) && (
                    <div className="mt-3 flex justify-between gap-2 text-[10px]" style={{ color: textColor, opacity: 0.82 }}>
                        {showStock && <span>{isOutOfStock ? 'Out of stock' : `${stockQty} In stock`}</span>}
                        {showCatalog && <span>In catalog</span>}
                    </div>
                )}

                {hasVariants && attributesList.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        {attributesList.map((attr) => (
                            <div key={attr.name} className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {attr.values.map((val) => {
                                        const isSelected = selectedOptions[attr.name] === val;
                                        const outOfStock = isOptionOutOfStock(attr.name, val);
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleOptionSelect(attr.name, val);
                                                }}
                                                disabled={outOfStock}
                                                className={`min-w-[26px] h-6 px-1.5 flex items-center justify-center text-[10px] font-bold rounded uppercase transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-rose-600 text-white border border-rose-600 shadow-xs'
                                                        : outOfStock
                                                            ? 'bg-slate-50 text-slate-300 border border-slate-200 line-through cursor-not-allowed opacity-50'
                                                            : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-400 hover:text-rose-600'
                                                }`}
                                                title={`${attr.name}: ${val}${outOfStock ? ' (Out of stock)' : ''}`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedOptions[attr.name] && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {attr.name} <span className="font-semibold text-slate-700">{selectedOptions[attr.name]}</span> selected
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-auto space-y-1.5 pt-3">
                    {(showAddToCart || (hasVariants && showBuyNow)) && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                {primaryAction}
                            </div>
                            {showQuickView && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.dispatchEvent(new CustomEvent('open-quick-view', { detail: { product } }));
                                    }}
                                    className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition shrink-0 cursor-pointer shadow-xs"
                                    title="Quick View"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    {showBuyNow && !hasVariants && !isOutOfStock && (
                        <Link
                            href={route('checkout.index')}
                            onClick={() => onAddToCart?.(product, null, 1)}
                            className={`${commonBtnStyle} border`}
                            style={{ backgroundColor: buttonBuyNowBg, color: buttonBuyNowText, borderColor: buttonBorder }}
                        >
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.1} />
                            {showActionText ? 'Buy Now' : ''}
                        </Link>
                    )}
                    {showViewButton && (
                        <Link
                            href={route('product.show', { slug: product.slug })}
                            className={`${commonBtnStyle} border`}
                            style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText, borderColor: buttonBorder }}
                        >
                            View
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
