import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Truck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED');
  const [trackingNumber, setTrackingNumber] = useState('');
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('q', search);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status: selectedStatus,
        trackingNumber: trackingNumber || undefined,
        note: `Updated by administrator to ${selectedStatus}`
      });

      if (res.data.success) {
        toast.success('Order status updated');
        setEditingId(null);
        await fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <ShoppingCart className="w-6 h-6 text-purple-400 mr-2.5" />
            <span>Marketplace Orders & Logistics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Supervise customer transactions, dispatch fulfillment, and payment tracking</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {['', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {ord.orderNumber}
                      <div className="text-[10px] text-slate-500 font-sans">{new Date(ord.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{ord.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ord.items.length} parts
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-emerald-400 border border-slate-800 uppercase font-bold">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingId(editingId === ord._id ? null : ord._id);
                          setSelectedStatus(ord.orderStatus);
                          setTrackingNumber(ord.trackingNumber || '');
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px]"
                      >
                        {editingId === ord._id ? 'Cancel' : 'Manage Status'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No marketplace orders found.</div>
        )}
      </div>

      {/* Editing drawer modal */}
      {editingId && (
        <div className="bg-slate-950 border border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <span className="font-bold text-white">Update Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <input
            type="text"
            placeholder="Courier Tracking AWB"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
          />

          <button
            onClick={() => handleUpdateStatus(editingId)}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Apply & Save
          </button>
        </div>
      )}
    </div>
  );
}
