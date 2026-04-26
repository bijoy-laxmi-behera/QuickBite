import { useEffect } from "react";

function OrderTracking({ setPage }) {

  useEffect(() => {
    const timer = setTimeout(() => {
    console.log("Auto redirect to success");
      setPage("success");
    }, 3000);

    return () => clearTimeout(timer);
  }, [setPage]);

  return (
    <div className="p-6 text-center">

      <h2 className="text-xl font-bold mb-4">
        Order Tracking 🚚
      </h2>

      <p>Preparing...</p>
      <p>Out for delivery...</p>
      <p className="text-green-600 font-semibold">Delivered ✅</p>

      <p className="text-sm text-gray-500 mt-3">
        
      </p>

    </div>
  );
}

export default OrderTracking;