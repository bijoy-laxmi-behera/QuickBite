import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Truck, Coffee, Clock, CheckCircle, XCircle,
  MapPin, Phone, User, RefreshCw, Bell, BellRing,
  Eye, Check, X, AlertCircle, Timer, Navigation
} from 'lucide-react';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';

const LiveOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  const fetchLiveOrders = async () => {
    try {
      const data = await fetchWithAuth('/admin/orders/live');
      const newOrders = data.orders || [];
      
      // Check for new orders
      if (soundEnabled && orders.length > 0 && newOrders.length > orders.length) {
        const newOrderCount = newOrders.length - orders.length;
        playNotificationSound();
        showToast(`${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`, 'warning');
      }
      
      setOrders(newOrders);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching live orders:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const loadOrders = async () => {
    setLoading(true);
    await fetchLiveOrders();
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchLiveOrders();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await fetchWithAuth(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Order status updated to ${newStatus.replace('_', ' ')}`);
      fetchLiveOrders();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={20} className="text-blue-500" />;
      case 'preparing': return <Coffee size={20} className="text-purple-500" />;
      case 'out_for_delivery': return <Truck size={20} className="text-orange-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      case 'accepted': return 'border-blue-500 bg-blue-50';
      case 'preparing': return 'border-purple-500 bg-purple-50';
      case 'out_for_delivery': return 'border-orange-500 bg-orange-50';
      case 'delivered': return 'border-green-500 bg-green-50';
      case 'cancelled': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else {
      return `${Math.floor(diffMinutes / 60)} hr ${diffMinutes % 60} min ago`;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'out_for_delivery'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Orders</h1>
          <p className="text-gray-500">Real-time order tracking and management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              autoRefresh ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-300 text-gray-600'
            }`}
          >
            <RefreshCw size={18} className={autoRefresh ? 'animate-spin-slow' : ''} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              soundEnabled ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-300 text-gray-600'
            }`}
          >
            {soundEnabled ? <BellRing size={18} /> : <Bell size={18} />}
            Sound {soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Active Orders</p>
          <p className="text-2xl font-bold">{activeOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Completed Today</p>
          <p className="text-2xl font-bold">{completedOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Total Live</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
      </div>

      {/* Last Refresh Time */}
      <div className="text-right text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 transition-shadow hover:shadow-xl ${getStatusColor(order.status)}`}
          >
            {/* Order Header */}
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-mono text-gray-500">#{order._id?.slice(-8)}</span>
                </div>
                <p className="text-xs text-gray-400">{getTimeElapsed(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Order Body */}
            <div className="p-4 space-y-3">
              {/* Customer Info */}
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span className="font-medium">{order.user?.name || 'Guest'}</span>
                {order.user?.phone && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Phone size={14} className="text-gray-400" />
                    <span>{order.user.phone}</span>
                  </>
                )}
              </div>

              {/* Address */}
              {order.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400 mt-0.5" />
                  <span className="text-xs">
                    {order.address.street}, {order.address.city}, {order.address.state}
                  </span>
                </div>
              )}

              {/* Items Preview */}
              <div className="bg-gray-50 rounded-lg p-2 text-sm">
                <p className="font-medium text-gray-700 mb-1">Items:</p>
                <div className="space-y-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Order Footer - Actions */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                >
                  <Eye size={16} /> View Details
                </button>

                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'accepted')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </>
                )}

                {order.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'preparing')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Coffee size={16} /> Start Preparing
                  </button>
                )}

                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  >
                    <Truck size={16} /> Out for Delivery
                  </button>
                )}

                {order.status === 'out_for_delivery' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle size={16} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No live orders at the moment</p>
          <p className="text-sm text-gray-400">New orders will appear here automatically</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Timer */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer size={20} className="text-gray-500" />
                  <span className="text-sm font-medium">Time since order:</span>
                </div>
                <span className="text-sm font-mono">{getTimeElapsed(selectedOrder.createdAt)}</span>
              </div>

              {/* Order Status Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Order Status</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].map((status, idx) => {
                      const isCompleted = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].indexOf(selectedOrder.status) >= idx;
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <div key={status} className="relative flex items-start gap-3">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                          }`}>
                            {isCompleted ? <Check size={16} className="text-white" /> : null}
                          </div>
                          <div>
                            <p className={`font-medium capitalize ${isCurrent ? 'text-blue-600' : ''}`}>
                              {status.replace('_', ' ')}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-gray-500">Current status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs">Item</th>
                        <th className="px-4 py-2 text-left text-xs">Qty</th>
                        <th className="px-4 py-2 text-left text-xs">Price</th>
                        <th className="px-4 py-2 text-right text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">₹{item.price}</td>
                          <td className="px-4 py-2 text-sm text-right">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium">Total:</td>
                        <td className="px-4 py-2 text-right font-bold">₹{selectedOrder.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div>
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedOrder.address.street}</p>
                    <p className="text-sm">{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                    <p className="text-sm">Pincode: {selectedOrder.address.pincode}</p>
                    {selectedOrder.address.landmark && (
                      <p className="text-sm text-gray-500">Landmark: {selectedOrder.address.landmark}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      const nextStatus = {
                        pending: 'accepted',
                        accepted: 'preparing',
                        preparing: 'out_for_delivery',
                        out_for_delivery: 'delivered',
                      }[selectedOrder.status];
                      if (nextStatus) {
                        handleUpdateStatus(selectedOrder._id, nextStatus);
                        setShowDetailModal(false);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update to Next Step
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
    </div>
  );
};

export default LiveOrdersPage;