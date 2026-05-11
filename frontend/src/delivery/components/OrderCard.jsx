// delivery/components/OrderCard.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, User, Phone, Navigation, 
  CheckCircle, Loader, Package, 
  ChevronDown, ChevronUp, AlertCircle, MessageCircle,
  Lock, Target, Store
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const OrderCard = ({ order: initialOrder, variant = 'incoming' }) => {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [otp, setOtp] = useState('');
  const [issueText, setIssueText] = useState('');

  // Only update when initialOrder actually changes from parent
  useEffect(() => {
    if (initialOrder?.deliveryStatus !== order?.deliveryStatus) {
      console.log('Order status changed from parent:', initialOrder?.deliveryStatus);
      setOrder(initialOrder);
    }
  }, [initialOrder]);

  const getStatusBadge = () => {
    const config = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: '✓' },
      picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800', icon: '📦' },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    const cfg = config[order?.deliveryStatus] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.color}`}>
        <span>{cfg.icon}</span> {cfg.label}
      </span>
    );
  };

  const acceptOrder = async () => {
    setLoading(true);
    try {
      const response = await API.patch(`/delivery/orders/${order._id}/accept`);
      
      if (response.data?.success) {
        // ONLY update local state - NO parent refresh
        setOrder(prev => ({ ...prev, deliveryStatus: 'accepted' }));
        toast.success('Order accepted! Head to the restaurant. 🚀');
      } else {
        toast.error(response.data?.message || 'Failed to accept order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = async () => {
    const reason = prompt('Reason for rejection:', 'Too far away');
    if (!reason) return;
    
    setLoading(true);
    try {
      await API.patch(`/delivery/orders/${order._id}/reject`, { reason });
      toast.success('Order rejected');
      setOrder(prev => ({ ...prev, deliveryStatus: 'rejected' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setLoading(false);
    }
  };

  const markPickedUp = async () => {
    setLoading(true);
    try {
      const response = await API.patch(`/delivery/orders/${order._id}/picked-up`);
      
      if (response.data?.success) {
        setOrder(prev => ({ ...prev, deliveryStatus: 'picked_up' }));
        toast.success('Order picked up! Head to customer. 🛵');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndDeliver = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      await API.post(`/delivery/orders/${order._id}/otp-verify`, { otp });
      await API.patch(`/delivery/orders/${order._id}/delivered`);
      setOrder(prev => ({ ...prev, deliveryStatus: 'delivered' }));
      toast.success('Order delivered successfully! 🎉');
      setShowOtpModal(false);
      setOtp('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reportIssue = async () => {
    if (!issueText.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    
    setLoading(true);
    try {
      await API.post(`/delivery/orders/${order._id}/issue`, { issue: issueText });
      toast.success('Issue reported to support');
      setShowIssueModal(false);
      setIssueText('');
    } catch (error) {
      toast.error('Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  const getEarnings = () => {
    return order?.deliveryFee || 40;
  };

  const getActionButtons = () => {
    if (order?.deliveryStatus === 'pending') {
      return (
        <div className="flex gap-2">
          <button
            onClick={acceptOrder}
            disabled={loading}
            className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Accept
          </button>
          <button
            onClick={rejectOrder}
            disabled={loading}
            className="flex-1 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 transition"
          >
            Reject
          </button>
        </div>
      );
    }
    
    if (order?.deliveryStatus === 'accepted') {
      return (
        <div className="space-y-2">
          <button
            onClick={markPickedUp}
            disabled={loading}
            className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <Store size={14} />}
            Mark as Picked Up
          </button>
          <Link
            to={`/delivery/orders/${order._id}`}
            className="w-full py-2 border border-blue-500 text-blue-500 rounded-lg text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <Navigation size={14} />
            View Details & Track
          </Link>
        </div>
      );
    }
    
    if (order?.deliveryStatus === 'picked_up') {
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowOtpModal(true)}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              Deliver with OTP
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              className="py-2 px-3 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition"
            >
              <AlertCircle size={16} />
            </button>
          </div>
          <Link
            to={`/delivery/orders/${order._id}`}
            className="w-full py-2 border border-blue-500 text-blue-500 rounded-lg text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <Target size={14} />
            Track Live Location
          </Link>
        </div>
      );
    }
    
    if (order?.deliveryStatus === 'delivered') {
      return (
        <div className="text-center text-green-600 text-sm flex items-center justify-center gap-2">
          <CheckCircle size={14} />
          Completed - ₹{getEarnings()} earned
        </div>
      );
    }
    
    return null;
  };

  if (!order) {
    return <div className="bg-white rounded-xl p-4 text-center">Loading order...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800">
                  #{order.orderId || order._id?.slice(-8)}
                </p>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Package size={12} />
                {order.vendor?.name || 'Restaurant'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-orange-600 text-lg">₹{order.totalAmount}</p>
              <p className="text-xs text-green-600">Earnings: ₹{getEarnings()}</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left mb-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
              </span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {expanded && (
            <div className="mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 space-y-1">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.menuItem?.name || item.name}</span>
                  <span>₹{(item.price || item.menuItem?.price) * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
            <span>{order.address?.street || order.address?.address}, {order.address?.city || 'City'}</span>
          </div>

          <div className="flex items-center justify-between text-sm border-t pt-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-700">{order.user?.name || 'Customer'}</span>
              <Phone size={12} className="text-gray-400 ml-1" />
              <span className="text-gray-500">{order.user?.phone || order.address?.phone || 'N/A'}</span>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            {getActionButtons()}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOtpModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Enter Delivery OTP</h3>
              <p className="text-gray-500 text-sm mt-1">
                Ask the customer for the 6-digit OTP
              </p>
            </div>
            
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndDeliver}
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowIssueModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={24} className="text-red-500" />
              <h3 className="text-xl font-semibold">Report Issue</h3>
            </div>
            
            <textarea
              rows={4}
              placeholder="Describe the issue you're facing..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIssueModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={reportIssue}
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;