import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldX, ArrowLeft, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/60 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto mb-4 text-red-500">
            <ShieldX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            This portal is restricted to authorized {allowedRoles.join(' / ')} accounts only. Your account currently holds the <span className="text-white font-bold">{user?.role}</span> role.
          </p>

          <div className="flex flex-col gap-3">
            {allowedRoles.includes('SELLER') && user?.role === 'USER' && (
              <Link
                to="/become-seller"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Store className="w-4 h-4" />
                <span>Apply to Become a Verified Seller</span>
              </Link>
            )}

            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
