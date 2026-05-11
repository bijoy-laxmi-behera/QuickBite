import { useEffect, useState } from "react";
import { FaSpinner, FaCopy, FaCheck } from "react-icons/fa";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";

function OrderSuccess({ setPage, orderId: propOrderId }) {
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("confirmed");
  const [estimatedTime, setEstimatedTime] = useState("30-40");
  const [copied, setCopied] = useState(false);

  const orderId = propOrderId || localStorage.getItem("lastOrderId");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/customer/me/orders/${orderId}`);
        
        if (response.data.success) {
          const orderData = response.data.data;
          setOrder(orderData);
          setStatus(orderData.deliveryStatus || orderData.status);
          
          const estimated = calculateEstimatedTime(orderData);
          setEstimatedTime(estimated);
          
          localStorage.setItem("lastOrderId", orderId);
          localStorage.setItem("trackingOrderId", orderId);
          localStorage.setItem("lastOrder", JSON.stringify(orderData));
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        const savedOrder = localStorage.getItem("lastOrder");
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            setOrder(parsed);
            setStatus(parsed.status || "confirmed");
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    setTimeout(() => setShow(true), 100);
  }, [orderId]);

  const calculateEstimatedTime = (orderData) => {
    if (orderData.estimatedArrival) return orderData.estimatedArrival;
    if (orderData.vendor?.deliveryTime) return orderData.vendor.deliveryTime;
    const itemCount = orderData.items?.length || 0;
    if (itemCount > 5) return "45-60";
    if (itemCount > 3) return "35-50";
    return "25-35";
  };

  // Copy OTP to clipboard
  const copyOtpToClipboard = () => {
    if (order?.otp) {
      navigator.clipboard.writeText(order.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    if (socket) {
      const handleStatusUpdate = (data) => {
        if (data.orderId === orderId) {
          setStatus(data.status);
          if (data.status === "out_for_delivery") {
            setEstimatedTime("10-20");
          } else if (data.status === "preparing") {
            setEstimatedTime("25-35");
          }
        }
      };

      socket.on('orderStatusUpdate', handleStatusUpdate);
      return () => socket.off('orderStatusUpdate', handleStatusUpdate);
    }
  }, [orderId]);

  const getCurrentStep = () => {
    const steps = ["confirmed", "preparing", "on-the-way", "out_for_delivery", "delivered"];
    const currentStatus = status?.toLowerCase().replace(/ /g, '-');
    const index = steps.findIndex(step => {
      if (currentStatus === "on-the-way") return step === "on-the-way";
      if (currentStatus === "out_for_delivery") return step === "out_for_delivery";
      return step === currentStatus;
    });
    return index >= 0 ? index : 0;
  };

  const getOrderNumber = () => {
    if (order?.orderId) return order.orderId;
    if (order?._id) return order._id.slice(-8).toUpperCase();
    const saved = localStorage.getItem("lastOrderNumber");
    if (saved) return saved;
    return `QB${Date.now().toString().slice(-4)}`;
  };

  const getStatusDisplay = () => {
    const statusMap = {
      'pending': { text: 'Pending', emoji: '⏳' },
      'confirmed': { text: 'Confirmed', emoji: '✓' },
      'preparing': { text: 'Preparing', emoji: '🍳' },
      'on-the-way': { text: 'On the Way', emoji: '🚚' },
      'out_for_delivery': { text: 'Out for Delivery', emoji: '🛵' },
      'delivered': { text: 'Delivered', emoji: '🎉' },
      'cancelled': { text: 'Cancelled', emoji: '❌' }
    };
    const key = status?.toLowerCase().replace(/ /g, '_');
    return statusMap[key] || { text: 'Confirmed', emoji: '✓' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
        <p className="text-gray-400">Loading order details...</p>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();
  const currentStep = getCurrentStep();
  const orderNumber = getOrderNumber();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">

      {/* ANIMATED CIRCLE */}
      <div className={`transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 delay-200 ${show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          Order Placed! {status === "delivered" ? "🎉" : "🎯"}
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Your order has been {status === "delivered" ? "delivered" : "confirmed"}
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Estimated delivery: <span className="font-bold text-orange-500">
            {status === "delivered" ? "Delivered" : `${estimatedTime} minutes`}
          </span>
        </p>

        {/* ORDER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 w-full max-w-xs mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Order ID</span>
            <span className="text-xs font-bold text-gray-700">#{orderNumber}</span>
          </div>
          
          {/* OTP Section - Added */}
          {order?.otp && (
            <div className="flex items-center justify-between mb-2 pt-2">
              <span className="text-xs text-gray-400">Delivery OTP</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-600 tracking-wider">
                  {order.otp}
                </span>
                <button
                  onClick={copyOtpToClipboard}
                  className="text-gray-400 hover:text-orange-500 transition"
                  title="Copy OTP"
                >
                  {copied ? <FaCheck className="text-green-500" /> : <FaCopy size={14} />}
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>{statusDisplay.emoji}</span> {statusDisplay.text}
            </span>
          </div>
          
          {order?.paymentMethod && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-400">Payment</span>
              <span className="text-xs font-medium text-gray-600">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* OTP Alert Box - Added for better visibility */}
        {order?.otp && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 w-full max-w-xs mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xl">🔐</span>
              <div>
                <p className="text-xs text-orange-600 font-medium">Your Delivery OTP</p>
                <p className="text-lg font-bold text-orange-600 tracking-wider">{order.otp}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Share this OTP with the delivery partner when your order arrives
            </p>
          </div>
        )}

        {/* DELIVERY STEPS */}
        <div className="flex items-center gap-2 justify-center mb-8 text-xs text-gray-400">
          <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentStep >= 0 ? "text-orange-500" : "text-gray-300"}`}>
            <span className="text-xl">{currentStep >= 0 ? "✓" : "🧾"}</span>
            <span className={currentStep >= 0 ? "text-orange-500 font-medium" : ""}>Confirmed</span>
          </div>
          <div className={`flex-1 h-px max-w-8 transition-all duration-300 ${currentStep >= 1 ? "bg-orange-400" : "bg-gray-200"}`} />
          
          <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentStep >= 1 ? "text-orange-500" : "text-gray-300"}`}>
            <span className="text-xl">{currentStep >= 1 ? (currentStep >= 2 ? "✓" : "🍳") : "🍳"}</span>
            <span className={currentStep >= 1 ? "text-orange-500 font-medium" : ""}>Preparing</span>
          </div>
          <div className={`flex-1 h-px max-w-8 transition-all duration-300 ${currentStep >= 2 ? "bg-orange-400" : "bg-gray-200"}`} />
          
          <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentStep >= 2 ? "text-orange-500" : "text-gray-300"}`}>
            <span className="text-xl">{currentStep >= 2 ? (currentStep >= 3 ? "✓" : "🚚") : "🚚"}</span>
            <span className={currentStep >= 2 ? "text-orange-500 font-medium" : ""}>On Way</span>
          </div>
          <div className={`flex-1 h-px max-w-8 transition-all duration-300 ${currentStep >= 3 ? "bg-orange-400" : "bg-gray-200"}`} />
          
          <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentStep >= 3 ? "text-orange-500" : "text-gray-300"}`}>
            <span className="text-xl">{currentStep >= 3 ? (currentStep >= 4 ? "✓" : "🎉") : "🎉"}</span>
            <span className={currentStep >= 3 ? "text-orange-500 font-medium" : ""}>Delivered</span>
          </div>
        </div>

        <button
          onClick={() => setPage("tracking")}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3.5 rounded-2xl font-extrabold mb-3 shadow-lg hover:from-orange-600 transition"
        >
          🚚 Track My Order
        </button>

        <button
          onClick={() => setPage("home")}
          className="w-full text-gray-500 py-3 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-50 transition text-sm"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;