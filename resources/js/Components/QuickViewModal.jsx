import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { X, Star, Heart, ShoppingBag, Check, Share2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { getWishlistItems, toggleWishlistProduct } from '../Services/Wishlist';
import { useCart } from '../Contexts/CartContext';

function stripHtml(value = '') {
    return String(value || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart, settings = {} }) {
    if (!isOpen || !product) return null;

    const cartCtx = useCart();
    const pageProps = usePage()?.props || {};
    const globalSettings = { ...pageProps.global_settings, ...settings };
    const primaryColor = globalSettings.card_button_bg_color || globalSettings.primary_color || '#e11d48';

    const hasVariants = (product.type === 'variable' || product.type === 'option') && product.variants?.length > 0;

    // Attributes list
    const attributesList = useMemo(() => {
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

    // Selected options state
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

    const selectedVariant = useMemo(() => {
        if (!hasVariants) return null;
        return product.variants.find(v => matchesVariant(v, selectedOptions)) || null;
    }, [hasVariants, product.variants, selectedOptions]);

    const isOptionOutOfStock = (attrName, val) => {
        if (!hasVariants) return false;
        const testOpts = { ...selectedOptions, [attrName]: val };
        const matched = product.variants.find(v => matchesVariant(v, testOpts));
        return matched ? Number(matched.stock || 0) <= 0 : true;
    };

    const isOutOfStock = hasVariants
        ? (selectedVariant ? Number(selectedVariant.stock || 0) <= 0 : !product.variants.some(v => Number(v.stock || 0) > 0))
        : Number(product.stock || 0) <= 0 && product.type !== 'digital';

    // Images
    const allImages = useMemo(() => {
        const imgs = [];
        if (selectedVariant?.image_path) {
            imgs.push({ id: `var-${selectedVariant.id}`, image_path: selectedVariant.image_path });
        }
        if (product.primary_image?.image_path && !imgs.some(i => i.image_path === product.primary_image.image_path)) {
            imgs.push(product.primary_image);
        }
        if (product.images?.length) {
            product.images.forEach(img => {
                if (!imgs.some(i => i.image_path === img.image_path)) {
                    imgs.push(img);
                }
            });
        }
        if (imgs.length === 0) {
            imgs.push({ id: 'fallback', image_path: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600' });
        }
        return imgs;
    }, [product, selectedVariant]);

    const [activeImage, setActiveImage] = useState(
        selectedVariant?.image_path || product.primary_image?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'
    );

    // Sync active image if selected variant changes
    useEffect(() => {
        if (selectedVariant?.image_path) {
            setActiveImage(selectedVariant.image_path);
        }
    }, [selectedVariant]);

    // Quantity state
    const [quantity, setQuantity] = useState(1);
    const maxStock = hasVariants && selectedVariant ? Number(selectedVariant.stock || 1) : Number(product.stock || 99);

    // Pricing
    const originalPrice = parseFloat(selectedVariant?.price || product.price || 0);
    const salePrice = (selectedVariant?.sale_price !== null && selectedVariant?.sale_price !== undefined && selectedVariant?.sale_price !== '')
        ? parseFloat(selectedVariant.sale_price)
        : (product.sale_price !== null && product.sale_price !== undefined && product.sale_price !== ''
            ? parseFloat(product.sale_price)
            : null);
    const hasDiscount = salePrice !== null && !isNaN(salePrice) && originalPrice > 0 && salePrice < originalPrice;
    const currentPrice = hasDiscount ? salePrice : (salePrice || originalPrice || 0);
    const discountPercent = hasDiscount && originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    // Wishlist
    const [wishlisted, setWishlisted] = useState(false);
    useEffect(() => {
        const syncWishlist = () => {
            const items = getWishlistItems();
            setWishlisted(items.some(item => item.wishlistId === `p-${product.id}`));
        };
        syncWishlist();
        window.addEventListener('govaly-wishlist-changed', syncWishlist);
        return () => window.removeEventListener('govaly-wishlist-changed', syncWishlist);
    }, [product.id]);

    const handleWishlistToggle = () => {
        const { added } = toggleWishlistProduct(product);
        setWishlisted(added);
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Reviews & Meta
    const approvedReviews = (product.reviews || []).filter(r => r?.is_approved !== false);
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
        ? approvedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
        : 5;

    const categoryName = product.categories?.[0]?.name || product.settings?.category_slug || 'Fashion';
    const badgeText = product.settings?.custom_badge || (product.labels && product.labels[0]) || (product.is_featured ? 'Bestseller' : null);
    const shortDesc = stripHtml(product.short_description || product.description || 'Premium curated design crafted with high-quality authentic fabrics. Fast nationwide home delivery across Bangladesh.');

    const handleAddToCartClick = () => {
        if (isOutOfStock) return;
        if (typeof onAddToCart === 'function') {
            onAddToCart(product, selectedVariant, quantity);
        } else if (cartCtx?.addToCart) {
            cartCtx.addToCart(product, selectedVariant, quantity);
        }
        onClose();
    };

    const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : '';

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition shadow-xs cursor-pointer"
                    aria-label="Close Quick View"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                        {/* Left: Product Images & Gallery */}
                        <div className="flex flex-col gap-3">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition duration-300"
                                />

                                {/* Badges */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                                    {hasDiscount && (
                                        <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                                            Sale {discountPercent > 0 ? `-${discountPercent}%` : ''}
                                        </span>
                                    )}
                                    {badgeText && (
                                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                                            {badgeText}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Thumbnails (if multiple images) */}
                            {allImages.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={img.id || idx}
                                            type="button"
                                            onClick={() => setActiveImage(img.image_path)}
                                            onMouseEnter={() => setActiveImage(img.image_path)}
                                            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 flex-none overflow-hidden p-0.5 bg-white transition cursor-pointer ${
                                                activeImage === img.image_path ? 'border-rose-600 ring-2 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <img
                                                src={img.image_path}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="h-full w-full rounded-lg object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info, Options & Actions */}
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                                {categoryName}
                            </span>

                            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">
                                {product.name}
                            </h2>

                            {/* Price */}
                            <div className="mt-3 flex items-baseline gap-2.5">
                                <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                    ৳ {Number(currentPrice).toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm font-semibold text-slate-400 line-through">
                                        ৳ {Number(originalPrice).toLocaleString()}
                                    </span>
                                )}
                                {hasDiscount && (
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                        Save {discountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="mt-2.5 flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-200'}`}
                                    />
                                ))}
                                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                                    ({reviewCount > 0 ? `${reviewCount} reviews` : '5 reviews'})
                                </span>
                            </div>

                            {/* Short Description */}
                            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                                {shortDesc}
                            </p>

                            {/* Variant Options Selection */}
                            {hasVariants && attributesList.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                                    {attributesList.map((attr) => (
                                        <div key={attr.name} className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-slate-800">
                                                {attr.name}: <span className="font-semibold text-rose-600">{selectedOptions[attr.name] || 'Select'}</span>
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {attr.values.map((val) => {
                                                    const isSelected = selectedOptions[attr.name] === val;
                                                    const outOfStock = isOptionOutOfStock(attr.name, val);
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: val }))}
                                                            disabled={outOfStock}
                                                            className={`min-w-[34px] h-8 px-3 flex items-center justify-center text-xs font-bold rounded-lg uppercase transition-all cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-rose-600 text-white border-2 border-rose-600 shadow-xs'
                                                                    : outOfStock
                                                                        ? 'bg-slate-50 text-slate-300 border border-slate-200 line-through cursor-not-allowed opacity-50'
                                                                        : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-400 hover:text-rose-600'
                                                            }`}
                                                        >
                                                            {val}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quantity & Add to Cart */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                                {/* Quantity Counter */}
                                <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 h-10 px-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition cursor-pointer text-sm font-bold"
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition cursor-pointer text-sm font-bold"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Add To Cart Button */}
                                {isOutOfStock ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="flex-1 h-10 px-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center"
                                    >
                                        Sold Out
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddToCartClick}
                                        className="flex-1 h-10 px-6 rounded-full text-white text-xs font-bold tracking-wide shadow-md transition duration-200 flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 cursor-pointer"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Add To Cart</span>
                                    </button>
                                )}
                            </div>

                            {/* Wishlist & Links */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={handleWishlistToggle}
                                    className={`inline-flex items-center gap-1.5 font-semibold transition cursor-pointer ${
                                        wishlisted ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                                    }`}
                                >
                                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                                    <span>{wishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
                                </button>

                                <Link
                                    href={route('product.show', { slug: product.slug })}
                                    onClick={onClose}
                                    className="font-bold text-rose-600 hover:underline inline-flex items-center gap-1"
                                >
                                    <span>View Full Details</span>
                                    <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </div>

                            {/* Social Share */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span className="font-semibold text-slate-600">Share:</span>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition"
                                        title="Share on Facebook"
                                    >
                                        <span className="text-[11px] font-bold">f</span>
                                    </a>
                                    <a
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name}${selectedVariant?.title || selectedVariant?.name ? ` (${selectedVariant.title || selectedVariant.name})` : ''} - ৳${Number(currentPrice || 0).toLocaleString()}\n${productUrl}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:opacity-90 transition"
                                        title="Share on WhatsApp"
                                    >
                                        <WhatsAppIcon className="w-4 h-4 fill-current text-white" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (navigator.clipboard) {
                                                navigator.clipboard.writeText(productUrl);
                                                window.dispatchEvent(new CustomEvent('govaly-toast', {
                                                    detail: { type: 'success', text: 'Product link copied to clipboard!' }
                                                }));
                                            }
                                        }}
                                        className="h-7 px-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                                        title="Copy Link"
                                    >
                                        <Share2 className="w-3 h-3" />
                                        <span>Copy Link</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
