import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

const STATUS_STEPS = ["assigned", "picked_up", "delivered"];

const stepLabel = {
  assigned:  "Order Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
};

export default function ActiveDelivery() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchActiveOrder();
  }, []);

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
      setOrder(null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
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
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Order Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Top Banner */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-medium">ORDER ID</p>
            <p className="text-white font-bold text-lg">#{order._id?.slice(-6).toUpperCase()}</p>
          </div>
          <span className="bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full">
            {order.deliveryStatus?.replace("_", " ").toUpperCase() || "ASSIGNED"}
          </span>
        </div>

        <div className="p-6 space-y-5">

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                  i <= currentStep
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-1 text-center ${i <= currentStep ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
                  {stepLabel[step]}
                </p>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 w-full mt-4 ${i < currentStep ? "bg-orange-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Customer Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-800">{order.user?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold text-gray-800">{order.user?.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-semibold text-gray-800 text-right max-w-[60%]">{order.deliveryAddress || "—"}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
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

          {/* Vendor Pickup */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Pickup From</p>
            <p className="text-sm font-semibold text-gray-800">{order.vendor?.restaurantName || order.vendor?.name || "—"}</p>
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
