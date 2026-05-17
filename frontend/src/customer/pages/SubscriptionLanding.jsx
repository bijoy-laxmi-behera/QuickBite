// src/customer/pages/SubscriptionLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaFire, FaCheck, FaStar, FaSpinner } from "react-icons/fa";
import API from "../../services/axios";

const PLANS = {
  weekly: {
    label: "Weekly", price: 699, per: "week", saving: null, badge: null,
    features: ["7 fresh meals delivered daily","Free delivery every day","Choose veg or non-veg","Pause or cancel anytime"],
  },
  monthly: {
    label: "Monthly", price: 2499, per: "month", saving: "Save ₹97 vs weekly", badge: "Best Value",
    features: ["30 fresh meals delivered daily","Free delivery every day","Choose veg or non-veg","Priority support 24/7","Pause or cancel anytime","Exclusive member discounts"],
  },
};

const HIGHLIGHTS = [
  { icon:"🥗", bg:"bg-green-50",  label:"Fresh Daily",      sub:"Cooked every morning"       },
  { icon:"🚚", bg:"bg-blue-50",   label:"Free Delivery",    sub:"No hidden charges"          },
  { icon:"⏰", bg:"bg-orange-50", label:"On Time",          sub:"8 AM – 10 AM guaranteed"    },
  { icon:"⏸️", bg:"bg-purple-50", label:"Pause Anytime",    sub:"Full flexibility"           },
  { icon:"🛡️", bg:"bg-red-50",    label:"Safe & Hygienic",  sub:"FSSAI certified kitchens"   },
  { icon:"🎫", bg:"bg-yellow-50", label:"Member Deals",     sub:"Exclusive discounts"        },
];

const STEPS = [
  { step:"01", icon:"👑", title:"Choose your plan",       desc:"Pick Weekly or Monthly based on your preference."                   },
  { step:"02", icon:"🍽️", title:"Select a cloud kitchen", desc:"Browse verified kitchens near you and pick one you love."           },
  { step:"03", icon:"📝", title:"Fill your details",       desc:"Set your address, meal preference, and delivery slot."              },
  { step:"04", icon:"💳", title:"Pay securely",            desc:"One-time payment via Razorpay — safe & encrypted."                 },
  { step:"05", icon:"🚚", title:"Enjoy fresh meals daily", desc:"Your chosen kitchen delivers fresh meals to your door every day."  },
];

const TESTIMONIALS = [
  { name:"Priya S.",  city:"Bhubaneswar", rating:5, text:"Fresh meals every morning — saves me so much time and money!" },
  { name:"Arjun M.", city:"Cuttack",      rating:5, text:"The cloud kitchen meals are restaurant quality. Totally worth it." },
  { name:"Sneha R.", city:"Puri",         rating:4, text:"Super convenient. I subscribed monthly and never looked back." },
];

export default function SubscriptionLanding() {
  const navigate = useNavigate();
  const [plan, setPlan]         = useState("monthly");
  const [visible, setVisible]   = useState(false);
  // ── FIX 1: Check if user already has an active subscription ──
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      // Quick localStorage check first (avoids flicker)
      if (localStorage.getItem("hasSubscription") === "true") {
        navigate("/customer/subscription-dashboard", { replace: true });
        return;
      }
      try {
        const { data } = await API.get("/customer/subscription/status");
        if (data.success && data.data?.active) {
          // User is already subscribed — send them to their dashboard
          localStorage.setItem("hasSubscription", "true");
          navigate("/customer/subscription-dashboard", { replace: true });
          return;
        }
      } catch {
        // API failed — fall through and show landing page
      }
      setChecking(false);
      setTimeout(() => setVisible(true), 80);
    };

    checkExistingSubscription();
  }, [navigate]);

  // Show spinner while checking subscription status
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <FaSpinner className="animate-spin text-orange-500 text-3xl" />
        <p className="text-gray-400 text-sm">Checking your subscription…</p>
      </div>
    );
  }

  const current = PLANS[plan];

  const handleSubscribe = () => {
    sessionStorage.setItem("chosenPlan", plan);
    navigate("/customer/subscription-checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-16 -translate-x-10" />

        <div className={`relative max-w-4xl mx-auto px-6 py-16 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
            <FaFire className="text-yellow-300" /> Limited time offer — up to 15% off
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Eat Fresh.<br /><span className="text-yellow-300">Every Single Day.</span>
          </h1>
          <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">
            Subscribe to QuickBite meal plans and get home-style meals from verified cloud kitchens delivered to your door — no cooking, no hassle.
          </p>
          <div className="flex items-center justify-center gap-8 text-white">
            {[["500+","Subscribers"],["4.8★","Rating"],["15+","Kitchens"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black">{v}</p>
                <p className="text-xs opacity-70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* ── WHY SECTION ── */}
        <div>
          <h2 className="text-xl font-black text-gray-800 text-center mb-6">Why QuickBite Subscription?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {HIGHLIGHTS.map(({ icon, bg, label, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>{icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PLAN CHOOSER ── */}
        <div>
          <h2 className="text-xl font-black text-gray-800 text-center mb-2">Choose Your Plan</h2>
          <p className="text-center text-gray-400 text-sm mb-6">Switch or cancel whenever you want</p>

          <div className="flex bg-gray-200 p-1 rounded-full w-fit mx-auto mb-7">
            {["weekly","monthly"].map(p => (
              <button key={p} onClick={() => setPlan(p)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${plan === p ? "bg-white shadow-md text-orange-500" : "text-gray-500 hover:text-gray-700"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative bg-white rounded-3xl border-2 border-orange-400 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-400" />
            {current.badge && (
              <span className="absolute top-5 right-5 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <FaFire className="text-yellow-300 text-[10px]" />{current.badge}
              </span>
            )}
            {current.saving && (
              <span className="absolute top-5 left-5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{current.saving}</span>
            )}
            <div className="p-7 pt-10">
              <div className="flex items-center gap-2 mb-2">
                <FaCrown className="text-orange-500" />
                <h3 className="text-lg font-black text-gray-800">{current.label} Plan</h3>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-black text-orange-500">₹{current.price}</span>
                <span className="text-gray-400 text-base ml-2">/ {current.per}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {current.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-[9px]" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleSubscribe}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-[0.98]">
                Subscribe Now →
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">No commitment • Cancel or pause anytime</p>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div>
          <h2 className="text-xl font-black text-gray-800 text-center mb-6">How It Works</h2>
          <div className="space-y-3">
            {STEPS.map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-[10px] font-black text-orange-400 tracking-widest">STEP {step}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div>
          <h2 className="text-xl font-black text-gray-800 text-center mb-6">What Subscribers Say</h2>
          <div className="space-y-3">
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: rating }).map((_, i) => <FaStar key={i} className="text-yellow-400 text-xs" />)}
                </div>
                <p className="text-sm text-gray-600 italic">"{text}"</p>
                <p className="text-xs font-bold text-gray-800 mt-2">{name} <span className="text-gray-400 font-normal">· {city}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-3xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl font-black mb-2">Ready to eat better?</h2>
          <p className="text-white/80 text-sm mb-6">Join 500+ subscribers enjoying fresh daily meals</p>
          <button onClick={handleSubscribe}
            className="bg-white text-orange-500 font-black px-10 py-4 rounded-2xl hover:bg-orange-50 transition shadow-lg">
            Get Started — ₹{current.price}/{current.per}
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}