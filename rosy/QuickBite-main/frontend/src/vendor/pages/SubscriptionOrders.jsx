import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

function SubscriptionOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/vendor/orders");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE STATUS
  const updateStatus = async (id, action) => {
    try {
      if (action === "accepted") {
        await API.patch(`/vendor/orders/${id}/accept`);
      } else if (action === "ready") {
        await API.patch(`/vendor/orders/${id}/ready`);
      }

      toast.success("Order updated");
      fetchOrders(); // refresh
    } catch {
      toast.error("Update failed");
    }
  };

  // SEARCH FILTER
  const filteredOrders = orders.filter((o) =>
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscription Orders</h1>
        <p className="text-gray-500 text-sm">
          Manage and update meal delivery orders.
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">

        <div className="overflow-x-auto">

          <table className="min-w-[800px] w-full text-sm table-fixed">

            {/* HEADER */}
            <thead className="text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 w-1/4">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>

              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">

                    {/* CUSTOMER */}
                    <td className="px-4 py-3 font-medium">
                      {order.user?.name || "N/A"}
                    </td>

                    {/* ITEMS */}
                    <td className="px-4 py-3">
                      {order.items?.length} items
                    </td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3">
                      ₹{order.totalAmount}
                    </td>

                    {/* TIME */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === "ready"
                            ? "bg-green-100 text-green-600"
                            : order.status === "accepted"
                            ? "bg-blue-100 text-blue-600"
                            : order.status === "preparing"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 flex flex-col sm:flex-row gap-2">

                      {order.status === "new" && (
                        <button
                          onClick={() => updateStatus(order._id, "accepted")}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
                        >
                          Accept
                        </button>
                      )}

                      {(order.status === "accepted" ||
                        order.status === "preparing") && (
                        <button
                          onClick={() => updateStatus(order._id, "ready")}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
                        >
                          Ready
                        </button>
                      )}

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

export default SubscriptionOrders;