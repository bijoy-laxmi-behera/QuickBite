import { useEffect, useState } from "react";
import API from "../../services/axios";
import { Search, CheckCircle, XCircle, Trash2, ToggleLeft, ToggleRight, Store, ChefHat } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorManagement() {
  const [vendors, setVendors]         = useState([]);
  const [pending, setPending]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("all");        // all | pending
  const [typeFilter, setTypeFilter]   = useState("all");        // all | Restaurant | Cloud Kitchen
  const [search, setSearch]           = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
        API.get("/admin/restaurants"),
        API.get("/admin/restaurants/pending"),
      ]);
      setVendors(allRes.data || []);
      setPending(pendingRes.data?.data || []);
    } catch { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await API.patch(`/admin/restaurants/${id}/approve`); toast.success("Approved!"); fetchData(); }
    catch { toast.error("Approval failed"); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please enter a reason"); return; }
    try {
      await API.patch(`/admin/restaurants/${rejectModal}/reject`, { reason: rejectReason });
      toast.success("Restaurant rejected");
      setRejectModal(null); setRejectReason("");
      fetchData();
    } catch { toast.error("Rejection failed"); }
  };

  const handleToggle = async (id) => {
    try { await API.patch(`/admin/restaurants/${id}/status`); toast.success("Status updated"); fetchData(); }
    catch { toast.error("Toggle failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this restaurant?")) return;
    try { await API.delete(`/admin/restaurants/${id}`); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Delete failed"); }
  };

  // ─── Filtering ─────────────────────────────────────────
  const display = tab === "pending" ? pending : vendors;
  const filtered = display.filter(v => {
    const matchSearch = (v.name || v.restaurantName)?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || v.type === typeFilter;
    return matchSearch && matchType;
  });

  // ─── Counts ───────────────────────────────────────────
  const restaurantCount   = vendors.filter(v => v.type === "Restaurant").length;
  const cloudKitchenCount = vendors.filter(v => v.type === "Cloud Kitchen").length;

  return (
    <div className="space-y-5">

      {/* ── TYPE STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setTypeFilter("all")}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition ${
            typeFilter === "all"
              ? "bg-orange-50 border-orange-200 shadow-sm"
              : "bg-white border-gray-100 hover:bg-gray-50"
          }`}>
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Store size={18} />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">All Vendors</p>
            <p className="text-lg font-black text-gray-800">{vendors.length}</p>
          </div>
        </button>

        <button onClick={() => setTypeFilter("Restaurant")}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition ${
            typeFilter === "Restaurant"
              ? "bg-blue-50 border-blue-200 shadow-sm"
              : "bg-white border-gray-100 hover:bg-gray-50"
          }`}>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
            🍴
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">Restaurants</p>
            <p className="text-lg font-black text-gray-800">{restaurantCount}</p>
          </div>
        </button>

        <button onClick={() => setTypeFilter("Cloud Kitchen")}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition ${
            typeFilter === "Cloud Kitchen"
              ? "bg-purple-50 border-purple-200 shadow-sm"
              : "bg-white border-gray-100 hover:bg-gray-50"
          }`}>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
            <ChefHat size={18} />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">Cloud Kitchens</p>
            <p className="text-lg font-black text-gray-800">{cloudKitchenCount}</p>
          </div>
        </button>
      </div>

      {/* ── TABS + SEARCH ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          {["all", "pending"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                tab === t ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {t === "pending" ? `Pending (${pending.length})` : "All Restaurants"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {/* Type Dropdown */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="all">All Types</option>
            <option value="Restaurant">Restaurant Only</option>
            <option value="Cloud Kitchen">Cloud Kitchen Only</option>
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 w-56"
            />
          </div>
        </div>
      </div>

      {/* ── PENDING BANNER ── */}
      {pending.length > 0 && tab === "all" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-orange-800">
                {pending.length} restaurant{pending.length > 1 ? "s" : ""} awaiting approval
              </p>
              <p className="text-xs text-orange-600">Review and approve vendor applications</p>
            </div>
          </div>
          <button onClick={() => setTab("pending")}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
            Review Now
          </button>
        </div>
      )}

      {/* ── TABLE ── */}
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
                  {["Restaurant", "Type", "Owner", "Cuisine", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No restaurants match these filters</td></tr>
                ) : filtered.map(v => (
                  <tr key={v._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                          {(v.name || v.restaurantName)?.[0]?.toUpperCase() || "R"}
                        </div>
                        <p className="font-semibold text-gray-800">{v.name || v.restaurantName || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        v.type === "Cloud Kitchen"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {v.type === "Cloud Kitchen" ? "☁️" : "🍴"} {v.type || "Restaurant"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{v.owner?.name || v.ownerName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {Array.isArray(v.cuisine) ? v.cuisine.join(", ") : v.cuisine || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {v.isApproved === false ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                      ) : v.isActive === false ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Inactive</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {v.isApproved === false ? (
                          <>
                            <button onClick={() => handleApprove(v._id)}
                              className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => setRejectModal(v._id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleToggle(v._id)}
                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition" title="Toggle">
                            {v.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        )}
                        <button onClick={() => handleDelete(v._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of {display.length} {typeFilter !== "all" && `(filtered by ${typeFilter})`}
        </div>
      </div>

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Reject Restaurant</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleReject}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}