// src/vendor/pages/Coupons.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner, FaTimes, FaTag } from "react-icons/fa";

const EMPTY = { code:"", discountType:"percentage", discountValue:"", minOrderAmount:"", maxDiscount:"", validTo:"", usageLimit:"", description:"" };

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm]   = useState(coupon ? { ...coupon } : EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.code || !form.discountValue) { alert("Code and discount value required"); return; }
    setSaving(true);
    try {
      if (coupon?._id) await API.put(`/vendor/coupons/${coupon._id}`, form);
      else             await API.post("/vendor/coupons", form);
      onSave();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800">{coupon ? "Edit Coupon" : "Create Coupon"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Coupon Code *</label>
            <input value={form.code} onChange={e=>f("code",e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-black uppercase focus:outline-none focus:border-orange-400 transition" />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Type</label>
              <select value={form.discountType} onChange={e=>f("discountType",e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition bg-white">
                <option value="percentage">% Percentage</option>
                <option value="flat">₹ Flat</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Value ({form.discountType==="percentage"?"%":"₹"}) *
              </label>
              <input type="number" value={form.discountValue} onChange={e=>f("discountValue",e.target.value)}
                placeholder={form.discountType==="percentage"?"20":"50"}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          </div>

          {/* Min order + Max discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Min Order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={e=>f("minOrderAmount",e.target.value)}
                placeholder="199"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            {form.discountType==="percentage" && (
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e=>f("maxDiscount",e.target.value)}
                  placeholder="100"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
              </div>
            )}
          </div>

          {/* Expiry + Usage limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Valid Until</label>
              <input type="date" value={form.validTo?.split("T")[0]||""} onChange={e=>f("validTo",e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e=>f("usageLimit",e.target.value)}
                placeholder="100"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</label>
            <textarea rows={2} value={form.description} onChange={e=>f("description",e.target.value)}
              placeholder="What is this coupon for?"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
          </div>

          {/* Preview */}
          {form.code && form.discountValue && (
            <div className="bg-orange-50 border border-orange-200 border-dashed rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-1">Preview</p>
              <p className="text-2xl font-black text-orange-500 tracking-widest">{form.code}</p>
              <p className="text-sm text-gray-600 mt-1">
                {form.discountType==="percentage"
                  ? `${form.discountValue}% off${form.maxDiscount?` (max ₹${form.maxDiscount})`:""}${form.minOrderAmount?` on orders above ₹${form.minOrderAmount}`:""}`
                  : `₹${form.discountValue} flat off${form.minOrderAmount?` on orders above ₹${form.minOrderAmount}`:""}`}
              </p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <FaSpinner className="animate-spin" />}
            {coupon ? "Save Changes" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get("/vendor/coupons");
      setCoupons(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const toggle = async (id) => {
    try {
      await API.patch(`/vendor/coupons/${id}/toggle`);
      fetchCoupons();
    } catch {}
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try { await API.delete(`/vendor/coupons/${id}`); fetchCoupons(); } catch {}
  };

  const isExpired = (c) => c.validTo && new Date(c.validTo) < new Date();
  const isLimitReached = (c) => c.usageLimit && c.usedCount >= c.usageLimit;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">Coupons</h1>
          <p className="text-gray-400 text-sm">{coupons.filter(c=>c.isActive).length} active coupons</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-200">
          <FaPlus /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FaTag className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No coupons yet</p>
          <button onClick={() => setModal({})} className="mt-4 px-5 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl">
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map(c => {
            const expired = isExpired(c);
            const limitHit = isLimitReached(c);
            const status = !c.isActive ? "inactive" : expired ? "expired" : limitHit ? "limit" : "active";

            return (
              <div key={c._id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                status==="active"?"border-gray-100":"border-gray-200 opacity-70"
              }`}>
                {/* Top stripe */}
                <div className={`h-1.5 w-full ${status==="active"?"bg-gradient-to-r from-orange-400 to-yellow-400":"bg-gray-200"}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-black tracking-widest text-gray-800">{c.code}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {c.discountType==="percentage"
                          ? `${c.discountValue}% off${c.maxDiscount?` (max ₹${c.maxDiscount})`:""}`
                          : `₹${c.discountValue} flat off`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      status==="active"  ? "bg-green-100 text-green-700" :
                      status==="expired" ? "bg-red-100 text-red-600" :
                      status==="limit"   ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {status==="active"?"ACTIVE":status==="expired"?"EXPIRED":status==="limit"?"LIMIT HIT":"INACTIVE"}
                    </span>
                  </div>

                  {c.description && <p className="text-xs text-gray-400 mt-2">{c.description}</p>}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {c.minOrderAmount > 0 && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Min ₹{c.minOrderAmount}</span>
                    )}
                    {c.validTo && (
                      <span className={`text-[10px] px-2 py-1 rounded-full ${expired?"bg-red-100 text-red-500":"bg-gray-100 text-gray-500"}`}>
                        Valid till {new Date(c.validTo).toLocaleDateString("en-IN")}
                      </span>
                    )}
                    {c.usageLimit && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {c.usedCount || 0}/{c.usageLimit} used
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => toggle(c._id)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      {c.isActive
                        ? <FaToggleOn  className="text-green-500 text-lg" />
                        : <FaToggleOff className="text-gray-400 text-lg" />}
                      {c.isActive?"Active":"Inactive"}
                    </button>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => setModal(c)} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-blue-500 transition">
                        <FaEdit className="text-xs" />
                      </button>
                      <button onClick={() => deleteCoupon(c._id)} className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-red-500 transition">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <CouponModal
          coupon={modal?._id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchCoupons(); }}
        />
      )}
    </div>
  );
}
