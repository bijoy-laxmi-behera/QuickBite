import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);

  // 🔁 Load orders
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    // ✅ avoid mutation
    setOrders([...savedOrders].reverse());
  }, []);

  // 🎯 Status logic (basic simulation)
  const getStatus = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;

    if (diff < 60) return "Preparing";
    if (diff < 180) return "Out for Delivery";
    return "Delivered";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen max-w-3xl mx-auto">

      <h2 className="text-2xl font-bold mb-6">My Orders 📦</h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>No orders yet</p>
        </div>
      ) : (
        orders.map((order) => {
          const status = getStatus(order.date);

          return (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow mb-4"
            >
              {/* 🧾 Header */}
              <div className="flex justify-between mb-2">
                <span className="font-semibold">
                  Order #{order.id}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleString()}
                </span>
              </div>

              {/* 📍 Address */}
              <p className="text-sm text-gray-600 mb-2">
                📍 {order.address || "No address"}
              </p>

              {/* 🍽 Items */}
              <div className="mb-2">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} × {item.qty || 1}
                    </span>
                    <span>
                      ₹{(item.price || 0) * (item.qty || 1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 💳 Payment */}
              <p className="text-sm text-gray-500">
                Payment: {(order.payment || "N/A").toUpperCase()}
              </p>

              {/* 💰 Total */}
              <h3 className="font-bold mt-2">
                Total: ₹{order.total || 0}
              </h3>

              {/* 📦 Status */}
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  status === "Delivered"
                    ? "bg-green-100 text-green-600"
                    : status === "Out for Delivery"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {status}
              </span>
            </div>
          );
        })
      )}

    </div>
  );
}

export default Orders;