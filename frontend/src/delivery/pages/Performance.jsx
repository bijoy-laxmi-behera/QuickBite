import { useEffect, useState } from "react";
import axios from "axios";
import { Award, Target, Zap, Shield, TrendingUp, Star, User, Bike } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const BADGES = [
  { key: "speedster",  label: "Speedster",  icon: Zap,       color: "text-yellow-400", bg: "bg-yellow-500/10",  desc: "10 on-time deliveries" },
  { key: "reliable",   label: "Reliable",   icon: Shield,    color: "text-blue-400",   bg: "bg-blue-500/10",    desc: "95%+ acceptance rate"  },
  { key: "top_earner", label: "Top Earner", icon: TrendingUp,color: "text-emerald-400",bg: "bg-emerald-500/10", desc: "₹5000+ in a week"      },
  { key: "veteran",    label: "Veteran",    icon: Award,     color: "text-purple-400", bg: "bg-purple-500/10",  desc: "100+ deliveries"       },
];

export default function Performance() {
  const [tab, setTab]         = useState("Stats");
  const [stats, setStats]     = useState(null);
  const [ratings, setRatings] = useState([]);
  const [badges, setBadges]   = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/delivery/performance/stats`,       { headers: h }),
      axios.get(`${API}/delivery/performance/ratings`,     { headers: h }),
      axios.get(`${API}/delivery/performance/badges`,      { headers: h }),
      axios.get(`${API}/delivery/performance/leaderboard`, { headers: h }),
    ])
      .then(([s, r, b, l]) => {
        setStats(s.data?.data || s.data);
        setRatings(Array.isArray(r.data?.data ?? r.data) ? (r.data?.data ?? r.data) : []);
        setBadges(Array.isArray(b.data?.data  ?? b.data)  ? (b.data?.data  ?? b.data)  : []);
        setLeaders(Array.isArray(l.data?.data ?? l.data)  ? (l.data?.data  ?? l.data)  : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#0D0D14] border border-white/5 rounded-xl p-1 w-fit">
        {["Stats","Ratings","Badges","Leaderboard"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t ? "bg-orange-500 text-white shadow-md shadow-orange-500/25" : "text-zinc-500 hover:text-zinc-300"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* STATS */}
      {tab === "Stats" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Deliveries", val: stats?.totalDeliveries || 0,                       color: "text-orange-400"  },
              { label: "Avg Rating",       val: stats?.rating ? `${stats.rating.toFixed(1)}★` : "—", color: "text-yellow-400" },
              { label: "Acceptance",       val: `${stats?.acceptanceRate || "—"}%`,                color: "text-emerald-400" },
              { label: "Completion",       val: `${stats?.completionRate || "—"}%`,                color: "text-blue-400"    },
              { label: "On-Time",          val: `${stats?.onTimeRate     || "—"}%`,                color: "text-purple-400"  },
              { label: "Avg Time",         val: stats?.avgDeliveryTime ? `${stats.avgDeliveryTime}m` : "—", color: "text-zinc-300" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-[#0D0D14] border border-white/5 rounded-2xl p-4 text-center hover:border-white/10 transition-colors">
                <p className={`text-xl font-black ${color}`}>{val}</p>
                <p className="text-[10px] text-zinc-600 font-medium mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Target size={15} className="text-orange-400" /> Today's Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Deliveries", current: stats?.todayDeliveries || 0, goal: 10,  prefix: ""  },
                { label: "Earnings",   current: stats?.todayEarnings   || 0, goal: 500, prefix: "₹" },
              ].map(({ label, current, goal, prefix }) => {
                const pct = Math.min((current / goal) * 100, 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-zinc-400 font-medium">{label}</span>
                      <span className="text-white font-bold">{prefix}{current} / {prefix}{goal}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{Math.round(pct)}% complete</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RATINGS */}
      {tab === "Ratings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3">
            <p className="text-6xl font-black text-yellow-400">{stats?.rating?.toFixed(1) || "—"}</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={22} className={s <= Math.round(stats?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-zinc-800"} />
              ))}
            </div>
            <p className="text-xs text-zinc-500">{ratings.length} reviews</p>
          </div>
          <div className="lg:col-span-2 bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5"><p className="text-sm font-bold text-white">Recent Reviews</p></div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {ratings.length === 0
                ? <p className="text-zinc-600 text-sm text-center py-8">No reviews yet</p>
                : ratings.map(r => (
                  <div key={r._id} className="px-5 py-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-white">{r.user?.name || "Customer"}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-800"} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-zinc-500 mt-1">{r.comment}</p>}
                    <p className="text-[10px] text-zinc-700 mt-1">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                    </p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* BADGES */}
      {tab === "Badges" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(b => {
            const earned = badges.some(e => e.key === b.key || e === b.key);
            const Icon = b.icon;
            return (
              <div key={b.key} className={`bg-[#0D0D14] border rounded-2xl p-5 text-center space-y-3 transition-all ${
                earned ? "border-orange-500/25 shadow-[0_0_20px_rgba(249,115,22,0.05)]" : "border-white/5 opacity-40"
              }`}>
                <div className={`w-14 h-14 ${b.bg} rounded-2xl flex items-center justify-center mx-auto`}>
                  <Icon size={24} className={b.color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{b.label}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{b.desc}</p>
                </div>
                {earned && (
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                    Earned ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === "Leaderboard" && (
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Top Partners This Week</h3>
          </div>
          {leaders.length === 0
            ? <p className="text-zinc-600 text-sm text-center py-8">No data available</p>
            : leaders.map((p, i) => (
              <div key={p._id || i} className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 ${i === 0 ? "bg-yellow-500/5" : ""}`}>
                <span className={`text-lg font-black w-8 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-zinc-700"}`}>
                  {i + 1}
                </span>
                <div className="w-9 h-9 bg-zinc-800 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                  {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-zinc-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{p.name || "Partner"}</p>
                  <p className="text-xs text-zinc-600">{p.deliveries || 0} deliveries</p>
                </div>
                <p className="text-sm font-black text-emerald-400">₹{(p.earnings || 0).toLocaleString("en-IN")}</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}