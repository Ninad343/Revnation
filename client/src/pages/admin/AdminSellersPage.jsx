import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSellersPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const toast = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/sellers?status=${statusFilter}` : '/admin/sellers';
      const res = await api.get(url);
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load seller applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (id, businessName) => {
    if (!window.confirm(`Approve seller application for "${businessName}"? This will escalate their account role from USER to SELLER.`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      const res = await api.put(`/admin/sellers/${id}/approve`, {
        notes: 'Approved by administrator after business & inventory verification.'
      });
      if (res.data.success) {
        toast.success(`Application approved! User role upgraded to SELLER.`);
        await fetchApplications();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id, businessName) => {
    const reason = window.prompt(`Enter rejection reason for "${businessName}":`, 'Did not meet technical inspection or registration verification standards');
    if (!reason) return;

    try {
      setActionLoadingId(id);
      const res = await api.put(`/admin/sellers/${id}/reject`, { reason });
      if (res.data.success) {
        toast.info('Application rejected and applicant notified');
        await fetchApplications();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject application');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <Store className="w-6 h-6 text-amber-400 mr-2.5" />
            <span>Seller Onboarding & Verification</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review merchant credentials and grant selling privileges</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              !statusFilter ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              statusFilter === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-900 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : applications.length > 0 ? (
          applications.map((app) => {
            const isPending = app.status === 'PENDING';
            const isApproved = app.status === 'APPROVED';

            return (
              <div
                key={app._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-white">{app.businessName}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isPending
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Applicant: <span className="text-white font-semibold">{app.user?.name}</span> ({app.user?.email}) • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions for Pending */}
                  {isPending && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleReject(app._id, app.businessName)}
                        disabled={actionLoadingId === app._id}
                        className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs flex items-center space-x-1.5 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(app._id, app.businessName)}
                        disabled={actionLoadingId === app._id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{actionLoadingId === app._id ? 'Upgrading...' : 'Approve & Grant Seller Role'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Contact Information</span>
                    <span className="text-slate-200 block">{app.businessEmail}</span>
                    <span className="text-slate-300 block">{app.businessPhone}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">GSTIN / Registration</span>
                    <span className="text-white font-mono font-bold">{app.taxId || 'N/A'}</span>
                    <span className="text-slate-400 block truncate">{app.address}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.categories.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="text-slate-500 block">Business Background:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{app.description}</p>
                </div>

                {app.adminNotes && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-300">Admin Inspection Notes:</strong> {app.adminNotes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <Store className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Applications Found</h3>
            <p className="text-xs text-slate-400">There are currently no seller onboarding requests matching this status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
