import { useEffect, useState } from "react";
import API from "../../services/axios";
import StatCard from "../components/StatCard";
import { Users, Store, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard({ setPage }) {
  const [stats, setStats]         = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [liveOrders, setLiveOrders]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, ordersRes, liveRes] = await Promise.all([
        API.get("/admin/analytics/overview"),
        API.get("/admin/orders"),
        API.get("/admin/orders/live"),
      ]);
      setStats(overviewRes.data);
      setRecentOrders((ordersRes.data.orders || []).slice(0, 5));
      setLiveOrders((liveRes.data.orders || []).slice(0, 5));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const statusColor = {
    pending:          "bg-yellow-100 text-yellow-700",
    accepted:         "bg-blue-100 text-blue-700",
    preparing:        "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-indigo-100 text-indigo-700",
    delivered:        "bg-green-100 text-green-700",
    cancelled:        "bg-red-100 text-red-700",
    completed:        "bg-green-100 text-green-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"      value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}  icon={<DollarSign size={20} />} color="bg-orange-100 text-orange-500" />
        <StatCard title="Total Orders"       value={stats?.totalOrders || 0}       icon={<ShoppingBag size={20} />}  color="bg-blue-100 text-blue-500" />
        <StatCard title="Total Users"        value={stats?.totalUsers || 0}        icon={<Users size={20} />}        color="bg-green-100 text-green-500" />
        <StatCard title="Total Restaurants"  value={stats?.totalRestaurants || 0}  icon={<Store size={20} />}        color="bg-purple-100 text-purple-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Manage Users",       page: "users",    emoji: "👥", color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Pending Vendors",    page: "vendors",  emoji: "🏪", color: "bg-orange-50 border-orange-100 text-orange-700" },
          { label: "Live Orders",        page: "orders",   emoji: "📦", color: "bg-green-50 border-green-100 text-green-700" },
          { label: "View Analytics",     page: "analytics",emoji: "📊", color: "bg-purple-50 border-purple-100 text-purple-700" },
        ].map(item => (
          <button key={item.page} onClick={() => setPage(item.page)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${item.color} hover:shadow-md transition group`}>
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-semibold text-center">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold text-gray-800">Live Orders</h3>
            </div>
            <button onClick={() => setPage("orders")} className="text-xs text-orange-500 font-semibold hover:underline">View all</button>
          </div>
          {liveOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm">No live orders right now</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {liveOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">#{order._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{order.user?.name || "Customer"}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-orange-500 font-bold mt-1">₹{order.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <button onClick={() => setPage("orders")} className="text-xs text-orange-500 font-semibold hover:underline">View all</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">#{order._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-orange-500 font-bold mt-1">₹{order.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
