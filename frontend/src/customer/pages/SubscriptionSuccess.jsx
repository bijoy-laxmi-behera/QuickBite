import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config

function SubscriptionSuccess({ setPage }) {
  const [show, setShow] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextDelivery, setNextDelivery] = useState(null);

  // ADDED: Fetch subscription details from backend
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get("/customer/subscription/status");
        
        if (response.data.success && response.data.data.active) {
          const subData = response.data.data;
          setSubscription({
            planType: subData.planType || "monthly",
            price: subData.price || (subData.planType === "weekly" ? 699 : 2499),
            mealType: subData.mealType || "veg",
            startDate: subData.startDate,
            endDate: subData.endDate,
            features: subData.features || getDefaultFeatures(subData.planType),
            status: subData.status,
            deliveryTime: subData.deliveryTime || "8:00 AM – 10:00 AM"
          });
          
          // Calculate next delivery date
          if (subData.nextDeliveryDate) {
            setNextDelivery(new Date(subData.nextDeliveryDate));
          } else {
            // Default to tomorrow if not provided
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNextDelivery(tomorrow);
          }
        } else {
          // No active subscription found - use localStorage fallback
          const savedSub = localStorage.getItem("lastSubscription");
          if (savedSub) {
            try {
              const parsed = JSON.parse(savedSub);
              setSubscription(parsed);
            } catch (e) {}
          }
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Fallback to localStorage
        const savedSub = localStorage.getItem("lastSubscription");
        if (savedSub) {
          try {
            const parsed = JSON.parse(savedSub);
            setSubscription(parsed);
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
    
    // Animation trigger
    setTimeout(() => setShow(true), 100);
  }, []);

  // ADDED: Helper to get default features based on plan type
  const getDefaultFeatures = (planType) => {
    if (planType === "weekly") {
      return ["Fresh Meals Daily", "Free Delivery", "Healthy Options"];
    }
    return ["Fresh Meals Daily", "Free Delivery", "Healthy Options", "Priority Support", "Pause Anytime"];
  };

  // ADDED: Format next delivery date
  const formatDeliveryDate = () => {
    if (!nextDelivery) return "Tomorrow Morning";
    
    const today = new Date();
    const diffDays = Math.ceil((nextDelivery - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow Morning";
    if (diffDays === 2) return "Day After Tomorrow";
    return nextDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // ADDED: Get plan display name
  const getPlanDisplay = () => {
    if (!subscription) return "Monthly Plan";
    return subscription.planType === "weekly" ? "Weekly Plan" : "Monthly Plan";
  };

  // ADDED: Get price display
  const getPriceDisplay = () => {
    if (!subscription) return "₹2499/mo";
    const per = subscription.planType === "weekly" ? "wk" : "mo";
    return `₹${subscription.price}/${per}`;
  };

  // ADDED: Get meal type icon
  const getMealIcon = () => {
    return subscription?.mealType === "veg" ? "🥦 Veg" : "🍗 Non-Veg";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
        <p className="text-gray-400">Loading subscription details...</p>
      </div>
    );
  }

  const features = subscription?.features || getDefaultFeatures(subscription?.planType || "monthly");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">

      {/* ANIMATED CHECK */}
      <div className={`transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl font-extrabold">
            ✓
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 delay-200 ${show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} w-full max-w-xs`}>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1">You're Subscribed! 🎉</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your daily {subscription?.mealType === "veg" ? "vegetarian" : "non-vegetarian"} meals will be delivered fresh as per your plan 🍱
        </p>

        {/* PLAN CARD */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 mb-6 text-left shadow-sm">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Your Plan</p>
          <div className="flex justify-between items-center mb-1">
            <div>
              <span className="text-sm font-bold text-gray-700">{getPlanDisplay()}</span>
              <span className="text-xs text-gray-500 ml-2">({getMealIcon()})</span>
            </div>
            <span className="text-orange-500 font-extrabold">{getPriceDisplay()}</span>
          </div>
          
          {/* Subscription Period - ADDED */}
          {subscription?.endDate && (
            <div className="text-xs text-gray-400 mt-1">
              Valid until: {new Date(subscription.endDate).toLocaleDateString()}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1 mt-3">
            {features.map((feature, idx) => (
              <p key={idx}>✅ {feature}</p>
            ))}
          </div>
        </div>

        {/* DELIVERY INFO */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm text-left">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">First Delivery</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-sm font-bold text-gray-800">{formatDeliveryDate()}</p>
              <p className="text-xs text-gray-400">
                Between {subscription?.deliveryTime || "8:00 AM – 10:00 AM"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPage("home")}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3.5 rounded-2xl font-extrabold shadow-lg hover:from-orange-600 transition"
        >
          🏠 Back to Home
        </button>

        <button
          onClick={() => setPage("orders")}
          className="w-full text-gray-500 py-3 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-50 transition text-sm mt-2"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
}

export default SubscriptionSuccess;