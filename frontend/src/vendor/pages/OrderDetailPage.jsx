// vendor/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Truck, Clock, MapPin, Phone, User, Package,
  CheckCircle, XCircle, AlertCircle, Printer
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const [orderRes, deliveryRes] = await Promise.all([
        axios.get(`/api/vendor/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/vendor/orders/${id}/delivery-status`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);
      setOrder(orderRes.data);
      setDeliveryStatus(deliveryRes.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
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
      await axios.patch(`/api/vendor/orders/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
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
      await axios.patch(`/api/vendor/orders/${id}/ready`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
    } catch (error) {
      console.error('Error marking ready:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotifyDelivery = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${id}/ready-for-pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Delivery partner notified!');
    } catch (error) {
      console.error('Error notifying delivery:', error);
    }
  };

  const handleUpdatePrepTime = async (newTime) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${id}/prep-time`, { prepTime: newTime }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating prep time:', error);
    }
  };

  const handleCancelDelivery = async () => {
    if (!confirm('Cancel delivery assignment? Another partner will be assigned.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/vendor/orders/${id}/cancel-delivery`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
    } catch (error) {
      console.error('Error canceling delivery:', error);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/vendor/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderId}</h1>
            <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2">
          <Printer size={16} />
          <span>Print</span>
        </button>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className={`flex-1 text-center ${order.status === 'pending' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${order.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Clock size={20} className={order.status === 'pending' ? 'text-orange-600' : 'text-gray-400'} />
            </div>
            <p className="text-sm mt-2">Order Placed</p>
          </div>
          <div className={`flex-1 text-center ${order.status === 'accepted' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${order.status === 'accepted' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <CheckCircle size={20} className={order.status === 'accepted' ? 'text-orange-600' : 'text-gray-400'} />
            </div>
            <p className="text-sm mt-2">Accepted</p>
          </div>
          <div className={`flex-1 text-center ${order.status === 'ready' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${order.status === 'ready' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Package size={20} className={order.status === 'ready' ? 'text-orange-600' : 'text-gray-400'} />
            </div>
            <p className="text-sm mt-2">Ready for Pickup</p>
          </div>
          <div className={`flex-1 text-center ${order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Truck size={20} className={order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'} />
            </div>
            <p className="text-sm mt-2">Delivered</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-gray-800">Order Items</h3>
            </div>
            <div className="p-5 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.variation && <p className="text-xs text-gray-500">{item.variation}</p>}
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-400 mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>₹{order.deliveryFee || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Tax</span>
                  <span>₹{order.tax || 0}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Special Instructions</p>
                  <p className="text-sm text-yellow-700 mt-1">{order.specialInstructions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span>{order.customer?.name || 'Guest'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone size={14} className="text-gray-400" />
                <span>{order.customer?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <span>{order.deliveryAddress || 'Pickup Order'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          {deliveryStatus && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Delivery Status</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className="capitalize font-medium">{deliveryStatus.status}</span>
                </p>
                {deliveryStatus.deliveryPartner && (
                  <>
                    <p className="text-sm">
                      <span className="text-gray-500">Partner:</span>{' '}
                      {deliveryStatus.deliveryPartner.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Phone:</span>{' '}
                      {deliveryStatus.deliveryPartner.phone}
                    </p>
                  </>
                )}
                {deliveryStatus.trackingLink && (
                  <a
                    href={deliveryStatus.trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 text-sm hover:text-orange-600 block mt-2"
                  >
                    Track Delivery →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={updating}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Accept Order</span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={updating}
                    className="w-full border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center space-x-2"
                  >
                    <XCircle size={16} />
                    <span>Reject Order</span>
                  </button>
                </>
              )}
              {order.status === 'accepted' && (
                <button
                  onClick={handleReady}
                  disabled={updating}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center justify-center space-x-2"
                >
                  <Package size={16} />
                  <span>Mark Ready for Pickup</span>
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={handleNotifyDelivery}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
                >
                  <Truck size={16} />
                  <span>Notify Delivery Partner</span>
                </button>
              )}
              {deliveryStatus?.status === 'assigned' && (
                <button
                  onClick={handleCancelDelivery}
                  className="w-full border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  Cancel Delivery Assignment
                </button>
              )}
            </div>
          </div>

          {/* Prep Time */}
          {order.status !== 'delivered' && order.status !== 'rejected' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Preparation Time</h3>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={order.preparationTime || 20}
                  onChange={(e) => handleUpdatePrepTime(e.target.value)}
                  min="5"
                  className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">minutes</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Update estimated preparation time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;