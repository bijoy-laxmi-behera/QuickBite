// src/customer/pages/OrderTracking.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaPhone, FaClock, FaCheckCircle } from "react-icons/fa";
import API from "../../services/axios";

const trackingSteps = [
  { label: "Order Confirmed", icon: "✅", key: "confirmed", description: "Your order has been confirmed" },
  { label: "Preparing", icon: "🍳", key: "preparing", description: "Restaurant is preparing your food" },
  { label: "On the Way", icon: "🚚", key: "on-the-way", description: "Rider is on the way to pick up" },
  { label: "Out for Delivery", icon: "🛵", key: "out_for_delivery", description: "Rider is on the way to you" },
  { label: "Delivered", icon: "🎉", key: "delivered", description: "Order delivered! Enjoy your meal" },
];

function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching order:", orderId);
        
        const response = await API.get(`/customer/me/orders/${orderId}/track`);
        console.log("Response:", response.data);
        
        if (response.data.success) {
          const trackingData = response.data.data;
          setOrder(trackingData);
          
          const stepIndex = getStepIndex(trackingData.deliveryStatus || trackingData.status);
          setCurrentStep(stepIndex);
          setEstimatedArrival(trackingData.estimatedArrival);
          
          if (trackingData.deliveryPartner) {
            setDeliveryPartner(trackingData.deliveryPartner);
          }
        } else {
          setError(response.data.message || "Failed to load tracking details");
        }
      } catch (error) {
        console.error("Error fetching tracking:", error);
        setError(error.response?.data?.message || "Failed to load tracking details");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, [orderId, navigate]);

  const getStepIndex = (status) => {
    const statusMap = {
      'pending': 0, 
      'confirmed': 0,
      'preparing': 1,
      'on-the-way': 2,
      'out_for_delivery': 3,
      'delivered': 4,
      'cancelled': -1
    };
    const key = status?.toLowerCase().replace(/ /g, '_');
    return statusMap[key] !== undefined ? statusMap[key] : 0;
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-500">Loading tracking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/customer/orders")} 
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <button 
            onClick={() => navigate("/customer/orders")} 
            className="mt-4 text-orange-500 hover:underline"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const isDelivered = currentStep === 4;
  const isCancelled = currentStep === -1;

  // Cancelled order state
  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Cancelled</h1>
          <p className="text-gray-500 mb-6">This order has been cancelled</p>
          <button
            onClick={() => navigate("/customer/orders")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/customer/orders")}
            className="text-orange-500 mb-2 flex items-center gap-1 hover:underline"
          >
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
          <p className="text-gray-500 text-sm mt-1">
            Order #{order.orderId || orderId?.slice(-8) || "N/A"}
          </p>
        </div>

        {/* Estimated Time Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-center gap-3">
            <FaClock className="text-2xl" />
            <div>
              <p className="text-sm opacity-90">Estimated Delivery Time</p>
              <p className="text-xl font-bold">
                {isDelivered ? "Delivered! 🎉" : estimatedArrival || "30-40 minutes"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200">
              <div 
                className="absolute top-0 left-0 w-full bg-orange-500 transition-all duration-500"
                style={{ height: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {trackingSteps.map((step, idx) => {
              const status = getStepStatus(idx);
              return (
                <div key={step.key} className="relative flex items-start gap-4 mb-6 last:mb-0">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                    status === "completed" ? "bg-green-500 text-white" :
                    status === "current" ? "bg-orange-500 text-white scale-110 shadow-lg" :
                    "bg-gray-200 text-gray-400"
                  }`}>
                    {status === "completed" ? "✓" : step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className={`font-semibold ${
                      status === "completed" ? "text-green-600" :
                      status === "current" ? "text-orange-500" :
                      "text-gray-400"
                    }`}>
                      {step.label}
                      {status === "current" && !isDelivered && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full animate-pulse">
                          In Progress
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner Info */}
        {deliveryPartner && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Delivery Partner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                {deliveryPartner.avatar ? (
                  <img src={deliveryPartner.avatar} alt="rider" className="w-full h-full rounded-full object-cover" />
                ) : (
                  "🏍️"
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{deliveryPartner.name || "Rider Assigned"}</p>
                <p className="text-sm text-gray-500">Your delivery partner</p>
              </div>
              {deliveryPartner.phone && (
                <a href={`tel:${deliveryPartner.phone}`} className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition">
                  <FaPhone />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name || item.menuItem?.name || "Item"} × {item.quantity || 1}</span>
                  <span className="font-semibold">₹{(item.price || item.menuItem?.price || 0) * (item.quantity || 1)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No items found</p>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-500">₹{order.totalAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isDelivered ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">
              Need help? <span className="text-orange-500">Contact Support</span>
            </p>
            <button
              onClick={() => navigate("/customer/orders")}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              View All Orders
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/customer/orders")}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3 rounded-xl font-bold hover:from-orange-600 transition"
          >
            🏠 Back to Orders
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;