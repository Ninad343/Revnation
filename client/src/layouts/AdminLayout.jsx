import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  ShoppingCart,
  Layers,
  MessageSquare,
  FileText,
  ArrowLeft,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/sellers', end: true, label: 'Seller Approvals', icon: Store },
    { to: '/admin/products', end: true, label: 'Products & Moderation', icon: Package },
    { to: '/admin/orders', end: true, label: 'Marketplace Orders', icon: ShoppingCart },
    { to: '/admin/users', end: true, label: 'User Accounts', icon: Users },
    { to: '/admin/categories', end: true, label: 'Categories Catalog', icon: Layers },
    { to: '/admin/reviews', end: true, label: 'Reviews Moderation', icon: MessageSquare },
    { to: '/admin/audit-logs', end: true, label: 'Security Audit Logs', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col md:flex-row text-slate-100 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center">
                REV<span className="text-purple-400">ADMIN</span>
              </div>
              <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
                Control Center
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tag */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="text-xs font-bold text-slate-200 truncate">{user?.name}</div>
          <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
              Super Administrator
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 transition text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f17]">
        <Outlet />
      </main>
    </div>
  );
}
