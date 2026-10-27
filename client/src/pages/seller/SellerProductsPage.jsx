import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, Edit, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/seller/me');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load seller products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (id, currentVal) => {
    try {
      const res = await api.put(`/products/${id}`, { isActive: !currentVal });
      if (res.data.success) {
        toast.success(`Product ${!currentVal ? 'activated' : 'hidden from marketplace'}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: !currentVal } : p))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update product state');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Your Listed Products</h1>
          <p className="text-xs text-slate-400 mt-1">Manage specifications, pricing, visibility, and listings</p>
        </div>

        <Link
          to="/seller/products/new"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter by part name, brand, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Part</th>
                  <th className="py-3 px-4">SKU / Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div className="truncate max-w-[200px]">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">PN: {p.partNumber || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.brand}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock <= 5 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-950 text-slate-300'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p._id, p.isActive)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                          p.isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/seller/products/${p._id}/edit`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Products Found</h3>
            <p>You haven't listed any parts yet or no listings match your search filter.</p>
            <Link
              to="/seller/products/new"
              className="inline-block px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              List Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
