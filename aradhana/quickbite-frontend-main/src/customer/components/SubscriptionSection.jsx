import { useState, useEffect } from "react";
import { FaCrown, FaFire, FaCheck } from "react-icons/fa";

function SubscriptionSection({ setPage }) {
  const [plan, setPlan] = useState("monthly");
  const [timeLeft, setTimeLeft] = useState(3600);

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

  const plans = {
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
  };

  const current = plans[plan];

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

      {/* TOGGLE */}
      <div className="flex bg-gray-200 p-1 rounded-full w-fit mb-5">
        {["weekly", "monthly"].map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              plan === p
                ? "bg-white shadow text-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
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
          {plan === "monthly" && (
            <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold shadow">
              <FaFire /> Best Value
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
            onClick={() => setPage("subscriptionCheckout")}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white rounded-xl font-bold text-sm sm:text-base transition shadow-md hover:shadow-lg"
          >
            Subscribe Now →
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
