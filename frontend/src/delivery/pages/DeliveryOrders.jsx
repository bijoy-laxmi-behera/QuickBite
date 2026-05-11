// delivery/pages/DeliveryOrders.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Truck,
  Loader
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';
import OrderCard from '../components/OrderCard';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [issueText, setIssueText] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
    cancelled: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 30 seconds (reduced frequency)
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const [incomingRes, historyRes] = await Promise.all([
        API.get('/delivery/orders/incoming'),
        API.get('/delivery/orders/history?limit=100')
      ]);
      
      const incoming = incomingRes.data?.orders || [];
      const history = historyRes.data?.orders || [];
      
      const allOrders = [...incoming, ...history];
      
      setOrders([...allOrders]);
      
      // Calculate stats
      const activeCount = allOrders.filter(o => 
        o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled'
      ).length;
      const deliveredCount = allOrders.filter(o => o.deliveryStatus === 'delivered').length;
      const cancelledCount = allOrders.filter(o => o.deliveryStatus === 'cancelled').length;
      const totalEarnings = allOrders
        .filter(o => o.deliveryStatus === 'delivered')
        .reduce((sum, o) => sum + (o.deliveryFee || 40), 0);
      
      setStats({
        total: allOrders.length,
        active: activeCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        totalEarnings
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (filterStatus === 'active') {
      filtered = filtered.filter(o => 
        o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled'
      );
    } else if (filterStatus === 'delivered') {
      filtered = filtered.filter(o => o.deliveryStatus === 'delivered');
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter(o => o.deliveryStatus === 'cancelled');
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        (o.orderId || o._id).toLowerCase().includes(term) ||
        o.vendor?.name?.toLowerCase().includes(term) ||
        o.address?.city?.toLowerCase().includes(term)
      );
    }
    
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // REMOVE OR COMMENT OUT this function - it's causing auto-refresh
  // const handleStatusChange = async () => {
  //   await fetchOrders();
  // };

  const reportIssue = async () => {
    if (!issueText.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    
    try {
      await API.post(`/delivery/orders/${selectedOrder._id}/issue`, { issue: issueText });
      toast.success('Issue reported to support');
      setShowIssueModal(false);
      setIssueText('');
    } catch (error) {
      toast.error('Failed to report issue');
    }
  };

  const verifyAndDeliver = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setOtpVerifying(true);
    try {
      await API.post(`/delivery/orders/${selectedOrder._id}/otp-verify`, { otp });
      await API.patch(`/delivery/orders/${selectedOrder._id}/delivered`);
      toast.success('Order delivered successfully! 🎉');
      setShowOtpModal(false);
      setOtp('');
      // REMOVE this fetchOrders call to prevent auto-refresh
      // await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your deliveries</p>
        </div>
        
        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-xs text-gray-500">Delivered</p>
          <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-xs text-gray-500">Earnings</p>
          <p className="text-xl font-bold text-orange-600">₹{stats.totalEarnings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'active', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap transition ${
                filterStatus === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
              {status !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({status === 'active' ? stats.active : 
                    status === 'delivered' ? stats.delivered : 
                    status === 'cancelled' ? stats.cancelled : 0})
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="relative sm:ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Orders List - REMOVED onStatusChange prop */}
      <div className="space-y-4">
        {currentOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            {searchTerm ? (
              <>
                <Search size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No matching orders</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </>
            ) : (
              <>
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No orders found</p>
                <p className="text-sm text-gray-400">Orders will appear here when available</p>
              </>
            )}
          </div>
        ) : (
          currentOrders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              variant={order.deliveryStatus === 'pending' ? 'incoming' : 'active'}
              // REMOVED onStatusChange prop to prevent auto-refresh
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOtpModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck size={28} className="text-orange-500" />
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
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndDeliver}
                disabled={otpVerifying}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {otpVerifying ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && selectedOrder && (
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
                className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;