import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Clock,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileText
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setCategoryStats(res.data.categoryStats || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-900 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
              Platform Master Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            RevNation Administration Overview
          </h1>
          <p className="text-xs text-slate-400">Ecosystem telemetry, merchant governance, and revenue analytics</p>
        </div>

        {stats?.pendingApplications > 0 && (
          <Link
            to="/admin/sellers"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition"
          >
            <Clock className="w-4 h-4" />
            <span>{stats.pendingApplications} Pending Seller Applications</span>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[11px] text-slate-500">From paid marketplace orders</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Sellers</span>
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {stats?.pendingApplications || 0}
          </div>
          <Link to="/admin/sellers" className="text-[11px] text-amber-400 hover:underline font-semibold block">
            Review onboarding applications →
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Marketplace Orders</span>
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-slate-400">{stats?.pendingOrders || 0} pending processing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Catalog Parts</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalProducts || 0}
          </div>
          <div className="text-[11px] text-slate-400">Listed across 9 vehicle categories</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Enthusiast Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-[11px] text-slate-500">Registered driver profiles</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Sellers</span>
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalSellers || 0}
          </div>
          <div className="text-[11px] text-slate-500">Approved merchant workshops</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {stats?.lowStockProducts || 0}
          </div>
          <div className="text-[11px] text-slate-500">Items with ≤ 5 units left</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Audit Trail</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <Link to="/admin/audit-logs" className="text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1">
              <span>View Security Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-[11px] text-slate-500">Immutable admin action records</div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center">
          <Layers className="w-4 h-4 mr-2 text-purple-400" />
          Catalog Category Distribution
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((cat) => (
            <div key={cat._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white text-xs">{cat._id}</div>
                <div className="text-[11px] text-slate-500">{cat.count} products listed</div>
              </div>
              <span className="font-mono text-sm font-black text-purple-400">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
