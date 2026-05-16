// src/vendor/pages/Coupons.jsx — REDESIGNED: shows admin-generated coupons, vendor can accept/reject
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaTag, FaSpinner, FaToggleOn, FaToggleOff, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

// Status badge config
const STATUS = {
  active:   { label: "ACTIVE",    cls: "bg-green-100 text-green-700"  },
  inactive: { label: "INACTIVE",  cls: "bg-gray-100  text-gray-500"   },
  expired:  { label: "EXPIRED",   cls: "bg-red-100   text-red-600"    },
  limit:    { label: "LIMIT HIT", cls: "bg-yellow-100 text-yellow-700"},
};

function getStatus(c) {
  const expired    = c.validTo && new Date(c.validTo) < new Date();
  const limitHit   = c.usageLimit && c.usedCount >= c.usageLimit;
  if (expired)  return "expired";
  if (limitHit) return "limit";
  // vendorAccepted controls whether the vendor opted in
  if (!c.vendorAccepted) return "inactive";
  return "active";
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // track which coupon is mid-toggle

  const fetchCoupons = async () => {
    try {
      // This endpoint should return coupons created by admin, scoped to this vendor
      const { data } = await API.get("/vendor/coupons");
      setCoupons(data.data || []);
    } catch (e) {
      console.error("Coupons fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  // Toggle vendor opt-in/opt-out for an admin coupon
  const toggleAcceptance = async (id, current) => {
    setToggling(id);
    try {
      // PATCH /vendor/coupons/:id/accept  → { accepted: true/false }
      await API.patch(`/vendor/coupons/${id}/accept`, { accepted: !current });
      setCoupons(prev =>
        prev.map(c => c._id === id ? { ...c, vendorAccepted: !current } : c)
      );
    } catch (e) {
      console.error("Toggle error:", e);
    } finally {
      setToggling(null);
    }
  };

  const active   = coupons.filter(c => c.vendorAccepted && getStatus(c) === "active").length;
  const pending  = coupons.filter(c => !c.vendorAccepted && getStatus(c) !== "expired" && getStatus(c) !== "limit").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <FaSpinner className="animate-spin text-orange-500 text-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-800">Admin Coupons</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Coupons created by QuickBite admin — toggle to opt in or out.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="text-center px-4 py-2 bg-green-50 rounded-xl border border-green-100">
            <p className="text-lg font-black text-green-600">{active}</p>
            <p className="text-[10px] text-green-500 font-semibold uppercase">Active</p>
          </div>
          {pending > 0 && (
            <div className="text-center px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-lg font-black text-orange-500">{pending}</p>
              <p className="text-[10px] text-orange-400 font-semibold uppercase">Pending</p>
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600 leading-relaxed">
          These coupons are configured by the QuickBite admin. You can choose to participate by
          toggling each one on. When active, customers at your restaurant can apply these
          discount codes at checkout.
        </p>
      </div>

      {/* Empty state */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FaTag className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No coupons available</p>
          <p className="text-gray-400 text-sm mt-1">The admin hasn't created any coupons yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map(c => {
            const status   = getStatus(c);
            const s        = STATUS[status];
            const accepted = !!c.vendorAccepted;
            const canToggle = status !== "expired" && status !== "limit";
            const isLoading = toggling === c._id;
            const expired   = c.validTo && new Date(c.validTo) < new Date();

            return (
              <div key={c._id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                accepted && status === "active"
                  ? "border-orange-200 shadow-orange-50"
                  : "border-gray-100 opacity-80"
              }`}>

                {/* Top accent */}
                <div className={`h-1.5 w-full ${
                  accepted && status === "active"
                    ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                    : "bg-gray-100"
                }`} />

                <div className="p-4 space-y-3">
                  {/* Code + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xl font-black tracking-widest text-gray-800">{c.code}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {c.discountType === "percentage"
                          ? `${c.discountValue}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`
                          : `₹${c.discountValue} flat off`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Description */}
                  {c.description && (
                    <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {c.minOrderAmount > 0 && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        Min ₹{c.minOrderAmount}
                      </span>
                    )}
                    {c.validTo && (
                      <span className={`text-[10px] px-2 py-1 rounded-full ${
                        expired ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"
                      }`}>
                        Valid till {new Date(c.validTo).toLocaleDateString("en-IN")}
                      </span>
                    )}
                    {c.usageLimit && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {c.usedCount || 0}/{c.usageLimit} used
                      </span>
                    )}
                    <span className="text-[10px] bg-purple-50 text-purple-500 px-2 py-1 rounded-full">
                      By Admin
                    </span>
                  </div>

                  {/* Accept / Reject toggle */}
                  <div className={`flex items-center justify-between pt-2 border-t border-gray-50 ${
                    !canToggle ? "opacity-40 pointer-events-none" : ""
                  }`}>
                    <div className="flex items-center gap-2">
                      {accepted
                        ? <FaCheckCircle className="text-green-500 text-base" />
                        : <FaTimesCircle className="text-gray-300 text-base" />}
                      <span className={`text-xs font-bold ${accepted ? "text-green-600" : "text-gray-400"}`}>
                        {accepted ? "Participating" : "Not participating"}
                      </span>
                    </div>

                    <button
                      disabled={!canToggle || isLoading}
                      onClick={() => toggleAcceptance(c._id, accepted)}
                      className="flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-40">
                      {isLoading
                        ? <FaSpinner className="animate-spin text-gray-400 text-lg" />
                        : accepted
                          ? <FaToggleOn  className="text-orange-500 text-2xl" />
                          : <FaToggleOff className="text-gray-300 text-2xl" />}
                    </button>
                  </div>

                  {!canToggle && (
                    <p className="text-[10px] text-gray-400 text-center">
                      {expired ? "This coupon has expired" : "Usage limit reached"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}