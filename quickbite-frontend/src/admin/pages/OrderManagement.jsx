import { useState } from "react";

const initialOrders = [
  { id: "QB1021", customer: "Anjali Sharma", vendor: "Spice Garden", meal: "Paneer Butter Masala", amount: "₹340", status: "delivered", date: "Jan 13, 2025", address: "Bhubaneswar, Odisha" },
  { id: "QB1022", customer: "Sneha Roy", vendor: "GreenLeaf", meal: "Fruit & Nut Salad", amount: "₹210", status: "out_for_delivery", date: "Jan 13, 2025", address: "Cuttack, Odisha" },
  { id: "QB1023", customer: "Priya Singh", vendor: "Desi Dhaba", meal: "Veg Thali Combo", amount: "₹250", status: "preparing", date: "Jan 13, 2025", address: "Puri, Odisha" },
  { id: "QB1024", customer: "Ritu Patel", vendor: "Spice Garden", meal: "Grilled Chicken Bowl", amount: "₹380", status: "pending", date: "Jan 13, 2025", address: "Bhubaneswar, Odisha" },
  { id: "QB1025", customer: "Amit Kumar", vendor: "GreenLeaf", meal: "Egg Fried Rice", amount: "₹190", status: "cancelled", date: "Jan 12, 2025", address: "Rourkela, Odisha" },
  { id: "QB1026", customer: "Divya Nair", vendor: "Desi Dhaba", meal: "Dal Makhani + Roti", amount: "₹300", status: "delivered", date: "Jan 12, 2025", address: "Sambalpur, Odisha" },
];

const statusConfig = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700" },
  preparing: { label: "Preparing", cls: "bg-blue-100 text-blue-700" },
  out_for_delivery: { label: "Out for Delivery", cls: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600" },
};

const statusCounts = (orders) => {
  return {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
};

export default function OrderManagement() {
  const [orders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = statusCounts(orders);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Order Management</h2>
        <p className="text-gray-500 text-sm mt-1">Track and manage all platform orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === key
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {key === "all" ? "All" : statusConfig[key]?.label} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by order ID or customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Order ID", "Customer", "Vendor", "Meal", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-orange-500">{order.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.address}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{order.vendor}</td>
                  <td className="px-5 py-4 text-gray-700">{order.meal}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800">{order.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[order.status].cls}`}>
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>
        )}
      </div>
    </div>
  );
}
