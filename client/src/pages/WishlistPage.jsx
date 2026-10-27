import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (product) => {
    await addToCart(product._id, 1);
    await removeFromWishlist(product._id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Heart className="w-6 h-6 text-red-500 mr-2.5 fill-red-500" />
          <span>Saved Parts & Builds</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Components saved for future chassis upgrades and maintenance schedules
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-slate-900 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const displayPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
            return (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                  <Link to={`/products/${item.slug || item._id}`}>
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-red-400 hover:bg-red-600 hover:text-white transition shadow-md"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider">{item.brand}</div>
                    <Link
                      to={`/products/${item.slug || item._id}`}
                      className="font-bold text-sm text-white line-clamp-2 hover:text-red-400 transition"
                    >
                      {item.name}
                    </Link>
                    <div className="text-base font-black text-white pt-1">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={item.stock === 0}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center space-x-1.5 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto">
          <Heart className="w-16 h-16 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400">
            Your wishlist is waiting for its first build. Browse our performance catalog and save parts you're planning to install.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
          >
            <span>Explore Parts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
