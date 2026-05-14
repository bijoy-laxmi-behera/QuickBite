import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Components ───────────────────────────────────────────
import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";

// ─── Pages ────────────────────────────────────────────────
import Dashboard          from "./pages/Dashboard";
import UserManagement     from "./pages/UserManagement";
import VendorManagement   from "./pages/VendorManagement";
import OrderManagement    from "./pages/OrderManagement";
import DeliveryManagement from "./pages/DeliveryManagement";
import Analytics          from "./pages/Analytics";
import Coupons            from "./pages/Coupons";
import Payments           from "./pages/Payments";
import Reviews            from "./pages/FeedbackReviews";
import Settings           from "./pages/Settings";

export default function AdminLayout() {
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const navigate                  = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!localStorage.getItem("token") || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage} />;
      case "users":     return <UserManagement />;
      case "vendors":   return <VendorManagement />;
      case "orders":    return <OrderManagement />;
      case "delivery":  return <DeliveryManagement />;
      case "analytics": return <Analytics />;
      case "coupons":   return <Coupons />;
      case "payments":  return <Payments />;
      case "reviews":   return <Reviews />;
      case "settings":  return <Settings />;
      default:          return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar page={page} setPage={setPage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}