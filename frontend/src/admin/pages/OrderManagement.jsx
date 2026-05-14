import { useEffect, useState } from "react";
import API from "../../services/axios";
import { Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending","accepted","preparing","out_for_delivery","delivered","cancelled","completed"];

const statusColor = {
  pending:          "bg-yellow-100 text-yellow-700",
  accepted:         "bg-blue-100 text-blue-700",
  preparing:        "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered:        "bg-green-100 text-green-700",
  completed:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
};

export default function OrderManagement() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await API.get(`/admin/orders${params}`);
      setOrders(res.data.orders || []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      setUpdating(true);
      await API.patch(`/admin/orders/${selected._id}/status`, { status: newStatus });
      toast.success("Order status updated");
      setSelected(null);
      fetchOrders();
    } catch { toast.error("Update failed"); }
    finally { setUpdating(false); }
  };

  const filtered = orders.filter(o =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to get amount from different possible field names
  const getAmount = (order) => {
    return order.totalAmount || order.total || order.amount || order.orderTotal || 0;
  };

  return (
    <div className="space-y-5">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 w-48"
            />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Order ID", "Customer", "Amount", "Status", "Payment", "Date", "Action"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
                ) : filtered.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-bold text-orange-500">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 text-gray-700">{order.user?.name || order.customer?.name || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      ₹{getAmount(order).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => { setSelected(order); setNewStatus(order.status); }}
                        className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100 transition">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Update Order Status</h3>
            <p className="text-sm text-gray-400 mb-4">Order #{selected._id?.slice(-6).toUpperCase()}</p>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={updating}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition">
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}