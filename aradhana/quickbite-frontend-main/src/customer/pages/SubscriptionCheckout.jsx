// ── SubscriptionCheckout.jsx ─────────────────────────────────
import { useState } from "react";
import { FaCrown, FaLeaf, FaDrumstickBite, FaMapMarkerAlt, FaCheckCircle, FaFire } from "react-icons/fa";

const plans = {
  weekly:  { label: "Weekly",  price: 699,  per: "week",  features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options"] },
  monthly: { label: "Monthly", price: 2499, per: "month", features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options", "Priority Support", "Pause Anytime"] },
};

function SubscriptionCheckout({ setPage }) {
  const [plan, setPlan]     = useState("monthly");
  const [mealType, setMealType] = useState("veg");
  const [address, setAddress]   = useState("");
  const [loading, setLoading]   = useState(false);

  const current = plans[plan];

  const handleSubscribe = () => {
    if (!address.trim()) { alert("Please enter your delivery address"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("subscriptionSuccess"); }, 1200);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        <h2 className="text-xl font-extrabold text-gray-800 mb-5">🍱 Subscribe to QuickBite</h2>

        {/* PLAN TOGGLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Choose Plan</h3>
          <div className="flex gap-3">
            {Object.entries(plans).map(([key, val]) => (
              <button key={key} onClick={() => setPlan(key)}
                className={`flex-1 rounded-2xl p-3 border-2 text-left transition ${plan === key ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {key === "monthly" && <FaCrown className="text-orange-500 text-xs" />}
                  <span className="font-bold text-sm text-gray-800">{val.label}</span>
                  {key === "monthly" && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><FaFire className="text-[8px]" />Best</span>}
                </div>
                <p className="text-orange-500 font-extrabold text-lg">₹{val.price}<span className="text-xs text-gray-400 font-normal">/{val.per}</span></p>
              </button>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">What's included</h3>
          <div className="space-y-2">
            {current.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</span>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEAL TYPE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Meal Preference</h3>
          <div className="flex gap-3">
            {[
              { val: "veg",     label: "Veg",     icon: <FaLeaf className="text-green-500" />, bg: "bg-green-50", border: "border-green-400" },
              { val: "non-veg", label: "Non-Veg", icon: <FaDrumstickBite className="text-red-500" />, bg: "bg-red-50", border: "border-red-400" },
            ].map((opt) => (
              <button key={opt.val} onClick={() => setMealType(opt.val)}
                className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-xs font-bold transition ${mealType === opt.val ? `${opt.bg} ${opt.border}` : "border-gray-100 bg-gray-50 text-gray-500"}`}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ADDRESS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Delivery Address</h3>
          </div>
          <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address..."
            className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none" />
        </div>

        {/* SUMMARY + CTA */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">You're subscribing to</p>
            <p className="font-extrabold text-gray-800">{current.label} · {mealType === "veg" ? "🥦 Veg" : "🍗 Non-Veg"}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="font-extrabold text-orange-500 text-lg">₹{current.price}</p>
          </div>
        </div>

        <button onClick={handleSubscribe} disabled={loading}
          className={`w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 shadow-xl transition ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600"}`}>
          {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</> : <><FaCheckCircle /> Pay ₹{current.price} & Subscribe</>}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Cancel anytime • No hidden charges • Pause anytime</p>
      </div>
    </div>
  );
}

export default SubscriptionCheckout;