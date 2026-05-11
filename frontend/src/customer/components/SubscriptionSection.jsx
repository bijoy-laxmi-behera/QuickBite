import { useState, useEffect } from "react";
import { FaCrown, FaFire, FaCheck, FaSpinner } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config

function SubscriptionSection({ setPage }) {
  const [plan, setPlan] = useState("monthly");
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(false); // ADDED: Loading state
  const [activeSubscription, setActiveSubscription] = useState(null); // ADDED: Check existing subscription
  const [subscriptionPlans, setSubscriptionPlans] = useState(null); // ADDED: Plans from backend

  // ADDED: Fetch subscription plans from backend
  // In SubscriptionSection.jsx, update the useEffect:

useEffect(() => {
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await API.get("/customer/subscription/plans");
      if (response.data.success) {
        setSubscriptionPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      // Keep using default plans as fallback
      setSubscriptionPlans({
        weekly: { price: 699, features: ["Fresh Meals Daily", "Free Delivery", "Healthy Meals"] },
        monthly: { price: 2499, features: ["Fresh Meals Daily", "Free Delivery", "Healthy Meals", "Priority Support"] }
      });
    }
  };

  const checkExistingSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await API.get("/customer/subscription/status");
      if (response.data.success && response.data.data.active) {
        setActiveSubscription(response.data.data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      // Don't show error to user, just assume no active subscription
      setActiveSubscription(null);
    }
  };

  fetchSubscriptionPlans();
  checkExistingSubscription();
}, []);

  // Timer effect (keep your existing timer logic)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;
    return hrs > 0
      ? `${hrs}h ${mins}m ${secs}s`
      : `${mins}m ${secs}s`;
  };

  // ADDED: Get plan details (from backend or fallback)
  const getPlanDetails = () => {
    if (subscriptionPlans) {
      const planData = subscriptionPlans[plan];
      return {
        label: plan === "weekly" ? "Weekly Plan" : "Monthly Plan",
        price: `₹${planData?.price || (plan === "weekly" ? 699 : 2499)}`,
        per: plan === "weekly" ? "week" : "month",
        features: planData?.features || (plan === "weekly" 
          ? ["Fresh Meals Daily", "Free Delivery", "Healthy Meals"]
          : ["Fresh Meals Daily", "Free Delivery", "Healthy Meals", "Priority Support"])
      };
    }
    
    // Fallback plans
    return {
      weekly: {
        label: "Weekly Plan",
        price: "₹699",
        per: "week",
        features: ["Fresh Meals Daily", "Free Delivery", "Healthy Meals"],
      },
      monthly: {
        label: "Monthly Plan",
        price: "₹2499",
        per: "month",
        features: [
          "Fresh Meals Daily",
          "Free Delivery",
          "Healthy Meals",
          "Priority Support",
        ],
      },
    }[plan];
  };

  // ADDED: Handle subscription purchase
  const handleSubscribe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to subscribe");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    
    try {
      const response = await API.post("/customer/subscription/create", {
        planType: plan,
        duration: plan === "weekly" ? 7 : 30
      });

      if (response.data.success) {
        // If payment is required, redirect to payment
        if (response.data.data.paymentUrl) {
          window.location.href = response.data.data.paymentUrl;
        } else {
          // Subscription created successfully
          alert(`Successfully subscribed to ${plan === "weekly" ? "Weekly" : "Monthly"} Plan!`);
          setPage("subscriptionSuccess");
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    
    setLoading(true);
    try {
      const response = await API.post("/customer/subscription/cancel");
      if (response.data.success) {
        alert("Subscription cancelled successfully");
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert(error.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const current = getPlanDetails();
  const hasActiveSubscription = activeSubscription && activeSubscription.active;

  return (
    <div className="mt-8">

      {/* HEADER ROW */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          🥗 Subscription Plans
        </h2>
        <span className="text-xs sm:text-sm bg-red-100 text-red-500 px-3 py-1.5 rounded-full font-semibold animate-pulse">
          ⏳ Offer ends in {formatTime()}
        </span>
      </div>

      {/* ACTIVE SUBSCRIPTION BANNER - ADDED */}
      {hasActiveSubscription && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FaCrown className="text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              Active Subscription: {activeSubscription.planType || plan} Plan
            </span>
            <span className="text-xs text-green-600">
              Expires: {new Date(activeSubscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* TOGGLE - Disabled if already subscribed */}
      <div className="flex bg-gray-200 p-1 rounded-full w-fit mb-5">
        {["weekly", "monthly"].map((p) => (
          <button
            key={p}
            onClick={() => !hasActiveSubscription && setPlan(p)}
            disabled={hasActiveSubscription}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              plan === p
                ? "bg-white shadow text-orange-500"
                : "text-gray-500 hover:text-gray-700"
            } ${hasActiveSubscription ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* CARD */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        {/* ACCENT TOP BAR */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-yellow-400" />

        <div className="p-4 sm:p-6">

          {/* BEST BADGE */}
          {plan === "monthly" && !hasActiveSubscription && (
            <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold shadow">
              <FaFire /> Best Value
            </span>
          )}

          {/* ACTIVE BADGE - ADDED */}
          {hasActiveSubscription && (
            <span className="absolute top-4 right-4 bg-green-500 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold shadow">
              <FaCheck /> Active
            </span>
          )}

          {/* PLAN TITLE */}
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-800 mb-1">
            {plan === "monthly" && <FaCrown className="text-orange-500" />}
            {current.label}
          </h3>

          {/* PRICE */}
          <p className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-4">
            {current.price}
            <span className="text-sm sm:text-base text-gray-400 font-normal ml-1">
              / {current.per}
            </span>
          </p>

          {/* FEATURES */}
          <ul className="space-y-2 mb-5">
            {current.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-600"
              >
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <FaCheck className="text-[10px]" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={hasActiveSubscription ? handleCancelSubscription : handleSubscribe}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm sm:text-base transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
              hasActiveSubscription
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white"
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : hasActiveSubscription ? (
              "Cancel Subscription →"
            ) : (
              "Subscribe Now →"
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Cancel anytime • No hidden charges • Pause anytime
      </p>
    </div>
  );
}

export default SubscriptionSection;