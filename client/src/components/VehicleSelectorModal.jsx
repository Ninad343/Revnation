import React, { useState } from 'react';
import { X, Car, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POPULAR_VEHICLES = [
  { make: 'BMW', models: ['3 Series', '4 Series', 'M3', 'M340i', '5 Series', 'M5', 'Z4'] },
  { make: 'Toyota', models: ['Fortuner', 'Hilux', 'Supra', 'Innova Crysta', 'Camry', 'Land Cruiser'] },
  { make: 'Audi', models: ['A4', 'S4', 'RS5', 'A6', 'S5 Sportback', 'RS6 Avant', 'TT'] },
  { make: 'Volkswagen', models: ['Golf GTI', 'Golf R', 'Polo GT TSI', 'Virtus GT', 'Tiguan'] },
  { make: 'Skoda', models: ['Octavia vRS', 'Octavia', 'Superb', 'Slavia 1.5 TSI', 'Kodiaq'] },
  { make: 'Honda', models: ['Civic', 'Civic Type R', 'City', 'Accord'] },
  { make: 'Hyundai', models: ['i20 N Line', 'Verna 1.5 Turbo', 'Creta N Line', 'Ioniq 5'] },
  { make: 'Mercedes-Benz', models: ['C-Class', 'C43 AMG', 'C63 AMG', 'A45 AMG', 'E-Class'] },
  { make: 'Porsche', models: ['911 Carrera', '718 Cayman', 'Taycan', 'Macan GTS'] }
];

export default function VehicleSelectorModal({ isOpen, onClose }) {
  const { isAuthenticated, addVehicle, setActiveVehicle } = useAuth();

  const [selectedMake, setSelectedMake] = useState('BMW');
  const [selectedModel, setSelectedModel] = useState('3 Series');
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedVariant, setSelectedVariant] = useState('330i M-Sport');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentMakeData = POPULAR_VEHICLES.find((v) => v.make === selectedMake) || POPULAR_VEHICLES[0];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (isAuthenticated) {
      await addVehicle({
        make: selectedMake,
        model: selectedModel,
        year: Number(selectedYear),
        variant: selectedVariant,
        fuelType: 'Petrol',
        nickname: `${selectedYear} ${selectedMake} ${selectedModel}`
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Select Your Vehicle</h3>
            <p className="text-xs text-slate-400">Unlock exact-fit parts and compatibility indicators</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Make selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Manufacturer / Make
            </label>
            <select
              value={selectedMake}
              onChange={(e) => {
                setSelectedMake(e.target.value);
                const nextMake = POPULAR_VEHICLES.find((v) => v.make === e.target.value);
                if (nextMake) setSelectedModel(nextMake.models[0]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500"
            >
              {POPULAR_VEHICLES.map((v) => (
                <option key={v.make} value={v.make}>
                  {v.make}
                </option>
              ))}
            </select>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500"
            >
              {currentMakeData.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500"
              >
                {Array.from({ length: 15 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Trim / Variant
              </label>
              <input
                type="text"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                placeholder="e.g. 330i, vRS, 4x4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center space-x-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Set Active Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
