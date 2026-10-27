import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Shield, Store, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (result.user.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate(from);
      }
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sign In to RevNation</h2>
          <p className="text-xs text-slate-400">Access your garage, order telemetry, and saved parts</p>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Quick Test Credentials:</span>
            <span className="text-red-400">Click to fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@revnation.com', 'Admin@12345')}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/50 text-left transition"
            >
              <div className="font-bold text-purple-300 flex items-center">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </div>
              <div className="text-[10px] text-slate-400">Platform Control</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('apex@revnation.com', 'Seller@12345')}
              className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 text-left transition"
            >
              <div className="font-bold text-emerald-300 flex items-center">
                <Store className="w-3 h-3 mr-1" /> Seller
              </div>
              <div className="text-[10px] text-slate-400">Apex Tuning</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('gearhead@revnation.com', 'User@12345')}
              className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/50 text-left transition"
            >
              <div className="font-bold text-cyan-300 flex items-center">
                <User className="w-3 h-3 mr-1" /> Buyer
              </div>
              <div className="text-[10px] text-slate-400">BMW 330i Garage</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          New to RevNation?{' '}
          <Link to="/register" className="text-red-400 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
