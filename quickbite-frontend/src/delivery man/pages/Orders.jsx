import { useState } from "react";
import { mockOrders } from "../data/mockOrders";
import OrderCard from "../components/OrderCard";

function Orders() {
  const [orders, setOrders] = useState(mockOrders);
  const [tab, setTab] = useState("available");

  const updateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders =
    tab === "available"
      ? orders.filter((o) => o.status === "available")
      : orders.filter((o) => o.status !== "available");

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("available")}
          className={`px-4 py-2 rounded ${
            tab === "available" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Available Orders
        </button>

        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded ${
            tab === "active" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Active Orders
        </button>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            updateStatus={updateStatus}
          />
        ))}
      </div>
    </div>
  );
}

export default Orders;