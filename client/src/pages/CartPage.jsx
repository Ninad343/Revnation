import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Looks like you haven't added any parts yet. Find exact-fit brakes, exhaust, suspension, and modifications for your build.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
        >
          <span>Browse Parts Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <ShoppingCart className="w-6 h-6 text-amber-500 mr-2.5" />
          <span>Shopping Cart</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review your selected automotive parts before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table / Cards */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="divide-y divide-slate-800">
            {cart.items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const unitPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />

                  {/* Title & Brand */}
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">{p.brand}</div>
                    <Link
                      to={`/products/${p.slug || p._id}`}
                      className="font-bold text-sm text-white hover:text-red-400 transition line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-slate-400">
                      Unit: ₹{unitPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs">
                    <button
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-2.5 font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, Math.min(p.stock, item.quantity + 1))}
                      className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right sm:w-28">
                    <div className="text-sm font-black text-white">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/products"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-base text-white">Order Summary</h3>

          <div className="space-y-3 text-xs divide-y divide-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Parts Subtotal</span>
              <span className="font-bold text-white">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-300 pt-3">
              <span>Insured Courier Shipping</span>
              <span className="font-bold text-white">
                {cart.shipping === 0 ? (
                  <span className="text-emerald-400 uppercase font-black tracking-wider">FREE</span>
                ) : (
                  `₹${cart.shipping}`
                )}
              </span>
            </div>

            <div className="flex justify-between items-baseline text-sm pt-3">
              <span className="font-black text-white">Grand Total</span>
              <span className="text-xl font-black text-red-400">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fitment Guarantee on every verified order</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Ships within 24-48 hours via Air Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
