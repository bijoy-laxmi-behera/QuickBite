// vendor/components/Orders/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, MapPin, User, Phone, Package, CreditCard,
  CheckCircle, XCircle, Truck, AlertCircle, Printer,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DeliveryTrackingLink from './DeliveryTrackingLink';
import ReportDeliveryIssue from './ReportDeliveryIssue';
import CancelDeliveryAssignment from './CancelDeliveryAssignment';

const OrderDetail = ({ orderId, onClose, onUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(false);
  const [showDeliveryIssue, setShowDeliveryIssue] = useState(false);
  const [showCancelDelivery, setShowCancelDelivery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vendor/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
      onUpdate?.();
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
      await axios.patch(`/api/vendor/orders/${orderId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
      onUpdate?.();
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
      await axios.patch(`/api/vendor/orders/${orderId}/ready`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
      onUpdate?.();
    } catch (error) {
      console.error('Error marking ready:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotifyDelivery = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/orders/${orderId}/ready-for-pickup`, {}, {
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
      await axios.patch(`/api/vendor/orders/${orderId}/prep-time`, { prepTime: newTime }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating prep time:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-800">Order #{order.orderId}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Order Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${order.status !== 'pending' ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <CheckCircle size={14} className={order.status !== 'pending' ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-xs mt-1">Placed</p>
                </div>
                <div className="h-px flex-1 bg-gray-300"></div>
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${order.status === 'accepted' || order.status === 'preparing' || order.status === 'ready' ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <Package size={14} className={order.status !== 'pending' && order.status !== 'rejected' ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-xs mt-1">Accepted</p>
                </div>
                <div className="h-px flex-1 bg-gray-300"></div>
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${order.status === 'ready' ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <Truck size={14} className={order.status === 'ready' ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-xs mt-1">Ready</p>
                </div>
                <div className="h-px flex-1 bg-gray-300"></div>
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <CheckCircle size={14} className={order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-xs mt-1">Delivered</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column - Order Items */}
              <div className="lg:col-span-2 space-y-5">
                {/* Items */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Order Items</h3>
                    <button
                      onClick={() => setExpandedItems(!expandedItems)}
                      className="text-orange-500 text-sm flex items-center space-x-1"
                    >
                      {expandedItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{expandedItems ? 'Collapse' : 'Expand All'}</span>
                    </button>
                  </div>
                  <div className="divide-y">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">
                                {item.quantity}x {item.name}
                              </span>
                              {item.isveg !== undefined && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${item.isveg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {item.isveg ? 'Veg' : 'Non-Veg'}
                                </span>
                              )}
                            </div>
                            {item.variation && (
                              <p className="text-xs text-gray-500 mt-1">{item.variation}</p>
                            )}
                            {expandedItems && item.specialInstructions && (
                              <p className="text-xs text-gray-400 mt-2 bg-yellow-50 p-2 rounded">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-orange-600">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 px-4 py-3 border-t">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span>₹{order.deliveryFee || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax & Charges</span>
                        <span>₹{order.tax || 0}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Total</span>
                        <span className="text-orange-600 text-lg">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Payment Method</span>
                        <span className="capitalize">{order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Special Instructions</p>
                        <p className="text-sm text-yellow-700 mt-1">{order.specialInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Customer & Actions */}
              <div className="space-y-5">
                {/* Customer Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <User size={16} />
                    <span>Customer Details</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gray-400" />
                      <span>{order.customer?.name || 'Guest'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{order.customer?.phone || 'N/A'}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-start space-x-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <span className="flex-1">{order.deliveryAddress}</span>
                        <button
                          onClick={() => copyToClipboard(order.deliveryAddress)}
                          className="text-gray-400 hover:text-orange-500"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preparation Time */}
                {order.status !== 'delivered' && order.status !== 'rejected' && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <Clock size={16} />
                      <span>Preparation Time</span>
                    </h3>
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

                {/* Action Buttons */}
                <div className="border rounded-lg p-4">
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
                  </div>
                </div>

                {/* Delivery Tracking */}
                {order.status === 'ready' && (
                  <DeliveryTrackingLink orderId={orderId} />
                )}

                {/* Delivery Issue Links */}
                {order.status !== 'delivered' && order.status !== 'rejected' && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Delivery Support</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowDeliveryIssue(true)}
                        className="w-full text-red-500 text-sm border border-red-200 rounded-lg py-2 hover:bg-red-50 flex items-center justify-center space-x-2"
                      >
                        <AlertCircle size={14} />
                        <span>Report Delivery Issue</span>
                      </button>
                      <button
                        onClick={() => setShowCancelDelivery(true)}
                        className="w-full text-gray-500 text-sm border rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center space-x-2"
                      >
                        <XCircle size={14} />
                        <span>Cancel Delivery Assignment</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeliveryIssue && (
        <ReportDeliveryIssue
          orderId={orderId}
          onClose={() => setShowDeliveryIssue(false)}
          onReported={() => {
            fetchOrderDetail();
            onUpdate?.();
          }}
        />
      )}

      {showCancelDelivery && (
        <CancelDeliveryAssignment
          orderId={orderId}
          onClose={() => setShowCancelDelivery(false)}
          onCancelled={() => {
            fetchOrderDetail();
            onUpdate?.();
          }}
        />
      )}
    </>
  );
};

export default OrderDetail;