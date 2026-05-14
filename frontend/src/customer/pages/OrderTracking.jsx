// src/customer/pages/OrderTracking.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaPhone, FaClock, FaMapMarkerAlt, FaMotorcycle, FaStore, FaBell } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";

// ─── Constants ───────────────────────────────────────────────────────────────
const TRACKING_STEPS = [
  { label: "Order Confirmed", icon: "✅", key: "confirmed",        description: "Your order has been received & confirmed",  etaOffset: 0  },
  { label: "Preparing",       icon: "🍳", key: "preparing",        description: "Restaurant is cooking your food",           etaOffset: -10 },
  { label: "On the Way",      icon: "🚚", key: "on-the-way",       description: "Rider is heading to pick up your order",    etaOffset: -15 },
  { label: "Out for Delivery",icon: "🛵", key: "out_for_delivery", description: "Rider is on the way to your location",      etaOffset: -5  },
  { label: "Delivered",       icon: "🎉", key: "delivered",        description: "Order delivered! Enjoy your meal 😋",       etaOffset: 0  },
];

const STATUS_TO_STEP = {
  pending: 0, confirmed: 0, preparing: 1,
  "on-the-way": 2, "on_the_way": 2,
  out_for_delivery: 3, delivered: 4, cancelled: -1,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function LivePulseDot({ active }) {
  if (!active) return null;
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
    </span>
  );
}

function ETACountdown({ minutes, isDelivered }) {
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    setRemaining(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (isDelivered || remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining, isDelivered]);

  if (isDelivered) return <span className="text-2xl font-bold text-white">Delivered 🎉</span>;
  if (remaining <= 0) return <span className="text-2xl font-bold text-white">Arriving soon...</span>;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-black text-white tabular-nums">{m}</span>
      <span className="text-lg font-bold text-orange-100 mb-1">min</span>
      <span className="text-2xl font-black text-white tabular-nums">{String(s).padStart(2, "0")}</span>
      <span className="text-lg font-bold text-orange-100 mb-1">sec</span>
    </div>
  );
}

