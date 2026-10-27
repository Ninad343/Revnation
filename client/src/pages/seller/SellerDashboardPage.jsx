import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Truck,
  AlertTriangle,
  PlusCircle,
  Boxes,
  Store,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

export default function SellerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sellers/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
        }
      } catch (err) {
        console.error('Failed to load seller stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-900 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Verified Merchant
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            Seller Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400">Real-time inventory levels, sales revenue, and pending fulfillment</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/seller/products/new"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Part</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{stats?.totalSales?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[11px] text-slate-500">Gross revenue generated from fulfilled items</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Orders Received</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold">
            {stats?.pendingOrders || 0} pending fulfillment
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Catalog Listings</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalProducts || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats?.activeProducts || 0} currently active in marketplace
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {stats?.lowStockProducts || 0}
          </div>
          <div className="text-[11px] text-slate-500">Products with ≤ 5 units remaining</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Quick Inventory Sync</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="pt-1">
            <Link
              to="/seller/inventory"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>Manage Bulk Stock Levels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-[11px] text-slate-500">Inline real-time quantity adjustments</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Orders Pipeline</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="pt-1">
            <Link
              to="/seller/orders"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View Customer Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-[11px] text-slate-500">Update shipping and AWB tracking numbers</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-bold text-sm text-white">Recent Orders Containing Your Parts</h2>
          <Link to="/seller/orders" className="text-xs text-emerald-400 hover:underline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-800 text-xs">
            {recentOrders.map((ord) => (
              <div key={ord._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-mono">{ord.orderNumber}</div>
                  <div className="text-slate-400 text-[11px]">{new Date(ord.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                    {ord.orderStatus}
                  </span>
                  <span className="font-black text-white font-mono">₹{ord.total.toLocaleString('en-IN')}</span>
                  <Link
                    to="/seller/orders"
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">No recent orders yet</div>
        )}
      </div>
    </div>
  );
}
