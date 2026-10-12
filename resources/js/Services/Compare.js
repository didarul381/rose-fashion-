const STORAGE_KEY = 'malamal_compare_items';
const MAX_COMPARE_ITEMS = 6;

const safeParse = (value) => {
    try {
        const parsed = JSON.parse(value || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const productImage = (product = {}) => product.primary_image?.image_path || product.primaryImage?.image_path || product.images?.[0]?.image_path || '';

export function getCompareItems() {
    if (typeof window === 'undefined') return [];
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function compareIds() {
    return getCompareItems().map(item => Number(item.id)).filter(Boolean);
}

export function isProductCompared(productId) {
    return compareIds().includes(Number(productId));
}

export function emitCompareChanged() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('malamal-compare-changed'));
    }
}

export function addCompareProduct(product) {
    if (!product?.id || typeof window === 'undefined') return { added: false, reason: 'invalid' };
    if (String(product.settings?.comparison_status || 'enabled') === 'disabled') return { added: false, reason: 'disabled' };
    const current = getCompareItems();
    if (current.some(item => Number(item.id) === Number(product.id))) {
        return { added: false, reason: 'exists', items: current };
    }
    if (current.length >= MAX_COMPARE_ITEMS) {
        return { added: false, reason: 'limit', items: current };
    }

    const next = [
        ...current,
        {
            id: product.id,
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            brand: product.brand,
            price: product.sale_price || product.price,
            image: productImage(product),
        }
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitCompareChanged();
    return { added: true, items: next };
}

export function removeCompareProduct(productId) {
    if (typeof window === 'undefined') return [];
    const next = getCompareItems().filter(item => Number(item.id) !== Number(productId));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitCompareChanged();
    return next;
}

export function toggleCompareProduct(product) {
    if (isProductCompared(product?.id)) {
        return { added: false, removed: true, items: removeCompareProduct(product.id) };
    }
    return addCompareProduct(product);
}

export function clearCompareItems() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    emitCompareChanged();
}

export function compareUrl() {
    const ids = compareIds();
    const base = typeof route === 'function' ? route('compare.index') : '/compare';
    return ids.length ? `${base}?ids=${ids.join(',')}` : base;
}

export { MAX_COMPARE_ITEMS };
