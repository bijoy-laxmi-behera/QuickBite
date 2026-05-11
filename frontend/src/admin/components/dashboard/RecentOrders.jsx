import React from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const RecentOrders = ({ orders }) => {
  const handleViewOrder = (orderId) => {
    // Navigate to order detail
    console.log('View order:', orderId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">#{order._id?.slice(-8)}</td>
                <td className="px-6 py-4 text-sm">{order.user?.name || 'Guest'}</td>
                <td className="px-6 py-4 text-sm font-medium">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewOrder(order._id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;