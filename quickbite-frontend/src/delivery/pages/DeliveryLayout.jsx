import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar  from "../components/Topbar";
import API     from "@/services/axios";

import Dashboard       from "./Dashboard";
import ActiveDelivery  from "./ActiveDelivery";
import DeliveryHistory from "./DeliveryHistory";
import Earnings        from "./Earnings";
import DailySummary    from "./DailySummary";
import Profile         from "./Profile";

export default function DeliveryLayout() {
  const navigate = useNavigate();
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const prevOrderIdRef = useRef(null);

  // ─── AUTH CHECK ────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!localStorage.getItem("token") || user.role !== "delivery") {
      navigate("/delivery/login");
    }
  }, []);

  // ─── POLL FOR NEW ORDER ASSIGNMENT ────────────────────
  useEffect(() => {
    if (!isOnline) return;

    const poll = async () => {
      try {
        const res = await API.get("/delivery/active-order");
        const order = res.data.order;
        if (order && order._id !== prevOrderIdRef.current) {
          prevOrderIdRef.current = order._id;
          const notif = {
            title:   "🆕 New Order Assigned!",
            message: `Order #${order._id.slice(-6).toUpperCase()} — ₹${order.totalAmount}`,
            time:    new Date().toLocaleTimeString(),
          };
          setNotifications((prev) => [notif, ...prev]);
          toast.success("New order assigned!", { icon: "🚴", duration: 5000 });
        }
      } catch {
        // silent
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // ─── ONLINE/OFFLINE TOGGLE ─────────────────────────────
  const handleOnlineToggle = async (val) => {
    setIsOnline(val);
    try {
      await API.patch("/delivery/status", { isOnline: val });
    } catch {
      // silent — optimistic update
    }
    toast(val ? "You are now Online 🟢" : "You are now Offline 🔴", {
      duration: 2000,
    });
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage} isOnline={isOnline} />;
      case "active":    return <ActiveDelivery />;
      case "history":   return <DeliveryHistory />;
      case "earnings":  return <Earnings />;
      case "summary":   return <DailySummary />;
      case "profile":   return <Profile />;
      default:          return <Dashboard setPage={setPage} isOnline={isOnline} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOnline={isOnline}
        setIsOnline={handleOnlineToggle}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar page={page} notifications={notifications} isOnline={isOnline} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}