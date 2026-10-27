import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  ShoppingCart,
  Heart,
  User,
  Car,
  Bell,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  PackageCheck,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ onOpenVehicleModal }) {
  const { user, isAuthenticated, isSeller, isAdmin, logout, activeVehicle, setActiveVehicle } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top micro-bar for quick announcements & vehicle pill */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border-b border-slate-800/60 text-xs py-1.5 px-4 hidden md:flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-red-400 font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5 inline-block"></span>
            Performance Parts & OEM Fitment Guaranteed
          </span>
          <span className="text-slate-600">|</span>
          <span>Free Express Shipping on Orders over ₹5,000</span>
        </div>

        {/* Active vehicle badge in microbar */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
              >
                <Car className="w-3.5 h-3.5 text-red-400" />
                <span>
                  {activeVehicle?.make
                    ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : 'Select Your Vehicle'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {vehicleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    My Garage
                  </div>
                  {user?.vehicles && user.vehicles.length > 0 ? (
                    user.vehicles.map((v) => (
                      <button
                        key={v._id}
                        onClick={() => {
                          setActiveVehicle(v._id);
                          setVehicleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between transition ${
                          activeVehicle?.make === v.make && activeVehicle?.model === v.model
                            ? 'text-red-400 font-bold bg-slate-800/50'
                            : ''
                        }`}
                      >
                        <div>
                          <div>{v.year} {v.make} {v.model}</div>
                          <div className="text-[10px] text-slate-400">{v.variant} • {v.fuelType}</div>
                        </div>
                        {activeVehicle?.make === v.make && activeVehicle?.model === v.model && (
                          <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">No vehicles saved yet</div>
                  )}
                  <div className="border-t border-slate-800 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setVehicleDropdownOpen(false);
                        if (onOpenVehicleModal) onOpenVehicleModal();
                        else navigate('/my-garage');
                      }}
                      className="w-full text-center py-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      + Add / Manage Garage
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-1 text-slate-300 hover:text-red-400 transition"
            >
              <Car className="w-3.5 h-3.5 text-red-500" />
              <span>Select vehicle for guaranteed fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition transform">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white flex items-center">
                  REV<span className="text-red-500">NATION</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
                  Automotive Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-slate-300">
              <Link
                to="/products"
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Shop Parts
              </Link>
              <Link
                to="/products?category=Modification"
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition text-amber-400 hover:text-amber-300"
              >
                Modifications
              </Link>
              <Link
                to="/my-garage"
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition flex items-center space-x-1.5"
              >
                <Car className="w-4 h-4 text-red-400" />
                <span>My Garage</span>
              </Link>
              {!isSeller && !isAdmin && (
                <Link
                  to="/become-seller"
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition"
                >
                  Become a Seller
                </Link>
              )}
            </nav>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search BMW brakes, Akrapovic, coilovers, turbos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2 border border-slate-700/80 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
              title="Saved Parts"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* In-app Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-3 z-50 text-slate-200">
                    <div className="px-4 py-1 flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-red-400 hover:text-red-300 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setNotificationsOpen(false);
                            }}
                            className={`px-4 py-2.5 text-xs hover:bg-slate-800 cursor-pointer transition ${
                              !n.read ? 'bg-slate-800/40 font-semibold text-white' : 'text-slate-400'
                            }`}
                          >
                            <div className="text-slate-200">{n.title}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-xs text-slate-500">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-sm font-semibold transition"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate text-slate-200">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800">
                    <div className="px-4 py-2">
                      <div className="font-bold text-sm text-white truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : user.role === 'SELLER'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 text-xs font-medium">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-800 transition"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" /> Profile & Addresses
                      </Link>
                      <Link
                        to="/my-garage"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-800 transition"
                      >
                        <Car className="w-4 h-4 mr-2.5 text-red-400" /> My Garage
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-800 transition"
                      >
                        <PackageCheck className="w-4 h-4 mr-2.5 text-amber-400" /> My Orders
                      </Link>
                    </div>

                    {/* Role specific portals */}
                    {isSeller && (
                      <div className="py-1 text-xs font-semibold">
                        <Link
                          to="/seller"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-emerald-400 hover:bg-emerald-950/40 transition"
                        >
                          <Store className="w-4 h-4 mr-2.5" /> Seller Dashboard
                        </Link>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="py-1 text-xs font-semibold">
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-purple-400 hover:bg-purple-950/40 transition"
                        >
                          <ShieldAlert className="w-4 h-4 mr-2.5" /> Admin Control Center
                        </Link>
                      </div>
                    )}

                    {!isSeller && !isAdmin && (
                      <div className="py-1 text-xs">
                        <Link
                          to="/become-seller"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-amber-400 hover:bg-slate-800 transition"
                        >
                          <Store className="w-4 h-4 mr-2.5" /> Become a Seller
                        </Link>
                      </div>
                    )}

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-950/30 transition text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search parts, brands, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-center"
            >
              Shop Parts
            </Link>
            <Link
              to="/my-garage"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-900 text-red-400 text-center flex items-center justify-center space-x-1"
            >
              <Car className="w-4 h-4" />
              <span>My Garage</span>
            </Link>
            {isSeller && (
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-emerald-950/60 text-emerald-300 text-center border border-emerald-800/60"
              >
                Seller Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-purple-950/60 text-purple-300 text-center border border-purple-800/60"
              >
                Admin Dashboard
              </Link>
            )}
            {!isSeller && !isAdmin && (
              <Link
                to="/become-seller"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-slate-900 text-amber-400 text-center"
              >
                Become a Seller
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
