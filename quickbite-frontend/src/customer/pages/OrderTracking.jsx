import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderTracking() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // 🚚 Simulate tracking steps
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 3000),
      setTimeout(() => navigate("/customer/success"), 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="p-6 text-center">

      <h2 className="text-xl font-bold mb-6">
        Order Tracking 🚚
      </h2>

      <div className="space-y-2">

        <p className={step >= 1 ? "font-semibold" : "text-gray-400"}>
          Preparing...
        </p>

        <p className={step >= 2 ? "font-semibold" : "text-gray-400"}>
          Out for delivery...
        </p>

        <p className={step >= 3 ? "text-green-600 font-semibold" : "text-gray-400"}>
          Delivered ✅
        </p>

      </div>

      <p className="text-sm text-gray-500 mt-4">
        Your order is on the way
      </p>

    </div>
  );
}

export default OrderTracking;