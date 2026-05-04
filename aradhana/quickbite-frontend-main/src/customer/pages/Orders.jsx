import { useState } from "react";
import { FaShoppingBag, FaMotorcycle, FaTimes, FaRedo, FaMapMarkerAlt } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";

const statusConfig = {
  Delivered:  { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500",  icon: "✅" },
  Preparing:  { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", icon: "🍳" },
  Cancelled:  { color: "text-red-500",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    icon: "❌" },
  "On the Way": { color: "text-blue-500", bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   icon: "🚚" },
};

function Orders({ setPage }) {
  const [orders, setOrders] = useState([
    { id: "QB1024", restaurant: "Spice Kitchen",  items: ["Paneer Butter Masala", "Dal Makhani"], total: 340, status: "Delivered",    date: "Today, 1:30 PM" },
    { id: "QB1023", restaurant: "Biryani Hub",    items: ["Chicken Biryani"],                    total: 220, status: "Preparing",    date: "Today, 12:10 PM" },
    { id: "QB1022", restaurant: "Pizza Town",     items: ["Margherita", "Garlic Bread"],          total: 370, status: "On the Way",  date: "Today, 11:45 AM" },
    { id: "QB1021", restaurant: "Green Bowl",     items: ["Veg Bowl", "Salad Mix"],               total: 280, status: "Cancelled",   date: "Yesterday, 8:20 PM" },
  ]);

  const handleCancel  = (id) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "Cancelled" } : o));
  const handleReorder = ()   => alert("Items added to cart 🛒");

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-4">

        <div className="flex items-center gap-2 mb-5">
          <FaShoppingBag className="text-orange-500" />
          <h2 className="text-xl font-extrabold text-gray-800">My Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <FaShoppingBag className="text-5xl text-gray-200 mb-4" />
            <p className="font-semibold text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = statusConfig[order.status] || statusConfig["Preparing"];
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* TOP */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <MdRestaurant className="text-orange-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{order.restaurant}</p>
                        <p className="text-[11px] text-gray-400">{order.date}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {order.status}
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.items.join(", ")}</p>
                    <p className="font-extrabold text-base text-gray-800 mt-1">₹{order.total}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 px-4 pb-4">
                    {order.status === "Preparing" || order.status === "On the Way" ? (
                      <button onClick={() => setPage && setPage("tracking")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-100 transition">
                        <FaMotorcycle /> Track Order
                      </button>
                    ) : null}

                    {order.status === "Preparing" && (
                      <button onClick={() => handleCancel(order.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 transition">
                        <FaTimes /> Cancel
                      </button>
                    )}

                    <button onClick={handleReorder}
                      className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl hover:bg-orange-100 transition ml-auto">
                      <FaRedo /> Reorder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;