import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { activeVehicle } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product._id);

  // Check vehicle compatibility against active garage vehicle
  const checkCompatibility = () => {
    if (!activeVehicle || !activeVehicle.make || !product.compatibility || product.compatibility.length === 0) {
      return null;
    }

    const match = product.compatibility.find((c) => {
      const makeMatch = c.make.toLowerCase() === activeVehicle.make.toLowerCase();
      const modelMatch = c.model.toLowerCase() === activeVehicle.model.toLowerCase();
      const yearMatch = !activeVehicle.year || (activeVehicle.year >= c.yearStart && activeVehicle.year <= c.yearEnd);
      return makeMatch && modelMatch && yearMatch;
    });

    return !!match;
  };

  const isCompatible = checkCompatibility();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
  };

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20">
      {/* Product Image and Badges */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
        <Link to={`/products/${product.slug || product._id}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badges && product.badges.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
              {product.badges[0]}
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition z-10 ${
            wishlisted
              ? 'bg-red-600/90 text-white shadow-lg shadow-red-600/40'
              : 'bg-slate-900/70 text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
          title={wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Vehicle Compatibility Banner */}
        {activeVehicle?.make && (
          <div className="absolute bottom-0 inset-x-0 py-1 px-3 text-[11px] font-medium backdrop-blur-md flex items-center justify-between z-10 border-t border-slate-800/80">
            {isCompatible ? (
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Fits your {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            ) : (
              <span className="text-slate-400 flex items-center text-[10px]">
                <AlertCircle className="w-3 h-3 mr-1 text-slate-500" />
                Compatibility not confirmed for {activeVehicle.model}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold text-red-400 uppercase tracking-wider">{product.brand}</span>
            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{product.category}</span>
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product.slug || product._id}`}
            className="text-sm font-bold text-slate-100 hover:text-red-400 line-clamp-2 transition leading-snug mb-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-3 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="ml-1 font-bold text-slate-200">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
            <span className="text-slate-500 text-[11px]">({product.reviewCount || 0} reviews)</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-white tracking-tight">
              ₹{displayPrice.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="text-xs text-slate-500 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              product.stock === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
