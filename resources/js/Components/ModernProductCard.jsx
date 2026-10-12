import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, ArrowRight, Star, GitCompare } from 'lucide-react';
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
    const hasAvailableVariant = hasVariants
        ? product.variants.some(variant => Number(variant.stock || 0) > 0)
        : true;
    const isOutOfStock = hasVariants
        ? !hasAvailableVariant
        : product.stock <= 0 && product.type !== 'digital';

    const cardRadius = radiusMap[settings.card_radius] || 'rounded-2xl';
    const cardShadow = shadowMap[settings.card_shadow] || 'shadow-md';
    const hoverMode = settings.card_hover_style || 'lift';
    const badgePosition = settings.card_badge_position === 'top-right' ? 'right-2.5' : 'left-2.5';

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

    const originalPrice = parseFloat(product.price || 0);
    const salePrice = parseFloat(product.sale_price || product.price || 0);
    const priceUnit = product.price_unit?.code || product.priceUnit?.code || 'pcs';
    const hasSale = !!product.sale_price && salePrice < originalPrice;
    const discountPercent = hasSale && originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    const approvedReviews = (product.reviews || []).filter(review => review?.is_approved !== false);
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
        ? approvedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : 0;

    const brandLabel = product.brand || product.categories?.[0]?.name || 'Catalog';
    const skuLabel = product.sku || `G-${product.id}`;
    const stockQty = hasVariants
        ? product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
        : Number(product.stock || 0);
    const productImage = product.primary_image?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

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

    const primaryAction = hasVariants ? (
        <Link
            href={route('product.show', { slug: product.slug })}
            className={commonBtnStyle}
            style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : buttonSelectOptionBg, color: isOutOfStock ? '#ffffff' : buttonSelectOptionText }}
        >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.1} />
            {isOutOfStock ? 'Out of stock' : 'Select options'}
        </Link>
    ) : (
        <button
            onClick={() => !isOutOfStock && onAddToCart?.(product, null, 1)}
            disabled={isOutOfStock}
            className={`${commonBtnStyle} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white`}
            style={!isOutOfStock ? { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText } : undefined}
        >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.1} />
            {showActionText ? (isOutOfStock ? 'Out of stock' : 'Add to cart') : ''}
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

                <div className="mt-auto space-y-1.5 pt-3">
                    {(showAddToCart || (hasVariants && showBuyNow)) && primaryAction}
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
