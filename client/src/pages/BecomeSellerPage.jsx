import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, Clock, CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AVAILABLE_CATEGORIES = [
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

export default function BecomeSellerPage() {
  const { user, isSeller } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: user?.email || '',
    businessPhone: user?.phone || '',
    address: '',
    taxId: '',
    description: '',
    categories: []
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sellers/application');
        if (res.data.success && res.data.application) {
          setExistingApp(res.data.application);
        }
      } catch (err) {
        console.error('Failed to load application status:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, []);

  const handleCategoryToggle = (categoryName) => {
    const prev = formData.categories;
    if (prev.includes(categoryName)) {
      setFormData({ ...formData, categories: prev.filter((c) => c !== categoryName) });
    } else {
      setFormData({ ...formData, categories: [...prev, categoryName] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast.error('Please select at least one product category you plan to sell');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/sellers/apply', formData);
      if (res.data.success) {
        setExistingApp(res.data.application);
        toast.success('Seller application submitted for administrator review!');
      }
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="h-64 bg-slate-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  // Already a Seller
  if (isSeller) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Approved RevNation Seller</h2>
        <p className="text-xs text-slate-400">
          Your merchant account is approved and active. You can list products, manage inventory, and fulfill customer orders in your dedicated dashboard.
        </p>
        <Link
          to="/seller"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
        >
          <span>Open Seller Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Application Pending Review
  if (existingApp && existingApp.status === 'PENDING') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
            Application Under Administrator Review
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            "{existingApp.businessName}"
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Your application was submitted on {new Date(existingApp.createdAt).toLocaleDateString()}. To maintain marketplace quality and prevent counterfeit parts, an administrator reviews business credentials before granting seller permissions.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left text-xs space-y-3 max-w-md mx-auto">
          <div className="text-slate-400">Submitted Categories:</div>
          <div className="flex flex-wrap gap-1.5">
            {existingApp.categories.map((c, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                {c}
              </span>
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Application Rejected (can reapply)
  const isRejected = existingApp && existingApp.status === 'REJECTED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Partner with RevNation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Reach thousands of automobile builders and enthusiasts across India.
        </p>
      </div>

      {isRejected && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-1">
          <div className="font-bold flex items-center">
            <XCircle className="w-4 h-4 mr-1.5 text-red-400" />
            Previous Application Update:
          </div>
          <div>{existingApp.adminNotes || 'Application did not meet marketplace requirements.'}</div>
          <div className="text-slate-400 text-[11px] pt-1">You may correct the information and re-apply below.</div>
        </div>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-red-500" />
            Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Company / Workshop Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Performance Engineering"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">GSTIN / Business Registration ID</label>
              <input
                type="text"
                placeholder="e.g. 27AAACV9821M1Z5"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Official Business Email</label>
              <input
                type="email"
                required
                placeholder="sales@yourbrand.com"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Official Contact Phone</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Physical Facility / Warehouse Address</label>
            <textarea
              rows={2}
              required
              placeholder="Unit #, Industrial Estate, City, State, PIN"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Business Background & Manufacturing / Sourcing Details</label>
            <textarea
              rows={3}
              required
              placeholder="Explain brands you represent, fabrication capabilities, and experience..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Categories Checkboxes */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Product Categories You Intend to Sell (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {AVAILABLE_CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition ${
                  formData.categories.includes(cat)
                    ? 'bg-amber-950/40 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span className="font-semibold">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition"
        >
          <span>{submitting ? 'Submitting Application...' : 'Submit Application for Admin Approval'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RevNation rigorously enforces seller approval prior to product listing permissions.</span>
        </div>
      </form>
    </div>
  );
}
