import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { useCart } from '../../Contexts/CartContext';
import { getWishlistItems, toggleWishlistProduct } from '../../Services/Wishlist';
import { 
    Star, ShoppingCart, GitCompare, Phone,
    ChevronRight, Share2, Heart, FileText, ArrowRight, X, AlertCircle, PlayCircle
} from 'lucide-react';
import WhatsAppIcon from '../../Components/WhatsAppIcon';

import { Tracker } from '../../Services/Tracker';
import { compareUrl, isProductCompared, toggleCompareProduct } from '../../Services/Compare';
import BreadcrumbSchema from '../../Components/BreadcrumbSchema';

function stripHtml(value = '') {
    return String(value).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
}

function getYouTubeId(url = '') {
    const value = String(url || '').trim();
    if (!value) return null;
    const patterns = [
        /youtu\.be\/([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
}

function getYouTubeEmbedUrl(url = '') {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : '';
}

function getYouTubeThumbnail(url = '') {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}
export default function ProductDetail({ product, related, seo, eventId, breadcrumbs = [] }) {
    const { auth, global_settings = {} } = usePage().props;
    const { addToCart } = useCart();

    const buttonAddToCartBg = global_settings.card_button_bg_color || global_settings.color_button || '#123963';
    const buttonAddToCartText = global_settings.card_button_text_color || '#ffffff';
    const buttonBuyNowBg = global_settings.card_buy_now_bg_color || '#f04a23';
    const buttonBuyNowText = global_settings.card_buy_now_text_color || '#ffffff';
    const showCallForOrder = String(global_settings.product_detail_call_button_status || 'enabled') !== 'disabled';
    const callForOrderPhone = String(global_settings.product_detail_call_phone || global_settings.contact_phone || global_settings.support_phone || '').trim();
    const cleanCallForOrderPhone = callForOrderPhone.replace(/[^+\d]/g, '');
    const callForOrderText = global_settings.product_detail_call_button_text || 'Call For Order';

    const showWhatsAppOrder = String(global_settings.product_detail_whatsapp_status || 'enabled') !== 'disabled';
    const rawWhatsAppPhone = String(global_settings.product_detail_whatsapp_phone || global_settings.contact_phone || global_settings.support_phone || '').trim();
    const cleanWhatsAppPhone = (rawWhatsAppPhone.replace(/\D/g, '')) || '8801712345678';
    const whatsAppButtonText = global_settings.product_detail_whatsapp_text || 'Order on WhatsApp';

    const showCompareButton = String(global_settings.product_detail_show_compare || 'enabled') !== 'disabled';
    const showWishlistButton = String(global_settings.product_detail_show_wishlist || 'enabled') !== 'disabled';
    const showSocialShare = String(global_settings.product_detail_show_share || 'enabled') !== 'disabled';
    const sitePrimaryColor = global_settings.primary_color || global_settings.theme_primary || '#02BCEF';
    const ribbonBadgeBg = global_settings.card_custom_badge_bg_color || sitePrimaryColor;
    const ribbonBadgeText = global_settings.card_custom_badge_text_color || '#ffffff';
    const themePriceColor = global_settings.card_price_color || global_settings.primary_color || '#f04a23';

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

    const buttonRadiusClass = radiusMap[global_settings.button_radius] || 'rounded-lg';
    const buttonHoverEffect = global_settings.button_hover_effect || 'scale';
    const buttonHoverClass =
        buttonHoverEffect === 'scale' ? 'hover:scale-105' :
        buttonHoverEffect === 'opacity' ? 'hover:opacity-80' :
        buttonHoverEffect === 'slide' ? 'hover:-translate-y-1' : '';
    const buttonAnim = global_settings.button_animation || 'none';
    const buttonAnimClass =
        buttonAnim === 'pulse' ? 'animate-pulse' :
        buttonAnim === 'bounce' ? 'animate-bounce' : '';

    useEffect(() => {
        Tracker.trackViewContent(product, eventId);
    }, [product, eventId]);

    const [activeImage, setActiveImage] = useState(
        product.images?.[0]?.image_path || (product.video_url ? '__video__' : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600')
    );
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [compared, setCompared] = useState(false);
    const [imageZoom, setImageZoom] = useState({ active: false, x: 50, y: 50 });

    // Variation options state (for variable products)
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [attributesList, setAttributesList] = useState([]);
    const sizeChart = product.size_chart || product.sizeChart || null;

    const showToast = (msg, type = 'error') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('govaly-toast', {
                detail: {
                    type,
                    text: msg,
                    title: type === 'error' ? 'Notice' : (type === 'success' ? 'Success' : ''),
                }
            }));
        }
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

    const productSettings = product.settings || {};
    const compareEnabled = String(productSettings.comparison_status || 'enabled') !== 'disabled';
    const showQuotationSection = String(productSettings.is_quotation_product || 'false') === 'true';

    const matchesVariantOptions = (variant, options = {}) => {
        const valuesArr = variant.attribute_values || variant.attributeValues || [];
        const variantOptions = valuesArr.reduce((acc, av) => {
            const attrName = av.attribute?.name || av.attribute?.code;
            if (attrName) {
                acc[attrName] = av.value;
            }
            return acc;
        }, {});

        return Object.entries(options).every(([attrName, val]) => variantOptions[attrName] === val);
    };

    const isOptionOutOfStock = (attrName, val) => {
        if (!product.type || product.type !== 'variable' || !product.variants) return false;
        
        const testOptions = { ...selectedOptions, [attrName]: val };

        const matched = product.variants.find(variant => matchesVariantOptions(variant, testOptions));
        
        return matched ? matched.stock <= 0 : true;
    };

    const getOptionImage = (attrName, val) => {
        if (!product.variants || !Array.isArray(product.variants)) return null;
        const targetVal = String(val).trim().toLowerCase();
        const targetAttr = String(attrName).trim().toLowerCase();

        const matched = product.variants.find(variant => {
            if (!variant.image_path) return false;

            const valuesArr = variant.attribute_values || variant.attributeValues || [];
            const matchInArr = valuesArr.some(av => {
                const name = av.attribute?.name || av.attribute?.code;
                return name && String(name).trim().toLowerCase() === targetAttr && String(av.value).trim().toLowerCase() === targetVal;
            });
            if (matchInArr) return true;

            if (variant.attributes && typeof variant.attributes === 'object') {
                for (const [k, v] of Object.entries(variant.attributes)) {
                    if (String(k).trim().toLowerCase() === targetAttr && String(v).trim().toLowerCase() === targetVal) {
                        return true;
                    }
                }
            }

            return false;
        });

        return matched?.image_path || null;
    };

    useEffect(() => {
        if (product.type === 'variable' && product.variants?.length > 0) {
            const attrs = {};
            product.variants.forEach(variant => {
                const valuesArr = variant.attribute_values || variant.attributeValues || [];
                valuesArr.forEach(av => {
                    const attrName = av.attribute?.name || av.attribute?.code;
                    if (attrName) {
                        if (!attrs[attrName]) {
                            attrs[attrName] = new Set();
                        }
                        attrs[attrName].add(av.value);
                    }
                });
            });

            const formatted = Object.keys(attrs).map(name => ({
                name,
                values: Array.from(attrs[name])
            }));
            
            setAttributesList(formatted);
        }
    }, [product]);

    // Handle variant matching and image switching when options change
    useEffect(() => {
        const hasAnySelection = Object.keys(selectedOptions).length > 0;
        const hasCompleteSelection = product.type === 'variable'
            && attributesList.length > 0
            && attributesList.every(attr => selectedOptions[attr.name]);

        if (product.type === 'variable' && hasCompleteSelection) {
            const matched = product.variants.find(variant => matchesVariantOptions(variant, selectedOptions));

            setSelectedVariant(matched || null);
            if (matched?.image_path) {
                setActiveImage(matched.image_path);
            }
        } else if (product.type === 'variable') {
            setSelectedVariant(null);

            if (hasAnySelection) {
                const partialImageMatch = product.variants.find(variant => matchesVariantOptions(variant, selectedOptions) && variant.image_path);
                if (partialImageMatch?.image_path) {
                    setActiveImage(partialImageMatch.image_path);
                }
            }
        }
    }, [selectedOptions, product, attributesList]);

    const hasVariants = product.type === 'variable' && product.variants?.length > 0;
    const hasCompleteSelection = hasVariants
        ? attributesList.length > 0 && attributesList.every(attr => selectedOptions[attr.name])
        : true;

    const isOutOfStock = hasVariants
        ? (!hasCompleteSelection || (selectedVariant ? selectedVariant.stock <= 0 : true))
        : (product.stock <= 0 && product.type !== 'digital');

    const handleAddToCart = () => {
        if (hasVariants && !hasCompleteSelection) {
            showToast('Please select all product options first.');
            return;
        }
        if (isOutOfStock) {
            showToast('Out of stock!');
            return;
        }
        if (hasVariants) {
            if (!selectedVariant) return;
            addToCart(product, selectedVariant, quantity);
        } else {
            addToCart(product, null, quantity);
        }
    };

    const handleBuyNow = () => {
        if (hasVariants && !hasCompleteSelection) {
            showToast('Please select all product options first.');
            return;
        }
        if (isOutOfStock) {
            showToast('Out of stock!');
            return;
        }
        handleAddToCart();
        window.location.href = route('checkout.index');
    };

    const handleWishlistClick = () => {
        const { added } = toggleWishlistProduct(product);
        setWishlisted(added);
        showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    };

    const handleCompareClick = () => {
        const result = toggleCompareProduct(product);
        const isCompared = !result.removed && isProductCompared(product.id);
        setCompared(isCompared);
        if (result.reason === 'disabled') {
            showToast('This product is not available for comparison.', 'error');
        } else if (result.reason === 'limit') {
            showToast('You can compare up to 6 products at once.', 'info');
        } else {
            showToast(isCompared ? 'Added to comparison' : 'Removed from comparison', 'info');
        }
    };

    const handleImageZoomMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setImageZoom({
            active: true,
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
    };

    // Price Calculations (quantity-aware totals)
    let priceDisplay = '';
    let originalPriceDisplay = '';
    let discountPercent = 0;
    let unitPrice = null;
    let unitOriginalPrice = null;

    if (product.type === 'variable' && product.variants?.length > 0) {
        if (selectedVariant) {
            unitPrice = parseFloat(selectedVariant.sale_price || selectedVariant.price);
            unitOriginalPrice = selectedVariant.sale_price ? parseFloat(selectedVariant.price) : null;

            priceDisplay = `৳${Math.round(unitPrice * quantity)}`;

            if (unitOriginalPrice) {
                originalPriceDisplay = `৳${Math.round(unitOriginalPrice * quantity)}`;
                discountPercent = Math.round(((unitOriginalPrice - unitPrice) / unitOriginalPrice) * 100);
            }
        } else {
            // No variant selected yet, so show the product's default price.
            // This keeps the initial PDP state aligned with the admin-defined base price.
            unitPrice = parseFloat(product.sale_price || product.price);
            unitOriginalPrice = product.sale_price ? parseFloat(product.price) : null;

            if (!Number.isNaN(unitPrice)) {
                priceDisplay = `৳${Math.round(unitPrice * quantity)}`;
            }

            if (unitOriginalPrice && !Number.isNaN(unitOriginalPrice)) {
                originalPriceDisplay = `৳${Math.round(unitOriginalPrice * quantity)}`;
                discountPercent = Math.round(((unitOriginalPrice - unitPrice) / unitOriginalPrice) * 100);
            }
        }
    } else {
        unitPrice = parseFloat(product.sale_price || product.price);
        unitOriginalPrice = product.sale_price ? parseFloat(product.price) : null;
        priceDisplay = `৳${Math.round(unitPrice * quantity)}`;
        if (unitOriginalPrice) {
            originalPriceDisplay = `৳${Math.round(unitOriginalPrice * quantity)}`;
            discountPercent = Math.round(((unitOriginalPrice - unitPrice) / unitOriginalPrice) * 100);
        }
    }

    const activeStock = product.type === 'variable' && selectedVariant
        ? selectedVariant.stock
        : product.stock;

    // Review statistics calculations
    const reviews = product.reviews || [];
    const totalReviews = reviews.length;
    const hasReviews = totalReviews > 0;
    const starsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const averageRating = hasReviews
        ? (reviews.reduce((sum, review) => {
            starsCount[review.rating] = (starsCount[review.rating] || 0) + 1;
            return sum + review.rating;
        }, 0) / totalReviews).toFixed(1)
        : null;

    // Question form state
    const reviewForm = useForm({
        rating: 5,
        comment: ''
    });

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        reviewForm.post(route('product.review.submit', { productId: product.id }), {
            onSuccess: () => reviewForm.reset('comment'),
        });
    };

    const questionForm = useForm({
        question: ''
    });

    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        questionForm.post(route('product.question.submit', { productId: product.id }), {
            onSuccess: () => questionForm.reset(),
        });
    };

    const sizeChartColumns = sizeChart?.columns || [];
    const sizeChartRows = sizeChart?.rows || [];
    const sizeChartTitle = sizeChart?.name || 'Size Guide';
    const sizeChartUnit = sizeChart?.unit || 'cm';
    const sizeChartHasContent = sizeChartColumns.length > 0 && sizeChartRows.length > 0;
    const firstCategory = product.categories?.[0] || null;
    const priceUnitLabel = product.price_unit?.code || product.priceUnit?.code || 'pcs';
    const displayPriceWithUnit = priceDisplay ? `${priceDisplay} / ${priceUnitLabel}` : '';
    const displayOriginalWithUnit = originalPriceDisplay ? `${originalPriceDisplay} / ${priceUnitLabel}` : '';
    const productSpecs = stripHtml(product.short_description)
        .split(/\n|•|;/)
        .map(item => item.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
    const youtubeEmbedUrl = getYouTubeEmbedUrl(product.video_url);
    const youtubeThumbnail = getYouTubeThumbnail(product.video_url);
    const mediaImages = product.images?.length ? product.images : [{ id: 'fallback', image_path: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' }];
    const activeIsVideo = activeImage === '__video__';
    const thumbLayoutSetting = global_settings.product_detail_thumb_layout || 'responsive';
    const forceHorizontalThumbs = thumbLayoutSetting === 'horizontal';
    const forceVerticalThumbs = thumbLayoutSetting === 'vertical';


    const resolvedBreadcrumbs = breadcrumbs && breadcrumbs.length > 0
        ? breadcrumbs
        : [
            { name: 'Home', url: route('home') },
            ...(firstCategory ? [{ name: firstCategory.name, url: route('category.show', firstCategory.slug) }] : []),
            { name: product.name, url: route('product.show', product.slug) }
        ];

    return (
        <ShopLayout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.meta_description} />
                {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
                <meta property="og:type" content="product" />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.meta_description} />
                {seo.og_image && <meta property="og:image" content={seo.og_image} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.title} />
                <meta name="twitter:description" content={seo.meta_description} />
                {seo.og_image && <meta name="twitter:image" content={seo.og_image} />}
                {seo.schema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(seo.schema).replace(/</g, '\\u003c')
                        }}
                    />
                )}
            </Head>
            <BreadcrumbSchema items={resolvedBreadcrumbs} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* Breadcrumb */}
                <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Link href={route('home')} className="hover:text-[#f05a28]">Home</Link>
                    {firstCategory && (
                        <>
                            <ChevronRight className="h-3 w-3 text-slate-300" />
                            <Link href={route('category.show', firstCategory.slug)} className="hover:text-[#f05a28]">{firstCategory.name}</Link>
                        </>
                    )}
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <span className="line-clamp-1 text-slate-700">{product.name}</span>
                </div>

                {/* Malamal-style product hero */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10 items-start">
                    <div className="min-w-0">
                        <div className={`${forceVerticalThumbs ? 'grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 md:grid-cols-[5rem_minmax(0,1fr)] md:gap-4' : forceHorizontalThumbs ? 'flex flex-col gap-3' : 'flex flex-col gap-3 md:flex-row md:gap-4'}`}>
                            {/* Thumbnail rail. Responsive mode uses mobile horizontal thumbs; Always Vertical uses this rail on every screen. */}
                            <div className={`${forceHorizontalThumbs ? 'order-2 flex w-full flex-row overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm' : forceVerticalThumbs ? 'flex max-h-[340px] w-16 flex-shrink-0 flex-col gap-2 overflow-y-auto pr-1 md:max-h-none md:w-20 md:gap-2.5 md:overflow-visible md:pr-0' : 'hidden w-20 flex-shrink-0 flex-col gap-2.5 md:flex'}`}>
                                {mediaImages.slice(0, 5).map((img, idx) => (
                                    <button
                                        key={img.id || idx}
                                        type="button"
                                        onClick={() => setActiveImage(img.image_path)}
                                        className={`h-16 w-16 flex-none overflow-hidden md:h-20 md:w-20 rounded-xl border-2 bg-white p-1 shadow-sm transition-all ${activeImage === img.image_path ? 'border-[#f05a28]' : 'border-slate-200 hover:border-[#f05a28]/50'}`}
                                    >
                                        <img src={img.image_path} className="h-full w-full rounded-lg object-cover" alt={product.name} />
                                    </button>
                                ))}

                                {youtubeEmbedUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveImage('__video__')}
                                        className={`relative h-16 w-16 flex-none overflow-hidden md:h-20 md:w-20 rounded-xl border-2 bg-slate-900 shadow-sm transition-all ${activeIsVideo ? 'border-[#f05a28]' : 'border-slate-200 hover:border-[#f05a28]/50'}`}
                                    >
                                        {youtubeThumbnail ? (
                                            <img src={youtubeThumbnail} className="h-full w-full object-cover opacity-80" alt="Product video" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/25 text-white">
                                            <PlayCircle className="h-7 w-7 fill-white/20" />
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="relative flex min-w-0 max-w-full flex-1 items-center justify-center overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm aspect-[4/3] md:min-h-[340px] xl:min-h-[440px] 2xl:min-h-[500px]">
                                {activeIsVideo && youtubeEmbedUrl ? (
                                    <iframe
                                        src={youtubeEmbedUrl}
                                        title={`${product.name} video`}
                                        className="h-full min-h-[220px] w-full rounded-2xl md:min-h-[340px] xl:min-h-[440px] 2xl:min-h-[500px]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div
                                        className="group h-full min-h-[220px] w-full cursor-zoom-in overflow-hidden rounded-2xl md:min-h-[340px] md:rounded-none xl:min-h-[440px] 2xl:min-h-[500px]"
                                        onMouseEnter={handleImageZoomMove}
                                        onMouseMove={handleImageZoomMove}
                                        onMouseLeave={() => setImageZoom({ active: false, x: 50, y: 50 })}
                                    >
                                        <img
                                            src={activeImage}
                                            className="h-full max-h-[500px] w-full object-cover transition-transform duration-150 ease-out"
                                            alt={product.name}
                                            style={{
                                                transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                                                transform: imageZoom.active ? 'scale(2.15)' : 'scale(1)',
                                            }}
                                        />
                                        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            Hover to zoom
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`${forceHorizontalThumbs || forceVerticalThumbs ? 'hidden' : 'flex'} gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm md:hidden`}>
                                {mediaImages.slice(0, 6).map((img, idx) => (
                                    <button
                                        key={`mobile-${img.id || idx}`}
                                        type="button"
                                        onClick={() => setActiveImage(img.image_path)}
                                        className={`h-16 w-16 flex-none overflow-hidden rounded-xl border-2 bg-white p-1 shadow-sm transition-all ${activeImage === img.image_path ? 'border-[#f05a28]' : 'border-slate-200'}`}
                                    >
                                        <img src={img.image_path} className="h-full w-full rounded-lg object-cover" alt={product.name} />
                                    </button>
                                ))}

                                {youtubeEmbedUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveImage('__video__')}
                                        className={`relative h-16 w-16 flex-none overflow-hidden rounded-xl border-2 bg-slate-900 shadow-sm transition-all ${activeIsVideo ? 'border-[#f05a28]' : 'border-slate-200'}`}
                                    >
                                        {youtubeThumbnail ? (
                                            <img src={youtubeThumbnail} className="h-full w-full object-cover opacity-80" alt="Product video" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/25 text-white">
                                            <PlayCircle className="h-6 w-6 fill-white/20" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {showQuotationSection && (
                        <div className="mt-4 hidden overflow-hidden rounded-3xl bg-[#163f6d] text-white shadow-sm xl:block">
                            <div className="p-5 md:flex md:items-center md:justify-between md:gap-5">
                                <div>
                                    <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]">Bulk Pricing</span>
                                    <h3 className="mt-3 text-xl font-black">Need a quotation?</h3>
                                    <p className="mt-2 max-w-md text-sm leading-6 text-white/85">Share your quantity and delivery location for project or retail orders.</p>
                                </div>
                                <Link href={route('quotation.request')} className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100 md:mt-0">
                                    Request quotation
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-3 text-[11px] font-bold text-white/80">
                                <span className="rounded-full bg-white/10 px-3 py-1">Bulk order support</span>
                                <span className="rounded-full bg-white/10 px-3 py-1">Corporate procurement</span>
                                <span className="rounded-full bg-white/10 px-3 py-1">Delivery coordination</span>
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="p-2 shadow-sm sm:p-5 lg:p-6">
                            {(product.settings?.custom_badge || product.badge) && (
                                <div className="mb-2.5">
                                    <span
                                        className="inline-block rounded-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs"
                                        style={{ backgroundColor: ribbonBadgeBg, color: ribbonBadgeText }}
                                    >
                                        {product.settings?.custom_badge || product.badge}
                                    </span>
                                </div>
                            )}
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-snug">{product.name}</h1>

                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                                <span>SKU: <span className="font-semibold text-slate-700">{product.sku || `G-${product.id}`}</span></span>
                                {product.brand && <span>Brand: <span className="font-semibold uppercase text-slate-700">{product.brand}</span></span>}
                                {firstCategory && <span>Category: <span className="font-semibold text-slate-700">{firstCategory.name}</span></span>}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
                                <div className="flex items-baseline gap-2 sm:gap-2.5">
                                    {displayOriginalWithUnit && <span className="text-xs sm:text-sm font-medium text-slate-400 line-through">{displayOriginalWithUnit}</span>}
                                    <span className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight leading-none" style={{ color: themePriceColor }}>{displayPriceWithUnit}</span>
                                    {discountPercent > 0 && (
                                        <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                                            -{discountPercent}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {productSpecs.length > 0 && (
                                <ul className="mt-5 space-y-2.5 text-sm font-medium leading-6 text-slate-700">
                                    {productSpecs.map((item, idx) => (
                                        <li key={idx} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-700" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {product.video_url && !youtubeEmbedUrl && (
                                <a href={product.video_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#f04a23] hover:underline">
                                    <PlayCircle className="h-4 w-4" /> Watch product video
                                </a>
                            )}

                            {showWhatsAppOrder && (
                                <a href={`https://wa.me/${cleanWhatsAppPhone}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-emerald-600 hover:underline">
                                    <WhatsAppIcon className="h-4 w-4 shrink-0" /> {whatsAppButtonText}
                                </a>
                            )}

                            {product.type === 'variable' && attributesList.map((attr, idx) => (
                                <div key={idx} className="mt-5 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700">Select {attr.name}</span>
                                        {attr.name.toLowerCase() === 'size' && sizeChart && (
                                            <button type="button" onClick={() => setIsSizeGuideOpen(true)} className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#f04a23]">Size Guide</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {attr.values.map((val) => {
                                            const isSelected = selectedOptions[attr.name] === val;
                                            const isOut = isOptionOutOfStock(attr.name, val);
                                            const optionImg = getOptionImage(attr.name, val);
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedOptions(prev => ({ ...prev, [attr.name]: val }));
                                                        if (optionImg) {
                                                            setActiveImage(optionImg);
                                                        }
                                                    }}
                                                    disabled={isOut}
                                                    className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                                                        optionImg ? 'p-1.5 pr-3' : 'h-10 min-w-10 px-3.5'
                                                    } ${
                                                        isSelected
                                                            ? 'border-[#f04a23] bg-orange-50 text-[#f04a23] shadow-xs ring-1 ring-[#f04a23]'
                                                            : isOut
                                                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 opacity-60'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-[#f04a23]/50 hover:bg-slate-50/50'
                                                    }`}
                                                >
                                                    {optionImg && (
                                                        <img
                                                            src={optionImg}
                                                            alt={val}
                                                            className="h-8 w-8 rounded-lg object-cover border border-slate-100 shrink-0"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <span>{val}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-[96px_1fr_1fr]">
                                <div className="flex h-12 items-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-11">
                                    <button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="h-full flex-1 text-slate-500 hover:bg-slate-50">-</button>
                                    <input type="text" value={quantity} readOnly className="h-full w-9 border-x border-slate-200 text-center text-sm font-bold focus:outline-none" />
                                    <button type="button" onClick={() => setQuantity(prev => Math.min(activeStock || 10, prev + 1))} className="h-full flex-1 text-slate-500 hover:bg-slate-50">+</button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    style={!isOutOfStock ? { backgroundColor: buttonAddToCartBg, color: buttonAddToCartText } : undefined}
                                    className={`h-12 whitespace-nowrap px-3 text-sm font-black transition-all ${buttonRadiusClass} ${buttonHoverClass} ${buttonAnimClass} sm:h-11 ${isOutOfStock ? 'bg-slate-300 text-white' : ''}`}
                                >
                                    Add To Cart
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock}
                                    style={!isOutOfStock ? { backgroundColor: buttonBuyNowBg, color: buttonBuyNowText } : undefined}
                                    className={`h-12 whitespace-nowrap px-3 text-sm font-black transition-all ${buttonRadiusClass} ${buttonHoverClass} ${buttonAnimClass} sm:h-11 ${isOutOfStock ? 'bg-slate-300 text-white' : ''}`}
                                >
                                    Buy Now
                                </button>
                                {showCallForOrder && cleanCallForOrderPhone && (
                                    <a
                                        href={`tel:${cleanCallForOrderPhone}`}
                                        className={`flex h-12 items-center justify-center gap-2 whitespace-nowrap bg-[#29469b] px-3 text-sm font-black text-white shadow-sm transition-all hover:bg-[#213b86] sm:col-start-2 sm:col-span-2 sm:h-11 ${buttonRadiusClass}`}
                                    >
                                        <Phone className="h-4 w-4" />
                                        {callForOrderText}
                                    </a>
                                )}
                            </div>

                            {((compareEnabled && showCompareButton) || showWishlistButton || showSocialShare) && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                                    {compareEnabled && showCompareButton && (
                                        <button type="button" onClick={handleCompareClick} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold ${compared ? 'border-[#f04a23] bg-orange-50 text-[#f04a23]' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <GitCompare className="h-3.5 w-3.5" />
                                            {compared ? 'Compared' : 'Compare'}
                                        </button>
                                    )}
                                    {compareEnabled && showCompareButton && compared && (
                                        <Link href={compareUrl()} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-50">
                                            View Compare
                                        </Link>
                                    )}
                                    {showWishlistButton && (
                                        <button type="button" onClick={handleWishlistClick} className={`rounded-lg border px-4 py-2 text-xs font-bold ${wishlisted ? 'border-[#f04a23] bg-orange-50 text-[#f04a23]' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            Wishlist
                                        </button>
                                    )}
                                    {showSocialShare && (
                                        <div className="ml-auto flex items-center gap-3 text-slate-400">
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-xs font-bold">f</span>
                                            <span className="text-xs font-bold">x</span>
                                            <span className="text-xs font-bold">in</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {showQuotationSection && (
                        <div className="mt-4 overflow-hidden rounded-3xl bg-[#163f6d] text-white shadow-sm xl:hidden">
                            <div className="p-5">
                                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]">Bulk Pricing</span>
                                <h3 className="mt-3 text-xl font-black">Need a quotation?</h3>
                                <p className="mt-2 text-sm leading-6 text-white/85">Share your quantity and delivery location for project or retail orders.</p>
                                <Link href={route('quotation.request')} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
                                    Request quotation
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-3 text-[11px] font-bold text-white/80">
                                <span className="rounded-full bg-white/10 px-3 py-1">Bulk order support</span>
                                <span className="rounded-full bg-white/10 px-3 py-1">Corporate procurement</span>
                                <span className="rounded-full bg-white/10 px-3 py-1">Delivery coordination</span>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                {/* Description & Reviews block (modern tabbed layout) */}
                <div className="mt-14 pt-8 border-t border-slate-150">
                    <div className="flex gap-6 border-b border-slate-100 pb-3 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`text-sm font-bold pb-2 relative transition-all whitespace-nowrap ${
                                activeTab === 'description'
                                    ? 'text-[#e51b75]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            Description
                            {activeTab === 'description' && (
                                <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#e51b75]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`text-sm font-bold pb-2 relative transition-all whitespace-nowrap ${
                                activeTab === 'reviews'
                                    ? 'text-[#e51b75]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            Reviews {totalReviews > 0 ? `(${totalReviews})` : ''}
                            {activeTab === 'reviews' && (
                                <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#e51b75]" />
                            )}
                        </button>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'description' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8 border border-pink-200 rounded-2xl p-5 md:p-7 bg-white text-xs md:text-sm text-slate-700 leading-relaxed font-medium shadow-sm">
                                    <div
                                        className="space-y-4"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>

                                <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Reviews</p>
                                            <h3 className="mt-1 text-lg font-black text-slate-900">
                                                {hasReviews ? `${averageRating}/5` : 'No rating yet'}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#e51b75]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${hasReviews && i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="mt-3 text-xs text-slate-500 leading-6">
                                        {hasReviews
                                            ? `${totalReviews} approved review${totalReviews > 1 ? 's' : ''} from customers.`
                                            : 'Be the first customer to share a review after purchase.'}
                                    </p>

                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#e51b75] border border-pink-200 hover:bg-pink-50 transition-all"
                                    >
                                        Write a review
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 md:p-6 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-5xl font-black text-slate-900 leading-none">
                                            {hasReviews ? averageRating : '0.0'}
                                        </div>
                                        <div className="mt-2 flex justify-center gap-1 text-[#e51b75]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${hasReviews && i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                            {hasReviews ? 'Verified Buyers' : 'No reviews yet'}
                                        </p>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        {[5, 4, 3, 2, 1].map((stars) => {
                                            const count = starsCount[stars] || 0;
                                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                                            return (
                                                <div key={stars} className="flex items-center gap-3 text-xs">
                                                    <span className="w-3 text-slate-500 font-bold text-right">{stars}</span>
                                                    <Star className="w-3 h-3 text-[#e51b75] fill-current" />
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#e51b75] rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-4 text-slate-400 text-right font-semibold">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="lg:col-span-8 space-y-6">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">Write a review</h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Reviews are submitted for admin approval before they appear publicly.
                                                </p>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Verified buyers</span>
                                        </div>

                                        {auth?.user ? (
                                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[11px] font-bold uppercase text-slate-500">Rating</label>
                                                        <select
                                                            value={reviewForm.data.rating}
                                                            onChange={e => reviewForm.setData('rating', parseInt(e.target.value, 10))}
                                                            className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#e51b75] focus:outline-none"
                                                            required
                                                        >
                                                            {[5, 4, 3, 2, 1].map(value => (
                                                                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold uppercase text-slate-500">Name</label>
                                                        <input
                                                            type="text"
                                                            value={auth.user.name}
                                                            readOnly
                                                            className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-bold uppercase text-slate-500">Comment</label>
                                                    <textarea
                                                        value={reviewForm.data.comment}
                                                        onChange={e => reviewForm.setData('comment', e.target.value)}
                                                        rows={4}
                                                        className="w-full mt-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#e51b75] focus:outline-none"
                                                        placeholder="Tell others what you liked, what could be better, and how the product performed."
                                                    />
                                                    {reviewForm.errors.comment && (
                                                        <div className="text-red-500 text-[11px] mt-1">{reviewForm.errors.comment}</div>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center justify-center rounded-3xl bg-[#e51b75] px-5 py-3 text-sm font-bold text-white hover:bg-[#c2185b] transition-all"
                                                >
                                                    Submit Review
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                                                Please <Link href={route('login')} className="font-bold text-[#e51b75] hover:underline">login</Link> to submit a review.
                                            </div>
                                        )}
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((rev) => (
                                                <div key={rev.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900">{rev.user?.name || 'Guest'}</div>
                                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                                                <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>Verified purchase</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex text-[#e51b75] gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 text-sm text-slate-600 leading-7">
                                                        {rev.comment || 'No comment provided.'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-[#e51b75]">
                                                <Star className="h-6 w-6" />
                                            </div>
                                            <h4 className="mt-4 text-lg font-black text-slate-900">No reviews yet</h4>
                                            <p className="mt-2 text-sm text-slate-500 leading-7 max-w-md mx-auto">
                                                Once a customer submits a review and it is approved by admin, it will appear here automatically.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Curations Section */}
                {related?.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-base font-extrabold text-slate-800 mb-6 uppercase tracking-wider">
                            Related Curations
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {related.map((prod) => {
                                const prodOrigPrice = parseFloat(prod.price || 0);
                                const prodSalePrice = prod.sale_price ? parseFloat(prod.sale_price) : null;
                                const prodHasDiscount = prodSalePrice !== null && !isNaN(prodSalePrice) && prodOrigPrice > 0 && prodSalePrice < prodOrigPrice;
                                const prodDiscountPercent = prodHasDiscount ? Math.round(((prodOrigPrice - prodSalePrice) / prodOrigPrice) * 100) : 0;

                                return (
                                    <Link 
                                        key={prod.id} 
                                        href={route('product.show', { slug: prod.slug })}
                                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div className="aspect-square bg-slate-50 overflow-hidden relative">
                                            <img src={prod.primary_image?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="" />
                                            {prodHasDiscount && (
                                                <span className="absolute top-2.5 left-2.5 z-10 bg-rose-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                                    {prodDiscountPercent > 0 ? `-${prodDiscountPercent}%` : 'Discount'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-slate-50">
                                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-[#e51b75] transition-all">{prod.name}</h4>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="text-sm font-extrabold text-slate-900">৳{Number(prodHasDiscount ? prodSalePrice : (prodSalePrice || prodOrigPrice || 0)).toLocaleString()}</span>
                                                {prodHasDiscount && (
                                                    <span className="text-xs font-semibold text-slate-400 line-through">৳{Number(prodOrigPrice).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {isSizeGuideOpen && sizeChart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)}>
                    <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">
                                    Size Guide
                                </div>
                                <h3 className="mt-3 text-xl font-black text-slate-900">{sizeChartTitle}</h3>
                                <p className="mt-1 text-sm text-slate-500">Unit: {sizeChartUnit}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSizeGuideOpen(false)}
                                className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
                                    <div className="border-b border-slate-200 bg-white px-4 py-4">
                                        <h4 className="text-sm font-bold text-slate-900">Measurement Table</h4>
                                        {sizeChart.description && (
                                            <p className="mt-1 text-xs text-slate-500">{sizeChart.description}</p>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto p-4">
                                        {sizeChartHasContent ? (
                                            <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                            Size
                                                        </th>
                                                        {sizeChartColumns.map((column) => (
                                                            <th key={column.id} className="border-b border-slate-200 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                                {column.name} ({sizeChartUnit})
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sizeChartRows.map((row) => (
                                                        <tr key={row.id}>
                                                            <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-900">{row.label}</td>
                                                            {sizeChartColumns.map((column) => {
                                                                const cellValue = row.values?.find((value) => value.size_chart_column_id === column.id)?.value || '-';
                                                                return (
                                                                    <td key={`${row.id}-${column.id}`} className="border-b border-slate-100 px-4 py-3 text-slate-600">
                                                                        {cellValue}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                                This size guide is still being configured.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col gap-4">
                                {sizeChart.image_path && (
                                    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                                        <div className="border-b border-slate-200 px-4 py-3">
                                            <h4 className="text-sm font-bold text-slate-900">How to measure</h4>
                                        </div>
                                        <div className="aspect-[4/3] bg-slate-100">
                                            <img src={sizeChart.image_path} alt={sizeChartTitle} className="h-full w-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                {sizeChart.measurement_instructions && (
                                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                                        <h4 className="text-sm font-bold text-slate-900">Instructions</h4>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                                            {sizeChart.measurement_instructions}
                                        </p>
                                    </div>
                                )}

                                {!sizeChart.image_path && !sizeChart.measurement_instructions && (
                                    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                        Add an image or measurement instructions in admin to make this size guide more helpful.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}








