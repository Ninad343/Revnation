import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  XOctagon
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUS_STEPS = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be returned to inventory.')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.data.success) {
        setOrder(res.data.order);
        toast.success('Order cancelled successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-96 bg-slate-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h2 className="text-lg font-bold text-white mb-2">Order Not Found</h2>
        <Link to="/orders" className="text-xs text-red-400 font-bold hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <Link to="/orders" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Order <span className="font-mono text-red-500">#{order.orderNumber}</span>
          </h1>
          <p className="text-xs text-slate-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/80 text-red-300 font-bold text-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
          >
            <XOctagon className="w-3.5 h-3.5" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
          </button>
        )}
      </div>

      {/* Visual Tracking Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center">
            <Truck className="w-4 h-4 mr-2 text-red-500" />
            Shipment Status Tracking
          </h3>
          {order.trackingNumber && (
            <span className="text-xs text-slate-400 font-mono">
              AWB: <strong className="text-white">{order.trackingNumber}</strong>
            </span>
          )}
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>This order was cancelled. Reserved parts inventory has been restored.</span>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    isCurrent ? 'text-white' : isPast ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    {step.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Event Log */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status History</span>
            <div className="space-y-1.5 text-xs">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-center justify-between text-slate-400">
                  <span>{event.comment || event.status}</span>
                  <span className="text-[10px] text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Itemization & Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white">Parts Ordered</h3>
          <div className="divide-y divide-slate-800">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={it.image} alt={it.name} className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800" />
                  <div>
                    <div className="font-bold text-white">{it.name}</div>
                    <div className="text-[11px] text-slate-400">{it.brand} • Part #{it.partNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white font-mono">{it.quantity}x ₹{it.price.toLocaleString('en-IN')}</div>
                  <div className="text-slate-500 font-mono">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span className="text-white font-mono">{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
              <span className="text-white">Total</span>
              <span className="text-red-400 font-mono">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-white flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-red-500" />
            Shipping Destination
          </h3>
          <div className="space-y-1 text-slate-300">
            <div className="font-bold text-white">{order.shippingAddress.fullName}</div>
            <div>{order.shippingAddress.street}</div>
            <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</div>
            <div className="text-slate-500 pt-1">Phone: {order.shippingAddress.phone}</div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-1">
            <div className="text-slate-500">Payment Protocol:</div>
            <div className="font-semibold text-white">{order.paymentMethod.replace(/_/g, ' ')}</div>
            <div className="text-emerald-400 font-bold uppercase text-[10px]">Status: {order.paymentStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
