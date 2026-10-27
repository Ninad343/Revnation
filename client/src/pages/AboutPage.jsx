import React from 'react';
import { Wrench, ShieldCheck, Flag, Users, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto">
          <Wrench className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          About RevNation
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          The premier automotive marketplace engineered for performance builders, motorsport teams, and modification enthusiasts.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-lg font-bold text-white">Our Mission</h2>
        <p>
          Automobile performance modification has historically been plagued by counterfeits, obscure fitment specifications, and fragmented sellers. RevNation was built to eliminate guesswork through verified parts catalogs, strict merchant auditing, and real-time vehicle fitment algorithms.
        </p>

        <h2 className="text-lg font-bold text-white pt-4">The Fitment Guarantee</h2>
        <p>
          When you add your automobile to <strong className="text-red-400">My Garage</strong>, our engine filters parts based on manufacturer engineering tolerances. If any verified part does not fit your confirmed chassis code, our fitment guarantee covers immediate 100% refund or exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Verified Vendors</h3>
          <p className="text-xs text-slate-400">Strict admin approval prevents unverified sellers.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <Flag className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Trackside Tested</h3>
          <p className="text-xs text-slate-400">Curated hardware proven under extreme track conditions.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <Cpu className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Modern Architecture</h3>
          <p className="text-xs text-slate-400">Full-stack MERN with atomic stock reservations and JWT security.</p>
        </div>
      </div>
    </div>
  );
}
