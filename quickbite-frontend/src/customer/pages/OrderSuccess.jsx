import { useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="p-6 text-center">

      <h1 className="text-2xl font-bold text-green-600">
        Order Placed Successfully 🎉
      </h1>

      <p className="mt-2">Your food is on the way 🚀</p>

      <button
        onClick={() => navigate("/customer/order-tracking")}
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
      >
        Track Order
      </button>

      <button
        onClick={() => navigate("/customer/home")}
        className="mt-2 block mx-auto text-gray-600"
      >
        Back to Home
      </button>

    </div>
  );
}

export default OrderSuccess;