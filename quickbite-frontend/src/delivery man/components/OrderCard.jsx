import StatusBadge from "./StatusBadge";
import { useNavigate } from "react-router-dom";

function OrderCard({ order, updateStatus }) {
  const navigate = useNavigate();

  const getNextAction = () => {
    switch (order.status) {
      case "available":
        return { label: "Accept Order", next: "assigned" };
      case "assigned":
        return { label: "Picked Up", next: "picked" };
      case "picked":
        return { label: "Start Delivery", next: "on_the_way" };
      case "on_the_way":
        return { label: "Mark Delivered", next: "delivered" };
      default:
        return null;
    }
  };

  const action = getNextAction();

  // 🔥 Handle action click with auto-navigation
  const handleAction = () => {
    if (!action) return;

    updateStatus(order.id, action.next);

    // 🚀 Auto open tracker when accepting order
    if (order.status === "available") {
      setTimeout(() => {
        navigate(`/delivery/order-details/${order.id}`);
      }, 200);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 space-y-3 border hover:shadow-lg transition">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{order.customerName}</h3>
        <StatusBadge status={order.status} />
      </div>

      {/* Address */}
      <p className="text-sm text-gray-600">{order.address}</p>

      {/* Items */}
      <p className="text-sm">
        🍔 {order.items.join(", ")}
      </p>

      {/* Price + Distance */}
      <div className="flex justify-between text-sm">
        <span className="font-medium">₹{order.amount}</span>
        <span className="text-gray-500">{order.distance}</span>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={handleAction}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        >
          {action.label}
        </button>
      )}

      {/* Track Button */}
      {(order.status === "assigned" ||
        order.status === "picked" ||
        order.status === "on_the_way") && (
        <button
          onClick={() => navigate(`/delivery/order-details/${order.id}`)}
          className="w-full border border-orange-500 text-orange-500 py-2 rounded hover:bg-orange-50 transition"
        >
          Track Order
        </button>
      )}

    </div>
  );
}

export default OrderCard;