import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been received! Our tech team will reply within 24 hours.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Contact Technical Support</h1>
        <p className="text-xs sm:text-sm text-slate-400">Questions regarding fitment, custom mapping, or orders? We're on call.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">RevNation HQ</h2>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>Speed & Tech Park, Motor City, Bengaluru, KA 560001</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>support@revnation.com / sales@revnation.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+91 (080) 4123-9900 (Mon - Sat, 9am - 7pm IST)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Inquiry Dispatched</h3>
              <p className="text-xs text-slate-400">A technical specialist will review your vehicle specifications and reply.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Arun Kumar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="arun@domain.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about your build, part inquiry, or question..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
