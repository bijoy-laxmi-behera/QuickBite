// vendor/components/Orders/OrderCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Package, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const OrderCard = ({ order, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${order._id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${order._id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReady = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${order._id}/ready`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Error marking ready:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotifyDelivery = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${order._id}/ready-for-pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Delivery partner notified!');
    } catch (error) {
      console.error('Error notifying delivery:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-gray-800">#{order.orderId}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium">{order.customer?.name || 'Guest'}</p>
          </div>
          <div>
            <p className="text-gray-500">Items</p>
            <p className="font-medium">{order.items?.length || 0} items</p>
          </div>
          <div>
            <p className="text-gray-500">Total Amount</p>
            <p className="font-bold text-orange-600">₹{order.totalAmount}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment</p>
            <p className="font-medium capitalize">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={handleAccept}
                disabled={updating}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                <span>Accept Order</span>
              </button>
              <button
                onClick={handleReject}
                disabled={updating}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </>
          )}
          
          {order.status === 'accepted' && (
            <button
              onClick={handleReady}
              disabled={updating}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
            >
              <Clock size={16} />
              <span>Mark Ready</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={handleNotifyDelivery}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Package size={16} />
              <span>Notify Delivery Partner</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/vendor/orders/${order._id}`)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>View Details</span>
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                    {item.variation && <span className="text-gray-500"> ({item.variation})</span>}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            {order.specialInstructions && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Special Instructions:</p>
                <p className="text-sm">{order.specialInstructions}</p>
              </div>
            )}

            {order.deliveryAddress && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Delivery Address:</p>
                <p className="text-sm">{order.deliveryAddress}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;