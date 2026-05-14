import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDelivery } from "../DeliveryContext";
import axios from "axios";
import {
  IndianRupee,
  Bike,
  Star,
  TrendingUp,
  Clock,
  Package,
  ChevronRight,
  CheckCircle,
  XCircle,
  MapPin,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function StatCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
        >
          <Icon size={18} className={color} />
        </div>
        <ArrowUpRight
          size={14}
          className="text-zinc-700 group-hover:text-zinc-500 transition-colors"
        />
      </div>
      <div>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function OrderRow({ order, onAccept, onReject }) {
  const earnings = Math.round((order.pricing?.deliveryFee || 40) * 0.85);
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
      <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Package size={15} className="text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-orange-400">
            {order.orderId || "QB-" + order._id?.slice(-6)}
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <MapPin size={10} /> {order.address?.city || "City"}
          </span>
        </div>
        <p className="text-sm font-medium text-zinc-200 mt-0.5 truncate">
          {order.items?.map((i) => i.name).join(", ") || "Food items"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-black text-emerald-400">
          +₹{earnings}
        </span>
        {onAccept && (
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onReject(order._id)}
              className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
            >
              <XCircle size={13} className="text-red-400" />
            </button>
            <button
              onClick={() => onAccept(order._id)}
              className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle size={13} className="text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { partner } = useDelivery();
  const [earnings, setEarnings] = useState(null);
  const [stats, setStats] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/delivery/earnings/summary`, { headers }),
      axios.get(`${API}/delivery/performance/stats`, { headers }),
      axios.get(`${API}/delivery/orders/incoming`, { headers }),
    ])
      .then(([e, s, o]) => {
        setEarnings(e.data);
        setStats(s.data);
        const raw = o.data?.orders || o.data?.data || [];
        setIncoming(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (id) => {
    try {
      await axios.patch(
        `${API}/delivery/orders/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIncoming((p) => p.filter((o) => o._id !== id));
    } catch {}
  };
  const handleReject = async (id) => {
    try {
      await axios.patch(
        `${API}/delivery/orders/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIncoming((p) => p.filter((o) => o._id !== id));
    } catch {}
  };

  // Weekly bar chart data (mock if no data)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData = earnings?.weeklyBreakdown || [
    120, 80, 200, 150, 300, 250, 180,
  ];
  const maxVal = Math.max(...weekData, 1);

  return (
    <div className="space-y-6">
      {/* ── Hero greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-sm font-medium">Good day,</p>
          <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
            {partner?.name?.split(" ")[0] || "Partner"} 👋
          </h2>
        </div>
        <Link
          to="/delivery/orders/incoming"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
        >
          <Package size={15} />
          View Orders
          {incoming.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {incoming.length}
            </span>
          )}
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Earnings"
          value={`₹${(earnings?.total || 0).toLocaleString("en-IN")}`}
          sub="Base + tips"
          icon={IndianRupee}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
        <StatCard
          label="Deliveries Today"
          value={stats?.completionRate ? Math.round(stats.completionRate) : 0}
          sub={`${stats?.totalDeliveries || 0} total`}
          icon={Bike}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Rating"
          value={stats?.rating ? `${stats.rating.toFixed(1)} ★` : "New"}
          sub="Customer reviews"
          icon={Star}
          color="text-yellow-400"
          bg="bg-yellow-500/10"
        />
        <StatCard
          label="Weekly Earnings"
          value={`₹${(earnings?.totalEarnings || 0).toLocaleString("en-IN")}`}
          sub={`${stats?.acceptanceRate || "—"}% acceptance`}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly earnings chart */}
        <div className="lg:col-span-2 bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Earnings</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
            </div>
            <Link
              to="/delivery/earnings"
              className="text-xs text-orange-400 font-semibold flex items-center gap-0.5 hover:text-orange-300"
            >
              Details <ChevronRight size={13} />
            </Link>
          </div>
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-32">
            {weekDays.map((day, i) => {
              const h = Math.round((weekData[i] / maxVal) * 100);
              const isToday = i === new Date().getDay() - 1;
              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full flex items-end justify-center"
                    style={{ height: "96px" }}
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? "bg-orange-500 shadow-lg shadow-orange-500/30"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                      style={{ height: `${Math.max(h, 8)}%` }}
                      title={`₹${weekData[i]}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${isToday ? "text-orange-400" : "text-zinc-600"}`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Total */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Total this week</span>
            <span className="text-sm font-black text-white">
              ₹{(earnings?.weekly || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Performance snapshot */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Performance</h3>
            <Link
              to="/delivery/performance"
              className="text-xs text-orange-400 font-semibold flex items-center gap-0.5 hover:text-orange-300"
            >
              Full report <ChevronRight size={13} />
            </Link>
          </div>
          {[
            {
              label: "Acceptance Rate",
              val: stats?.acceptanceRate || 0,
              color: "bg-orange-500",
            },
            {
              label: "Completion Rate",
              val: stats?.completionRate || 0,
              color: "bg-emerald-500",
            },
            {
              label: "On-Time Rate",
              val: stats?.onTimeRate || 0,
              color: "bg-blue-500",
            },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-zinc-400 font-medium">
                  {label}
                </span>
                <span className="text-xs font-bold text-white">{val}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-yellow-400">
                {stats?.rating?.toFixed(1) || "—"}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Rating
              </p>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-white">
                {stats?.totalDeliveries || 0}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Incoming Orders + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming orders */}
        <div className="lg:col-span-2 bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Incoming Orders</h3>
              {incoming.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {incoming.length} new
                </span>
              )}
            </div>
            <Link
              to="/delivery/orders/incoming"
              className="text-xs text-orange-400 font-semibold flex items-center gap-0.5 hover:text-orange-300"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-zinc-900 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : incoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-3">
                <Bike size={22} className="text-zinc-700" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">
                No incoming orders
              </p>
              <p className="text-zinc-700 text-xs mt-1">
                Stay online to receive new orders
              </p>
            </div>
          ) : (
            <div className="p-2">
              {incoming.slice(0, 4).map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Today's summary */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Today's Summary</h3>
          {[
            {
              label: "Deliveries",
              value: stats?.totalDeliveries || 0,
              unit: "",
              color: "text-orange-400",
            },
            {
              label: "Earnings",
              value: `₹${earnings?.totalEarnings || 0}`,
              unit: "",
              color: "text-emerald-400",
            },
            {
              label: "Avg Per Trip",
              value: `₹${Math.round(earnings?.avgPerTrip || 0)}`,
              unit: "",
              color: "text-yellow-400",
            },
            {
              label: "Online Hours",
              value: stats?.onlineHours || "—",
              unit: "h",
              color: "text-blue-400",
            },
            {
              label: "Avg. Distance",
              value: stats?.avgDistance || "—",
              unit: "km",
              color: "text-purple-400",
            },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-xs text-zinc-500 font-medium">{label}</span>
              <span className={`text-sm font-black ${color}`}>
                {value}
                {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
