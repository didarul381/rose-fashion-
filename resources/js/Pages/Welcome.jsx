import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ChevronRight, Heart, ShoppingBag, ShoppingCart, Star, X } from 'lucide-react';
import ShopLayout from '../Layouts/ShopLayout';
import { useCart } from '../Contexts/CartContext';
import { useStoreName } from '../Hooks/useStoreName';

export default function Welcome({ sections = [], settings = {}, home_categories = [], all_products = [], active_flash_sale }) {
    const storeName = useStoreName();
    const { global_settings = {} } = usePage().props;
    const { addToCart } = useCart();
    const [toastMessage, setToastMessage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const handleAdd = (product) => {
        addToCart(product, null, 1);
        setToastMessage(`Added "${product.name}" to shopping bag!`);
    };

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => {
            setToastMessage(null);
        }, 3500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const handleSelectCategory = (categorySlug) => {
        setActiveCategory(categorySlug || 'all');
        const element = document.getElementById('shop-products');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const renderSection = (section) => {
        const sectionSettings = section.settings || {};
        switch (section.type) {
            case 'hero_slider':
            case 'hero_banner':
                return <RoseFashionHero key={section.id} settings={sectionSettings} />;
            case 'category_grid':
                return (
                    <RoseFashionCategoryGrid
                        key={section.id}
                        settings={sectionSettings}
                        categories={home_categories}
                        onSelectCategory={handleSelectCategory}
                    />
                );
            case 'products_tabs':
            case 'product_shelf':
                return (
                    <RoseFashionProductsSection
                        key={section.id}
                        settings={sectionSettings}
                        all_products={all_products}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        onAddToCart={handleAdd}
                    />
                );
            case 'feature_badges':
            case 'experience_features':
                return <RoseFashionWhyUsSection key={section.id} settings={sectionSettings} />;
            default:
                return null;
        }
    };

    return (
        <ShopLayout>
            <Head title={settings.site_title || global_settings.site_title || "Rose Fashion | Dhaka New Market | Timeless Elegance"} />

            <div className="min-h-screen">
                {sections.map(renderSection)}

                {sections.length === 0 && (
                    <div className="py-24 text-center">
                        <h1 className="text-2xl font-extrabold text-slate-900">Your homepage is ready to build</h1>
                        <p className="mt-2 text-sm text-slate-500">Enable sections from Admin Page Builder to display content.</p>
                    </div>
                )}
            </div>

            {/* Notification Toast Message Box */}
            <div
                className={`fixed bottom-6 right-6 z-50 transition-all duration-300 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm border border-slate-800 ${
                    toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
                }`}
            >
                <div className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                </div>
                <span>{toastMessage}</span>
            </div>
        </ShopLayout>
    );
}

function RoseFashionHero({ settings = {} }) {
    const badgeText = settings.badge_text || "Dhaka New Market's Premier Fashion Destination";
    const headline = settings.headline || "Exquisite Sarees & Bridal Collections";
    const highlightWord = settings.highlight_word || "Sarees";
    const subtitle = settings.subtitle || "Discover authentic Jamdani fabrics, bridal lehengas, and designer sarees directly from our Dhaka New Market storefront with nationwide delivery.";
    const bgImage = settings.bg_image || "/banner-bg.png";
    const primaryButtonText = settings.primary_button_text || "Explore Collection";
    const primaryButtonLink = settings.primary_button_link || "#shop-products";
    const secondaryButtonText = settings.secondary_button_text || "Message on Facebook";
    const secondaryButtonLink = settings.secondary_button_link || "https://www.facebook.com/share/18Ttrev5mS/";

    const trust1 = settings.trust_badge_1 || "100% Authentic Quality";
    const trust2 = settings.trust_badge_2 || "New Market Dhaka";
    const trust3 = settings.trust_badge_3 || "Fast BD Delivery";

    const cardBadge = settings.card_badge || "New Arrival";
    const cardImage = settings.card_image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800";
    const cardTag = settings.card_tag || "Handloom Masterpiece";
    const cardTitle = settings.card_title || "Royal Crimson Jamdani";
    const cardPrice = settings.card_price || "Starting from ৳ 4,500";
    const cardLocation = settings.card_location || "Dhaka New Market Shop #214";
    const cardChatLink = settings.card_chat_link || "https://www.facebook.com/share/18Ttrev5mS/";

    const parts = highlightWord && headline.includes(highlightWord)
        ? headline.split(highlightWord)
        : null;

    return (
        <section
            className="relative text-white overflow-hidden py-16 sm:py-20 lg:py-28"
            style={{
                background: `url('${bgImage}') center/cover no-repeat, #0f172a`
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-rose-950/50"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-rose-900/80 border border-rose-700/50 text-rose-200 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-inner">
                            <span className="text-amber-400 animate-spin" style={{ animationDuration: '6s', display: 'inline-block' }}>👑</span>
                            <span>{badgeText}</span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
                            {parts ? (
                                <>
                                    {parts[0]}
                                    <span className="text-rose-400 italic font-serif mx-1">{highlightWord}</span>
                                    {parts[1]}
                                </>
                            ) : headline}
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                            {subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <a
                                href={primaryButtonLink}
                                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg glow-btn transition transform hover:-translate-y-1 text-center inline-flex items-center justify-center gap-2"
                            >
                                <span>{primaryButtonText}</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </a>
                            <a
                                href={secondaryButtonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full transition text-center flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                <span>{secondaryButtonText}</span>
                            </a>
                        </div>
                        {/* Trust Badges */}
                        <div className="pt-6 grid grid-cols-3 gap-4 border-t border-rose-900/60 max-w-lg mx-auto lg:mx-0 text-slate-300 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <span className="text-rose-400 font-bold text-base">🛡️</span>
                                <span>{trust1}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <span className="text-rose-400 font-bold text-base">🏬</span>
                                <span>{trust2}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <span className="text-rose-400 font-bold text-base">🚚</span>
                                <span>{trust3}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual Banner Card */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-md bg-gradient-to-b from-rose-900/40 to-slate-900/60 p-6 rounded-3xl border border-rose-500/30 shadow-2xl backdrop-blur-md transform hover:scale-[1.02] transition duration-500">
                            {cardBadge && (
                                <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider animate-bounce">
                                    {cardBadge}
                                </div>
                            )}
                            <div className="overflow-hidden rounded-2xl h-80 bg-rose-900/20 relative group">
                                <img
                                    src={cardImage}
                                    alt={cardTitle}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                                    <div>
                                        <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider">{cardTag}</span>
                                        <h3 className="font-serif text-2xl font-bold text-white mt-0.5">{cardTitle}</h3>
                                        <p className="text-slate-300 text-sm mt-1">{cardPrice}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-300 px-2">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <span className="text-rose-500">📍</span> {cardLocation}
                                </span>
                                <a href={cardChatLink} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline font-medium">
                                    Chat on Facebook &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RoseFashionCategoryGrid({ settings = {}, onSelectCategory }) {
    const tag = settings.tag || "Curated Collections";
    const title = settings.title || "Explore Our Signature Categories";
    const subtitle = settings.subtitle || "From traditional Bangladeshi handlooms to modern designer party wear sarees and lehengas.";
    const items = settings.items && settings.items.length > 0 ? settings.items : [
        {
            title: "Premium Jamdani Sarees",
            subtitle: "Handwoven masterclass drapes carrying rich cultural heritage of Bengal.",
            image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
            badge: "Handloom",
            category_slug: "jamdani",
        },
        {
            title: "Bridal & Party Lehengas",
            subtitle: "Stunning embroidered lehengas tailored for weddings, receptions, and festivals.",
            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
            badge: "Bridal & Party",
            category_slug: "lehengas",
        },
        {
            title: "Designer Sarees",
            subtitle: "Georgette, silk, chiffon, and katan sarees with sophisticated zari work.",
            image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600",
            badge: "Exclusive",
            category_slug: "designer-sarees",
        }
    ];

    return (
        <section id="collections" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-rose-600 font-semibold text-sm uppercase tracking-widest">{tag}</span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">{title}</h2>
                    <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">{subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 border border-slate-100 flex flex-col transform hover:-translate-y-2"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                                {item.badge && (
                                    <span className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow justify-between">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                                        {item.subtitle || item.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onSelectCategory ? onSelectCategory(item.category_slug || item.slug) : null}
                                    className="mt-6 inline-flex items-center text-sm font-semibold text-rose-600 hover:text-rose-700 group-hover:translate-x-1 transition text-left cursor-pointer"
                                >
                                    <span>
                                        {item.button_text || (
                                            item.title?.toLowerCase().includes('jamdani') ? 'View Jamdani' :
                                            item.title?.toLowerCase().includes('lehenga') ? 'View Lehengas' :
                                            item.title?.toLowerCase().includes('saree') ? 'View Sarees' :
                                            `View ${item.title}`
                                        )}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function RoseFashionProductsSection({ settings = {}, all_products = [], activeCategory, setActiveCategory, onAddToCart }) {
    const tag = settings.tag || "Handpicked Selections";
    const title = settings.title || "Best Sellers & New Arrivals";

    const tabs = settings.tabs && settings.tabs.length > 0 ? settings.tabs : [
        { label: "All Items", slug: "all" },
        { label: "Jamdani", slug: "jamdani" },
        { label: "Lehengas", slug: "lehengas" },
        { label: "Designer Sarees", slug: "designer-sarees" },
    ];

    const filteredProducts = useMemo(() => {
        if (!activeCategory || activeCategory === 'all') return all_products;
        return all_products.filter(p => {
            const inCat = p.categories?.some(c => c.slug === activeCategory || c.name?.toLowerCase().includes(activeCategory.toLowerCase()));
            const inSetting = p.settings?.category_slug === activeCategory;
            const inName = p.name?.toLowerCase().includes(activeCategory.toLowerCase());
            return inCat || inSetting || inName;
        });
    }, [all_products, activeCategory]);

    return (
        <section id="shop-products" className="py-20 bg-slate-100/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-rose-600 font-semibold text-sm uppercase tracking-widest">{tag}</span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">{title}</h2>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
                        {tabs.map(tab => {
                            const isActive = (activeCategory === tab.slug) || (!activeCategory && tab.slug === 'all');
                            return (
                                <button
                                    key={tab.slug}
                                    onClick={() => setActiveCategory(tab.slug)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-semibold transition transform hover:scale-105 cursor-pointer ${
                                        isActive
                                            ? 'bg-rose-600 text-white shadow-md'
                                            : 'bg-white text-slate-700 hover:bg-rose-50 border border-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Product Grid with Dual-Image Hover Effect */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No products found in this category.
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <RoseFashionProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

function RoseFashionProductCard({ product, onAddToCart }) {
    const primaryImg = product.primary_image?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600';
    const secondaryImg = product.images?.[1]?.image_path || product.settings?.secondary_image || primaryImg;
    const badge = product.settings?.custom_badge || (product.labels && product.labels[0]) || (product.is_featured ? 'Bestseller' : null);
    const categoryName = product.categories?.[0]?.name || product.settings?.category_slug || 'Fashion';

    return (
        <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 border border-slate-100 flex flex-col group transform hover:-translate-y-2">
            <Link href={route('product.show', { slug: product.slug })} className="h-72 overflow-hidden relative bg-slate-100 cursor-pointer block">
                {/* Primary Image */}
                <img
                    src={primaryImg}
                    alt={product.name}
                    className="img-primary absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
                {/* Secondary Image for Dual-Image Hover Preview */}
                <img
                    src={secondaryImg}
                    alt={`${product.name} alternate view`}
                    className="img-secondary absolute inset-0 w-full h-full object-cover"
                />
                {badge && (
                    <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        {badge}
                    </span>
                )}
            </Link>

            <div className="p-6 flex flex-col flex-grow justify-between bg-white">
                <div>
                    <span className="text-xs uppercase tracking-wider text-rose-600 font-semibold">{categoryName}</span>
                    <Link href={route('product.show', { slug: product.slug })}>
                        <h3 className="font-serif text-lg font-bold text-slate-900 mt-1 group-hover:text-rose-600 transition line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">
                        ৳ {Number(product.sale_price || product.price || 0).toLocaleString()}
                    </span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-full transition duration-300 flex items-center gap-1.5 shadow-sm transform hover:scale-105 cursor-pointer"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function RoseFashionWhyUsSection({ settings = {} }) {
    const tag = settings.tag || "Our Legacy";
    const title = settings.title || "Why Customers Trust Rose Fashion";
    const subtitle = settings.subtitle || "Rooted in Dhaka New Market with hundreds of happy clients across Bangladesh.";

    const items = settings.items && settings.items.length > 0 ? settings.items : [
        {
            icon: "store",
            title: "Dhaka New Market Store",
            text: "Visit our physical storefront at Dhaka New Market for direct touch-and-feel shopping of sarees and fabrics.",
        },
        {
            icon: "gem",
            title: "Authentic Collections",
            text: "Handpicked authentic Jamdani weaves, premium silk katan, and exquisite bridal lehengas.",
        },
        {
            icon: "truck",
            title: "Secure Nationwide Delivery",
            text: "Reliable packaging and fast home delivery services across Dhaka and all districts of Bangladesh.",
        },
    ];

    const showTestimonial = settings.show_testimonial !== 'no';
    const quote = settings.testimonial_quote || '"Rose Fashion in New Market is my go-to place for Jamdani sarees. Their online selection and quick Facebook messenger support made ordering from home so convenient!"';
    const author = settings.testimonial_author || "Farzana Rahman";
    const authorTag = settings.testimonial_author_tag || "Verified Customer, Dhaka";

    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-rose-600 font-semibold text-sm uppercase tracking-widest">{tag}</span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">{title}</h2>
                    <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">{subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-2xl bg-rose-50/50 border border-rose-100 text-center transform hover:-translate-y-2 transition duration-300 shadow-sm hover:shadow-xl"
                        >
                            <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-md">
                                {item.icon === 'gem' ? '💎' : item.icon === 'truck' ? '📦' : '🏬'}
                            </div>
                            <h3 className="font-serif text-xl font-bold text-slate-900">{item.title}</h3>
                            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{item.text || item.description}</p>
                        </div>
                    ))}
                </div>

                {showTestimonial && (
                    <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 text-rose-900/40 text-9xl font-serif select-none pointer-events-none">“</div>
                        <div className="max-w-3xl mx-auto text-center relative z-10">
                            <div className="flex justify-center text-amber-400 gap-1 mb-4 text-base">
                                {'★'.repeat(5)}
                            </div>
                            <p className="font-serif text-xl sm:text-2xl italic leading-relaxed text-white">
                                {quote}
                            </p>
                            <h4 className="font-semibold text-rose-400 mt-6">- {author}</h4>
                            <span className="text-xs text-slate-400 uppercase tracking-widest">{authorTag}</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
