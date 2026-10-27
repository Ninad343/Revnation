import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VehicleSelectorModal from '../components/VehicleSelectorModal';

export default function RootLayout() {
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      <Navbar onOpenVehicleModal={() => setVehicleModalOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ openVehicleModal: () => setVehicleModalOpen(true) }} />
      </main>
      <Footer />
      <VehicleSelectorModal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
      />
    </div>
  );
}
