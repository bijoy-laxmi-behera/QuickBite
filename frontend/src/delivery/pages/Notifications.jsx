import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Package, IndianRupee, Info, CheckCheck } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TYPE_ICON = {
  order:   { icon: Package,     bg: "bg-orange-500/10",  color: "text-orange-400"  },
  payment: { icon: IndianRupee, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  general: { icon: Info,        bg: "bg-blue-500/10",    color: "text-blue-400"    },
  delivery:{ icon: Package,     bg: "bg-amber-500/10",   color: "text-amber-400"   },
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/delivery/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        const raw = r.data?.data ?? r.data ?? [];
        setNotifs(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const markAll = async () => {
    try {
      await axios.patch(`${API}/delivery/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(p => p.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await axios.patch(`${API}/delivery/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                {unread}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Your recent updates</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold hover:text-orange-300">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell size={36} className="text-zinc-800 mb-3" />
            <p className="text-zinc-500 font-semibold text-sm">All caught up!</p>
            <p className="text-zinc-700 text-xs mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifs.map(n => {
              const cfg = TYPE_ICON[n.type] || TYPE_ICON.general;
              const Icon = cfg.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markOne(n._id)}
                  className={`flex gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    !n.isRead ? "border-l-2 border-orange-500" : ""
                  }`}
                >
                  <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-zinc-400" : "text-white"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-zinc-700 mt-1">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}