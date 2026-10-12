const WISHLIST_KEY = 'govaly_wishlist';
const WISHLIST_EVENT = 'govaly-wishlist-changed';

export function getWishlistItems() {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to read wishlist', error);
        return [];
    }
}

export function saveWishlistItems(items) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, {
        detail: { items }
    }));
}

export function toggleWishlistProduct(product) {
    const items = getWishlistItems();
    const wishlistId = `p-${product.id}`;
    const existingIndex = items.findIndex(item => item.wishlistId === wishlistId);

    if (existingIndex >= 0) {
        const updated = items.filter(item => item.wishlistId !== wishlistId);
        saveWishlistItems(updated);
        return { items: updated, added: false };
    }

    const newItem = {
        wishlistId,
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.sale_price || product.price,
        originalPrice: product.price,
        image: product.primary_image?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        type: product.type,
        stock: product.stock
    };

    const updated = [newItem, ...items];
    saveWishlistItems(updated);
    return { items: updated, added: true };
}

export function removeWishlistProduct(wishlistId) {
    const items = getWishlistItems().filter(item => item.wishlistId !== wishlistId);
    saveWishlistItems(items);
    return items;
}

