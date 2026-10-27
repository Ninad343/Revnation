import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SellerProfilePage() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get('/sellers/application');
        if (res.data.success) {
          setApplication(res.data.application);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <Store className="w-6 h-6 text-emerald-400 mr-2.5" />
          <span>Seller Business Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Verified merchant credentials registered on RevNation</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-black">
            {application?.businessName ? application.businessName.charAt(0) : 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{application?.businessName || user?.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>Verified Seller</span>
              </span>
              <span className="text-xs text-slate-400">Account ID: {user?.id || user?._id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 block">Official Business Email:</span>
            <span className="font-semibold text-white flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {application?.businessEmail || user?.email}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block">Contact Phone:</span>
            <span className="font-semibold text-white flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {application?.businessPhone || user?.phone || 'Not provided'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block">GSTIN / Tax ID:</span>
            <span className="font-mono font-bold text-slate-200">
              {application?.taxId || 'GSTIN-VERIFIED'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block">Approved Categories:</span>
            <div className="flex flex-wrap gap-1 pt-1">
              {application?.categories?.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <span className="text-slate-500 block">Registered Facility Address:</span>
          <p className="text-slate-300 flex items-start">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 shrink-0" />
            <span>{application?.address || 'Auto Cluster Industrial Facility, Bangalore, India'}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <span className="text-slate-500 block">Business Description:</span>
          <p className="text-slate-300 leading-relaxed">
            {application?.description || 'Certified automotive parts merchant.'}
          </p>
        </div>
      </div>
    </div>
  );
}
