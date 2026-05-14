import { useEffect, useState } from "react";
import API from "../../services/axios";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

const empty = { code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxDiscount: "", expiresAt: "", usageLimit: "" };

export default function Coupons() {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(empty);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/coupons");
      setCoupons(res.data.coupons || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) { toast.error("Code and discount value required"); return; }
    try {
      await API.post("/admin/coupons", form);
      toast.success("Coupon created!");
      setShowForm(false);
      setForm(empty);
      fetchCoupons();
    } catch { toast.error("Create failed"); }
  };

  const handleToggle = async (id) => {
    try { await API.patch(`/admin/coupons/${id}/toggle`); fetchCoupons(); }
    catch { toast.error("Toggle failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try { await API.delete(`/admin/coupons/${id}`); toast.success("Deleted"); fetchCoupons(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
          <Plus size={15} /> Create Coupon
        </button>
      </div>

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
                  {["Code", "Discount", "Min Order", "Used/Limit", "Expires", "Active", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No coupons yet</td></tr>
                ) : coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-bold text-orange-500">{c.code}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {c.discountType === "flat" ? `₹${c.discountValue}` : `${c.discountValue}%`}
                      {c.maxDiscount && <span className="text-xs text-gray-400 ml-1">(max ₹{c.maxDiscount})</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">₹{c.minOrderAmount || 0}</td>
                    <td className="px-5 py-3 text-gray-500">{c.usedCount || 0}/{c.usageLimit || "∞"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "No expiry"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(c._id)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition">
                          {c.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
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
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-lg">Create Coupon</h3>
            {[
              { key: "code", label: "Coupon Code *", type: "text", placeholder: "e.g. SAVE10" },
              { key: "discountValue", label: "Discount Value *", type: "number", placeholder: "e.g. 10" },
              { key: "minOrderAmount", label: "Min Order Amount", type: "number", placeholder: "e.g. 299" },
              { key: "maxDiscount", label: "Max Discount (for %)", type: "number", placeholder: "e.g. 150" },
              { key: "usageLimit", label: "Usage Limit", type: "number", placeholder: "Leave blank for unlimited" },
              { key: "expiresAt", label: "Expires At", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setForm(empty); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
