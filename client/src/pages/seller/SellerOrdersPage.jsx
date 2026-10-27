import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Search, ArrowRight, Package } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [statusInput, setStatusInput] = useState('PROCESSING');
  const [trackingInput, setTrackingInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sellers/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load seller orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    try {
      setUpdating(true);
      const res = await api.put(`/sellers/orders/${orderId}/status`, {
        status: statusInput,
        trackingNumber: trackingInput,
        note: `Status updated by Seller. Tracking: ${trackingInput || 'Pending'}`
      });

      if (res.data.success) {
        toast.success('Order status updated and customer notified');
        setEditingOrderId(null);
        await fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Truck className="w-6 h-6 text-emerald-400 mr-2.5" />
          <span>Fulfillment & Customer Orders</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Orders requiring shipment, packaging, and AWB tracking updates</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-900 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
            >
              {/* Top metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 text-xs">
                <div>
                  <span className="font-mono text-white font-black text-sm">#{ord.orderNumber}</span>
                  <span className="text-slate-500 ml-2">({new Date(ord.createdAt).toLocaleString()})</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-slate-300 border border-slate-800">
                    Status: {ord.orderStatus}
                  </span>
                  <button
                    onClick={() => {
                      setEditingOrderId(editingOrderId === ord._id ? null : ord._id);
                      setStatusInput(ord.orderStatus);
                      setTrackingInput(ord.trackingNumber || '');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    {editingOrderId === ord._id ? 'Cancel' : 'Update Fulfillment'}
                  </button>
                </div>
              </div>

              {/* Status Update Inline Drawer */}
              {editingOrderId === ord._id && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center gap-3 text-xs">
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING (Packaging)</option>
                    <option value="SHIPPED">SHIPPED (In Transit)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Courier AWB Tracking Number"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(ord._id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                  >
                    {updating ? 'Saving...' : 'Save & Notify Buyer'}
                  </button>
                </div>
              )}

              {/* Items & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Parts to Fulfill:
                  </span>
                  <div className="divide-y divide-slate-800 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                    {ord.sellerItems?.map((it, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={it.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-950" />
                          <div>
                            <div className="font-bold text-white">{it.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Part #{it.partNumber || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white font-mono">{it.quantity}x ₹{it.price.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-500 font-mono">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Customer Destination:
                  </span>
                  <div className="text-slate-200 font-bold">{ord.shippingAddress?.fullName}</div>
                  <div className="text-slate-400">{ord.shippingAddress?.street}</div>
                  <div className="text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode}</div>
                  <div className="text-slate-500 pt-1">Phone: {ord.shippingAddress?.phone}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Orders Received Yet</h3>
            <p className="text-xs text-slate-400">Customer orders containing your listed parts will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
