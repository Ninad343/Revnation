import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Truck,
  Boxes,
  User,
  ArrowLeft,
  Store,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/seller', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/seller/products', end: true, label: 'Products', icon: Package },
    { to: '/seller/products/new', end: true, label: 'Add Product', icon: PlusCircle },
    { to: '/seller/orders', end: true, label: 'Customer Orders', icon: Truck },
    { to: '/seller/inventory', end: true, label: 'Inventory Stock', icon: Boxes },
    { to: '/seller/profile', end: true, label: 'Seller Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col md:flex-row text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center">
                REV<span className="text-emerald-500">SELLER</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Partner Portal
              </div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="text-xs font-bold text-slate-200 truncate">{user?.name}</div>
          <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Approved Seller
            </span>
          </div>
        </div>

        {/* Navigation links */}
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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
