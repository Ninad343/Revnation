import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">Delivered</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">In Transit</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-950 text-red-400 border border-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-800">Confirmed</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Package className="w-6 h-6 text-red-500 mr-2.5" />
          <span>My Orders</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Track parts shipments and past automotive orders</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <div className="text-xs text-slate-400">Order Number</div>
                  <div className="text-sm font-black text-white font-mono">{order.orderNumber}</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Placed On</div>
                    <div className="text-xs text-white">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 overflow-x-auto">
                  {order.items.map((it, idx) => (
                    <img
                      key={idx}
                      src={it.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                      alt={it.name}
                      title={`${it.quantity}x ${it.name}`}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                    />
                  ))}
                  <div className="text-xs text-slate-400">
                    {order.items.length} {order.items.length === 1 ? 'part' : 'parts'}
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</div>
                    <div className="text-base font-black text-white">₹{order.total.toLocaleString('en-IN')}</div>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
          <Package className="w-16 h-16 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400">
            Ready to upgrade your vehicle? Explore our performance catalog to place your first order.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
          >
            Explore Performance Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
