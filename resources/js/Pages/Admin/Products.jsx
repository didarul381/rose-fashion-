import { useStoreName } from '../../Hooks/useStoreName';
import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminImage from '../../Components/AdminImage';
import SummernoteEditor from '../../Components/SummernoteEditor';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit3, X, Save, AlertCircle, Upload, Loader2 } from 'lucide-react';


function plainText(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function calculateSeoScore(data) {
    let score = 0;
    const metaTitleLength = plainText(data.meta_title).length;
    const metaDescriptionLength = plainText(data.meta_description).length;
    const shortDescriptionLength = plainText(data.short_description).length;
    const fullDescriptionLength = plainText(data.description).length;

    if (data.name) score += 10;
    if (metaTitleLength >= 45 && metaTitleLength <= 65) score += 20;
    else if (metaTitleLength > 0) score += 10;
    if (metaDescriptionLength >= 120 && metaDescriptionLength <= 160) score += 20;
    else if (metaDescriptionLength > 0) score += 10;
    if (shortDescriptionLength >= 80) score += 15;
    else if (shortDescriptionLength > 0) score += 8;
    if (fullDescriptionLength >= 300) score += 15;
    else if (fullDescriptionLength > 0) score += 8;
    if (data.meta_image_url || data.primary_image_url || data.meta_image) score += 10;
    if (data.category_ids?.length) score += 5;
    if (data.brand) score += 5;

    return Math.min(score, 100);
}

function ProductsTableSkeleton({ rowsCount = 8 }) {
    return (
        <tbody className="divide-y divide-slate-50 font-medium animate-pulse">
            {Array.from({ length: rowsCount }).map((_, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                    <td className="px-2 py-3.5 text-center">
                        <div className="mx-auto h-4 w-4 rounded border border-slate-200 bg-slate-100"></div>
                    </td>
                    <td className="px-2 py-3.5 text-center">
                        <div className="mx-auto h-3 w-4 rounded bg-slate-200"></div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200"></div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <div className="h-3.5 w-48 rounded bg-slate-200"></div>
                                <div className="h-2.5 w-28 rounded bg-slate-100"></div>
                            </div>
                        </div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="h-3 w-16 rounded bg-slate-200"></div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="h-3 w-12 rounded bg-slate-100"></div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="h-5 w-16 rounded-full bg-slate-100"></div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="h-5 w-16 rounded-full bg-slate-100"></div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="flex flex-col gap-1">
                            <div className="h-3.5 w-14 rounded bg-slate-200"></div>
                            <div className="h-2.5 w-10 rounded bg-slate-100"></div>
                        </div>
                    </td>
                    <td className="px-2 py-3.5">
                        <div className="h-3.5 w-14 rounded bg-slate-200"></div>
                    </td>
                    <td className="px-2 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-100"></div>
                            <div className="h-8 w-8 rounded-lg bg-slate-100"></div>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

const PRESET_BADGES = ['Best Selling', 'New Arrival', 'Offered Items', 'Featured', 'Hot Deal', 'Organic'];

export default function AdminProducts({ products, categories, sizeCharts = [], activeBrands = [], activePriceUnits = [], activeWeightUnits = [], productOptions = [], filters = {} }) {
    const storeName = useStoreName();
    const { props: pageProps } = usePage();
    const globalSettings = pageProps?.global_settings || {};
    const primaryColor = globalSettings?.card_custom_badge_bg_color || globalSettings?.primary_color || globalSettings?.theme_primary || '#02BCEF';
    const badgeTextColor = globalSettings?.card_custom_badge_text_color || '#ffffff';

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [attributesSetup, setAttributesSetup] = useState([]);
    const [variantsList, setVariantsList] = useState([]);
    const [currentSizeChartName, setCurrentSizeChartName] = useState('');
    const [isProductInfoOpen, setIsProductInfoOpen] = useState(false);
    const [isCategoriesBoxOpen, setIsCategoriesBoxOpen] = useState(true);
    const [isRelatedBoxOpen, setIsRelatedBoxOpen] = useState(true);
    const [relatedSearch, setRelatedSearch] = useState('');
    const [isRelatedPickerOpen, setIsRelatedPickerOpen] = useState(false);
    const [uploadingVariantImages, setUploadingVariantImages] = useState({});
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isCustomBadge, setIsCustomBadge] = useState(false);
    
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [type, setType] = useState(filters.type || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const [statusStatus, setStatusStatus] = useState(filters.status || '');
    const [visibility, setVisibility] = useState(filters.visibility || '');
    const [sizeChartId, setSizeChartId] = useState(filters.size_chart_id || '');

    // Sync filters with props
    useEffect(() => {
        setSearch(filters.search || '');
        setCategory(filters.category || '');
        setType(filters.type || '');
        setStockStatus(filters.stock_status || '');
        setStatusStatus(filters.status || '');
        setVisibility(filters.visibility || '');
        setSizeChartId(filters.size_chart_id || '');
    }, [filters]);

    // Initial load transition
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    const applyFilters = (newFilters) => {
        setIsFiltering(true);
        router.get(route('admin.products'), {
            search: newFilters.search !== undefined ? newFilters.search : search,
            category: newFilters.category !== undefined ? newFilters.category : category,
            type: newFilters.type !== undefined ? newFilters.type : type,
            stock_status: newFilters.stock_status !== undefined ? newFilters.stock_status : stockStatus,
            status: newFilters.status !== undefined ? newFilters.status : statusStatus,
            visibility: newFilters.visibility !== undefined ? newFilters.visibility : visibility,
            size_chart_id: newFilters.size_chart_id !== undefined ? newFilters.size_chart_id : sizeChartId,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsFiltering(true),
            onFinish: () => {
                setIsFiltering(false);
                setIsLoading(false);
            },
            onError: () => {
                setIsFiltering(false);
                setIsLoading(false);
            }
        });
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);
    
    // Product edit form
    const form = useForm({
        id: '',
        name: '',
        type: 'simple',
        status: 'active',
        brand: '',
        is_featured: false,
        price: '',
        sale_price: '',
        price_unit_id: '',
        stock: '',
        weight: '',
        weight_unit_id: '',
        sku: '',
        short_description: '',
        description: '',
        video_url: '',
        meta_title: '',
        meta_description: '',
        meta_image: null,
        meta_image_url: '',
        size_chart_id: '',
        category_ids: [],
        related_product_ids: [],
        primary_image_url: '',
        additional_image_urls: '',
        primary_image: null,
        additional_images: null,
        variants: '[]',
        settings: {
            product_info_status: 'enabled',
            product_info_design: 'default',
            product_info_return_label: 'Return',
            product_info_return_value: 'Instant',
            product_info_exchange_label: 'Exchange',
            product_info_exchange_value: 'Not Exchangeable',
            product_info_delivery_label: 'Delivery Time',
            product_info_delivery_value: '2 Days',
            product_info_payment_label: 'Payment',
            product_info_payment_value: 'COD Available',
            comparison_status: 'enabled',
            comparison_specs: '',
            is_quotation_product: 'false',
            custom_badge: '',
        }
    });

    const handleEditClick = (product) => {
        const primaryImg = product.images?.find(img => img.is_primary)?.image_path || '';
        const additionalImgs = product.images?.filter(img => !img.is_primary)?.map(img => img.image_path).join('\n') || '';

        // Extract attributes Setup from existing variants
        const attrsMap = {};
        product.variants?.forEach(v => {
            v.attribute_values?.forEach(av => {
                if (av.attribute) {
                    if (!attrsMap[av.attribute.name]) {
                        attrsMap[av.attribute.name] = new Set();
                    }
                    attrsMap[av.attribute.name].add(av.value);
                }
            });
        });

        const initialSetup = Object.keys(attrsMap).map(key => ({
            name: key,
            values: Array.from(attrsMap[key]).join(', ')
        }));
        setAttributesSetup(initialSetup);

        const initialVariants = product.variants?.map(v => {
            const combAttrs = {};
            v.attribute_values?.forEach(av => {
                if (av.attribute) {
                    combAttrs[av.attribute.name] = av.value;
                }
            });
            return {
                sku: v.sku || '',
                price: v.price || '',
                sale_price: v.sale_price || '',
                stock: v.stock || 0,
                image_path: v.image_path || '',
                attributes: combAttrs
            };
        }) || [];
        setVariantsList(initialVariants);
        setCurrentSizeChartName(product.size_chart?.name || product.sizeChart?.name || '');
        setIsProductInfoOpen(false);

        form.setData({
            id: product.id,
            name: product.name,
            type: product.type,
            status: product.status || 'active',
            brand: product.brand || '',
            is_featured: Boolean(product.is_featured),
            price: product.price,
            sale_price: product.sale_price || '',
            price_unit_id: product.price_unit_id || '',
            stock: product.stock,
            weight: product.weight || '',
            weight_unit_id: product.weight_unit_id || '',
            sku: product.sku || '',
            short_description: product.short_description || '',
            description: product.description || '',
            video_url: product.video_url || '',
            meta_title: product.meta_title || '',
            meta_description: product.meta_description || '',
            meta_image: null,
            meta_image_url: product.meta_image || '',
            size_chart_id: product.size_chart_id || '',
            category_ids: product.categories?.map(c => c.id) || [],
            related_product_ids: product.related_products?.map(p => p.id) || product.relatedProducts?.map(p => p.id) || [],
            primary_image_url: primaryImg,
            additional_image_urls: additionalImgs,
            primary_image: null,
            additional_images: null,
            variants: '[]',
            settings: {
                product_info_status: product.settings?.product_info_status || 'enabled',
                product_info_design: product.settings?.product_info_design || 'default',
                product_info_return_label: product.settings?.product_info_return_label || 'Return',
                product_info_return_value: product.settings?.product_info_return_value || 'Instant',
                product_info_exchange_label: product.settings?.product_info_exchange_label || 'Exchange',
                product_info_exchange_value: product.settings?.product_info_exchange_value || 'Not Exchangeable',
                product_info_delivery_label: product.settings?.product_info_delivery_label || 'Delivery Time',
                product_info_delivery_value: product.settings?.product_info_delivery_value || '2 Days',
                product_info_payment_label: product.settings?.product_info_payment_label || 'Payment',
                product_info_payment_value: product.settings?.product_info_payment_value || 'COD Available',
                comparison_status: product.settings?.comparison_status || 'enabled',
                comparison_specs: product.settings?.comparison_specs || '',
                is_quotation_product: product.settings?.is_quotation_product || 'false',
                custom_badge: product.settings?.custom_badge || '',
            }
        });
        const existingBadge = product.settings?.custom_badge || '';
        setIsCustomBadge(Boolean(existingBadge && !PRESET_BADGES.includes(existingBadge)));
        setIsFormOpen(true);
    };

    const handleDuplicateFromEdit = () => {
        form.setData({
            ...form.data,
            id: '',
            name: form.data.name ? `${form.data.name} Copy` : '',
            sku: '',
        });
        setIsFormOpen(true);
    };

    const handleNewClick = () => {
        form.reset();
        form.setData('settings', {
            product_info_status: 'enabled',
            product_info_design: 'default',
            product_info_return_label: 'Return',
            product_info_return_value: 'Instant',
            product_info_exchange_label: 'Exchange',
            product_info_exchange_value: 'Not Exchangeable',
            product_info_delivery_label: 'Delivery Time',
            product_info_delivery_value: '2 Days',
            product_info_payment_label: 'Payment',
            product_info_payment_value: 'COD Available',
            comparison_status: 'enabled',
            comparison_specs: '',
            is_quotation_product: 'false',
            custom_badge: '',
        });
        setIsCustomBadge(false);
        setAttributesSetup([]);
        setVariantsList([]);
        setCurrentSizeChartName('');
        setRelatedSearch('');
        setIsFormOpen(true);
    };

    const handleVariantImageUpload = async (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingVariantImages(prev => ({ ...prev, [index]: true }));
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(route('admin.page-builder.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.url) {
                const updated = [...variantsList];
                updated[index] = { ...updated[index], image_path: response.data.url };
                setVariantsList(updated);
            }
        } catch (error) {
            console.error('Variant image upload failed:', error);
            alert('Variant image upload failed. Please try again.');
        } finally {
            setUploadingVariantImages(prev => ({ ...prev, [index]: false }));
            e.target.value = '';
        }
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            size_chart_id: form.data.size_chart_id || null,
            price_unit_id: form.data.price_unit_id || null,
            weight_unit_id: form.data.weight_unit_id || null,
            variants: form.data.type === 'variable' ? JSON.stringify(variantsList) : '[]',
            settings: JSON.stringify(form.data.settings || {}),
        };

        router.post(route('admin.products.save'), payload, {
            onSuccess: () => {
                setIsFormOpen(false);
                form.reset();
                setRelatedSearch('');
                setAttributesSetup([]);
                setVariantsList([]);
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('admin.products.delete', { id }));
        }
    };

    const currentPageProductIds = products.data.map(product => product.id);
    const allCurrentPageSelected = currentPageProductIds.length > 0 && currentPageProductIds.every(id => selectedProductIds.includes(id));

    const toggleProductSelection = (id) => {
        setSelectedProductIds(prev => (
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        ));
    };

    const toggleCurrentPageSelection = () => {
        setSelectedProductIds(prev => {
            if (allCurrentPageSelected) {
                return prev.filter(id => !currentPageProductIds.includes(id));
            }

            return [...new Set([...prev, ...currentPageProductIds])];
        });
    };

    const handleBulkDelete = () => {
        if (!selectedProductIds.length) return;

        if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected product(s)?`)) {
            router.delete(route('admin.products.bulk-delete'), {
                data: { ids: selectedProductIds },
                preserveScroll: true,
                onSuccess: () => setSelectedProductIds([]),
            });
        }
    };

    const seoScore = calculateSeoScore(form.data);

    const additionalImageUrls = String(form.data.additional_image_urls || '')
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean);

    const removeAdditionalImageUrl = (urlToRemove) => {
        const nextUrls = additionalImageUrls.filter(url => url !== urlToRemove);
        form.setData('additional_image_urls', nextUrls.join('\n'));
    };

    const appendAdditionalImageFiles = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        form.setData('additional_images', [...(form.data.additional_images || []), ...files]);
        event.target.value = '';
    };

    const removeAdditionalImageFile = (indexToRemove) => {
        form.setData('additional_images', (form.data.additional_images || []).filter((_, index) => index !== indexToRemove));
    };
    const handleCategoryToggle = (catId) => {
        const current = [...form.data.category_ids];
        if (current.includes(catId)) {
            form.setData('category_ids', current.filter(id => id !== catId));
        } else {
            form.setData('category_ids', [...current, catId]);
        }
    };

    const childCategoriesByParent = categories.reduce((groups, cat) => {
        const parentKey = cat.parent_id || 'root';
        return { ...groups, [parentKey]: [...(groups[parentKey] || []), cat] };
    }, {});
    const rootProductCategories = childCategoriesByParent.root?.length ? childCategoriesByParent.root : categories.filter(cat => !cat.parent_id);
    const selectedCategoryIds = form.data.category_ids || [];
    const renderProductCategoryOption = (cat, level = 0) => {
        const children = childCategoriesByParent[cat.id] || [];
        return (
            <React.Fragment key={cat.id}>
                <label className="flex cursor-pointer select-none items-center gap-2 py-1 text-sm font-medium text-slate-700 transition hover:text-orange-600" style={{ paddingLeft: `${level * 22}px` }}>
                    <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="leading-5">{cat.name}</span>
                </label>
                {children.map(child => renderProductCategoryOption(child, level + 1))}
            </React.Fragment>
        );
    };

    const productCategoriesBox = (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setIsCategoriesBoxOpen(!isCategoriesBoxOpen)}
                className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left"
            >
                <span className="text-base font-extrabold text-slate-800">Categories</span>
                {isCategoriesBoxOpen ? <ChevronUp className="h-5 w-5 text-slate-700" /> : <ChevronDown className="h-5 w-5 text-slate-700" />}
            </button>
            {isCategoriesBoxOpen && (
                <div className="m-3 max-h-[260px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 pr-3">
                    {rootProductCategories.length ? rootProductCategories.map(cat => renderProductCategoryOption(cat)) : (
                        <p className="px-2 py-3 text-xs font-semibold text-slate-400">No categories available.</p>
                    )}
                </div>
            )}
        </div>
    );

    const selectedRelatedIds = form.data.related_product_ids || [];
    const selectedRelatedProducts = selectedRelatedIds
        .map(id => productOptions.find(product => Number(product.id) === Number(id)))
        .filter(Boolean);
    const filteredRelatedProducts = productOptions
        .filter(product => Number(product.id) !== Number(form.data.id))
        .filter(product => !selectedRelatedIds.some(id => Number(id) === Number(product.id)))
        .filter(product => String(product.name || '').toLowerCase().includes(relatedSearch.toLowerCase()))
        .slice(0, 12);
    const addRelatedProduct = (productId) => {
        const normalizedId = Number(productId);
        if (!normalizedId || selectedRelatedIds.some(id => Number(id) === normalizedId)) return;
        form.setData('related_product_ids', [...selectedRelatedIds, normalizedId]);
        setRelatedSearch('');
        setIsRelatedPickerOpen(false);
    };
    const removeRelatedProduct = (productId) => {
        form.setData('related_product_ids', selectedRelatedIds.filter(id => Number(id) !== Number(productId)));
    };

    const relatedProductsBox = (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setIsRelatedBoxOpen(!isRelatedBoxOpen)}
                className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left"
            >
                <span className="text-base font-extrabold text-slate-800">Related Products</span>
                {isRelatedBoxOpen ? <ChevronUp className="h-5 w-5 text-slate-700" /> : <ChevronDown className="h-5 w-5 text-slate-700" />}
            </button>
            {isRelatedBoxOpen && (
                <div className="p-3">
                    <div className="relative" onBlur={() => setTimeout(() => setIsRelatedPickerOpen(false), 120)}>
                        <input
                            type="text"
                            value={relatedSearch}
                            onFocus={() => setIsRelatedPickerOpen(true)}
                            onChange={e => {
                                setRelatedSearch(e.target.value);
                                setIsRelatedPickerOpen(true);
                            }}
                            placeholder="Related Products"
                            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        {isRelatedPickerOpen && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                                {filteredRelatedProducts.length ? filteredRelatedProducts.map(product => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => addRelatedProduct(product.id)}
                                        className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 last:border-b-0"
                                    >
                                        {product.name}
                                    </button>
                                )) : (
                                    <p className="px-3 py-3 text-xs font-semibold text-slate-400">
                                        {productOptions.length ? 'No products found.' : 'No products available.'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-2 min-h-24 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {selectedRelatedProducts.length ? selectedRelatedProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-3 text-sm last:border-b-0">
                                <span className="min-w-0 truncate font-medium text-slate-900">{product.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeRelatedProduct(product.id)}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-white transition hover:bg-red-500"
                                    title="Remove related product"
                                >
                                    <span className="-mt-px text-base leading-none">-</span>
                                </button>
                            </div>
                        )) : (
                            <p className="px-3 py-4 text-xs font-semibold text-slate-400">No related products selected.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`Products Inventory Manager | ${storeName} Admin`} />

            <div className="flex flex-col gap-6">
                
                {/* Header title */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-800">Products Inventory</h1>
                            {isFiltering && (
                                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 animate-pulse border border-orange-100">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Updating...
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Manage listings, variants, stock updates, and details curation.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedProductIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-xs font-bold text-red-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-100"
                                title="Delete selected products"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>{selectedProductIds.length}</span>
                            </button>
                        )}
                        <button 
                            onClick={handleNewClick}
                            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Product
                        </button>
                    </div>
                </div>

                {/* Form overlay drawer */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex justify-end" onClick={() => setIsFormOpen(false)}>
                        <div className="w-full max-w-6xl bg-white h-full p-6 md:p-8 flex flex-col shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 mb-6">
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-800">
                                        {form.data.id ? 'Edit Product listing' : 'Create new product listing'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        {form.data.id ? 'Update this listing or duplicate it as a new product.' : 'Create a brand-new product listing.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {form.data.id && (
                                        <button
                                            type="button"
                                            onClick={handleDuplicateFromEdit}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
                                        >
                                            Save as New
                                        </button>
                                    )}
                                    <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-50 rounded">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                                
                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Product Name</label>
                                            <input
                                                type="text"
                                                value={form.data.name}
                                                onChange={e => form.setData('name', e.target.value)}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Short Description</label>
                                            <textarea
                                                value={form.data.short_description}
                                                onChange={e => form.setData('short_description', e.target.value)}
                                                rows="3"
                                                placeholder="Write a concise benefit-focused summary. Aim for 80-160 characters for strong SEO snippets."
                                                className="w-full mt-1 p-3 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                required
                                            />
                                            <p className="mt-1 text-[10px] font-medium text-slate-400">Used in product cards, search snippets, and SEO fallback description.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <label className="font-bold text-slate-655 uppercase">Product Type</label>
                                                <select
                                                    value={form.data.type}
                                                    onChange={e => form.setData('type', e.target.value)}
                                                    className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none"
                                                >
                                                    <option value="simple">Simple Product</option>
                                                    <option value="variable">Variable Attributes (Polos, Size/Color)</option>
                                                    <option value="digital">Digital (PDF E-Book/Key)</option>
                                                    <option value="bundle">Product Combo Bundle</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-655 uppercase">SKU Identifier</label>
                                                <input
                                                    type="text"
                                                    value={form.data.sku}
                                                    onChange={e => form.setData('sku', e.target.value)}
                                                    placeholder="Auto-generated if blank"
                                                    className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-bold text-slate-655 uppercase">Product Status</label>
                                                <select
                                                    value={form.data.status}
                                                    onChange={e => form.setData('status', e.target.value)}
                                                    className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Brand</label>
                                            <select
                                                value={form.data.brand}
                                                onChange={e => form.setData('brand', e.target.value)}
                                                className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            >
                                                <option value="">No brand assigned</option>
                                                {form.data.brand && !activeBrands.some(brand => brand.slug === form.data.brand) && (
                                                    <option value={form.data.brand}>{form.data.brand}</option>
                                                )}
                                                {activeBrands.map(brand => (
                                                    <option key={brand.id} value={brand.slug}>{brand.name}</option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-[10px] font-medium text-slate-400">Only active brands are shown. Manage them from Catalog &gt; Brands Manager.</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Marketing & Homepage Sources</h4>
                                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">Control where this product appears on dynamic homepage blocks, similar to modern ecommerce / OpenCart featured modules.</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${form.data.is_featured ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(form.data.is_featured)}
                                                            onChange={e => form.setData('is_featured', e.target.checked)}
                                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                        />
                                                        <span className="text-xs font-extrabold">Featured Product</span>
                                                    </label>
                                                    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${form.data.settings?.is_quotation_product === 'true' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={form.data.settings?.is_quotation_product === 'true'}
                                                            onChange={e => form.setData('settings', { ...(form.data.settings || {}), is_quotation_product: e.target.checked ? 'true' : 'false' })}
                                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-xs font-extrabold">Quotation Product</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                                                <div className="rounded-xl border border-orange-100 bg-white p-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Featured</span>
                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Manual. Enable the checkbox to show in Featured blocks.</p>
                                                </div>
                                                <div className="rounded-xl border border-slate-100 bg-white p-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Latest / New</span>
                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Automatic. Newest active products by created date.</p>
                                                </div>
                                                <div className="rounded-xl border border-slate-100 bg-white p-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Best Selling</span>
                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Automatic. Products with highest sold quantity.</p>
                                                </div>
                                                <div className="rounded-xl border border-slate-100 bg-white p-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Trending</span>
                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Automatic. Featured + sales + approved reviews + newest.</p>
                                                </div>
                                                <div className="rounded-xl border border-blue-100 bg-white p-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Quotation</span>
                                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Manual. Enable Quotation Product to show the request quotation section on product detail.</p>
                                                </div>
                                            </div>

                                            {/* Product Card Ribbon Badge Selector */}
                                            <div className="mt-4 border-t border-slate-200/80 pt-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Product Card Badge / Ribbon</h4>
                                                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">Display a prominent promotional ribbon badge on top of the product card (e.g. Best Selling, New Arrival, Offered Items like Ghorer Bazar).</p>
                                                    </div>
                                                    <select
                                                        value={isCustomBadge ? 'custom' : (form.data.settings?.custom_badge || '')}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val === 'custom') {
                                                                setIsCustomBadge(true);
                                                                const current = form.data.settings?.custom_badge || '';
                                                                const newBadge = PRESET_BADGES.includes(current) ? '' : current;
                                                                form.setData('settings', { ...(form.data.settings || {}), custom_badge: newBadge });
                                                            } else {
                                                                setIsCustomBadge(false);
                                                                form.setData('settings', { ...(form.data.settings || {}), custom_badge: val });
                                                            }
                                                        }}
                                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                    >
                                                        <option value="">None (No badge)</option>
                                                        <option value="Best Selling">Best Selling</option>
                                                        <option value="New Arrival">New Arrival</option>
                                                        <option value="Offered Items">Offered Items</option>
                                                        <option value="Featured">Featured</option>
                                                        <option value="Hot Deal">Hot Deal</option>
                                                        <option value="Organic">Organic</option>
                                                        <option value="custom">Custom Text...</option>
                                                    </select>
                                                </div>
                                                {isCustomBadge && (
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter custom badge text (e.g. Special Offer, Hot, 50% Off)"
                                                            value={form.data.settings?.custom_badge || ''}
                                                            onChange={e => form.setData('settings', { ...(form.data.settings || {}), custom_badge: e.target.value })}
                                                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                )}
                                                {form.data.settings?.custom_badge && (
                                                    <div className="mt-2.5 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Card Badge Preview:</span>
                                                        <span
                                                            className="inline-block rounded-xs px-2.5 py-0.5 text-[9px] font-black uppercase shadow-xs"
                                                            style={{ backgroundColor: primaryColor, color: badgeTextColor }}
                                                        >
                                                            {form.data.settings.custom_badge}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 lg:sticky lg:top-4">
                                        {productCategoriesBox}
                                        {relatedProductsBox}
                                    </div>
                                </div>



                                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Comparison Settings</h4>
                                            <p className="mt-1 text-[11px] leading-5 text-slate-500">Choose if this product can be compared and add key specs. Use one spec per line: <span className="font-bold">Material: Cotton</span></p>
                                        </div>
                                        <select
                                            value={form.data.settings?.comparison_status || 'enabled'}
                                            onChange={e => form.setData('settings', { ...(form.data.settings || {}), comparison_status: e.target.value })}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="enabled">Comparison Enabled</option>
                                            <option value="disabled">Comparison Disabled</option>
                                        </select>
                                    </div>
                                    <textarea
                                        value={form.data.settings?.comparison_specs || ''}
                                        onChange={e => form.setData('settings', { ...(form.data.settings || {}), comparison_specs: e.target.value })}
                                        rows="5"
                                        placeholder={`Material: Cotton\nWarranty: 1 Year\nCountry of Origin: Bangladesh\nModel: HB-100`}
                                        className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <p className="mt-2 text-[10px] font-semibold text-slate-500">These fields appear as side-by-side specification rows on the comparison page and differences are highlighted automatically.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Regular Price (TK)</label>
                                        <input type="number" value={form.data.price} onChange={e => form.setData('price', e.target.value)} className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" required />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Discount Price (TK)</label>
                                        <input type="number" value={form.data.sale_price} onChange={e => form.setData('sale_price', e.target.value)} placeholder="Optional" className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Price Unit</label>
                                        <select value={form.data.price_unit_id} onChange={e => form.setData('price_unit_id', e.target.value)} className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500">
                                            <option value="">Default unit</option>
                                            {activePriceUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>)}
                                        </select>
                                        <p className="mt-1 text-[10px] font-medium text-slate-400">Manage from Catalog &gt; Price Unit.</p>
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Inventory Stock</label>
                                        <input type="number" value={form.data.stock} onChange={e => form.setData('stock', e.target.value)} className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" required />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Weight</label>
                                        <input type="number" step="0.01" value={form.data.weight} onChange={e => form.setData('weight', e.target.value)} placeholder="Optional" className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Weight Unit</label>
                                        <select value={form.data.weight_unit_id} onChange={e => form.setData('weight_unit_id', e.target.value)} className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500">
                                            <option value="">Default unit</option>
                                            {activeWeightUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>)}
                                        </select>
                                        <p className="mt-1 text-[10px] font-medium text-slate-400">Manage from Catalog &gt; Weight Unit.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">Size Chart</label>
                                        <select
                                            value={form.data.size_chart_id}
                                            onChange={e => form.setData('size_chart_id', e.target.value)}
                                            className="w-full mt-1 border border-slate-250 rounded-xl p-2.5 bg-white text-xs focus:outline-none"
                                        >
                                            {form.data.id && form.data.size_chart_id && !sizeCharts.some(chart => String(chart.id) === String(form.data.size_chart_id)) && (
                                                <option value={form.data.size_chart_id}>{currentSizeChartName || 'Current assigned chart'}</option>
                                            )}
                                            <option value="">No size chart assigned</option>
                                            {sizeCharts.map(chart => (
                                                <option key={chart.id} value={chart.id}>{chart.name} ({chart.unit})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <a
                                            href={route('admin.size-charts.create')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 text-center"
                                        >
                                            + Create New Size Chart
                                        </a>
                                    </div>
                                </div>

                                {form.data.type === 'variable' && (
                                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Product Attributes & Variations</h4>
                                            <button
                                                type="button"
                                                onClick={() => setAttributesSetup([...attributesSetup, { name: '', values: '' }])}
                                                className="px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-[10px] flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add Attribute
                                            </button>
                                        </div>

                                        {/* Attributes Setup Inputs */}
                                        {attributesSetup.length > 0 && (
                                            <div className="space-y-3 bg-white p-3 border border-slate-100 rounded-xl">
                                                <span className="text-[10px] text-slate-400 font-bold block">1. Define Attributes & Options</span>
                                                {attributesSetup.map((attr, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={attr.name}
                                                            onChange={e => {
                                                                const updated = [...attributesSetup];
                                                                updated[idx].name = e.target.value;
                                                                setAttributesSetup(updated);
                                                            }}
                                                            placeholder="Name (e.g. Color)"
                                                            className="w-1/3 px-3 py-1.5 border border-slate-250 rounded-lg text-xs focus:outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={attr.values}
                                                            onChange={e => {
                                                                const updated = [...attributesSetup];
                                                                updated[idx].values = e.target.value;
                                                                setAttributesSetup(updated);
                                                            }}
                                                            placeholder="Values (comma-separated: Black, Navy)"
                                                            className="flex-1 px-3 py-1.5 border border-slate-250 rounded-lg text-xs focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setAttributesSetup(attributesSetup.filter((_, i) => i !== idx))}
                                                            className="text-red-500 hover:text-red-650 p-1.5"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const activeAttrs = attributesSetup.filter(a => a.name.trim() !== '' && a.values.trim() !== '');
                                                        if (activeAttrs.length === 0) return;

                                                        const cartesian = (arrays) => {
                                                            return arrays.reduce((acc, curr) => acc.flatMap(d => curr.map(e => [...d, e])), [[]]);
                                                        };

                                                        const attrArrays = activeAttrs.map(attr => attr.values.split(',').map(v => v.trim()).filter(v => v !== ''));
                                                        const combinations = cartesian(attrArrays);

                                                        const newVariants = combinations.map(comb => {
                                                            const combAttrs = {};
                                                            activeAttrs.forEach((attr, idx) => {
                                                                combAttrs[attr.name] = comb[idx];
                                                            });

                                                            const existing = variantsList.find(v => Object.keys(combAttrs).every(k => v.attributes[k] === combAttrs[k]));

                                                            return {
                                                                sku: existing?.sku || '',
                                                                price: existing?.price || form.data.price || '',
                                                                sale_price: existing?.sale_price || form.data.sale_price || '',
                                                                stock: existing?.stock || 0,
                                                                image_path: existing?.image_path || '',
                                                                attributes: combAttrs
                                                            };
                                                        });
                                                        setVariantsList(newVariants);
                                                    }}
                                                    className="w-full mt-2 py-2 bg-orange-50 text-orange-655 hover:bg-orange-100 rounded-lg text-[10px] font-bold transition-all border border-orange-200"
                                                >
                                                    Generate Variations Matrix
                                                </button>
                                            </div>
                                        )}

                                        {/* Generated Variants List */}
                                        {variantsList.length > 0 && (
                                            <div className="space-y-3 bg-white p-3 border border-slate-100 rounded-xl max-h-80 overflow-y-auto">
                                                <span className="text-[10px] text-slate-400 font-bold block">2. Configure Variation Prices & Stock</span>
                                                {variantsList.map((variant, idx) => (
                                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-2.5">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(variant.attributes).map(([k, v]) => (
                                                                    <span key={k} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-bold uppercase">
                                                                        {k}: {v}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
                                                                className="text-red-500 hover:text-red-650 p-1"
                                                                title="Remove variation"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">PRICE (TK)</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.price}
                                                                    onChange={e => {
                                                                        const updated = [...variantsList];
                                                                        updated[idx].price = e.target.value;
                                                                        setVariantsList(updated);
                                                                    }}
                                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">SALE PRICE (TK)</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.sale_price}
                                                                    onChange={e => {
                                                                        const updated = [...variantsList];
                                                                        updated[idx].sale_price = e.target.value;
                                                                        setVariantsList(updated);
                                                                    }}
                                                                    placeholder="Optional"
                                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">STOCK</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.stock}
                                                                    onChange={e => {
                                                                        const updated = [...variantsList];
                                                                        updated[idx].stock = e.target.value;
                                                                        setVariantsList(updated);
                                                                    }}
                                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">SKU</label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.sku}
                                                                    onChange={e => {
                                                                        const updated = [...variantsList];
                                                                        updated[idx].sku = e.target.value;
                                                                        setVariantsList(updated);
                                                                    }}
                                                                    placeholder="Auto-generated"
                                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-[72px_1fr] md:items-end">
                                                            <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                                {variant.image_path ? (
                                                                    <img src={variant.image_path} alt="Variant" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="grid h-full w-full place-items-center text-[9px] font-bold uppercase text-slate-300">Image</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="mb-0.5 flex items-center justify-between gap-2">
                                                                    <label className="text-[9px] font-bold text-slate-400 block">VARIANT IMAGE URL</label>
                                                                    <label className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-black uppercase text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 ${uploadingVariantImages[idx] ? 'pointer-events-none opacity-70' : ''}`}>
                                                                        {uploadingVariantImages[idx] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                                                        <span>{uploadingVariantImages[idx] ? 'Uploading' : 'Choose File'}</span>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            disabled={uploadingVariantImages[idx]}
                                                                            onChange={e => handleVariantImageUpload(e, idx)}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={variant.image_path || ''}
                                                                    onChange={e => {
                                                                        const updated = [...variantsList];
                                                                        updated[idx].image_path = e.target.value;
                                                                        setVariantsList(updated);
                                                                    }}
                                                                    placeholder="Optional image URL or upload from device"
                                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                                                                />
                                                                <p className="mt-1 text-[9px] font-medium text-slate-400">Upload from device or paste URL. When this variation is selected, this image will show on product detail.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                                    <button
                                        type="button"
                                        onClick={() => setIsProductInfoOpen((open) => !open)}
                                        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/70"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Product Info Box</h4>
                                            <p className="text-[10px] text-slate-500 mt-1">Set product-specific return, exchange, delivery and merchant details.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${form.data.settings.product_info_status === 'enabled' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {form.data.settings.product_info_status || 'enabled'}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isProductInfoOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    {isProductInfoOpen && (
                                        <div className="space-y-4 border-t border-slate-200 p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
                                                <select
                                                    value={form.data.settings.product_info_status}
                                                    onChange={e => form.setData('settings', {
                                                        ...form.data.settings,
                                                        product_info_status: e.target.value
                                                    })}
                                                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                                                >
                                                    <option value="enabled">Enabled</option>
                                                    <option value="disabled">Disabled</option>
                                                </select>
                                            </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Design</label>
                                            <select
                                                value={form.data.settings.product_info_design}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_design: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            >
                                                <option value="default">Default</option>
                                                <option value="light">Light</option>
                                                <option value="outline">Outline</option>
                                            </select>
                                        </div>
                                        <div />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Return Label</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_return_label}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_return_label: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Return Value</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_return_value}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_return_value: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Exchange Label</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_exchange_label}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_exchange_label: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Exchange Value</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_exchange_value}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_exchange_value: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Delivery Label</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_delivery_label}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_delivery_label: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Delivery Value</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_delivery_value}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_delivery_value: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Payment Label</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_payment_label}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_payment_label: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Payment Value</label>
                                            <input
                                                type="text"
                                                value={form.data.settings.product_info_payment_value}
                                                onChange={e => form.setData('settings', {
                                                    ...form.data.settings,
                                                    product_info_payment_value: e.target.value
                                                })}
                                                className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none"
                                            />
                                        </div>
                                    </div>
</div>
                                    )}
                                </div>
                                <div>
                                    <label className="font-bold text-slate-655 uppercase">Full Description (HTML Supported)</label>
                                    <div className="mt-1 overflow-hidden rounded-xl border border-slate-250 bg-white focus-within:ring-1 focus-within:ring-orange-500">
                                        <SummernoteEditor
                                            value={form.data.description}
                                            onChange={(content) => form.setData('description', content)}
                                            placeholder="Add detailed product content, specifications, benefits, warranty notes and usage guidance..."
                                            height={260}
                                        />
                                    </div>
                                    <p className="mt-1 text-[10px] font-medium text-slate-400">For 95+ SEO score, add at least 300 words of useful, unique product information.</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">SEO Meta Tags</h4>
                                            <p className="mt-1 text-[10px] text-slate-400">Complete these fields to improve product search visibility.</p>
                                        </div>
                                        <div className={`rounded-full px-3 py-1 text-[10px] font-black ${seoScore >= 95 ? 'bg-emerald-100 text-emerald-700' : seoScore >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            SEO Score {seoScore}/100
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[150px_1fr] lg:items-center">
                                        <label className="font-bold text-slate-655 uppercase">Meta Title</label>
                                        <div>
                                            <input
                                                type="text"
                                                value={form.data.meta_title}
                                                onChange={e => form.setData('meta_title', e.target.value)}
                                                placeholder="Meta Title"
                                                maxLength="70"
                                                className="w-full rounded-xl border border-slate-250 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            />
                                            <p className="mt-1 text-[10px] text-slate-400">Best length: 45-65 characters. Current: {plainText(form.data.meta_title).length}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[150px_1fr] lg:items-start">
                                        <label className="pt-2 font-bold text-slate-655 uppercase">Description</label>
                                        <div>
                                            <textarea
                                                value={form.data.meta_description}
                                                onChange={e => form.setData('meta_description', e.target.value)}
                                                rows="5"
                                                maxLength="180"
                                                placeholder="Write a compelling search result description with product benefit, category and buying intent."
                                                className="w-full rounded-xl border border-slate-250 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            />
                                            <p className="mt-1 text-[10px] text-slate-400">Best length: 120-160 characters. Current: {plainText(form.data.meta_description).length}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[150px_1fr] lg:items-start">
                                        <label className="pt-2 font-bold text-slate-655 uppercase">Meta Image</label>
                                        <div>
                                            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                                                <input type="file" accept="image/*" onChange={e => form.setData('meta_image', e.target.files[0])} className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 text-xs focus:outline-none" />
                                                <input type="text" value={form.data.meta_image_url} onChange={e => form.setData('meta_image_url', e.target.value)} placeholder="Or paste meta image URL" className="w-full rounded-xl border border-slate-250 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                            </div>
                                            {(form.data.meta_image_url || form.data.primary_image_url) && (
                                                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                                                    <img src={form.data.meta_image_url || form.data.primary_image_url} alt="SEO meta preview" className="h-28 w-full rounded-lg object-cover" />
                                                </div>
                                            )}
                                            <p className="mt-1 text-[10px] text-slate-400">Recommended Open Graph image: 1200x630px.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Product Media & Gallery</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Primary Image File</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => form.setData('primary_image', e.target.files[0])}
                                                className="w-full mt-1 px-3 py-1.5 border border-slate-250 rounded-xl text-xs bg-white focus:outline-none"
                                            />
                                            {form.data.primary_image_url && (
                                                <p className="text-[10px] text-slate-400 mt-1 truncate">
                                                    Current: <a href={form.data.primary_image_url} target="_blank" rel="noreferrer" className="text-orange-500 font-semibold underline">{form.data.primary_image_url}</a>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Or Primary Image URL</label>
                                            <input
                                                type="text"
                                                value={form.data.primary_image_url}
                                                onChange={e => form.setData('primary_image_url', e.target.value)}
                                                placeholder="https://images.unsplash.com/photo-..."
                                                className="w-full mt-1 px-3.5 py-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Additional Images Files</label>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={appendAdditionalImageFiles}
                                                className="w-full mt-1 px-3 py-1.5 border border-slate-250 rounded-xl text-xs bg-white focus:outline-none"
                                            />
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">New selected files will be added to the existing gallery.</p>

                                            {additionalImageUrls.length > 0 && (
                                                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">
                                                    <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">Current gallery images</span>
                                                    <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                                                        {additionalImageUrls.map((url, i) => (
                                                            <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                                <AdminImage src={url} alt="Additional product" className="h-20 w-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAdditionalImageUrl(url)}
                                                                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                                                                    title="Remove this image"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(form.data.additional_images || []).length > 0 && (
                                                <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-2">
                                                    <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-orange-600">New files to add</span>
                                                    <div className="space-y-1">
                                                        {(form.data.additional_images || []).map((file, i) => (
                                                            <div key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                                                                <span className="truncate">{file.name}</span>
                                                                <button type="button" onClick={() => removeAdditionalImageFile(i)} className="grid h-6 w-6 place-items-center rounded-full text-red-500 hover:bg-red-50" title="Remove selected file">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-655 uppercase">Or Additional URLs (Newline separated)</label>
                                            <textarea
                                                value={form.data.additional_image_urls}
                                                onChange={e => form.setData('additional_image_urls', e.target.value)}
                                                rows="2"
                                                placeholder="https://images.unsplash.com/photo-2&#10;https://images.unsplash.com/photo-3"
                                                className="w-full mt-1 p-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-655 uppercase">YouTube / Product Video Link</label>
                                        <input
                                            type="url"
                                            value={form.data.video_url}
                                            onChange={e => form.setData('video_url', e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="w-full mt-1 px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        />
                                        <p className="mt-1 text-[10px] font-medium text-slate-400">Shown as a playable video thumbnail on the product detail page.</p>
                                    </div>
                                </div>


                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Save Product Details
                                </button>

                            </form>

                        </div>
                    </div>
                )}

                {/* Filters Row */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {/* Search Query */}
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Name/SKU</label>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <select
                                value={category}
                                onChange={e => {
                                    setCategory(e.target.value);
                                    applyFilters({ category: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Product Type Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                            <select
                                value={type}
                                onChange={e => {
                                    setType(e.target.value);
                                    applyFilters({ type: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Types</option>
                                <option value="simple">Simple Product</option>
                                <option value="variable">Variable Attributes</option>
                                <option value="digital">Digital Product</option>
                                <option value="bundle">Product Combo Bundle</option>
                            </select>
                        </div>

                        {/* Stock Status Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Status</label>
                            <select
                                value={stockStatus}
                                onChange={e => {
                                    setStockStatus(e.target.value);
                                    applyFilters({ stock_status: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Stock Statuses</option>
                                <option value="in">In Stock (&gt; 5)</option>
                                <option value="low">Low Stock (1-5)</option>
                                <option value="out">Out of Stock (0)</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                                value={statusStatus}
                                onChange={e => {
                                    setStatusStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Homepage Source</label>
                            <select
                                value={visibility}
                                onChange={e => {
                                    setVisibility(e.target.value);
                                    applyFilters({ visibility: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Sources</option>
                                <option value="featured">Featured</option>
                                <option value="latest">Latest / New arrivals</option>
                                <option value="best_selling">Best selling</option>
                                <option value="trending">Trending</option>
                                <option value="discounted">Discounted</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size Chart</label>
                            <select
                                value={sizeChartId}
                                onChange={e => {
                                    setSizeChartId(e.target.value);
                                    applyFilters({ size_chart_id: e.target.value });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="">All Charts</option>
                                {sizeCharts.map(chart => (
                                    <option key={chart.id} value={chart.id}>{chart.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(search || category || type || stockStatus || statusStatus || visibility || sizeChartId) && (
                        <button
                            disabled={isFiltering}
                            onClick={() => {
                                setSearch('');
                                setCategory('');
                                setType('');
                                setStockStatus('');
                                setStatusStatus('');
                                setVisibility('');
                                setSizeChartId('');
                                applyFilters({
                                    search: '',
                                    category: '',
                                    type: '',
                                    stock_status: '',
                                    status: '',
                                    visibility: '',
                                    size_chart_id: '',
                                });
                            }}
                            className={`px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                isFiltering ? 'cursor-wait opacity-60' : ''
                            }`}
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Products Grid list table */}
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1180px] w-full table-fixed text-left text-xs text-slate-500">
                            <colgroup>
                                <col className="w-[52px]" />
                                <col className="w-[64px]" />
                                <col className="w-[38%]" />
                                <col className="w-[110px]" />
                                <col className="w-[90px]" />
                                <col className="w-[100px]" />
                                <col className="w-[120px]" />
                                <col className="w-[110px]" />
                                <col className="w-[105px]" />
                                <col className="w-[110px]" />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                                    <th className="px-2 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={allCurrentPageSelected}
                                            onChange={toggleCurrentPageSelection}
                                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                            aria-label="Select all products on this page"
                                        />
                                    </th>
                                    <th className="px-2 py-3 text-center">SL</th>
                                    <th className="px-2 py-3">Details</th>
                                    <th className="px-2 py-3">SKU</th>
                                    <th className="px-2 py-3">Type</th>
                                    <th className="px-2 py-3">Status</th>
                                    <th className="px-2 py-3">Source</th>
                                    <th className="px-2 py-3">Pricing</th>
                                    <th className="px-2 py-3">Stock</th>
                                    <th className="px-2 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            {isLoading || isFiltering ? (
                                <ProductsTableSkeleton rowsCount={8} />
                            ) : (
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {products.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="py-12 text-center text-slate-400">
                                                <p className="text-sm font-semibold text-slate-600">No products found</p>
                                                <p className="text-xs mt-1 text-slate-400">Try adjusting your search terms or filter criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((prod, index) => (
                                            <tr key={prod.id} className={`hover:bg-slate-50/50 ${selectedProductIds.includes(prod.id) ? 'bg-orange-50/40' : ''}`}>
                                                <td className="px-2 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProductIds.includes(prod.id)}
                                                        onChange={() => toggleProductSelection(prod.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                        aria-label={`Select ${prod.name}`}
                                                    />
                                                </td>
                                                <td className="px-2 py-3.5 text-center font-mono text-[11px] font-bold text-slate-400">
                                                    {(products.from || 1) + index}
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                                                            <AdminImage
                                                                src={prod.images?.find(img => img.is_primary)?.image_path}
                                                                alt={prod.name}
                                                                className="w-full h-full object-cover"
                                                                wrapperClassName="w-full h-full rounded-lg"
                                                                size="sm"
                                                            />
                                                        </div>
                                                        <div className="flex min-w-0 flex-col">
                                                            <span className="truncate font-bold text-slate-800">{prod.name}</span>
                                                            <span className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-400">{prod.categories?.map(c => c.name).join(', ')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3.5 font-mono font-bold text-slate-500">{prod.sku}</td>
                                                <td className="px-2 py-3.5 uppercase text-[9px] font-bold text-slate-400">{prod.type}</td>
                                                <td className="px-2 py-3.5">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                        prod.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                        {prod.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {prod.is_featured && <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black uppercase text-orange-600">Featured</span>}
                                                        {prod.sale_price && <span className="rounded-full bg-rose-50 px-2 py-1 text-[9px] font-black uppercase text-rose-600">Discount</span>}
                                                        {!prod.is_featured && !prod.sale_price && <span className="text-[10px] font-bold text-slate-300">Standard</span>}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex flex-col whitespace-nowrap">
                                                        <span className="font-bold text-slate-800">TK {prod.sale_price || prod.price}</span>
                                                        {prod.sale_price && (
                                                            <span className="text-[10px] text-slate-400 line-through">TK {prod.price}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <span className={`font-bold leading-5 ${
                                                        prod.stock <= 5 ? 'text-red-500' : 'text-slate-700'
                                                    }`}>
                                                        {prod.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button 
                                                            onClick={() => handleEditClick(prod)}
                                                            className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-750 transition-all"
                                                            title="Edit listing details"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteClick(prod.id)}
                                                            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                            title="Delete product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1.5">
                            {products.links.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <button
                                        key={idx}
                                        disabled={isFiltering}
                                        onClick={() => {
                                            if (isFiltering) return;
                                            setIsFiltering(true);
                                            router.visit(link.url, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                onStart: () => setIsFiltering(true),
                                                onFinish: () => setIsFiltering(false),
                                                onError: () => setIsFiltering(false),
                                            });
                                        }}
                                        className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-orange-500 border-orange-500 text-white' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        } ${isFiltering ? 'cursor-wait opacity-70' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
