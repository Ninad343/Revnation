import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Car,
  Search
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeVehicle } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter query state
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const fitMyVehicle = searchParams.get('fitMyVehicle') === 'true';

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        if (brand) params.set('brand', brand);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        params.set('page', page);
        params.set('limit', 12);

        // If fitMyVehicle is active and activeVehicle exists
        if (fitMyVehicle && activeVehicle?.make && activeVehicle?.model) {
          params.set('vehicleMake', activeVehicle.make);
          params.set('vehicleModel', activeVehicle.model);
          if (activeVehicle.year) params.set('vehicleYear', activeVehicle.year);
        }

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setPages(res.data.pages);
          if (res.data.brands) setBrands(res.data.brands);
          if (res.data.categories) setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchParams, activeVehicle, fitMyVehicle]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {category ? category : 'Automobile Parts Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {q ? (
              <span>Showing search results for <span className="text-white font-bold">"{q}"</span></span>
            ) : (
              'Discover precision upgrades, replacement assemblies, and track components.'
            )}
          </p>
        </div>

        {/* Sorting & Filter toggle for mobile */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-red-500" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6">
          {/* Active Vehicle Fitment Toggle */}
          {activeVehicle?.make ? (
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                  <Car className="w-4 h-4 mr-1.5" />
                  My Garage Fitment
                </span>
              </div>
              <div className="text-xs text-white font-semibold">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Filter exclusively for guaranteed compatibility
              </p>
              <label className="mt-3 flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fitMyVehicle}
                  onChange={(e) => updateFilter('fitMyVehicle', e.target.checked ? 'true' : '')}
                  className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                />
                <span className="text-xs font-medium text-slate-200">
                  Only show compatible parts
                </span>
              </label>
            </div>
          ) : null}

          {/* Filter Reset Button */}
          {(category || brand || minPrice || maxPrice || q || fitMyVehicle) && (
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}

          {/* Categories */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Categories
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                  !category ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilter('category', c)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                    category.toLowerCase() === c.toLowerCase()
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Brands
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {brands.map((b) => (
                <label key={b} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brand.toLowerCase() === b.toLowerCase()}
                    onChange={() => updateFilter('brand', brand.toLowerCase() === b.toLowerCase() ? '' : b)}
                    className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Price Range (₹)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <section className="lg:col-span-3 space-y-6">
          {/* Active filters pill display */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Found <span className="text-white font-bold">{total}</span> parts available
            </div>
            {fitMyVehicle && activeVehicle && (
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Filtered for {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Matching Parts Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {fitMyVehicle
                  ? `No parts currently in stock explicitly matched your ${activeVehicle.make} ${activeVehicle.model}. Try disabling the vehicle fitment filter or resetting search terms.`
                  : 'Try adjusting your search criteria or resetting filters to browse our wider catalog.'}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pt-8 border-t border-slate-800 flex items-center justify-center space-x-2">
              {Array.from({ length: pages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateFilter('page', pageNum.toString())}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                      page === pageNum
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-80 bg-slate-900 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Filter Parts</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h5 className="text-xs font-bold uppercase text-slate-300 mb-2">Category</h5>
              <div className="space-y-1">
                <button
                  onClick={() => { updateFilter('category', ''); setMobileFilterOpen(false); }}
                  className="w-full text-left text-xs py-1 text-slate-300"
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { updateFilter('category', c); setMobileFilterOpen(false); }}
                    className="w-full text-left text-xs py-1 text-slate-400 hover:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Apply / Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
