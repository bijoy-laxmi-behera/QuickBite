function SubscriptionSection() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">

      <h2 className="text-xl font-semibold mb-4">
        🍱 Daily Meal Subscription
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div className="border rounded-xl p-4 hover:shadow transition">
          <h3 className="font-semibold">Weekly Plan</h3>
          <p className="text-gray-500">₹699 / week</p>

          <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg">
            Subscribe
          </button>
        </div>

        <div className="border rounded-xl p-4 hover:shadow transition">
          <h3 className="font-semibold">Monthly Plan</h3>
          <p className="text-gray-500">₹2499 / month</p>

          <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg">
            Subscribe
          </button>
        </div>

      </div>
    </div>
  );
}

export default SubscriptionSection;