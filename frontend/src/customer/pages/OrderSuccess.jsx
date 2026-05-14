// src/customer/pages/OrderSuccess.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCopy, FaCheck, FaBell, FaShieldAlt } from "react-icons/fa";
import { MdTrackChanges } from "react-icons/md";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";

const STEPS = [
  { key: "confirmed",        label: "Confirmed",  icon: "🧾", activeIcon: "✓"  },
  { key: "preparing",        label: "Preparing",  icon: "🍳", activeIcon: "🍳" },
  { key: "out_for_delivery", label: "On Way",      icon: "🚚", activeIcon: "🛵" },
  { key: "delivered",        label: "Delivered",  icon: "🎉", activeIcon: "🎉" },
];

const STATUS_TO_STEP = {
  pending: 0, confirmed: 0, preparing: 1,
  "on-the-way": 2, on_the_way: 2, out_for_delivery: 2, delivered: 3,
};

const STATUS_MSGS = {
  confirmed:        { emoji: "✓",  text: "Confirmed",       color: "text-blue-500"   },
  preparing:        { emoji: "🍳", text: "Preparing",       color: "text-orange-500" },
  "on-the-way":     { emoji: "🚚", text: "On the Way",      color: "text-purple-500" },
  out_for_delivery: { emoji: "🛵", text: "Out for Delivery",color: "text-indigo-500" },
  delivered:        { emoji: "🎉", text: "Delivered",        color: "text-green-500"  },
  cancelled:        { emoji: "❌", text: "Cancelled",        color: "text-red-500"   },
};

function getStatusDisplay(status) {
  const key = status?.toLowerCase().replace(/ /g, "_");
  return STATUS_MSGS[key] || STATUS_MSGS[status?.toLowerCase()] || { emoji: "✓", text: "Confirmed", color: "text-blue-500" };
}

function getStepIndex(status) {
  const key = status?.toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
  return STATUS_TO_STEP[key] ?? 0;
}

// ─── Confetti burst (pure CSS, lightweight) ───────────────────────────────────
function ConfettiDot({ style }) {
  return <div className="absolute w-2 h-2 rounded-full animate-confetti" style={style} />;
}

