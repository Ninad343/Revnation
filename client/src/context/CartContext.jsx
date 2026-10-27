import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, shipping: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return { success: false, requireAuth: true };
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        toast.success('Part added to cart');
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Could not add to cart');
      return { success: false, error: err.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
      return { success: false, error: err.message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.data.success) {
        toast.info('Item removed from cart');
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
      return { success: false, error: err.message };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], subtotal: 0, shipping: 0, total: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err.message);
    }
  };

  const cartCount = cart.items ? cart.items.reduce((acc, it) => acc + it.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
