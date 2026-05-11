import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, CheckCircle, XCircle, Truck, Coffee, Package,
  Eye, Bell, BellRing, RefreshCw, AlertCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const LiveOrdersList = ({ orders, onViewOrder, onUpdateStatus, autoRefresh, onToggleAutoRefresh }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousOrderCount, setPreviousOrderCount] = useState(orders.length);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={18} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={18} className="text-blue-500" />;
      case 'preparing': return <Coffee size={18} className="text-purple-500" />;
      case 'out_for_delivery': return <Truck size={18} className="text-orange-500" />;
      case 'delivered': return <Package size={18} className="text-green-500" />;
      case 'cancelled': return <XCircle size={18} className="text-red-500" />;
      default: return <Clock size={18} className="text-gray-500" />;
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

  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  useEffect(() => {
    if (orders.length > previousOrderCount) {
      playNotificationSound();
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length]);

  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else {
      return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'out_for_delivery'].includes(o.status));

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No live orders at the moment</p>
        <p className="text-sm text-gray-400">New orders will appear here automatically</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Orders Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">LIVE</span>
          </div>
          <span className="text-sm text-gray-500">|</span>
          <div className="flex gap-3">
            <span className="text-sm">
              <span className="font-semibold text-yellow-600">{pendingOrders.length}</span> Pending
            </span>
            <span className="text-sm">
              <span className="font-semibold text-blue-600">{activeOrders.length}</span> Active
            </span>
            <span className="text-sm">
              <span className="font-semibold text-gray-600">{orders.length}</span> Total
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? <BellRing size={18} /> : <Bell size={18} />}
          </button>
          <button
            onClick={onToggleAutoRefresh}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}
            title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          >
            <RefreshCw size={18} className={autoRefresh ? 'animate-spin-slow' : ''} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`bg-white rounded-lg shadow border-l-4 overflow-hidden transition-all ${getStatusColor(order.status)}`}
          >
            {/* Order Header */}
            <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono text-gray-600">#{order._id?.slice(-8)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{getTimeElapsed(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                </div>
              </div>

              {/* Customer Info - Always Visible */}
              <div className="mt-3 pt-2 border-t flex flex-wrap justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{order.user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{order.user?.phone}</p>
                </div>
                {order.address && (
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{order.address.city}</p>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedOrder === order._id && (
              <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
                {/* Items */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Order Items:</p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 5 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 5} more items</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                {order.address && (
                  <div className="mb-3 text-sm">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Address:</p>
                    <p className="text-xs text-gray-600">{order.address.street}, {order.address.city}</p>
                    <p className="text-xs text-gray-600">{order.address.state} - {order.address.pincode}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-2 border-t">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                  >
                    <Eye size={14} /> View Details
                  </button>
                  
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(order._id, 'accepted')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button
                        onClick={() => onUpdateStatus(order._id, 'cancelled')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                  
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => onUpdateStatus(order._id, 'preparing')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <Coffee size={14} /> Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => onUpdateStatus(order._id, 'out_for_delivery')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                    >
                      <Truck size={14} /> Out for Delivery
                    </button>
                  )}
                  
                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => onUpdateStatus(order._id, 'delivered')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveOrdersList;