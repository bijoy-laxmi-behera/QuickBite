import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

function SubscriberList() {

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await API.get("/vendor/orders");

      const orders = res.data.orders || [];

      // ✅ Convert orders → unique subscribers
      const uniqueUsers = {};

      orders.forEach((order) => {
        const user = order.user;

        if (user && !uniqueUsers[user._id]) {
          uniqueUsers[user._id] = {
            _id: user._id,
            name: user.name,
            phone: user.phone || "N/A",
            joined: new Date(order.createdAt).toLocaleDateString(),
            totalOrders: 1,
          };
        } else if (user) {
          uniqueUsers[user._id].totalOrders += 1;
        }
      });

      setSubscribers(Object.values(uniqueUsers));

    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const filtered = subscribers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <p className="text-gray-500 text-sm">
          Customers who ordered from your kitchen.
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search subscriber..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">

        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full text-sm table-fixed">

            {/* HEADER */}
            <thead className="text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 w-1/4">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub._id} className="border-b hover:bg-gray-50">

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {sub.name}
                    </td>

                    <td className="px-4 py-3">
                      {sub.phone}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                        {sub.totalOrders} Orders
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {sub.joined}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SubscriberList;