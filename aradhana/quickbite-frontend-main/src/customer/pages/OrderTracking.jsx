import { useEffect, useState } from "react";

const steps = [
  { label: "Order Confirmed",  icon: "🧾", desc: "Your order has been received" },
  { label: "Preparing",        icon: "🍳", desc: "Chef is cooking your meal" },
  { label: "Out for Delivery", icon: "🚚", desc: "Rider is on the way" },
  { label: "Delivered",        icon: "🎉", desc: "Enjoy your meal!" },
];

function OrderTracking({ setPage }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="max-w-md mx-auto w-full px-4 pt-6 flex-1">

        {/* HEADER */}
        <h2 className="text-xl font-extrabold text-gray-800 mb-1">Tracking Order</h2>
        <p className="text-xs text-gray-400 mb-6">Order #QB{Date.now().toString().slice(-4)}</p>

        {/* MAP PLACEHOLDER */}
        <div className="w-full h-44 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-orange-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,#f97316 0,#f97316 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#f97316 0,#f97316 1px,transparent 1px,transparent 40px)" }} />
          <span className="text-4xl mb-2 relative z-10">🗺️</span>
          <p className="text-sm font-semibold text-orange-600 relative z-10">Live tracking map</p>
          <p className="text-xs text-orange-400 relative z-10">Rider is {currentStep < 2 ? "being assigned" : "on the way"}</p>
        </div>

        {/* RIDER INFO */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">🧑</div>
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-800">Rahul Kumar</p>
            <p className="text-xs text-gray-400">Your delivery partner</p>
          </div>
          <a href="tel:+91" className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200 transition">
            📞
          </a>
        </div>

        {/* STEP TRACKER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isDone    = idx < currentStep;
              const isActive  = idx === currentStep;
              const isPending = idx > currentStep;
              return (
                <div key={idx} className="flex items-start gap-3">
                  {/* ICON + LINE */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${isDone ? "bg-green-500 shadow-md" : isActive ? "bg-orange-500 shadow-lg scale-110" : "bg-gray-100"}`}>
                      {isDone ? "✓" : step.icon}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-8 transition-all duration-500 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                  {/* TEXT */}
                  <div className="pb-6 pt-1.5">
                    <p className={`text-sm font-bold transition-all ${isDone ? "text-green-600" : isActive ? "text-orange-500" : "text-gray-300"}`}>
                      {step.label}
                      {isActive && <span className="ml-2 text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full animate-pulse">Live</span>}
                    </p>
                    <p className={`text-xs mt-0.5 ${isPending ? "text-gray-300" : "text-gray-400"}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === steps.length - 1 && (
          <button
            onClick={() => setPage("home")}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 rounded-2xl font-extrabold shadow-lg hover:from-orange-600 transition"
          >
            🏠 Back to Home
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;