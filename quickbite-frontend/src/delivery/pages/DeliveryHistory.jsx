import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/delivery/history");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" || o.deliveryStatus === filter;
    const matchSearch =
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Delivery History</h2>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total deliveries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <div className="flex gap-2">
          {["all", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                filter === s
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">No deliveries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-orange-500 text-sm">
                    #{order._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="font-semibold text-gray-800 mt-0.5">{order.user?.name || "Customer"}</p>
                  <p className="text-xs text-gray-400">{order.deliveryAddress || "—"}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  order.deliveryStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {order.deliveryStatus || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
