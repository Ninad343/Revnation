import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Parts</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from verified motorsport manufacturers</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Fitment Guarantee</h4>
              <p className="text-xs text-slate-400 mt-0.5">Save your vehicle in My Garage for verified fit</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Insured Express Shipping</h4>
              <p className="text-xs text-slate-400 mt-0.5">Reinforced packaging for heavy assemblies</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">14-day replacement guarantee on all parts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                REV<span className="text-red-500">NATION</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              RevNation is India's dedicated automotive marketplace for high-performance upgrades, precision braking, adjustable suspension, forged wheels, and styling components. Built by petrolheads, for petrolheads.
            </p>
            <div className="text-xs text-slate-500">
              Contact Support: <span className="text-slate-300">support@revnation.com</span> | +91 (080) 4123-9900
            </div>
          </div>

          {/* Shop */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Shop Parts</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=Brakes" className="hover:text-red-400 transition">Big Brake Kits & Rotors</Link></li>
              <li><Link to="/products?category=Suspension" className="hover:text-red-400 transition">Coilovers & Sway Bars</Link></li>
              <li><Link to="/products?category=Exhaust" className="hover:text-red-400 transition">Titanium Valved Exhausts</Link></li>
              <li><Link to="/products?category=Engine" className="hover:text-red-400 transition">Intakes & Turbochargers</Link></li>
              <li><Link to="/products?category=Wheels" className="hover:text-red-400 transition">Forged Monoblock Wheels</Link></li>
            </ul>
          </div>

          {/* Seller / Platform */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Sell on RevNation</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/become-seller" className="hover:text-amber-400 transition">Become a Verified Seller</Link></li>
              <li><Link to="/login" className="hover:text-slate-200 transition">Seller Portal Login</Link></li>
              <li><Link to="/about" className="hover:text-slate-200 transition">Fitment Guarantee Policy</Link></li>
              <li><Link to="/contact" className="hover:text-slate-200 transition">Merchant API Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-slate-200 transition">Track Your Shipment</Link></li>
              <li><Link to="/my-garage" className="hover:text-slate-200 transition">Vehicle Compatibility Checker</Link></li>
              <li><Link to="/about" className="hover:text-slate-200 transition">Terms of Sale & Warranty</Link></li>
              <li><Link to="/about" className="hover:text-slate-200 transition">Privacy & Data Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} RevNation Technologies Pvt Ltd. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <span>Secure 256-bit SSL Encrypted</span>
            <span>•</span>
            <span>Razorpay / Test Gateway Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
