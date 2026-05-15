// src/vendor/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axios";
import {
  FaRupeeSign, FaShoppingBag, FaStar, FaClock,
  FaUsers, FaCrown, FaArrowUp, FaArrowDown, FaSpinner,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function StatCard({ icon, label, value, sub, color = "orange", trend }) {
  const colors = {
    orange: "bg-orange-50 text-orange-500 border-orange-100",
    green:  "bg-green-50  text-green-500  border-green-100",
    blue:   "bg-blue-50   text-blue-500   border-blue-100",
    purple: "bg-purple-50 text-purple-500 border-purple-100",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border ${colors[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <FaArrowUp className="text-[9px]" /> : <FaArrowDown className="text-[9px]" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-800 mt-3">{value ?? "—"}</p>
      <p className="text-sm font-semibold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ isCloudKitchen, restaurant }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, lo, ti, rv] = await Promise.allSettled([
          API.get("/vendor/overview"),
          API.get("/vendor/live-orders"),
          API.get("/vendor/top-items"),
          API.get("/vendor/weekly-revenue"),
        ]);
        if (ov.status === "fulfilled") setOverview(ov.value.data.data || ov.value.data);
        if (lo.status === "fulfilled") setLiveOrders(lo.value.data.data || []);
        if (ti.status === "fulfilled") setTopItems(ti.value.data.data || []);
        if (rv.status === "fulfilled") setRevenue(rv.value.data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(() => API.get("/vendor/live-orders").then(({ data }) => setLiveOrders(data.data || [])).catch(() => {}), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FaSpinner className="animate-spin text-orange-500 text-3xl" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Welcome banner */}
      <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${
        isCloudKitchen ? "bg-gradient-to-r from-purple-600 to-indigo-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
      }`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <p className="text-white/80 text-sm font-medium">Welcome back 👋</p>
        <h1 className="text-2xl font-black mt-1">{restaurant?.name || "Your Kitchen"}</h1>
        <p className="text-white/70 text-sm mt-0.5">
          {isCloudKitchen ? "Cloud Kitchen · Subscription Meals" : "Restaurant · Online Orders"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaRupeeSign />}    label="Today's Revenue"  value={`₹${overview?.todayRevenue ?? 0}`}       color="orange" trend={overview?.revenueTrend} />
        <StatCard icon={<FaShoppingBag />}  label="Total Orders"     value={overview?.totalOrders ?? 0}                color="blue"   trend={overview?.orderTrend} />
        <StatCard icon={<FaStar />}         label="Avg Rating"       value={overview?.avgRating ?? "—"}                color="purple" />
        <StatCard
          icon={isCloudKitchen ? <FaCrown /> : <FaUsers />}
          label={isCloudKitchen ? "Active Subscribers" : "Customers Today"}
          value={isCloudKitchen ? (overview?.activeSubscribers ?? 0) : (overview?.customersToday ?? 0)}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <h3 className="font-black text-gray-800">Live Orders</h3>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{liveOrders.length}</span>
            </div>
            <button onClick={() => navigate("/vendor/orders")} className="text-xs text-orange-500 font-semibold hover:underline">View All →</button>
          </div>

          {liveOrders.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl">🍽️</span>
              <p className="text-gray-400 text-sm font-medium mt-2">No active orders right now</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {liveOrders.slice(0, 5).map(order => (
                <div key={order._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/vendor/orders")}>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    order.status === "pending"  ? "bg-yellow-100 text-yellow-700" :
                    order.status === "confirmed"? "bg-blue-100   text-blue-700"   :
                    order.status === "preparing"? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  }`}>
                    {(order.status || "pending").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">#{order.orderId || order._id?.slice(-6)}</p>
                    <p className="text-xs text-gray-400">{order.items?.length || 0} items · ₹{order.pricing?.totalAmount || 0}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <FaClock className="text-[10px]" />
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-gray-800">Top Items</h3>
            <p className="text-xs text-gray-400 mt-0.5">Most ordered this week</p>
          </div>
          {topItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No data yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {topItems.slice(0, 5).map((item, i) => (
                <div key={item._id || i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    i === 0 ? "bg-yellow-100 text-yellow-700" :
                    i === 1 ? "bg-gray-100 text-gray-600" :
                    i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.orderCount || 0} orders</p>
                  </div>
                  <span className="text-sm font-bold text-orange-500">₹{item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue chart */}
      {revenue.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-800 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill={isCloudKitchen ? "#8b5cf6" : "#f97316"} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
