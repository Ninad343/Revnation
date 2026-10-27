import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      const res = await api.put(`/admin/reviews/${id}/moderate`, { status });
      if (res.data.success) {
        toast.success(`Review ${status.toLowerCase()}`);
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to moderate review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete review permanently?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data.success) {
        toast.success('Review removed');
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toast.error('Failed to remove review');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
          <MessageSquare className="w-6 h-6 text-purple-400 mr-2.5" />
          <span>Customer Reviews Moderation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Audit customer feedback, ratings, and verified purchase legitimacy</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-900 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div
              key={r._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="font-bold text-white text-xs">{r.user?.name}</div>
                  <span className="text-[10px] text-slate-500">for</span>
                  <div className="text-xs font-bold text-red-400 truncate max-w-xs">{r.product?.name}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    r.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {r.status}
                  </span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-sm text-white">{r.title}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800 text-xs">
                {r.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleModerate(r._id, 'APPROVED')}
                    className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800"
                  >
                    Approve
                  </button>
                )}
                {r.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleModerate(r._id, 'REJECTED')}
                    className="px-3 py-1 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 border border-red-800"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r._id)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No reviews found.</div>
        )}
      </div>
    </div>
  );
}
