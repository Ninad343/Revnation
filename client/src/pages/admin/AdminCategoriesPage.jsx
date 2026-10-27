import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    subcategories: '',
    featured: true
  });
  const toast = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const subArray = formData.subcategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post('/categories', {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        subcategories: subArray,
        featured: formData.featured
      });

      if (res.data.success) {
        toast.success('Category created successfully');
        setShowAddModal(false);
        setFormData({ name: '', description: '', image: '', subcategories: '', featured: true });
        await fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        toast.success('Category deleted');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <Layers className="w-6 h-6 text-purple-400 mr-2.5" />
            <span>Product Catalog Categories</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure taxonomy hierarchy and navigation groupings</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-w-xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Create New Category</h3>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aerodynamics & Wings"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Overview of parts included in this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Subcategories (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Splitters, GT Wings, Diffusers, Canards"
              value={formData.subcategories}
              onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{cat.name}</h3>
                <span className="text-[10px] text-slate-500 font-mono">/{cat.slug}</span>
              </div>
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {cat.description || 'Automotive performance catalog grouping.'}
            </p>

            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Subcategories:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.subcategories.map((sc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
