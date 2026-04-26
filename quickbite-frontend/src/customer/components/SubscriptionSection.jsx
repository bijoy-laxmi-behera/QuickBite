function SubscriptionSection({ setPage }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        🍱 Daily Meal Subscription
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {/* WEEKLY */}
        <div className="border p-4 rounded-xl">
          <h3 className="font-semibold text-lg">Weekly Plan</h3>
          <p className="text-gray-500">₹699 / week</p>

          <button
            onClick={() => setPage("subscriptionCheckout")}   // ✅ IMPORTANT
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
        </div>

        {/* MONTHLY */}
        <div className="border p-4 rounded-xl">
          <h3 className="font-semibold text-lg">Monthly Plan</h3>
          <p className="text-gray-500">₹2499 / month</p>

          <button
            onClick={() => setPage("subscriptionCheckout")}   // ✅ IMPORTANT
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
        </div>

      </div>

    </div>
  );
}

export default SubscriptionSection;