import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tracker } from '../Services/Tracker';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('govaly_cart');
        if (stored) {
            try {
                setCartItems(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }
    }, []);

    // Sync to localStorage
    const saveCart = (newItems) => {
        setCartItems(newItems);
        localStorage.setItem('govaly_cart', JSON.stringify(newItems));
    };

    const addToCart = (product, variant = null, quantity = 1) => {
        if (product?.type === 'variable' && !variant) {
            return false;
        }

        const stock = variant ? Number(variant.stock || 0) : Number(product?.stock || 0);
        if (product?.type !== 'digital' && stock <= 0) {
            return false;
        }

        const itemId = variant ? `v-${variant.id}` : `p-${product.id}`;
        const existingIndex = cartItems.findIndex(item => item.cartId === itemId);

        const newItem = {
            cartId: itemId,
            id: product.id,
            slug: product.slug,
            variant_id: variant ? variant.id : null,
            name: product.name,
            sku: variant ? variant.sku : product.sku,
            price: variant ? (variant.sale_price || variant.price) : (product.sale_price || product.price),
            image: variant?.image_path || product.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            quantity: quantity,
            variantDescription: variant ? variant.attribute_values?.map(av => av.value).join(' / ') : null,
            weight: Number(product.weight || 0),
            weight_unit: product.weight_unit?.code || product.weightUnit?.code || 'kg',
            stock: variant ? variant.stock : product.stock
        };

        let updated;
        if (existingIndex > -1) {
            updated = [...cartItems];
            updated[existingIndex].quantity = Math.min(updated[existingIndex].quantity + quantity, newItem.stock);
        } else {
            updated = [...cartItems, newItem];
        }
        saveCart(updated);
        
        // Track client-side event
        Tracker.trackAddToCart(newItem, quantity);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('govaly-cart-event', {
                detail: {
                    action: 'added',
                    item: newItem,
                    quantity,
                }
            }));
        }
        return true;
    };

    const removeFromCart = (cartId) => {
        const updated = cartItems.filter(item => item.cartId !== cartId);
        saveCart(updated);
    };

    const updateQty = (cartId, quantity) => {
        const updated = cartItems.map(item => {
            if (item.cartId === cartId) {
                return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
            }
            return item;
        });
        saveCart(updated);
    };

    const clearCart = () => {
        saveCart([]);
        setAppliedCoupon(null);
        setShippingCost(0);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            subtotal,
            appliedCoupon,
            shippingCost,
            setAppliedCoupon,
            setShippingCost,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
