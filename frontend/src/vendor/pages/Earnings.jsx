// src/vendor/pages/Earnings.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaRupeeSign, FaSpinner, FaCrown, FaShoppingBag } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

export default function Earnings({ isCloudKitchen }) {
  const [summary, setSummary] = useState(null);
  const [trend,   setTrend]   = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");

  useEffect(() => {
    Promise.allSettled([
      API.get("/vendor/earnings-summary"),
      API.get("/vendor/revenue-trend"),
      API.get("/vendor/payout-history"),
    ]).then(([s, t, p]) => {
      if (s.status === "fulfilled") setSummary(s.value.data.data || s.value.data);
      if (t.status === "fulfilled") setTrend(t.value.data.data   || []);
      if (p.status === "fulfilled") setPayouts(p.value.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <FaSpinner className="animate-spin text-orange-500 text-3xl" />
    </div>
  );

  const accent = isCloudKitchen ? "purple" : "orange";
  const accentCls = {
    bg:     isCloudKitchen ? "bg-purple-500" : "bg-orange-500",
    light:  isCloudKitchen ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-orange-50 text-orange-700 border-orange-100",
    text:   isCloudKitchen ? "text-purple-600" : "text-orange-600",
    chart:  isCloudKitchen ? "#8b5cf6" : "#f97316",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-black text-gray-800">Earnings & Revenue</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Today",     value:`₹${summary?.todayEarnings  || 0}` },
          { label:"This Week", value:`₹${summary?.weekEarnings   || 0}` },
          { label:"This Month",value:`₹${summary?.monthEarnings  || 0}` },
          { label:"Total",     value:`₹${summary?.totalEarnings  || 0}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-xl font-black text-gray-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Cloud Kitchen breakdown */}
      {isCloudKitchen && summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-4 ${accentCls.light}`}>
            <div className="flex items-center gap-2 mb-1">
              <FaCrown className="text-yellow-500 text-sm" />
              <p className="text-xs font-bold">Subscription Revenue</p>
            </div>
            <p className="text-2xl font-black">₹{summary.subscriptionEarnings || 0}</p>
            <p className="text-xs opacity-70 mt-0.5">{summary.activeSubscribers || 0} active subscribers</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaShoppingBag className="text-blue-500 text-sm" />
              <p className="text-xs font-bold text-blue-700">Order Revenue</p>
            </div>
            <p className="text-2xl font-black text-blue-700">₹{summary.orderEarnings || 0}</p>
            <p className="text-xs text-blue-500 mt-0.5">{summary.totalOrders || 0} orders</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {["overview","payouts"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === t ? accentCls.bg + " text-white" : "bg-gray-100 text-gray-500"
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Revenue trend chart */}
      {tab === "overview" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-black text-gray-800 mb-4">Revenue Trend</h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize:10 }} tickFormatter={d => typeof d === "object" ? `${d.day}/${d.month}` : d} />
                <YAxis tick={{ fontSize:10 }} />
                <Tooltip formatter={v => [`₹${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill={accentCls.chart} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>
      )}

      {/* Payouts */}
      {tab === "payouts" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-gray-800">Payout History</h3>
          </div>
          {payouts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No payouts yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {payouts.map(p => (
                <div key={p._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Payout #{p._id?.slice(-6)}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-green-600">₹{p.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {(p.status || "").toUpperCase()}
                    </span>
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