function DeliveryPartnerCard({ partner }) {
  if (!partner) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <FaMotorcycle className="text-orange-400" /> Delivery Partner
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-2xl shadow">
          {partner.avatar
            ? <img src={partner.avatar} alt="rider" className="w-full h-full rounded-full object-cover" />
            : "🏍️"
          }
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{partner.name || "Rider Assigned"}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-xs ${s <= (partner.rating || 4) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">{partner.rating || "4.8"}</span>
          </div>
          {partner.vehicleNumber && (
            <p className="text-xs text-gray-400 mt-0.5">🏍 {partner.vehicleNumber}</p>
          )}
        </div>
        {partner.phone && (
          <a
            href={`tel:${partner.phone}`}
            className="w-11 h-11 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-md"
          >
            <FaPhone className="text-sm" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order,           setOrder]           = useState(null);
  const [currentStep,     setCurrentStep]     = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [etaMinutes,      setEtaMinutes]      = useState(35);
  const [lastUpdated,     setLastUpdated]     = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [statusHistory,   setStatusHistory]   = useState([]);
  const [refreshing,      setRefreshing]      = useState(false);
  const [notification,    setNotification]    = useState(null);

  const socketRef = useRef(null);

  // ── Helper ──────────────────────────────────────────────────────────────────
  const getStepIndex = (status) => {
    const key = status?.toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
    const mapped = {
      pending: 0, confirmed: 0, preparing: 1,
      on_the_way: 2, out_for_delivery: 3, delivered: 4, cancelled: -1,
    };
    return mapped[key] !== undefined ? mapped[key] : 0;
  };

  const computeEta = (trackingData, stepIndex) => {
    if (trackingData.estimatedArrival) {
      // If it's a string like "30-40 min", extract the lower bound
      const match = String(trackingData.estimatedArrival).match(/\d+/);
      if (match) return parseInt(match[0]);
    }
    const baseMins = [35, 30, 20, 12, 0];
    return baseMins[stepIndex] ?? 35;
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Fetch tracking data ──────────────────────────────────────────────────────
  const fetchTracking = useCallback(async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!orderId) { setError("No order ID provided"); setLoading(false); return; }

    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await API.get(`/customer/me/orders/${orderId}/track`);
      if (res.data.success) {
        const data = res.data.data;
        setOrder(data);
        const step = getStepIndex(data.deliveryStatus || data.status);
        setCurrentStep(step);
        setEtaMinutes(computeEta(data, step));
        setLastUpdated(new Date());
        if (data.deliveryPartner) setDeliveryPartner(data.deliveryPartner);
        if (data.statusHistory) setStatusHistory(data.statusHistory);
      } else {
        setError(res.data.message || "Failed to load tracking");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tracking details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, navigate]);

  // ── Socket.IO real-time ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    if (!socket) return;

    socketRef.current = socket;

    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onStatusUpdate = (data) => {
      if (data.orderId !== orderId) return;

      const newStep = getStepIndex(data.status);
      setCurrentStep(newStep);

      if (data.estimatedArrival) {
        const match = String(data.estimatedArrival).match(/\d+/);
        if (match) setEtaMinutes(parseInt(match[0]));
      } else {
        const baseMins = [35, 30, 20, 12, 0];
        setEtaMinutes(baseMins[newStep] ?? 35);
      }

      setLastUpdated(new Date());

      // Human-readable notification
      const msgs = {
        confirmed:        "✅ Order confirmed! Restaurant is getting ready.",
        preparing:        "🍳 Chef is preparing your food!",
        "on-the-way":     "🚚 Rider is picking up your order!",
        out_for_delivery: "🛵 Your order is on the way!",
        delivered:        "🎉 Order delivered! Enjoy your meal!",
      };
      const msgKey = data.status?.toLowerCase().replace(/ /g, "_");
      if (msgs[msgKey] || msgs[data.status?.toLowerCase()]) {
        showNotification(msgs[msgKey] || msgs[data.status?.toLowerCase()]);
      }

      // Refresh full data to get partner / items updates
      fetchTracking(true);
    };

    const onPartnerUpdate = (data) => {
      if (data.orderId !== orderId) return;
      if (data.partner) {
        setDeliveryPartner(data.partner);
        showNotification("🏍️ Delivery partner assigned!");
      }
    };

    const onEtaUpdate = (data) => {
      if (data.orderId !== orderId) return;
      if (data.eta) setEtaMinutes(data.eta);
    };

    socket.on("connect",            onConnect);
    socket.on("disconnect",         onDisconnect);
    socket.on("orderStatusUpdate",  onStatusUpdate);
    socket.on("partnerAssigned",    onPartnerUpdate);
    socket.on("etaUpdate",          onEtaUpdate);

    setSocketConnected(socket.connected);

    // Join order room
    socket.emit("joinOrderRoom", orderId);

    return () => {
      socket.off("connect",           onConnect);
      socket.off("disconnect",        onDisconnect);
      socket.off("orderStatusUpdate", onStatusUpdate);
      socket.off("partnerAssigned",   onPartnerUpdate);
      socket.off("etaUpdate",         onEtaUpdate);
      socket.emit("leaveOrderRoom",   orderId);
    };
  }, [orderId, fetchTracking]);

  // ── Poll every 30s as fallback ───────────────────────────────────────────────
  useEffect(() => {
    if (currentStep >= 4) return; // delivered — stop polling
    const interval = setInterval(() => fetchTracking(true), 30_000);
    return () => clearInterval(interval);
  }, [currentStep, fetchTracking]);

  // ── Render helpers ───────────────────────────────────────────────────────────
  const getStepStatus = (idx) => {
    if (idx < currentStep)  return "completed";
    if (idx === currentStep) return "current";
    return "pending";
  };

  const isDelivered  = currentStep === 4;
  const isCancelled  = currentStep === -1;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 font-medium">Loading tracking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button onClick={() => fetchTracking()} className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition mr-2">
            Retry
          </button>
          <button onClick={() => navigate("/customer/orders")} className="text-gray-500 px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
            My Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Cancelled</h1>
          <p className="text-gray-500 mb-6">This order has been cancelled.</p>
          <button onClick={() => navigate("/customer/orders")} className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toast Notification ─────────────────────────────────────────────── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-bounce-once max-w-xs text-center">
          <FaBell className="text-orange-400 shrink-0" />
          {notification}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/customer/orders")} className="flex items-center gap-1 text-orange-500 font-semibold hover:underline text-sm">
            ← Orders
          </button>
          <div className="flex items-center gap-2">
            {/* Socket status */}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${socketConnected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-gray-400"}`} />
              {socketConnected ? "Live" : "Offline"}
            </div>
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <MdRefresh className={`text-base ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mb-1">
          <h1 className="text-2xl font-extrabold text-gray-800">Track Your Order</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Order #{order.orderId || orderId?.slice(-8) || "N/A"}
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-300">
                · Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        {/* ── ETA Banner ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-3xl p-5 mb-5 mt-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1 flex items-center gap-2">
                <FaClock /> Estimated Delivery
              </p>
              <ETACountdown minutes={etaMinutes} isDelivered={isDelivered} />
            </div>
            <div className="text-5xl opacity-80">
              {isDelivered ? "🎉" : TRACKING_STEPS[currentStep]?.icon}
            </div>
          </div>
          {!isDelivered && (
            <div className="mt-3 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-700"
                style={{ width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* ── Live Progress Steps ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            Order Status
            <LivePulseDot active={!isDelivered && socketConnected} />
          </h2>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gray-100">
              <div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-orange-500 to-yellow-400 transition-all duration-1000 ease-out"
                style={{ height: `${(currentStep / Math.max(TRACKING_STEPS.length - 1, 1)) * 100}%` }}
              />
            </div>

            {TRACKING_STEPS.map((step, idx) => {
              const status = getStepStatus(idx);
              return (
                <div key={step.key} className="relative flex items-start gap-4 mb-5 last:mb-0">
                  {/* Step circle */}
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 transition-all duration-500 ${
                    status === "completed" ? "bg-green-500 text-white shadow-md"
                    : status === "current"  ? "bg-orange-500 text-white shadow-lg scale-110 ring-4 ring-orange-100"
                    : "bg-gray-100 text-gray-400"
                  }`}>
                    {status === "completed" ? "✓" : step.icon}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold text-sm ${
                        status === "completed" ? "text-green-600"
                        : status === "current"  ? "text-orange-500"
                        : "text-gray-400"
                      }`}>
                        {step.label}
                      </h3>
                      {status === "current" && !isDelivered && (
                        <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>

                  {/* Timestamp from history */}
                  {status === "completed" && statusHistory?.find(h => h.status === step.key) && (
                    <span className="text-[10px] text-gray-300 shrink-0 pt-1.5">
                      {new Date(statusHistory.find(h => h.status === step.key).time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery Partner ─────────────────────────────────────────────── */}
        <DeliveryPartnerCard partner={deliveryPartner} />

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FaStore className="text-orange-400" /> Order Summary
          </h3>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-2 mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate mr-2">{item.name || item.menuItem?.name || "Item"} × {item.quantity || 1}</span>
                  <span className="font-semibold shrink-0">₹{(item.price || item.menuItem?.price || 0) * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-3">No items data available</p>
          )}
          <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between font-extrabold text-sm text-gray-800">
            <span>Total Paid</span>
            <span className="text-orange-500">₹{order.totalAmount || 0}</span>
          </div>
          {order.paymentMethod && (
            <p className="text-xs text-gray-400 mt-1">
              via {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod?.toUpperCase()}
            </p>
          )}
        </div>

        {/* ── Delivery Address ─────────────────────────────────────────────── */}
        {order.address && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-5">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-orange-400" /> Delivering to
            </h3>
            <p className="text-sm text-gray-600">
              {typeof order.address === "string"
                ? order.address
                : order.address.street || order.address.fullAddress || JSON.stringify(order.address)}
            </p>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        {isDelivered ? (
          <button
            onClick={() => navigate("/customer/orders")}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 rounded-2xl font-extrabold shadow-xl hover:from-orange-600 transition"
          >
            🏠 Back to Orders
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/customer/orders")}
              className="flex-1 bg-white border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              View All Orders
            </button>
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
              className="flex-1 bg-orange-50 border border-orange-200 text-orange-500 py-3.5 rounded-2xl font-semibold hover:bg-orange-100 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MdRefresh className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        )}

        {/* ── Support note ─────────────────────────────────────────────────── */}
        {!isDelivered && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Need help? <span className="text-orange-500 font-semibold cursor-pointer hover:underline">Contact Support</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
