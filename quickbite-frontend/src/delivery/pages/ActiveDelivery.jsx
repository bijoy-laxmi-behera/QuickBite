import { useEffect, useState, useRef } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

const STATUS_STEPS = ["assigned", "picked_up", "delivered"];

const stepLabel = {
  assigned:  "Order Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
};

export default function ActiveDelivery() {
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | active | error
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchActiveOrder();
    return () => stopTracking();
  }, []);

  // Start tracking when order is assigned or picked up
  useEffect(() => {
    if (order && order.deliveryStatus !== "delivered") {
      startTracking(order._id);
    } else {
      stopTracking();
    }
  }, [order]);

  const fetchActiveOrder = async () => {
    try {
      const res = await API.get("/delivery/active-order");
      setOrder(res.data.order || null);
    } catch {
      toast.error("Failed to load active order");
    } finally {
      setLoading(false);
    }
  };

  // ─── GPS TRACKING ──────────────────────────────────────
  const startTracking = (orderId) => {
    if (intervalRef.current) return; // already running

    if (!navigator.geolocation) {
      setGpsStatus("error");
      toast.error("Geolocation not supported on this device");
      return;
    }

    setGpsStatus("active");

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          try {
            await API.patch(`/delivery/orders/${orderId}/location`, { lat, lng });
          } catch {
            // silent fail — don't spam toasts
          }
        },
        () => {
          setGpsStatus("error");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    };

    sendLocation(); // send immediately
    intervalRef.current = setInterval(sendLocation, 5000); // then every 5s
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setGpsStatus("idle");
  };

  // ─── ACTIONS ───────────────────────────────────────────
  const handlePickedUp = async () => {
    try {
      setUpdating(true);
      await API.patch(`/delivery/orders/${order._id}/picked-up`);
      toast.success("Marked as picked up!");
      fetchActiveOrder();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelivered = async () => {
    try {
      setUpdating(true);
      await API.patch(`/delivery/orders/${order._id}/delivered`);
      toast.success("Order delivered successfully!");
      stopTracking();
      setOrder(null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // ─── LOADING ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🏍️</p>
        <h3 className="text-lg font-semibold text-gray-700">No Active Delivery</h3>
        <p className="text-sm text-gray-400 mt-1">You'll be assigned an order soon.</p>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.deliveryStatus || "assigned");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* GPS Status Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
        gpsStatus === "active"
          ? "bg-green-50 border border-green-200 text-green-700"
          : gpsStatus === "error"
          ? "bg-red-50 border border-red-200 text-red-600"
          : "bg-gray-50 border border-gray-200 text-gray-500"
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          gpsStatus === "active" ? "bg-green-500 animate-pulse" :
          gpsStatus === "error"  ? "bg-red-500" : "bg-gray-400"
        }`} />
        {gpsStatus === "active" && "📡 Live location sharing is ON — updating every 5 seconds"}
        {gpsStatus === "error"  && "⚠️ Location access denied. Please enable GPS in your browser."}
        {gpsStatus === "idle"   && "📍 Location sharing inactive"}
      </div>

      {/* Order Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Top Banner */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-medium">ORDER ID</p>
            <p className="text-white font-bold text-lg">#{order._id?.slice(-6).toUpperCase()}</p>
          </div>
          <span className="bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full">
            {(order.deliveryStatus || "assigned").replace("_", " ").toUpperCase()}
          </span>
        </div>

        <div className="p-6 space-y-5">

          {/* Progress Steps */}
          <div className="flex items-start justify-between mb-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    i < currentStep ? "bg-orange-500" : "bg-gray-200"
                  }`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 transition ${
                  i <= currentStep
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center leading-tight ${
                  i <= currentStep ? "text-orange-500 font-semibold" : "text-gray-400"
                }`}>
                  {stepLabel[step]}
                </p>
              </div>
            ))}
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Customer Details</p>
            <div className="space-y-2 text-sm">
              <Row label="Name"    value={order.user?.name || "—"} />
              <Row label="Phone"   value={order.user?.phone || "—"} />
              <Row label="Address" value={order.deliveryAddress || "—"} />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Order Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name || item.menuItem?.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-orange-500">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Vendor Pickup */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Pickup From</p>
            <p className="text-sm font-semibold text-gray-800">
              {order.vendor?.restaurantName || order.vendor?.name || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{order.vendor?.address || "—"}</p>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {order.deliveryStatus === "assigned" && (
          <button
            onClick={handlePickedUp}
            disabled={updating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition"
          >
            {updating ? "Updating..." : "📦 Mark as Picked Up"}
          </button>
        )}
        {order.deliveryStatus === "picked_up" && (
          <button
            onClick={handleDelivered}
            disabled={updating}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition"
          >
            {updating ? "Updating..." : "✅ Mark as Delivered"}
          </button>
        )}
      </div>

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
