import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bike, Package, MapPin, Phone, ShieldCheck,
  CheckCircle2, Navigation, User,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const STEPS = [
  { key: "accepted",   label: "Order Confirmed", desc: "Restaurant is preparing",   icon: CheckCircle2 },
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API}/delivery/orders/active`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setOrder(r.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // ── Derived state (safe with null order) ──
  const deliveryStatus = order?.deliveryStatus || order?.status || "";
  const stepIdx = STEPS.findIndex((s) => s.key === deliveryStatus);
  const current = stepIdx >= 0 ? stepIdx : 0;
  const isDelivered = deliveryStatus === "delivered";

  // ── Actions ──
  const markPickedUp = async () => {
    setBusy(true);
    try {
      await axios.patch(
        `${API}/delivery/orders/${order._id}/picked-up`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder((p) => ({ ...p, deliveryStatus: "picked_up" }));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setBusy(true);
    try {
      await axios.post(
        `${API}/delivery/orders/${order._id}/otp-verify`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Mark delivered after OTP verified
      await axios.patch(
        `${API}/delivery/orders/${order._id}/delivered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpModal(false);
      setOrder((p) => ({ ...p, deliveryStatus: "delivered", status: "delivered" }));
    } catch {
      alert("Invalid OTP or failed to deliver");
    } finally {
      setBusy(false);
    }
  };

  // ── Loading ──
  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-[#0D0D14] rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  // ── No active order ──
  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-[#0D0D14] border border-white/5 rounded-3xl flex items-center justify-center mb-5">
        <Bike size={32} className="text-zinc-700" />
      </div>
      <h2 className="text-lg font-bold text-white">No Active Delivery</h2>
      <p className="text-zinc-500 text-sm mt-1">Accept an order to start delivering</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* ── Left: Details ── */}
      <div className="lg:col-span-3 space-y-4">

        {/* Order ID header */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Active Delivery</p>
            <p className="text-lg font-black text-orange-400 mt-0.5">
              {order.orderId || "QB-" + order._id?.slice(-6)}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isDelivered
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-orange-500/10 border-orange-500/20 text-orange-400"
          }`}>
            {isDelivered ? "✓ Delivered" : "In Progress"}
          </span>
        </div>

        {/* Customer */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Customer</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <User size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {order.user?.name || order.address?.fullName || "Customer"}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {order.address?.street}, {order.address?.city}
                </p>
              </div>
            </div>
            <a
              href={`tel:${order.address?.phone || order.user?.phone}`}
              className="w-10 h-10 bg-orange-500/10 border border-orange-500/25 rounded-xl flex items-center justify-center hover:bg-orange-500/20 transition-colors"
            >
              <Phone size={15} className="text-orange-400" />
            </a>
          </div>
          <div className="mt-4 bg-zinc-900/60 rounded-xl p-3 flex items-start gap-2">
            <MapPin size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-zinc-300 leading-relaxed">
              {order.address?.street}, {order.address?.city}, {order.address?.pincode}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Order Items</h3>
          <div className="space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-orange-500/10 text-orange-400 text-[11px] font-black rounded-lg flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-zinc-300 font-medium">{item.name}</span>
                </div>
                <span className="text-xs text-zinc-500">₹{item.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-zinc-500">Order total</span>
            <span className="text-sm font-black text-white">
              ₹{order.pricing?.totalAmount || "—"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isDelivered && (
          <div className="flex gap-3">
            {/* Mark Picked Up — show when accepted */}
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

            {/* Verify OTP — show when picked up */}
            {["picked_up", "on-the-way"].includes(deliveryStatus) && (
              <button
                onClick={() => setOtpModal(true)}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck size={16} />
                Verify OTP & Deliver
              </button>
            )}

            <button className="px-4 py-3.5 bg-[#0D0D14] border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 text-sm font-semibold">
              <Navigation size={15} />
              Maps
            </button>
          </div>
        )}

        {/* Delivered success */}
        {isDelivered && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-emerald-400 font-bold">Order Delivered Successfully!</p>
            <p className="text-zinc-500 text-sm mt-1">Earnings have been added to your wallet.</p>
          </div>
        )}
      </div>

      {/* ── Right: Progress Tracker ── */}
      <div className="lg:col-span-2 space-y-4">

        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Progress</h3>
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
                      : active ? "bg-orange-500/15 border-orange-500"
                               : "bg-zinc-900 border-zinc-800"
                    }`}>
                      <Icon size={15} className={
                        done ? "text-white" : active ? "text-orange-400" : "text-zinc-700"
                      } />
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 ${done ? "bg-orange-500" : "bg-zinc-800"}`} />
                    )}
                  </div>
                  <div className="pb-10 pt-1.5">
                    <p className={`text-sm font-bold ${
                      done   ? "text-zinc-600 line-through"
                      : active ? "text-white"
                               : "text-zinc-700"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${active ? "text-orange-400" : "text-zinc-700"}`}>
                      {active ? "⟶ " : ""}{step.desc}
                    </p>

                    {/* Inline action buttons inside progress */}
                    {active && !isDelivered && (
                      <div className="mt-2">
                        {step.key === "accepted" && (
                          <button
                            onClick={markPickedUp}
                            disabled={busy}
                            className="text-xs bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                          >
                            {busy ? "Updating..." : "Mark Picked Up →"}
                          </button>
                        )}
                        {step.key === "picked_up" && (
                          <button
                            onClick={() => setOtpModal(true)}
                            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                          >
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

        {/* OTP reminder */}
        {!isDelivered && (
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-blue-400" />
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">OTP Delivery</p>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Customer has a 6-digit OTP. Request it at the time of handover to confirm delivery.
            </p>
          </div>
        )}

        {/* Earnings card */}
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-2">Your Earnings</p>
          <p className="text-2xl font-black text-emerald-400">
            ₹{Math.round((order.pricing?.deliveryFee || 40) * 0.85)}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Delivery fee · {order.estimatedArrival || "30–40"} min estimated
          </p>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Enter OTP</h3>
              <button onClick={() => setOtpModal(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-zinc-500">Ask the customer for their 6-digit delivery code.</p>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-center text-2xl font-black text-white tracking-[0.5em] focus:outline-none focus:border-orange-500 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOtpModal(false)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl text-zinc-400 font-semibold text-sm"
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