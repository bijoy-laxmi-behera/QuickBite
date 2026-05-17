// src/vendor/VendorLayout.jsx — UPDATED with all new features
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import API from "../services/axios";

// Components
import Sidebar from "./components/Sidebar";
import TopBar  from "./components/TopBar";

// Pages — existing
import Dashboard        from "./pages/Dashboard";
import Orders           from "./pages/Orders";
import Menu             from "./pages/Menu";
import Subscriptions    from "./pages/Subscriptions";
import DeliverySchedule from "./pages/DeliverySchedule";
import Earnings         from "./pages/Earnings";
import Reviews          from "./pages/Reviews";
import Profile          from "./pages/Profile";
import Notifications    from "./pages/Notifications";
import Settings         from "./pages/Settings";

// Pages — new features
import Analytics        from "./pages/Analytics";
import Coupons          from "./pages/Coupons";
import Offers           from "./pages/Offers";
import MenuPlanner      from "./pages/MenuPlanner";

export default function VendorLayout() {
  const loc      = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorType,  setVendorType]  = useState(null);
  const [restaurant,  setRestaurant]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/vendor/profile");
        const rest = data.data?.restaurant || data.data?.restaurantInfo || data.data || data;
        setRestaurant(rest);
        const type = (
          data.data?.restaurantInfo?.type ||
          data.data?.restaurant?.type     ||
          rest?.type || ""
        ).toLowerCase();
        setVendorType(type.includes("cloud") ? "cloud_kitchen" : "restaurant");
      } catch {
        setVendorType("restaurant");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isCloudKitchen = vendorType === "cloud_kitchen";
  const seg      = loc.pathname.split("/").filter(Boolean);
  const activePage = seg[seg.length - 1] || "dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        isCloudKitchen={isCloudKitchen}
        navigate={navigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          setSidebarOpen={setSidebarOpen}
          restaurant={restaurant}
          isCloudKitchen={isCloudKitchen}
          loading={loading}
        />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Routes>
              <Route path="/"             element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="dashboard"     element={<Dashboard     isCloudKitchen={isCloudKitchen} restaurant={restaurant} />} />
              <Route path="orders"        element={<Orders        isCloudKitchen={isCloudKitchen} />} />
              <Route path="menu"          element={<Menu          isCloudKitchen={isCloudKitchen} />} />
              <Route path="earnings"      element={<Earnings      isCloudKitchen={isCloudKitchen} />} />
              <Route path="reviews"       element={<Reviews />} />
              <Route path="profile"       element={<Profile       restaurant={restaurant} setRestaurant={setRestaurant} isCloudKitchen={isCloudKitchen} />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings"      element={<Settings />} />

              {/* ── Both vendor types ── */}
              <Route path="analytics" element={<Analytics isCloudKitchen={isCloudKitchen} />} />

              {/* ── Restaurant only ── */}
              {!isCloudKitchen && (
                <>
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="offers"  element={<Offers />} />
                </>
              )}

              {/* ── Cloud Kitchen only ── */}
              {isCloudKitchen && (
                <>
                  <Route path="subscriptions"     element={<Subscriptions />} />
                  <Route path="delivery-schedule" element={<DeliverySchedule />} />
                  <Route path="menu-planner"      element={<MenuPlanner />} />
                </>
              )}

              <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}