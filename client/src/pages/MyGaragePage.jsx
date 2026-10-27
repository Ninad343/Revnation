import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, CheckCircle2, ArrowRight, Gauge, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyGaragePage() {
  const { user, activeVehicle, addVehicle, setActiveVehicle, deleteVehicle } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    make: 'BMW',
    model: '3 Series',
    variant: '330i',
    year: 2022,
    fuelType: 'Petrol',
    nickname: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addVehicle({
      ...formData,
      year: Number(formData.year)
    });
    setLoading(false);
    setShowAddForm(false);
    setFormData({
      make: 'BMW',
      model: '3 Series',
      variant: '330i',
      year: 2022,
      fuelType: 'Petrol',
      nickname: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">My Garage</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain your vehicles to unlock guaranteed fitment badges and chassis-specific performance upgrades.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Add Vehicle Drawer/Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-base text-white">Add Vehicle to Garage</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Make / Manufacturer</label>
              <input
                type="text"
                required
                placeholder="e.g. BMW, Toyota, Audi"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Model</label>
              <input
                type="text"
                required
                placeholder="e.g. 3 Series, Fortuner, Octavia"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Model Year</label>
              <input
                type="number"
                required
                min={1990}
                max={2026}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Trim / Engine</label>
              <input
                type="text"
                placeholder="e.g. 330i, 2.8 4x4, vRS"
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Vehicle Nickname (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Project G20, Track Weapon"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30"
            >
              {loading ? 'Saving...' : 'Save to Garage'}
            </button>
          </div>
        </form>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.vehicles && user.vehicles.length > 0 ? (
          user.vehicles.map((v) => {
            const isActive = activeVehicle?.make === v.make && activeVehicle?.model === v.model && activeVehicle?.year === v.year;

            return (
              <div
                key={v._id}
                className={`bg-slate-900 border rounded-3xl p-6 transition-all relative overflow-hidden ${
                  isActive
                    ? 'border-emerald-500/80 shadow-xl shadow-emerald-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center space-x-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Vehicle</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-500">
                    <Car className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  {v.nickname && (
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                      "{v.nickname}"
                    </span>
                  )}
                  <h3 className="text-xl font-black text-white">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{v.variant || 'All Trims'}</span>
                    <span>•</span>
                    <span>{v.fuelType}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
                  <Link
                    to={`/products?vehicleMake=${encodeURIComponent(v.make)}&vehicleModel=${encodeURIComponent(v.model)}&vehicleYear=${v.year}&fitMyVehicle=true`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Find Parts</span>
                  </Link>

                  {!isActive && (
                    <button
                      onClick={() => setActiveVehicle(v._id)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                    >
                      Make Active
                    </button>
                  )}

                  <button
                    onClick={() => deleteVehicle(v._id)}
                    className="p-2.5 text-slate-500 hover:text-red-400 transition"
                    title="Remove Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Car className="w-16 h-16 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Your Garage is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your car or motorcycle to activate instant vehicle compatibility checks and personalized modification upgrades.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30"
            >
              + Add Your First Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
