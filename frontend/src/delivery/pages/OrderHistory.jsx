import { useEffect, useState } from "react";
import axios from "axios";
import { Package, CheckCircle, XCircle, Clock } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const STATUS = {
  delivered:    { label: "Delivered",  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  cancelled:    { label: "Cancelled",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle     },
  "on-the-way": { label: "In Transit", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: Clock       },
};

export default function OrderHistory() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const token = localStorage.getItem("token");

  const fetch = async (p = 1) => {
    try {
      const { data } = await axios.get(`${API}/delivery/orders/history?page=${p}&limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(data?.data ?? data) ? (data?.data ?? data) : [];
      p === 1 ? setOrders(list) : setOrders(prev => [...prev, ...list]);
      setHasMore(list.length === 15);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(1); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">{orders.length} Deliveries</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Complete delivery history</p>
        </div>
      </div>

      <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 border-b border-white/5 text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
          <span>Order ID</span><span>Address</span><span>Date</span><span>Status</span><span className="text-right">Earnings</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={36} className="text-zinc-800 mb-3" />
            <p className="text-zinc-500 font-semibold text-sm">No delivery history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map(order => {
              const cfg = STATUS[order.status] || STATUS.delivered;
              const Icon = cfg.icon;
              const earn = Math.round((order.pricing?.deliveryFee || 40) * 0.85);
              return (
                <div key={order._id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center">
                  <span className="text-xs font-bold text-orange-400">{order.orderId || "QB-" + order._id?.slice(-6)}</span>
                  <span className="text-sm text-zinc-300 truncate md:col-span-1">{order.address?.street || "—"}</span>
                  <span className="text-xs text-zinc-600">{new Date(order.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" })}</span>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      <Icon size={10} />{cfg.label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-emerald-400 md:text-right">+₹{earn}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {hasMore && (
        <button onClick={() => { const n = page + 1; setPage(n); fetch(n); }}
          className="w-full py-3 bg-[#0D0D14] border border-white/5 rounded-xl text-zinc-500 text-sm font-semibold hover:text-zinc-300 hover:border-white/10 transition-colors">
          Load more
        </button>
      )}
    </div>
  );
}