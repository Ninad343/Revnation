import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Save, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SellerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [stockInputs, setStockInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/seller/me');
      if (res.data.success) {
        setProducts(res.data.products);
        const map = {};
        res.data.products.forEach((p) => {
          map[p._id] = p.stock;
        });
        setStockInputs(map);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id, val) => {
    setStockInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (id) => {
    const newStock = stockInputs[id];
    if (newStock === undefined || isNaN(newStock) || Number(newStock) < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    try {
      setUpdatingId(id);
      const res = await api.patch(`/products/${id}/stock`, { stock: Number(newStock) });
      if (res.data.success) {
        toast.success('Inventory stock level updated');
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: Number(newStock) } : p))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Boxes className="w-6 h-6 text-purple-400 mr-2.5" />
          <span>Inventory Stock Manager</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quickly adjust unit quantities to avoid out-of-stock cancellations
        </p>
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
                  <th className="py-3 px-4">Part</th>
                  <th className="py-3 px-4">Brand / SKU</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Update Quantity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {products.map((p) => {
                  const isLow = p.stock <= 5;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0"
                          />
                          <div className="font-bold text-white max-w-[220px] truncate">{p.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{p.brand}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {p.stock} units
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800 flex items-center w-fit space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          value={stockInputs[p._id] !== undefined ? stockInputs[p._id] : p.stock}
                          onChange={(e) => handleStockChange(p._id, e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSaveStock(p._id)}
                          disabled={updatingId === p._id}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1 ml-auto"
                        >
                          <Save className="w-3 h-3" />
                          <span>{updatingId === p._id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No inventory products found.</div>
        )}
      </div>
    </div>
  );
}
