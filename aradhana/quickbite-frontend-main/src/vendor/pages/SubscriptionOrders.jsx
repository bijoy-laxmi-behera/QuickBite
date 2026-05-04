import { useState } from "react";

function SubscriptionOrders() {

const [orders, setOrders] = useState([
{
id: 1,
customer: "Rahul Sharma",
meal: "Veg Thali",
diet: "Veg",
time: "1:00 PM",
status: "Pending"
},
{
id: 2,
customer: "Priya Das",
meal: "Dal Rice",
diet: "High Protein",
time: "1:30 PM",
status: "Preparing"
},
{
id: 3,
customer: "Arjun Patel",
meal: "Paneer Meal",
diet: "Non-Veg",
time: "7:00 PM",
status: "Ready"
}
]);

const updateStatus = (id, newStatus) => {
setOrders(
orders.map((order) =>
order.id === id ? { ...order, status: newStatus } : order
)
);
};

return ( <div className="p-6">

  {/* Header */}
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Subscription Orders</h1>
    <p className="text-gray-500 text-sm">
      Manage and update meal delivery orders.
    </p>
  </div>


  {/* Orders Table */}
  <div className="bg-white rounded-xl shadow-sm p-6">

    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Customer</th>
            <th className="text-left">Meal</th>
            <th className="text-left">Diet</th>
            <th className="text-left">Delivery Time</th>
            <th className="text-left">Status</th>
            <th className="text-left">Action</th>
          </tr>
        </thead>

        <tbody>

          {orders.map((order) => (
            <tr key={order.id} className="border-b">

              <td className="py-3">{order.customer}</td>

              <td>{order.meal}</td>

              <td>{order.diet}</td>

              <td>{order.time}</td>

              <td>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.status === "Ready"
                      ? "bg-green-100 text-green-600"
                      : order.status === "Preparing"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </td>

              <td className="flex gap-2 py-2">

                <button
                  onClick={() => updateStatus(order.id, "Preparing")}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                >
                  Ready
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>

</div>

);
}

export default SubscriptionOrders;
