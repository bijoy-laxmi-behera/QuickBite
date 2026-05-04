import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analytics() {

  const [overview, setOverview] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [topItem, setTopItem] = useState("N/A");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, revenueRes, topItemsRes] = await Promise.all([
        API.get("/vendor/overview"),
        API.get("/vendor/weekly-revenue"),
        API.get("/vendor/top-items"),
      ]);

      // OVERVIEW
      setOverview(overviewRes.data.data || {});

      // REVENUE FORMAT
      const formattedRevenue = (revenueRes.data.revenue || []).map((item) => ({
        day: new Date(item._id).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        revenue: item.totalRevenue,
      }));

      setRevenueData(formattedRevenue);

      // TOP ITEM
      if (topItemsRes.data.items?.length > 0) {
        setTopItem("Top Selling Item");
      }

    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <p className="text-gray-500 text-sm">
          Track revenue and performance insights.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <StatCard
          title="Total Revenue"
          value={`₹${overview?.revenue || 0}`}
        />

        <StatCard
          title="Total Orders"
          value={overview?.totalOrders || 0}
        />

        <StatCard
          title="Avg Prep Time"
          value={`${overview?.avgPrepTime || 0} min`}
        />

        <StatCard
          title="Top Item"
          value={topItem}
        />

      </div>

      {/* CHART */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">

        <h2 className="text-lg font-semibold mb-4">
          Weekly Revenue
        </h2>

        {revenueData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={revenueData}>

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>
        )}

      </div>

    </div>
  );
}

/* REUSABLE CARD */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-lg sm:text-xl font-bold mt-1">{value}</h2>
    </div>
  );
}

export default Analytics;