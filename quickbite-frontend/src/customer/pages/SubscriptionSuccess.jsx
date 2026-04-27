import { useNavigate } from "react-router-dom";

function SubscriptionSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">

      <h1 className="text-3xl font-bold text-green-600 mb-4">
        🎉 Subscription Activated!
      </h1>

      <p className="text-gray-600 mb-6">
        Your daily meals will be delivered as per your plan 🍱
      </p>

      <button
        onClick={() => navigate("/customer/home")}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Back to Home
      </button>

    </div>
  );
}

export default SubscriptionSuccess;