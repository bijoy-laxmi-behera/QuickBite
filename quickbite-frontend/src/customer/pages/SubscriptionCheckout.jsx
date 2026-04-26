import { useState } from "react";

function SubscriptionCheckout({ setPage }) {

  const [plan, setPlan] = useState("weekly");
  const [mealType, setMealType] = useState("veg");
  const [address, setAddress] = useState("");

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">
        🍱 Subscription 
      </h2>

      {/* PLAN */}
      <div className="mb-4">
        <p className="font-semibold mb-2">Select Plan</p>

        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="weekly">Weekly - ₹699</option>
          <option value="monthly">Monthly - ₹2499</option>
        </select>
      </div>

      {/* MEAL TYPE */}
      <div className="mb-4">
        <p className="font-semibold mb-2">Meal Type</p>

        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>
      </div>

      {/* ADDRESS */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Delivery Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={() => {
          if (!address) {
            alert("Enter address");
            return;
          }

          setPage("subscriptionSuccess");
        }}
        className="w-full bg-orange-500 text-white py-3 rounded"
      >
        Pay & Subscribe
      </button>

    </div>
  );
}

export default SubscriptionCheckout;