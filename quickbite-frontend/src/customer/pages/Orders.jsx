import { useState } from "react";

function Orders() {

  // ✅ Dummy data (replace with API later)
  const [orders, setOrders] = useState([
    {
      id: 1,
      items: ["Pizza", "Coke"],
      total: 320,
      status: "Delivered"
    },
    {
      id: 2,
      items: ["Biryani"],
      total: 250,
      status: "Preparing"
    }
  ]);

  // ✅ Cancel Order
  const handleCancel = (id) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status: "Cancelled" }
          : order
      )
    );
  };

  // ✅ Reorder
  const handleReorder = (order) => {
    alert("Items added to cart 🛒");
    // later connect with cart API
  };

  return (
    <div className="max-w-3xl mx-auto">

      <h2 className="text-xl font-bold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-xl shadow mb-4"
          >

            <h3 className="font-semibold">
              Order #{order.id}
            </h3>

            <p className="text-sm text-gray-500">
              {order.items.join(", ")}
            </p>

            <p className="mt-1 font-medium">
              ₹{order.total}
            </p>

            <p className={`mt-1 text-sm ${
              order.status === "Delivered"
                ? "text-green-600"
                : order.status === "Cancelled"
                ? "text-red-500"
                : "text-orange-500"
            }`}>
              {order.status}
            </p>

            <div className="flex gap-2 mt-3">

              {/* TRACK */}
              <button
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Track
              </button>

              {/* CANCEL */}
              {order.status === "Preparing" && (
                <button
                  onClick={() => handleCancel(order.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Cancel
                </button>
              )}

              {/* REORDER */}
              <button
                onClick={() => handleReorder(order)}
                className="px-3 py-1 bg-orange-500 text-white rounded"
              >
                Reorder
              </button>

            </div>

          </div>
        ))
      )}

    </div>
  );
}

export default Orders;