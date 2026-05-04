import { useEffect, useState } from "react";

export default function DailySummary() {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    completed: 0,
    earnings: 0,
    hoursOnline: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSummary({
      totalOrders: 0,
      completed: 0,
      earnings: 0,
      hoursOnline: 0,
    });

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading summary...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        📊 Daily Summary
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card title="Total Orders" value={summary.totalOrders} />
        <Card title="Completed Deliveries" value={summary.completed} />
        <Card title="Total Earnings" value={`₹${summary.earnings}`} />
        <Card title="Hours Online" value={`${summary.hoursOnline} hrs`} />

      </div>
    </div>
  );
}

/* Card Component */
function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold text-gray-800 mt-2">
        {value}
      </h2>
    </div>
  );
}