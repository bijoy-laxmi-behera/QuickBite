// src/vendor/pages/Analytics.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import {
  FaSpinner, FaRupeeSign, FaShoppingBag, FaChartBar,
  FaCheckCircle, FaTimesCircle, FaArrowUp, FaArrowDown,
} from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

const PERIODS = [
  { val:"7",  label:"Last 7 days"  },
  { val:"14", label:"Last 14 days" },
  { val:"30", label:"Last 30 days" },
];

const STATUS_COLORS = {
  pending:   "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#f97316",
  delivered: "#10b981",
  cancelled: "#ef4444",
  completed: "#10b981",
};

function StatCard({ icon, label, value, sub, color="orange" }) {
  const bg = { orange:"bg-orange-50 text-orange-500", green:"bg-green-50 text-green-500",
               blue:"bg-blue-50 text-blue-500", red:"bg-red-50 text-red-500" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-3 ${bg[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-sm font-semibold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Analytics({ isCloudKitchen }) {
  const [period,    setPeriod]    = useState("7");
  const [data,      setData]      = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [bestItems, setBestItems] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("overview");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, p, b] = await Promise.allSettled([
        API.get(`/vendor/analytics?period=${period}`),
        API.get("/vendor/analytics/peak-hours"),
        API.get("/vendor/analytics/best-items"),
      ]);
      if (a.status === "fulfilled") setData(a.value.data.data);
      if (p.status === "fulfilled") setPeakHours(p.value.data.data || []);
      if (b.status === "fulfilled") setBestItems(b.value.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [period]);

  const pieData = data ? Object.entries(data.statusBreakdown || {}).map(([name, value]) => ({ name, value })) : [];

  if (loading) return (
    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-800">Analytics</h1>
          <p className="text-gray-400 text-sm">Business insights and performance</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {PERIODS.map(p => (
            <button key={p.val} onClick={() => setPeriod(p.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period===p.val?"bg-white shadow text-gray-800":"text-gray-500"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaRupeeSign />}    label="Total Revenue"    value={`₹${data?.totalRevenue || 0}`}    color="orange" />
        <StatCard icon={<FaShoppingBag />}  label="Total Orders"     value={data?.totalOrders || 0}            color="blue"   />
        <StatCard icon={<FaCheckCircle />}  label="Completion Rate"  value={`${data?.completionRate || 0}%`}  color="green"  sub={`${data?.delivered || 0} delivered`} />
        <StatCard icon={<FaChartBar />}     label="Avg Order Value"  value={`₹${data?.avgOrderValue || 0}`}   color="orange" sub={`${data?.cancelled || 0} cancelled`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["overview","peak-hours","best-items"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition capitalize ${tab===t?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
            {t.replace("-"," ")}
          </button>
        ))}
      </div>

      {/* Overview: Revenue + Status pie */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-black text-gray-800 mb-4">Daily Revenue</h3>
            {data?.dailyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize:10 }} tickFormatter={d=>d.slice(5)} />
                  <YAxis tick={{ fontSize:10 }} />
                  <Tooltip formatter={v=>[`₹${v}`,"Revenue"]} labelFormatter={d=>d} />
                  <Bar dataKey="revenue" fill={isCloudKitchen?"#8b5cf6":"#f97316"} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-10">No data for this period</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-black text-gray-800 mb-4">Order Status</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v,n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-10">No orders yet</p>}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {tab === "peak-hours" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-black text-gray-800 mb-1">Peak Hours (Last 30 days)</h3>
          <p className="text-xs text-gray-400 mb-4">When do you get the most orders?</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip formatter={(v,n)=>[v, n==="orders"?"Orders":"Revenue"]} />
              <Bar dataKey="orders" fill="#f97316" radius={[4,4,0,0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
          {/* Top 3 peak hours */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[...peakHours].sort((a,b)=>b.orders-a.orders).slice(0,3).map((h,i)=>(
              <div key={h.hour} className={`rounded-xl p-3 text-center ${i===0?"bg-orange-100":i===1?"bg-orange-50":"bg-gray-50"}`}>
                <p className="text-lg font-black text-gray-800">{h.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{h.orders} orders</p>
                <p className={`text-xs font-bold ${i===0?"text-orange-600":i===1?"text-orange-400":"text-gray-400"}`}>
                  #{i+1} Busiest
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Items */}
      {tab === "best-items" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-gray-800">Best Selling Items (Last 30 days)</h3>
          </div>
          {bestItems.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No order data yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {bestItems.map((item, i) => (
                <div key={item._id} className="flex items-center gap-4 px-5 py-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    i===0?"bg-yellow-100 text-yellow-700":i===1?"bg-gray-100 text-gray-600":i===2?"bg-orange-100 text-orange-700":"bg-gray-50 text-gray-500"
                  }`}>{i+1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{item.name || "Unknown Item"}</p>
                    <p className="text-xs text-gray-400">{item.quantity} sold · ₹{Math.round(item.revenue || 0)} revenue</p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full"
                        style={{ width:`${Math.round((item.quantity/(bestItems[0]?.quantity||1))*100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
