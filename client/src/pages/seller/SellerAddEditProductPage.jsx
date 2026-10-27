import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Plus, Trash2, ArrowLeft, Save, Sparkles, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'Engine Parts',
  'Exhaust Systems',
  'Brakes & Braking',
  'Suspension & Chassis',
  'Wheels & Tyres',
  'Exterior Styling & Aerodynamics',
  'Interior & Cockpit',
  'Lighting & Vision',
  'Performance Tuning & Electronics'
];

const BADGE_OPTIONS = [
  'PERFORMANCE',
  'BEST SELLER',
  'TRACK READY',
  'OEM FIT',
  'NEW',
  'DEAL',
  'LIMITED STOCK'
];

export default function SellerAddEditProductPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Engine Parts',
    subcategory: '',
    brand: '',
    price: '',
    discountPrice: '',
    stock: 10,
    partNumber: '',
    sku: '',
    images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Material', value: 'High-Tensile Alloy' },
      { name: 'Fitment Type', value: 'Direct Bolt-On Replacement' }
    ],
    compatibility: [
      { make: 'BMW', model: '3 Series', yearStart: 2019, yearEnd: 2024, variant: '330i M-Sport' }
    ],
    badges: ['PERFORMANCE'],
    warranty: '1 Year Manufacturer Warranty',
    returnPolicy: '14 Days Replacement Guarantee',
    isActive: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (isEdit) {
      const loadProduct = async () => {
        try {
          setFetching(true);
          const res = await api.get(`/products/${id}`);
          if (res.data.success) {
            const p = res.data.product;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              category: p.category || 'Engine Parts',
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              price: p.price || '',
              discountPrice: p.discountPrice || '',
              stock: p.stock !== undefined ? p.stock : 10,
              partNumber: p.partNumber || '',
              sku: p.sku || '',
              images: p.images || [],
              specifications: p.specifications || [],
              compatibility: p.compatibility || [],
              badges: p.badges || [],
              warranty: p.warranty || '',
              returnPolicy: p.returnPolicy || '',
              isActive: p.isActive !== undefined ? p.isActive : true
            });
          }
        } catch (err) {
          toast.error('Failed to load product for editing');
          navigate('/seller/products');
        } finally {
          setFetching(false);
        }
      };
      loadProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Spec management
  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const updateSpec = (index, field, value) => {
    const next = [...formData.specifications];
    next[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: next }));
  };

  const removeSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  // Compatibility management
  const addCompatibility = () => {
    setFormData((prev) => ({
      ...prev,
      compatibility: [
        ...prev.compatibility,
        { make: 'BMW', model: '3 Series', yearStart: 2019, yearEnd: 2024, variant: 'All' }
      ]
    }));
  };

  const updateCompatibility = (index, field, value) => {
    const next = [...formData.compatibility];
    next[index][field] = field.includes('year') ? Number(value) : value;
    setFormData((prev) => ({ ...prev, compatibility: next }));
  };

  const removeCompatibility = (index) => {
    setFormData((prev) => ({
      ...prev,
      compatibility: prev.compatibility.filter((_, i) => i !== index)
    }));
  };

  // Image management
  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Badge toggle
  const toggleBadge = (badge) => {
    const prev = formData.badges;
    if (prev.includes(badge)) {
      setFormData({ ...formData, badges: prev.filter((b) => b !== badge) });
    } else {
      setFormData({ ...formData, badges: [...prev, badge] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.brand || !formData.price) {
      toast.error('Name, category, brand, and price are required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock)
      };

      if (isEdit) {
        const res = await api.put(`/products/${id}`, payload);
        if (res.data.success) {
          toast.success('Product updated successfully!');
          navigate('/seller/products');
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          toast.success('New product listed in marketplace!');
          navigate('/seller/products');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto p-12">
        <div className="h-96 bg-slate-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <Link to="/seller/products" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            {isEdit ? 'Edit Product Specifications' : 'List New Automobile Part'}
          </h1>
          <p className="text-xs text-slate-400">Configure part numbers, fitment applications, and engineering parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-slate-800">
            1. Core Details
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Product Title</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Brembo GT 6-Piston 380mm Monobloc Big Brake Kit"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                required
                placeholder="e.g. Brembo, Akrapovic, BBS"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                placeholder="e.g. Big Brake Kits, Catback"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Full Description</label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Detail build material, performance benefits, aerodynamic testing, and installation..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-slate-800">
            2. Pricing, Part Numbers & Inventory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                min={0}
                placeholder="245000"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discount Price (Optional)</label>
              <input
                type="number"
                name="discountPrice"
                min={0}
                placeholder="228000"
                value={formData.discountPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Stock Count</label>
              <input
                type="number"
                name="stock"
                required
                min={0}
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Part Number</label>
              <input
                type="text"
                name="partNumber"
                placeholder="PN-1N1.9002A"
                value={formData.partNumber}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Compatibility Builder */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                3. Vehicle Fitment Applications
              </h2>
              <p className="text-[11px] text-slate-400">Products with accurate compatibility trigger guaranteed fit badges</p>
            </div>
            <button
              type="button"
              onClick={addCompatibility}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.compatibility.map((c, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Make (e.g. BMW)"
                  required
                  value={c.make}
                  onChange={(e) => updateCompatibility(idx, 'make', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. 3 Series)"
                  required
                  value={c.model}
                  onChange={(e) => updateCompatibility(idx, 'model', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Year Start"
                  required
                  value={c.yearStart}
                  onChange={(e) => updateCompatibility(idx, 'yearStart', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <input
                  type="number"
                  placeholder="Year End"
                  required
                  value={c.yearEnd}
                  onChange={(e) => updateCompatibility(idx, 'yearEnd', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Variant (e.g. 330i)"
                    value={c.variant}
                    onChange={(e) => updateCompatibility(idx, 'variant', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompatibility(idx)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications Builder */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              4. Technical Specifications
            </h2>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Specification</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Parameter (e.g. Rotor Size, Weight)"
                  value={spec.name}
                  onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 380mm x 34mm floating)"
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Media */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-slate-800">
            5. Badges & Product Imagery
          </h2>

          {/* Badges */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Performance Badges
            </label>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((badge) => (
                <button
                  type="button"
                  key={badge}
                  onClick={() => toggleBadge(badge)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    formData.badges.includes(badge)
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>

          {/* Image URLs */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Image Gallery URLs
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                + Add Image
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pt-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 shrink-0 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to="/seller/products"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Product...' : isEdit ? 'Update Product' : 'List in Marketplace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
