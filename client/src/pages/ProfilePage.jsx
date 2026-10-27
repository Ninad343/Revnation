import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, addAddress, deleteAddress, refreshUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updating, setUpdating] = useState(false);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.put('/auth/profile', { name, phone, avatar });
      if (res.data.success) {
        toast.success('Profile details updated');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const result = await addAddress(addressData);
    if (result.success) {
      setShowAddressForm(false);
      setAddressData({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Driver Profile & Addresses</h1>
        <p className="text-xs text-slate-400 mt-1">Manage personal contact information and delivery locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Profile Information */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-700" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center text-xl font-black">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user?.role === 'ADMIN'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : user?.role === 'SELLER'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
            >
              {updating ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Right: Shipping Addresses */}
        <div className="md:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Shipping Addresses</h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="flex items-center space-x-1 text-xs text-red-400 font-bold hover:text-red-300 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-white">New Shipping Address</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  required
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  required
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Street Address, Building, Flat"
                required
                value={addressData.street}
                onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={addressData.state}
                  onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  required
                  value={addressData.postalCode}
                  onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300">{addr.street}</div>
                    <div className="text-slate-400">{addr.city}, {addr.state} - {addr.postalCode}</div>
                    <div className="text-slate-500">Phone: {addr.phone}</div>
                  </div>

                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="Remove Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No saved addresses. Add an address for seamless checkout.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
