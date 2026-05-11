// vendor/components/Dashboard/LiveOrders.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Package, Eye } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const LiveOrders = ({ orders, onOrderUpdate }) => {
  const navigate = useNavigate();

  // Fix: Ensure orders is an array
  const ordersList = Array.isArray(orders) ? orders : [];

  const handleAccept = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleReject = async (orderId) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${orderId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleReady = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${orderId}/ready`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error marking ready:', error);
    }
  };

  if (!ordersList || ordersList.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <Package className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-lg font-medium text-gray-500">No Live Orders</h3>
        <p className="text-gray-400">New orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Live Orders</h3>
        <p className="text-sm text-gray-500">{ordersList.length} orders need attention</p>
      </div>
      <div className="divide-y">
        {ordersList.map((order) => (
          <div key={order._id} className="p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-800">#{order.orderId}</span>
                <StatusBadge status={order.status} />
              </div>
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium">{order.items?.length || 0} items</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium text-orange-600">₹{order.totalAmount}</p>
              </div>
            </div>

            {order.status === 'pending' && (
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleAccept(order._id)}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleReject(order._id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
              </div>
            )}

            {order.status === 'accepted' && (
              <button
                onClick={() => handleReady(order._id)}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center space-x-2"
              >
                <Clock size={16} />
                <span>Mark Ready for Pickup</span>
              </button>
            )}

            <button
              onClick={() => navigate(`/vendor/orders/${order._id}`)}
              className="mt-3 text-orange-500 text-sm hover:text-orange-600 flex items-center space-x-1"
            >
              <Eye size={14} />
              <span>View Details</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveOrders;