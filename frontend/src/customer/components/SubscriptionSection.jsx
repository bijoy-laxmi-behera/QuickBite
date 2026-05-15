// src/customer/components/SubscriptionSection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaFire, FaCheck, FaClock, FaChevronRight } from "react-icons/fa";
import API from "../../services/axios";

export default function SubscriptionSection() {
  const navigate = useNavigate();

  const [plan,    setPlan]    = useState("monthly");
  const [timeLeft,setTimeLeft]= useState(3600);
  const [sub,     setSub]     = useState(null);
  const [checked, setChecked] = useState(false);

  // Offer countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2,"0");
    const s = String(timeLeft % 60).padStart(2,"0");
    return `${m}:${s}`;
  };

  // Check subscription status
  useEffect(() => {
    const check = async () => {
      if (localStorage.getItem("hasSubscription") !== "true") { setChecked(true); return; }
      try {
        const { data } = await API.get("/customer/subscription/status");
        if (data.success && data.data?.active) setSub(data.data);
      } catch {}
      setChecked(true);
    };
    check();
  }, []);

  // Next delivery calculation
  const getNextDelivery = () => {
    if (!sub) return null;
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const parse = (str) => {
      if (!str) return null;
      const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return null;
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
      return h * 60 + parseInt(m[2]);
    };
    const lm = parse(sub.lunchSlot);
    const dm = parse(sub.dinnerSlot);
    if (lm && nowMins < lm - 15) return { label:"Today Lunch",   slot: sub.lunchSlot  };
    if (dm && nowMins < dm - 15) return { label:"Today Dinner",  slot: sub.dinnerSlot };
    return                              { label:"Tomorrow Lunch", slot: sub.lunchSlot  };
  };

  const prices   = { weekly:699, monthly:2499 };
  const features = {
    weekly:  ["7 fresh meals daily","Free delivery","Veg or non-veg","Cancel anytime"],
    monthly: ["30 fresh meals daily","Free delivery","Priority support","Exclusive discounts","Cancel anytime"],
  };

  if (!checked) return <div className="mt-8 bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />;

  // ── SUBSCRIBED VIEW ───────────────────────────────────────────────────────
  if (sub) {
    const next      = getNextDelivery();
    const planLabel = sub.planType === "weekly" ? "Weekly" : "Monthly";
    const daysLeft  = sub.endDate
      ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / 86400000))
      : (sub.planType === "weekly" ? 7 : 30);
    const total    = sub.planType === "weekly" ? 7 : 30;
    const progress = Math.max(5, Math.min(95, Math.round((1 - daysLeft / total) * 100)));

    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <FaCrown className="text-yellow-500" /> Your Meal Plan
          </h2>
          <span className="text-[10px] bg-green-100 text-green-700 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" /> ACTIVE
          </span>
        </div>

        {/* Clickable dashboard card */}
        <div
          onClick={() => navigate("/customer/subscription-dashboard")}
          className="relative bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            {sub.kitchenId?.name && (
              <p className="text-white/80 text-xs font-semibold mb-1">📍 {sub.kitchenId.name}</p>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-black text-xl">{planLabel} Plan</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  {sub.mealType === "veg" ? "🥗 Vegetarian" : "🍗 Non-Veg"} · ₹{sub.price}
                </p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-white font-black text-2xl leading-none">{daysLeft}</p>
                <p className="text-white/80 text-[10px] font-semibold">days left</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 mb-3">
              <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width:`${progress}%` }} />
              </div>
              <p className="text-white/60 text-[10px] mt-1">{progress}% of plan used</p>
            </div>

            {/* Next delivery */}
            {next && (
              <div className="flex items-center justify-between bg-white/20 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <FaClock className="text-white text-xs" />
                  <div>
                    <p className="text-white/70 text-[10px]">Next Delivery</p>
                    <p className="text-white font-black text-xs">{next.label} · {next.slot}</p>
                  </div>
                </div>
                <FaChevronRight className="text-white/60 text-xs" />
              </div>
            )}
            <p className="text-white/60 text-[10px] mt-3 text-center">Tap to view full dashboard →</p>
          </div>
        </div>

        {/* Slot pills */}
        <div className="flex gap-2 mt-3">
          {sub.lunchSlot && (
            <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">🌤️ Lunch</p>
              <p className="text-xs font-bold text-orange-600 mt-0.5">{sub.lunchSlot}</p>
            </div>
          )}
          {sub.dinnerSlot && (
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">🌙 Dinner</p>
              <p className="text-xs font-bold text-blue-600 mt-0.5">{sub.dinnerSlot}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── NOT SUBSCRIBED VIEW (unchanged) ───────────────────────────────────────
  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">🥗 Subscription Plans</h2>
        <span className="text-xs bg-red-100 text-red-500 px-3 py-1.5 rounded-full font-semibold animate-pulse">
          ⏳ Offer ends in {fmt()}
        </span>
      </div>
      <div className="flex bg-gray-200 p-1 rounded-full w-fit mb-4">
        {["weekly","monthly"].map(p => (
          <button key={p} onClick={() => setPlan(p)}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${plan===p?"bg-white shadow text-orange-500":"text-gray-500"}`}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-400 to-yellow-400" />
        <div className="p-5">
          {plan==="monthly" && (
            <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
              <FaFire /> Best Value
            </span>
          )}
          <h3 className="text-base font-bold flex items-center gap-2 text-gray-800 mb-1">
            {plan==="monthly" && <FaCrown className="text-orange-500" />}
            {plan.charAt(0).toUpperCase()+plan.slice(1)} Plan
          </h3>
          <p className="text-3xl font-extrabold text-orange-500 mb-3">
            ₹{prices[plan]}<span className="text-sm text-gray-400 font-normal ml-1">/ {plan==="weekly"?"week":"month"}</span>
          </p>
          <ul className="space-y-1.5 mb-4">
            {features[plan].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCheck className="text-[8px]" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate("/customer/subscription-landing")}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 text-white shadow-md transition">
            Subscribe Now →
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Cancel anytime • No hidden charges</p>
    </div>
  );
}