import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Gauge,
  Disc,
  Sliders,
  CircleDot,
  Wind,
  Compass,
  Cpu,
  Car,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { openVehicleModal } = useOutletContext() || {};
  const { activeVehicle } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8&sort=popular'),
          api.get('/categories')
        ]);
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Home data load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'engine-parts': return Gauge;
      case 'exhaust-systems': return Flame;
      case 'brakes': return Disc;
      case 'suspension': return Sliders;
      case 'wheels-and-tyres': return CircleDot;
      case 'exterior-styling': return Wind;
      case 'interior-cockpit': return Compass;
      case 'performance-tuning': return Cpu;
      default: return Wrench;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800 carbon-pattern pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient red and amber glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-bold uppercase tracking-wider shadow-inner">
                <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>The Enthusiast's Auto Parts Destination</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none uppercase">
                Build Your Ride. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">
                  Your Way.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                RevNation connects drivers with genuine automobile performance parts, track-tested suspension, big brake kits, titanium exhausts, and bespoke modification components.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Shop Performance Parts</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products?category=Modification"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition hover:text-white"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Explore Modifications</span>
                </Link>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-white">50,000+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Genuine Parts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fitment Guarantee</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">48-Hr</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Insured Dispatch</div>
                </div>
              </div>
            </div>

            {/* Right Visual Feature Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl p-2 group">
                <img
                  src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80"
                  alt="High Performance Automobile"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent rounded-2xl pointer-events-none"></div>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white inline-block mb-2">
                    Circuit Spec Setup
                  </span>
                  <h3 className="text-xl font-bold text-white">Brembo GT6 + Bilstein B16</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Precision stopping power combined with 10-stage rebound adjustability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MY GARAGE QUICK SELECTOR BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-red-400">Smart Vehicle Filter</div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {activeVehicle?.make
                  ? `Active Garage: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.variant || ''}`
                  : 'Select your vehicle for guaranteed fitment'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We'll flag compatible brakes, exhausts, coilovers, and styling parts that bolt right on.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto">
            {activeVehicle?.make ? (
              <Link
                to={`/products?vehicleMake=${activeVehicle.make}&vehicleModel=${activeVehicle.model}&vehicleYear=${activeVehicle.year}`}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 text-center transition"
              >
                View Compatible Parts
              </Link>
            ) : null}

            <button
              onClick={() => openVehicleModal && openVehicleModal()}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 text-center transition"
            >
              {activeVehicle?.make ? 'Change Vehicle' : '+ Add Your Vehicle'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-500">Curated Systems</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition"
          >
            <span>Browse All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat._id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative bg-slate-900 border border-slate-800 hover:border-red-600/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-red-600/20 text-slate-300 group-hover:text-red-400 flex items-center justify-center transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition transform group-hover:translate-x-1" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {cat.description || 'High-performance components and verified upgrades.'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-500">Track & Street Tested</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Featured Performance Parts
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition"
          >
            <span>View All Parts</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 5. TRENDING MODIFICATIONS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Trending Modifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Titanium Exhausts & Carbon Aero
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlock authentic motorsport acoustics, lower backpressure, and shave unneeded weight with Akrapovic, Vorsteiner, and Eventuri intake systems.
            </p>
            <div className="pt-2">
              <Link
                to="/products?category=Exhaust%20Systems"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                <span>Shop Exhausts & Aero</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY REVNATION? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-red-500">The RevNation Difference</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Why Enthusiasts Trust Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Vetted & Approved Sellers Only</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every seller undergoes business verification, tax check, and inventory auditing before approval. No counterfeit parts allowed.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">My Garage Fitment Guarantee</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your vehicle year, make, and trim. If a product marked compatible does not fit your vehicle, we handle the return 100% free.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Automotive-First Experience</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built specifically for automobile modification enthusiasts. Detailed specs, part numbers, and genuine customer reviews.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
