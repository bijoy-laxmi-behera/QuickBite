import { useEffect, useState } from "react";
import axios from "axios";
import { IndianRupee, TrendingUp, Star, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TABS = ["Today", "Weekly", "Monthly"];

export default function Earnings() {
  const [tab, setTab]     = useState("Today");
  const [data, setData]   = useState(null);
  const [txns, setTxns]   = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/delivery/earnings/summary`,      { headers: h }),
      axios.get(`${API}/delivery/earnings/transactions`, { headers: h }),
    ])
      .then(([s, t]) => {
        setData(s.data?.data || s.data);
        const raw = t.data?.data ?? t.data ?? [];
        setTxns(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const amounts    = { Today: data?.today || 0,   Weekly: data?.weekly || 0,   Monthly: data?.monthly || 0 };
  const deliveries = { Today: data?.todayDeliveries || 0, Weekly: data?.weeklyDeliveries || 0, Monthly: data?.monthlyDeliveries || 0 };

  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weekVals = data?.weeklyBreakdown || [80,120,200,90,250,310,180];
  const maxV     = Math.max(...weekVals, 1);

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? "bg-orange-500 text-white shadow-md shadow-orange-500/25" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Hero earnings */}
        <div className="lg:col-span-1 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">{tab} Earnings</p>
            <p className="text-4xl font-black text-gray-900 mt-2">
              ₹<span className="text-orange-500">{amounts[tab].toLocaleString("en-IN")}</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">{deliveries[tab]} deliveries</p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <ArrowUpRight size={14} />
            <span>+12% vs last {tab.toLowerCase()}</span>
          </div>
        </div>

        {/* Breakdown cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Base Pay", val: data?.basePay  || 0, icon: IndianRupee, color: "text-orange-500",  bg: "bg-orange-50"  },
            { label: "Tips",     val: data?.tips     || 0, icon: Star,        color: "text-yellow-500",  bg: "bg-yellow-50"  },
            { label: "Bonuses",  val: data?.bonuses  || 0, icon: TrendingUp,  color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Pending",  val: data?.pending  || 0, icon: Clock,       color: "text-gray-500",    bg: "bg-gray-100"   },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
              <div>
                <p className={`text-lg font-black ${color}`}>₹{val.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-gray-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Earnings Chart</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily breakdown</p>
            </div>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {weekDays.map((day, i) => {
              const h = Math.round((weekVals[i] / maxV) * 100);
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative group flex items-end justify-center w-full" style={{ height: "128px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-orange-500" : "bg-gray-200 group-hover:bg-gray-300"}`}
                      style={{ height: `${Math.max(h, 6)}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      ₹{weekVals[i]}
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium ${isToday ? "text-orange-500" : "text-gray-400"}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction list */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Transactions</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-14 mx-4 my-2 bg-gray-100 rounded-xl animate-pulse" />)
            ) : txns.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No transactions</p>
            ) : txns.slice(0, 8).map(tx => (
              <div key={tx._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                    {tx.type === "credit"
                      ? <ArrowUpRight size={13} className="text-emerald-500" />
                      : <ArrowDownRight size={13} className="text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 leading-none">{tx.description || "Earning"}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black ${tx.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
