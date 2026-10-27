import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(
    !user?.addresses || user.addresses.length === 0
  );

  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('TEST_MODE_CARD');
  const [testCardNumber, setTestCardNumber] = useState('4242 •••• •••• 4242');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const activeShippingAddress = useNewAddress
    ? newAddress
    : user?.addresses?.[selectedAddressIndex] || newAddress;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!activeShippingAddress.fullName || !activeShippingAddress.street || !activeShippingAddress.city || !activeShippingAddress.postalCode) {
      toast.error('Please complete all required shipping address fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/orders', {
        shippingAddress: activeShippingAddress,
        paymentMethod
      });

      if (res.data.success) {
        setConfirmedOrder(res.data.order);
        await fetchCart(); // resets cart
        toast.success(`Order #${res.data.order.orderNumber} placed successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation screen
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
            Payment Verified & Stock Allocated
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Order Confirmed!</h1>
          <p className="text-xs text-slate-400">
            Order Reference: <strong className="text-white font-mono">{confirmedOrder.orderNumber}</strong>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-slate-400">Estimated Dispatch</span>
            <span className="font-bold text-white">Within 24 Hours</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-slate-400">Delivery Address</span>
            <span className="font-semibold text-slate-200">
              {confirmedOrder.shippingAddress.fullName}, {confirmedOrder.shippingAddress.city} - {confirmedOrder.shippingAddress.postalCode}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-slate-400">Amount Paid</span>
            <span className="text-base font-black text-emerald-400">
              ₹{confirmedOrder.total.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Ordered Parts:</span>
            {confirmedOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-300">
                <span>{it.quantity}x {it.name}</span>
                <span className="font-mono">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/orders/${confirmedOrder._id}`}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Lock className="w-5 h-5 text-red-500 mr-2.5" />
          <span>Secure Checkout</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">256-bit encrypted checkout with fitment guarantee</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Addresses & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white flex items-center">
                <Truck className="w-4 h-4 mr-2 text-red-500" />
                1. Shipping Address
              </h2>
              {user?.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  className="text-xs font-semibold text-red-400 hover:underline"
                >
                  {useNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!useNewAddress && user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-xs space-y-1 ${
                      selectedAddressIndex === idx
                        ? 'bg-slate-850 border-red-500 shadow-md shadow-red-950/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{addr.fullName}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-slate-300">{addr.street}</div>
                    <div className="text-slate-400">{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div className="text-slate-500">Phone: {addr.phone}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Street Address, Flat / Apartment / House No"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHOD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center pb-3 border-b border-slate-800">
              <CreditCard className="w-4 h-4 mr-2 text-emerald-400" />
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => setPaymentMethod('TEST_MODE_CARD')}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                  paymentMethod === 'TEST_MODE_CARD'
                    ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Card (Sandbox Mode)</span>
                  {paymentMethod === 'TEST_MODE_CARD' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Simulate verified payment in development mode</p>
              </div>

              <div
                onClick={() => setPaymentMethod('RAZORPAY_DEMO')}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                  paymentMethod === 'RAZORPAY_DEMO'
                    ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Razorpay UPI / Netbanking</span>
                  {paymentMethod === 'RAZORPAY_DEMO' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Indian payment rail simulator</p>
              </div>

              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                  paymentMethod === 'COD'
                    ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Cash on Delivery</span>
                  {paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Pay courier on physical receipt</p>
              </div>
            </div>

            {paymentMethod === 'TEST_MODE_CARD' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Test Payment Sandbox (No real charges incurred)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    disabled
                    value={testCardNumber}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono"
                    />
                    <input
                      type="text"
                      disabled
                      value="888"
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800">
            Order Review ({cart.items?.length || 0} Parts)
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 text-xs">
            {cart.items?.map((it) => (
              <div key={it._id} className="py-2.5 flex justify-between items-center text-slate-300">
                <div className="truncate max-w-[180px]">
                  <span className="font-bold text-white">{it.quantity}x</span> {it.product?.name}
                </div>
                <span className="font-bold font-mono">
                  ₹{((it.product?.discountPrice || it.product?.price || 0) * it.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white font-bold">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span className="text-white font-bold">
                {cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}
              </span>
            </div>
            <div className="flex justify-between items-baseline text-sm pt-2 border-t border-slate-800">
              <span className="font-black text-white">Grand Total</span>
              <span className="text-xl font-black text-red-500">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition"
          >
            <span>{submitting ? 'Processing Payment...' : 'Confirm & Place Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Fitment Policy Active</span>
          </div>
        </div>
      </form>
    </div>
  );
}
