import { useEffect, useState, useRef } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

const STATUS_STEPS = ["assigned", "picked_up", "delivered"];
const stepLabel    = { assigned: "Assigned", picked_up: "Picked Up", delivered: "Delivered" };

export default function ActiveDelivery() {
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [photo, setPhoto]         = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const intervalRef               = useRef(null);

  useEffect(() => {
    fetchActiveOrder();
    return () => stopTracking();
  }, []);

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
    if (intervalRef.current) return;
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("active");
    const send = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            await API.patch(`/delivery/orders/${orderId}/location`, {
              lat: coords.latitude,
              lng: coords.longitude,
            });
          } catch { /* silent */ }
        },
        () => setGpsStatus("error"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    };
    send();
    intervalRef.current = setInterval(send, 5000);
  };

  const stopTracking = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setGpsStatus("idle");
  };

  // ─── ACTIONS ───────────────────────────────────────────
  const handlePickedUp = async () => {
    try {
      setUpdating(true);
      await API.patch(`/delivery/orders/${order._id}/picked-up`);
      toast.success("Marked as picked up!");
      fetchActiveOrder();
    } catch { toast.error("Failed to update"); }
    finally { setUpdating(false); }
  };

  const handleDelivered = async () => {
    if (!photo) {
      toast.error("Please upload a delivery photo proof first");
      return;
    }
    try {
      setUpdating(true);
      // Upload photo first
      const formData = new FormData();
      formData.append("photo", photo);
      await API.patch(`/delivery/orders/${order._id}/proof`, formData);
      // Then mark delivered
      await API.patch(`/delivery/orders/${order._id}/delivered`);
      toast.success("Order delivered successfully!");
      stopTracking();
      setOrder(null);
    } catch { toast.error("Failed to mark delivered"); }
    finally { setUpdating(false); }
  };

  // ─── NAVIGATION ────────────────────────────────────────
  const handleNavigate = () => {
    if (!order?.deliveryAddress) {
      toast.error("No delivery address found");
      return;
    }
    const encoded = encodeURIComponent(order.deliveryAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
  };

  const handleNavigateToVendor = () => {
    const addr = order?.vendor?.address;
    if (!addr) { toast.error("No vendor address found"); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`, "_blank");
  };

  // ─── PHOTO ─────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* GPS Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
        gpsStatus === "active" ? "bg-green-50 border border-green-200 text-green-700"
        : gpsStatus === "error" ? "bg-red-50 border border-red-200 text-red-600"
        : "bg-gray-50 border border-gray-200 text-gray-500"
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          gpsStatus === "active" ? "bg-green-500 animate-pulse"
          : gpsStatus === "error" ? "bg-red-500" : "bg-gray-400"
        }`} />
        {gpsStatus === "active" && "📡 Live location sharing ON — updating every 5 seconds"}
        {gpsStatus === "error"  && "⚠️ Location access denied. Enable GPS in browser settings."}
        {gpsStatus === "idle"   && "📍 Location sharing inactive"}
      </div>

      {/* Order Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Banner */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs">ORDER ID</p>
            <p className="text-white font-bold text-lg">#{order._id?.slice(-6).toUpperCase()}</p>
          </div>
          <span className="bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full">
            {(order.deliveryStatus || "assigned").replace("_", " ").toUpperCase()}
          </span>
        </div>

        <div className="p-6 space-y-5">

          {/* Progress */}
          <div className="flex items-start justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentStep ? "bg-orange-500" : "bg-gray-200"}`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 ${
                  i <= currentStep ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-300"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center ${i <= currentStep ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
                  {stepLabel[step]}
                </p>
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-semibold uppercase">Customer Details</p>
              <button onClick={handleNavigate}
                className="flex items-center gap-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                🗺️ Navigate
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Name"    value={order.user?.name || "—"} />
              <Row label="Phone"   value={order.user?.phone || "—"} />
              <Row label="Address" value={order.deliveryAddress || "—"} />
            </div>
          </div>

          {/* Vendor */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-semibold uppercase">Pickup From</p>
              <button onClick={handleNavigateToVendor}
                className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                🗺️ Navigate to Vendor
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-800">{order.vendor?.restaurantName || order.vendor?.name || "—"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.vendor?.address || "—"}</p>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Order Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name || item.menuItem?.name} × {item.quantity}</span>
                  <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-orange-500">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Photo Proof (show when picked up) */}
          {order.deliveryStatus === "picked_up" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-semibold uppercase mb-3">📸 Delivery Photo Proof</p>
              <p className="text-xs text-blue-600 mb-3">Upload a photo after delivering to complete the order.</p>
              <input type="file" accept="image/*" onChange={handlePhotoChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Proof preview"
                  className="mt-3 w-full h-40 object-cover rounded-xl border border-blue-200"
                />
              )}
              {photo && (
                <p className="text-xs text-green-600 font-semibold mt-2">✅ Photo ready to upload</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {order.deliveryStatus === "assigned" && (
          <button onClick={handlePickedUp} disabled={updating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition">
            {updating ? "Updating..." : "📦 Mark as Picked Up"}
          </button>
        )}
        {order.deliveryStatus === "picked_up" && (
          <button onClick={handleDelivered} disabled={updating || !photo}
            className={`w-full py-3.5 rounded-xl font-semibold transition text-white ${
              photo ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"
            } disabled:opacity-50`}>
            {updating ? "Uploading & Completing..." : photo ? "✅ Mark as Delivered" : "⚠️ Upload Photo First"}
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