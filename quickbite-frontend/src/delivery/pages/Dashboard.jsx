import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";
import { FaMotorcycle, FaCheckCircle, FaWallet, FaStar } from "react-icons/fa";

export default function Dashboard({ setPage }) {
  const [overview, setOverview] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Deliveries"
          value={overview?.todayDeliveries || 0}
          icon={<FaMotorcycle />}
          color="bg-orange-100 text-orange-500"
        />
        <StatCard
          title="Total Deliveries"
          value={overview?.totalDeliveries || 0}
          icon={<FaCheckCircle />}
          color="bg-green-100 text-green-500"
        />
        <StatCard
          title="Today's Earnings"
          value={`₹${overview?.todayEarnings || 0}`}
          icon={<FaWallet />}
          color="bg-blue-100 text-blue-500"
        />
        <StatCard
          title="Rating"
          value={`⭐ ${overview?.rating?.toFixed(1) || "0.0"}`}
          icon={<FaStar />}
          color="bg-purple-100 text-purple-500"
        />
      </div>

      {/* Active Order Banner */}
      {activeOrder ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold text-gray-800">Active Delivery</h3>
            </div>
            <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold">
              In Progress
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-gray-400 text-xs">Order ID</p>
              <p className="font-bold text-gray-800 mt-0.5">{activeOrder._id?.slice(-6).toUpperCase() || "—"}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-gray-400 text-xs">Customer</p>
              <p className="font-bold text-gray-800 mt-0.5">{activeOrder.user?.name || "—"}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-orange-100">
              <p className="text-gray-400 text-xs">Amount</p>
              <p className="font-bold text-orange-500 mt-0.5">₹{activeOrder.totalAmount || 0}</p>
            </div>
          </div>
          <button
            onClick={() => setPage("active")}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition"
          >
            View Active Delivery →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🏍️</p>
          <p className="font-semibold text-gray-700">No active delivery</p>
          <p className="text-sm text-gray-400 mt-1">You'll be assigned orders automatically.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          emoji="📦"
          title="Active Delivery"
          desc="View & update current order"
          onClick={() => setPage("active")}
        />
        <QuickCard
          emoji="📋"
          title="Delivery History"
          desc="Past completed deliveries"
          onClick={() => setPage("history")}
        />
        <QuickCard
          emoji="💰"
          title="Earnings"
          desc="Track your income"
          onClick={() => setPage("earnings")}
        />
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

function QuickCard({ emoji, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-orange-200 transition group"
    >
      <span className="text-3xl">{emoji}</span>
      <p className="font-semibold text-gray-800 mt-3 group-hover:text-orange-500 transition">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </button>
  );
}
