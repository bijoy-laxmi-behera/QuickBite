import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { DeliveryProvider, useDelivery } from "./DeliveryContext";
import Sidebar   from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import TopBar    from "./components/TopBar";

function DeliveryShell() {
  const { loading } = useDelivery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Loading</p>
        </div>
      </div>
    );
  }

  return (
    // ⚠️ h-screen + overflow-hidden = page never scrolls as a whole
    <div className="h-screen overflow-hidden bg-gray-50 text-gray-900 flex">

      {/* ── SIDEBAR — locked to viewport height, never scrolls with page ── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── MAIN CONTENT — fills remaining width, scrolls independently ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar onMenuToggle={() => setMobileMenuOpen(p => !p)} />

        {/* Only THIS element scrolls */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default function DeliveryLayout() {
  return (
    <DeliveryProvider>
      <DeliveryShell />
    </DeliveryProvider>
  );
}