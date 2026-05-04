import { useEffect, useState } from "react";

function SubscriptionSuccess({ setPage }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

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
        <p className="text-gray-400 text-sm mb-6">Your daily meals will be delivered fresh as per your plan 🍱</p>

        {/* PLAN CARD */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 mb-6 text-left shadow-sm">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Your Plan</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-gray-700">Monthly Plan</span>
            <span className="text-orange-500 font-extrabold">₹2499/mo</span>
          </div>
          <div className="text-xs text-gray-500 space-y-1 mt-2">
            <p>✅ Fresh Meals Daily</p>
            <p>✅ Free Delivery</p>
            <p>✅ Priority Support</p>
            <p>✅ Pause Anytime</p>
          </div>
        </div>

        {/* DELIVERY INFO */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm text-left">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">First Delivery</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-sm font-bold text-gray-800">Tomorrow Morning</p>
              <p className="text-xs text-gray-400">Between 8:00 AM – 10:00 AM</p>
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
