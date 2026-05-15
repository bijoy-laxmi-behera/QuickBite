// src/customer/pages/SubscriptionSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

export default function SubscriptionSuccess() {
  const navigate   = useNavigate();
  const [show,     setShow]     = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);

    // 5-second countdown then go to dashboard
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/customer/subscription-dashboard", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Read details stored by checkout
  let kitchen = null;
  let details  = null;
  try { kitchen = JSON.parse(sessionStorage.getItem("subKitchen") || "null"); } catch {}
  try { details  = JSON.parse(sessionStorage.getItem("subDetails")  || "null"); } catch {}

  const planLabel = details?.plan === "weekly" ? "Weekly" : "Monthly";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">

      {/* Confetti circles (pure CSS) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {["#f97316","#fbbf24","#34d399","#60a5fa","#f472b6","#a78bfa"].map((c, i) => (
          <div key={i} style={{
            position:"absolute",
            width: 10, height: 10,
            borderRadius: "50%",
            background: c,
            left: `${10 + i * 15}%`,
            top:  `${5  + (i % 3) * 20}%`,
            animation: `fall ${1 + i * 0.3}s ease-in forwards`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity:1; }
          100% { transform: translateY(100px) rotate(180deg); opacity:0; }
        }
        @keyframes pop {
          0%   { transform: scale(0.5); opacity:0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity:1; }
        }
      `}</style>

      {/* Animated check */}
      <div className={`transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ animation: show ? "pop 0.6s ease" : "none" }}>
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <FaCheck className="text-white text-4xl" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className={`transition-all duration-700 delay-200 max-w-xs ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h1 className="text-3xl font-black text-gray-800 mb-2">You're Subscribed! 🎉</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your {planLabel} meal subscription is confirmed. Get ready for fresh meals delivered to your door!
        </p>

        {/* Quick recap */}
        {kitchen && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Your Subscription</p>
            <div className="flex items-center gap-3">
              <img src={kitchen.image || kitchen.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&q=80"}
                alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-black text-gray-800 text-sm">{kitchen.name}</p>
                <p className="text-xs text-gray-400">{planLabel} Plan · ₹{details?.price}</p>
                <p className="text-xs text-orange-500 font-semibold">
                  {details?.mealType === "veg" ? "🥗 Veg" : "🍗 Non-Veg"} · {details?.slot}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Countdown ring */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#f97316" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / 5)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-orange-500">
              {countdown}
            </span>
          </div>
          <p className="text-xs text-gray-400">Redirecting to your subscription dashboard…</p>
        </div>

        <button
          onClick={() => navigate("/customer/subscription-dashboard", { replace: true })}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-200 transition hover:from-orange-600">
          Go to Dashboard Now →
        </button>
      </div>
    </div>
  );
}