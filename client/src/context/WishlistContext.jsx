import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save items to your wishlist');
      return { success: false, requireAuth: true };
    }
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchWishlist();
        return { success: true, isWishlisted: res.data.isWishlisted };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
      return { success: false, error: err.message };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        toast.info('Removed from wishlist');
        await fetchWishlist();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove from wishlist');
      return { success: false, error: err.message };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        wishlistCount: wishlist.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
