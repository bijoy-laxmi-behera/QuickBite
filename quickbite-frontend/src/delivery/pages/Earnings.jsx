import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";
import { FaWallet, FaMotorcycle, FaCalendarAlt, FaChartLine } from "react-icons/fa";

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await API.get("/delivery/earnings");
      setData(res.data.data);
    } catch {
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Earnings</h2>
        <p className="text-gray-500 text-sm mt-1">Your income summary</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EarningCard
          title="Today's Earnings"
          value={`₹${data?.todayEarnings || 0}`}
          icon={<FaCalendarAlt />}
          color="bg-orange-100 text-orange-500"
        />
        <EarningCard
          title="This Week"
          value={`₹${data?.weekEarnings || 0}`}
          icon={<FaChartLine />}
          color="bg-blue-100 text-blue-500"
        />
        <EarningCard
          title="This Month"
          value={`₹${data?.monthEarnings || 0}`}
          icon={<FaWallet />}
          color="bg-green-100 text-green-500"
        />
        <EarningCard
          title="Total Deliveries"
          value={data?.totalDeliveries || 0}
          icon={<FaMotorcycle />}
          color="bg-purple-100 text-purple-500"
        />
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Earnings Breakdown</h3>
        <div className="space-y-4">
          <BreakdownRow label="Delivery Charges" value={`₹${data?.deliveryCharges || 0}`} />
          <BreakdownRow label="Tips Received" value={`₹${data?.tips || 0}`} />
          <BreakdownRow label="Bonuses" value={`₹${data?.bonuses || 0}`} />
          <div className="border-t border-gray-100 pt-4">
            <BreakdownRow
              label="Total Earnings"
              value={`₹${(data?.todayEarnings || 0) + (data?.weekEarnings || 0)}`}
              bold
            />
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Recent Payouts</h3>
        {(data?.recentPayouts || []).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm">No payouts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentPayouts.map((payout, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Payout #{payout._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(payout.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className="font-bold text-green-600">₹{payout.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function EarningCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl ${color} text-xl`}>{icon}</div>
    </div>
  );
}

function BreakdownRow({ label, value, bold }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-bold text-gray-800" : ""}`}>
      <span className={bold ? "text-gray-800" : "text-gray-500"}>{label}</span>
      <span className={bold ? "text-orange-500 text-base" : "text-gray-700"}>{value}</span>
    </div>
  );
}
