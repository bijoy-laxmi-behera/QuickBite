import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bike, Package, MapPin, Phone, ShieldCheck,
  CheckCircle2, Navigation, User,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ✅ covers both "on-the-way" and "on_the_way" spellings
const PICKED_UP_STATUSES = ["picked_up", "on-the-way", "on_the_way"];

const STEPS = [
  { key: "accepted",   label: "Order Confirmed", desc: "Restaurant is preparing",    icon: CheckCircle2 },
  { key: "picked_up",  label: "Picked Up",        desc: "You've collected the order", icon: Package      },
  { key: "on-the-way", label: "On The Way",       desc: "Heading to customer",        icon: Bike         },
  { key: "delivered",  label: "Delivered",         desc: "Order handed to customer",   icon: MapPin       },
];

export default function ActiveOrder() {
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp]           = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API}/delivery/orders/active`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrder(r.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const deliveryStatus = order?.deliveryStatus || order?.status || "";
  const stepIdx = STEPS.findIndex((s) => s.key === deliveryStatus);
  const current = stepIdx >= 0 ? stepIdx : 0;
  const isDelivered = deliveryStatus === "delivered";
  const canVerifyOtp = PICKED_UP_STATUSES.includes(deliveryStatus);

  const markPickedUp = async () => {
    setBusy(true);
    setError("");
    try {
      await axios.patch(
        `${API}/delivery/orders/${order._id}/picked-up`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder((p) => ({ ...p, deliveryStatus: "picked_up" }));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status");
    } finally { setBusy(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    setError("");
    try {
      // Step 1: verify OTP
      await axios.post(
        `${API}/delivery/orders/${order._id}/otp-verify`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Step 2: mark delivered
      await axios.patch(
        `${API}/delivery/orders/${order._id}/delivered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpModal(false);
      setOtp("");
      setOrder((p) => ({ ...p, deliveryStatus: "delivered", status: "delivered" }));
    } catch (e) {
      setError(e?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally { setBusy(false); }
  };

  const resendOtp = async () => {
    try {
      await axios.post(
        `${API}/delivery/orders/${order._id}/resend-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("OTP resent to customer's email!");
    } catch {
      alert("Failed to resend OTP");
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-3xl flex items-center justify-center mb-5">
        <Bike size={32} className="text-gray-300" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">No Active Delivery</h2>
      <p className="text-gray-500 text-sm mt-1">Accept an order to start delivering</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* Left: Details */}
      <div className="lg:col-span-3 space-y-4">

        {/* Order ID header */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Active Delivery</p>
            <p className="text-lg font-black text-orange-500 mt-0.5">
              {order.orderId || "QB-" + order._id?.slice(-6)}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isDelivered
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-orange-50 border-orange-200 text-orange-600"
          }`}>
            {isDelivered ? "✓ Delivered" : "In Progress"}
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Customer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {order.user?.name || order.address?.fullName || "Customer"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.address?.street}, {order.address?.city}
                </p>
              </div>
            </div>
            <a
              href={`tel:${order.address?.phone || order.user?.phone}`}
              className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center hover:bg-orange-100 transition-colors"
            >
              <Phone size={15} className="text-orange-500" />
            </a>
          </div>
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2">
            <MapPin size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.address?.street}, {order.address?.city}, {order.address?.pincode}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</h3>
          <div className="space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-orange-50 text-orange-500 text-[11px] font-black rounded-lg flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                </div>
                <span className="text-xs text-gray-400">₹{item.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Order total</span>
            <span className="text-sm font-black text-gray-900">₹{order.pricing?.totalAmount || "—"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isDelivered && (
          <div className="flex gap-3">
            {deliveryStatus === "accepted" && (
              <button
                onClick={markPickedUp}
                disabled={busy}
                className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-60"
              >
                <Package size={16} />
                {busy ? "Updating..." : "Mark as Picked Up"}
              </button>
            )}
            {/* ✅ Fixed: uses canVerifyOtp which covers all picked_up variants */}
            {canVerifyOtp && (
              <button
                onClick={() => { setError(""); setOtpModal(true); }}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck size={16} />
                Verify OTP & Deliver
              </button>
            )}
            <button className="px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex items-center gap-2 text-sm font-semibold">
              <Navigation size={15} />
              Maps
            </button>
          </div>
        )}

        {isDelivered && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-emerald-600 font-bold">Order Delivered Successfully!</p>
            <p className="text-gray-500 text-sm mt-1">Earnings have been added to your wallet.</p>
          </div>
        )}
      </div>

      {/* Right: Progress Tracker */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Progress</h3>
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done   = idx < current;
              const active = idx === current;
              return (
                <div key={step.key} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${
                      done   ? "bg-orange-500 border-orange-500"
                      : active ? "bg-orange-50 border-orange-400"
                               : "bg-gray-50 border-gray-200"
                    }`}>
                      <Icon size={15} className={done ? "text-white" : active ? "text-orange-500" : "text-gray-300"} />
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 ${done ? "bg-orange-500" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pb-10 pt-1.5">
                    <p className={`text-sm font-bold ${
                      done ? "text-gray-400 line-through" : active ? "text-gray-900" : "text-gray-300"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${active ? "text-orange-500" : "text-gray-300"}`}>
                      {active ? "⟶ " : ""}{step.desc}
                    </p>
                    {active && !isDelivered && (
                      <div className="mt-2">
                        {step.key === "accepted" && (
                          <button onClick={markPickedUp} disabled={busy}
                            className="text-xs bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50">
                            {busy ? "Updating..." : "Mark Picked Up →"}
                          </button>
                        )}
                        {step.key === "picked_up" && (
                          <button onClick={() => { setError(""); setOtpModal(true); }}
                            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                            Verify OTP & Deliver →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isDelivered && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-blue-500" />
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">OTP Delivery</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Customer has a 6-digit OTP. Request it at the time of handover to confirm delivery.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">Your Earnings</p>
          <p className="text-2xl font-black text-emerald-500">
            ₹{Math.round((order.pricing?.deliveryFee || 40) * 0.85)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Delivery fee · {order.estimatedArrival || "30–40"} min estimated
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900">Enter OTP</h3>
              <button onClick={() => { setOtpModal(false); setOtp(""); setError(""); }} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </div>
            <p className="text-sm text-gray-500">Ask the customer for their 6-digit delivery code.</p>

            {/* Error inside modal */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
                ⚠️ {error}
              </div>
            )}

            <input
              type="number"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.slice(0, 6)); setError(""); }}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-center text-2xl font-black text-gray-900 tracking-[0.5em] focus:outline-none focus:border-orange-500 transition-colors"
            />

            {/* Resend OTP */}
            <button
              onClick={resendOtp}
              className="w-full text-xs text-blue-500 hover:text-blue-700 text-center transition-colors"
            >
              Customer didn't get OTP? Resend →
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => { setOtpModal(false); setOtp(""); setError(""); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={otp.length !== 6 || busy}
                className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-colors"
              >
                {busy ? "Verifying..." : "Confirm Delivery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}