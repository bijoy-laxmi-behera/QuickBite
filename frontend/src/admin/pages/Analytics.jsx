import { useEffect, useState } from "react";
import API from "../../services/axios";
import StatCard from "../components/StatCard";
import { BarChart2, TrendingUp, Clock, Store, DollarSign } from "lucide-react";

export default function Analytics() {
  const [overview, setOverview]   = useState(null);
  const [revenue, setRevenue]     = useState([]);
  const [orders, setOrders]       = useState([]);
  const [topRest, setTopRest]     = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [o, r, ord, t, p] = await Promise.all([
          API.get("/admin/analytics/overview"),
          API.get("/admin/analytics/revenue"),
          API.get("/admin/analytics/orders"),
          API.get("/admin/analytics/restaurants"),
          API.get("/admin/analytics/peak-hours"),
        ]);
        setOverview(o.data);
        setRevenue(r.data || []);
        setOrders(ord.data || []);
        setTopRest(t.data || []);
        setPeakHours(p.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const maxRevenue = Math.max(...revenue.map(r => r.totalRevenue || 0), 1);
  const maxOrders  = Math.max(...peakHours.map(p => p.totalOrders || 0), 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"     value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="bg-orange-100 text-orange-500" />
        <StatCard title="Total Orders"      value={overview?.totalOrders || 0}      icon={<BarChart2 size={20} />}  color="bg-blue-100 text-blue-500" />
        <StatCard title="Total Users"       value={overview?.totalUsers || 0}       icon={<TrendingUp size={20} />} color="bg-green-100 text-green-500" />
        <StatCard title="Total Restaurants" value={overview?.totalRestaurants || 0} icon={<Store size={20} />}      color="bg-purple-100 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Revenue Trend</h3>
          {revenue.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">📈</p><p className="text-sm">No revenue data</p></div>
          ) : (
            <div className="space-y-3">
              {revenue.slice(-7).map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    {r._id?.day}/{r._id?.month}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${((r.totalRevenue || 0) / maxRevenue) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-20 text-right">₹{r.totalRevenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Order Status Breakdown</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">📦</p><p className="text-sm">No data</p></div>
          ) : (
            <div className="space-y-3">
              {orders.map((s, i) => {
                const total = orders.reduce((sum, x) => sum + x.count, 0);
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28 flex-shrink-0 capitalize">{s._id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-16 text-right">{s.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Top Restaurants</h3>
          {topRest.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">🏆</p><p className="text-sm">No data yet</p></div>
          ) : (
            <div className="space-y-3">
              {topRest.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.restaurant?.name || "Restaurant"}</p>
                    <p className="text-xs text-gray-400">{r.totalOrders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-orange-500">₹{r.revenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Peak Hours</h3>
          {peakHours.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">⏰</p><p className="text-sm">No data</p></div>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {Array.from({length: 24}, (_, h) => {
                const found = peakHours.find(p => p._id?.hour === h);
                const val = found?.totalOrders || 0;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-orange-500 rounded-sm transition-all"
                      style={{ height: `${(val / maxOrders) * 100}%`, minHeight: val > 0 ? "4px" : "0" }}
                      title={`${h}:00 — ${val} orders`}
                    />
                    {h % 6 === 0 && <span className="text-[9px] text-gray-400">{h}h</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
