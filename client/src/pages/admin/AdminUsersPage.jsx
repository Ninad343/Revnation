import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Store, User, Ban, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('q', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'ADMIN') {
      toast.error('Cannot suspend an Administrator');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Set status of ${user.name} to ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await api.put(`/admin/users/${user._id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <Users className="w-6 h-6 text-blue-400 mr-2.5" />
            <span>Platform User Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage driver accounts, seller privileges, and security suspensions</p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {['', 'USER', 'SELLER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                roleFilter === r ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {r || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
      </form>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Garage Vehicles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-white text-xs">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 text-slate-400">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : u.role === 'SELLER'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.vehicles?.length || 0} saved
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800/80'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">No users found matching query.</div>
        )}
      </div>
    </div>
  );
}
