import React, { useState, useEffect } from 'react';
import { Package, Search, CheckCircle2, XCircle, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('q', search);

      const res = await api.get(`/admin/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const handleModerate = async (id, status, isActive) => {
    try {
      const res = await api.put(`/admin/products/${id}/moderate`, { status, isActive });
      if (res.data.success) {
        toast.success(`Product updated to ${status}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status, ...(isActive !== undefined ? { isActive } : {}) } : p))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to moderate product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <Package className="w-6 h-6 text-purple-400 mr-2.5" />
            <span>Marketplace Catalog Moderation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review seller listings, approve parts, and audit specifications</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {['', 'APPROVED', 'PENDING', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Moderation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0"
                        />
                        <div className="max-w-[200px] truncate">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">PN: {p.partNumber || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{p.seller?.name || 'Authorized'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.brand}</div>
                      <div className="text-[10px] text-slate-500">{p.category}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono">{p.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : p.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {p.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleModerate(p._id, 'APPROVED', true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleModerate(p._id, 'REJECTED', false)}
                            className="px-2.5 py-1 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 border border-red-800 text-[11px] font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No products found.</div>
        )}
      </div>
    </div>
  );
}