function Confetti({ show }) {
  const dots = show ? Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    background: ["#f97316","#fbbf24","#34d399","#60a5fa","#f472b6"][i % 5],
    animationDelay: `${Math.random() * 0.6}s`,
  })) : [];

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {dots.map((s, i) => <ConfettiDot key={i} style={s} />)}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function OrderSuccess({ setPage, orderId: propOrderId }) {
  const navigate  = useNavigate();
  const [show,    setShow]    = useState(false);
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("confirmed");
  const [eta,     setEta]     = useState("30–40");
  const [copied,  setCopied]  = useState(false);
  const [liveMsg, setLiveMsg] = useState(null);
  const [confetti,setConfetti]= useState(false);
  const socketRef = useRef(null);

  const orderId = propOrderId || localStorage.getItem("lastOrderId");

  // ── Fetch order ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await API.get(`/customer/me/orders/${orderId}`);
        if (res.data.success) {
          const d = res.data.data;
          setOrder(d);
          const s = d.deliveryStatus || d.status || "confirmed";
          setStatus(s);
          setEta(d.estimatedArrival || calcEta(d));
          localStorage.setItem("lastOrderId",    orderId);
          localStorage.setItem("trackingOrderId",orderId);
          localStorage.setItem("lastOrder",      JSON.stringify(d));
        }
      } catch {
        try {
          const saved = JSON.parse(localStorage.getItem("lastOrder") || "null");
          if (saved) { setOrder(saved); setStatus(saved.status || "confirmed"); }
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    setTimeout(() => setShow(true), 80);
    setTimeout(() => setConfetti(true), 200);
    setTimeout(() => setConfetti(false), 3000);
  }, [orderId]);

  const calcEta = (d) => {
    if (d.vendor?.deliveryTime) return d.vendor.deliveryTime;
    const n = d.items?.length || 0;
    if (n > 5) return "45–60"; if (n > 3) return "35–50"; return "25–35";
  };

  // ── Socket real-time ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onStatusUpdate = (data) => {
      if (data.orderId !== orderId) return;
      setStatus(data.status);
      if (data.estimatedArrival) setEta(data.estimatedArrival);
      else {
        const etaMap = { confirmed: "30–40", preparing: "25–35", out_for_delivery: "10–20", delivered: "Delivered!" };
        const key = data.status?.toLowerCase().replace(/ /g, "_");
        if (etaMap[key]) setEta(etaMap[key]);
      }

      // Notification
      const msgs = {
        confirmed:        "✅ Your order is confirmed!",
        preparing:        "🍳 Restaurant is preparing your food!",
        out_for_delivery: "🛵 Rider is on the way to you!",
        delivered:        "🎉 Your order has been delivered!",
      };
      const key = data.status?.toLowerCase().replace(/ /g, "_");
      if (msgs[key]) { setLiveMsg(msgs[key]); setTimeout(() => setLiveMsg(null), 5000); }
      if (data.status === "delivered") { setConfetti(true); setTimeout(() => setConfetti(false), 4000); }
    };

    socket.on("orderStatusUpdate", onStatusUpdate);
    return () => socket.off("orderStatusUpdate", onStatusUpdate);
  }, [orderId]);

  const copyOtp = () => {
    if (order?.otp) {
      navigator.clipboard.writeText(order.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getOrderNumber = () => {
    if (order?.orderId) return order.orderId;
    if (order?._id)    return order._id.slice(-8).toUpperCase();
    return `QB${Date.now().toString().slice(-4)}`;
  };

  const currentStep   = getStepIndex(status);
  const statusDisplay = getStatusDisplay(status);
  const isDelivered   = status?.toLowerCase() === "delivered";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Confetti show={confetti} />

      {/* Live notification toast */}
      {liveMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 max-w-xs text-center">
          <FaBell className="text-orange-400 shrink-0" /> {liveMsg}
        </div>
      )}

      <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* Success circle */}
        <div className={`transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"} mb-5`}>
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-green-50">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">{isDelivered ? "🎉" : "✓"}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-700 delay-150 ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} w-full`}>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            {isDelivered ? "Order Delivered! 🎉" : "Order Placed! 🎯"}
          </h1>
          <p className="text-gray-500 text-sm mb-1">
            {isDelivered ? "We hope you enjoyed your meal!" : "Your order has been confirmed"}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Estimated delivery: <span className="font-bold text-orange-500">
              {isDelivered ? "Delivered" : `${eta} mins`}
            </span>
          </p>

          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 w-full text-left">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs text-gray-400 font-medium">Order ID</span>
              <span className="text-xs font-bold text-gray-700">#{getOrderNumber()}</span>
            </div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs text-gray-400 font-medium">Status</span>
              <span className={`text-xs font-bold flex items-center gap-1 ${statusDisplay.color}`}>
                {statusDisplay.emoji} {statusDisplay.text}
              </span>
            </div>
            {order?.paymentMethod && (
              <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium">Payment</span>
                <span className="text-xs font-semibold text-gray-600">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod?.toUpperCase()}
                </span>
              </div>
            )}
            {order?.totalAmount && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Total Paid</span>
                <span className="text-sm font-extrabold text-orange-500">₹{order.totalAmount}</span>
              </div>
            )}
          </div>

          {/* OTP card */}
          {order?.otp && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4 mb-5 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-orange-400" />
                  <div className="text-left">
                    <p className="text-xs text-orange-600 font-semibold">Delivery OTP</p>
                    <p className="text-2xl font-black text-orange-600 tracking-widest">{order.otp}</p>
                  </div>
                </div>
                <button
                  onClick={copyOtp}
                  className="flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-500 px-3 py-1.5 rounded-full hover:bg-orange-50 transition font-semibold"
                >
                  {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Share this with your delivery partner upon arrival</p>
            </div>
          )}

          {/* Progress steps */}
          <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 mb-5">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const done    = idx < currentStep;
                const current = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                        done    ? "bg-orange-500 text-white shadow-md"
                        : current ? "bg-orange-100 ring-2 ring-orange-400 text-orange-600 scale-110"
                        : "bg-gray-100 text-gray-400"
                      }`}>
                        {done ? "✓" : (current ? step.activeIcon : step.icon)}
                      </div>
                      <span className={`text-[9px] font-semibold ${done || current ? "text-orange-500" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-all duration-500 ${done ? "bg-orange-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Buttons */}
          <button
            onClick={() => orderId ? navigate(`/customer/order-tracking/${orderId}`) : (setPage && setPage("tracking"))}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 rounded-2xl font-extrabold mb-3 shadow-lg hover:from-orange-600 transition flex items-center justify-center gap-2"
          >
            <MdTrackChanges className="text-xl" /> Track My Order
          </button>

          <button
            onClick={() => setPage ? setPage("home") : navigate("/customer/home")}
            className="w-full text-gray-500 py-3.5 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-50 transition text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
