import { useEffect, useState } from "react";

function OrderSuccess({ setPage }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

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
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 text-sm mb-1">Your order has been confirmed</p>
        <p className="text-gray-400 text-sm mb-8">Estimated delivery: <span className="font-bold text-orange-500">30–40 minutes</span></p>

        {/* ORDER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 w-full max-w-xs mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Order ID</span>
            <span className="text-xs font-bold text-gray-700">#QB{Date.now().toString().slice(-4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">🍳 Preparing</span>
          </div>
        </div>

        {/* DELIVERY STEPS */}
        <div className="flex items-center gap-2 justify-center mb-8 text-xs text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🧾</span>
            <span>Confirmed</span>
          </div>
          <div className="flex-1 h-px bg-orange-200 max-w-8" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🍳</span>
            <span>Preparing</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 max-w-8" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🚚</span>
            <span className="text-gray-300">On Way</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 max-w-8" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🎉</span>
            <span className="text-gray-300">Delivered</span>
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