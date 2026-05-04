import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";
import { FaMotorcycle, FaCheckCircle, FaWallet, FaStar } from "react-icons/fa";

export default function Dashboard({ setPage, isOnline }) {
  const [overview, setOverview]     = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [acting, setActing]         = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, activeRes] = await Promise.all([
        API.get("/delivery/overview"),
        API.get("/delivery/active-order"),
      ]);
      setOverview(overviewRes.data.data);
      setActiveOrder(activeRes.data.order || null);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActing(true);
      await API.patch(`/delivery/orders/${activeOrder._id}/accept`);
      toast.success("Order accepted!");
      fetchData();
    } catch {
      toast.error("Failed to accept order");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    try {
      setActing(true);
      await API.patch(`/delivery/orders/${activeOrder._id}/reject`);
      toast.success("Order rejected");
      setActiveOrder(null);
    } catch {
      toast.error("Failed to reject order");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back! 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's your delivery summary for today.</p>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-yellow-500 text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">You are currently Offline</p>
            <p className="text-xs text-yellow-600">Go online from the sidebar to receive orders.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Deliveries" value={overview?.todayDeliveries || 0}     icon={<FaMotorcycle />}   color="bg-orange-100 text-orange-500" />
        <StatCard title="Total Deliveries"   value={overview?.totalDeliveries || 0}     icon={<FaCheckCircle />}  color="bg-green-100 text-green-500" />
        <StatCard title="Today's Earnings"   value={`₹${overview?.todayEarnings || 0}`} icon={<FaWallet />}       color="bg-blue-100 text-blue-500" />
        <StatCard title="Rating"             value={`⭐ ${overview?.rating?.toFixed(1) || "0.0"}`} icon={<FaStar />} color="bg-purple-100 text-purple-500" />
      </div>

      {/* New Order — Accept / Reject */}
      {activeOrder && activeOrder.deliveryStatus === null && (
        <div className="bg-white border-2 border-orange-400 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <h3 className="font-bold text-gray-800">🆕 New Order Request!</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <InfoBox label="Order ID" value={`#${activeOrder._id?.slice(-6).toUpperCase()}`} />
            <InfoBox label="Customer" value={activeOrder.user?.name || "—"} />
            <InfoBox label="Amount"   value={`₹${activeOrder.totalAmount}`} orange />
          </div>
          <p className="text-xs text-gray-400 mb-4">📍 {activeOrder.deliveryAddress || "Address not set"}</p>
          <div className="flex gap-3">
            <button onClick={handleAccept} disabled={acting}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition">
              ✅ Accept
            </button>
            <button onClick={handleReject} disabled={acting}
              className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-xl font-semibold text-sm transition border border-red-200">
              ✕ Reject
            </button>
          </div>
        </div>
      )}

      {/* Active Order Banner */}
      {activeOrder && activeOrder.deliveryStatus !== null ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold text-gray-800">Active Delivery</h3>
            </div>
            <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold">
              {activeOrder.deliveryStatus?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <InfoBox label="Order ID" value={`#${activeOrder._id?.slice(-6).toUpperCase()}`} />
            <InfoBox label="Customer" value={activeOrder.user?.name || "—"} />
            <InfoBox label="Amount"   value={`₹${activeOrder.totalAmount}`} orange />
          </div>
          <button onClick={() => setPage("active")}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition">
            View Active Delivery →
          </button>
        </div>
      ) : !activeOrder && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🏍️</p>
          <p className="font-semibold text-gray-700">No active delivery</p>
          <p className="text-sm text-gray-400 mt-1">
            {isOnline ? "You'll be assigned orders automatically." : "Go online to receive orders."}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard emoji="📦" title="Active Delivery"  desc="View current order"     onClick={() => setPage("active")} />
        <QuickCard emoji="📋" title="Delivery History" desc="Past deliveries"         onClick={() => setPage("history")} />
        <QuickCard emoji="📊" title="Daily Summary"    desc="Today's performance"    onClick={() => setPage("summary")} />
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl ${color} text-xl`}>{icon}</div>
    </div>
  );
}

function InfoBox({ label, value, orange }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-orange-100">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`font-bold mt-0.5 ${orange ? "text-orange-500" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}

function QuickCard({ emoji, title, desc, onClick }) {
  return (
    <button onClick={onClick}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-orange-200 transition group">
      <span className="text-3xl">{emoji}</span>
      <p className="font-semibold text-gray-800 mt-3 group-hover:text-orange-500 transition">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </button>
  );
}