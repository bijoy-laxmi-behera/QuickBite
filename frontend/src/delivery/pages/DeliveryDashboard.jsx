// delivery/pages/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin,
  CheckCircle,
  Truck,
  AlertCircle,
  Loader,
  Target,
  Award,
  Calendar,
  Wifi,
  WifiOff,
  Bell,
  ChevronRight
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import OrderCard from '../components/OrderCard';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalTrips: 0,
    avgPerTrip: 0,
    rating: 0,
    completionRate: 0,
    acceptanceRate: 0,
    avgDeliveryTime: 0,
    totalTips: 0,
    totalBonuses: 0
  });
  const [activeOrder, setActiveOrder] = useState(null);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    fetchAllData();
    startLocationTracking();
    setupSocket();
    
    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      fetchIncomingOrders();
      fetchActiveOrder();
    }, 10000);
    
    return () => {
      clearInterval(interval);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  let watchIdRef = { current: null };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLastLocation(location);
        
        if (isOnline) {
          try {
            await API.patch('/delivery/me/location', location);
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (socket) {
      socket.on('newOrder', (order) => {
        setIncomingOrders(prev => [order, ...prev]);
        toast.success(`New order #${order.orderId} available!`, {
          duration: 5000,
          icon: '🛵'
        });
        addNotification(`New order #${order.orderId} available for pickup`);
      });
      
      socket.on('orderStatusUpdate', (data) => {
        if (data.orderId === activeOrder?._id) {
          fetchActiveOrder();
        }
      });
    }
  };

  const addNotification = (message) => {
    setNotifications(prev => [{
      id: Date.now(),
      message,
      time: new Date(),
      read: false
    }, ...prev]);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        earningsRes,
        statsRes,
        activeRes,
        incomingRes,
        todayRes,
        statusRes,
        historyRes
      ] = await Promise.all([
        API.get('/delivery/earnings/summary').catch(() => ({ data: {} })),
        API.get('/delivery/performance/stats').catch(() => ({ data: {} })),
        API.get('/delivery/orders/active').catch(() => ({ data: null })),
        API.get('/delivery/orders/incoming').catch(() => ({ data: { orders: [] } })),
        API.get('/delivery/earnings/today').catch(() => ({ data: { earnings: [] } })),
        API.get('/delivery/me/status').catch(() => ({ data: { isOnline: true } })),
        API.get('/delivery/orders/history?limit=5').catch(() => ({ data: { orders: [] } }))
      ]);

      setStats({
        totalEarnings: earningsRes.data?.totalEarnings || 0,
        totalTrips: earningsRes.data?.totalTrips || 0,
        avgPerTrip: earningsRes.data?.avgPerTrip || 0,
        ...statsRes.data
      });
      
      setActiveOrder(activeRes.data?.data || null);
      setIncomingOrders(incomingRes.data?.orders || []);
      setRecentHistory(historyRes.data?.orders || []);
      setTodayEarnings(todayRes.data?.total || 0);
      setTodayOrders(todayRes.data?.count || 0);
      setIsOnline(statusRes.data?.isOnline !== false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrder = async () => {
    try {
      const res = await API.get('/delivery/orders/active');
      setActiveOrder(res.data?.data || null);
    } catch (error) {
      console.error('Error fetching active order:', error);
    }
  };

  const fetchIncomingOrders = async () => {
    if (!isOnline) return;
    try {
      const res = await API.get('/delivery/orders/incoming');
      setIncomingOrders(res.data?.orders || []);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
    }
  };

  const toggleStatus = async () => {
    try {
      await API.patch('/delivery/me/status');
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      toast.success(newStatus ? 'You are now online and will receive orders' : 'You are now offline');
      
      if (!newStatus) {
        setIncomingOrders([]);
      } else {
        fetchIncomingOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await API.patch(`/delivery/orders/${orderId}/accept`);
      toast.success('Order accepted! 🚀');
      fetchAllData();
      addNotification(`Order #${orderId.slice(-8)} accepted. Head to restaurant.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const rejectOrder = async (orderId) => {
    const reason = prompt('Reason for rejection:', 'Too far away');
    if (!reason) return;
    try {
      await API.patch(`/delivery/orders/${orderId}/reject`, { reason });
      toast.success('Order rejected');
      fetchIncomingOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: '✓' },
      picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800', icon: '📦' },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' }
    };
    const cfg = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.color}`}>
        <span>{cfg.icon}</span> {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Ready for deliveries?</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border z-10">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.time).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Online Status */}
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isOnline 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Today's Earnings"
          value={todayEarnings}
          icon={DollarSign}
          color="green"
          prefix="₹"
          subtitle={`${todayOrders} deliveries today`}
        />
        
        <StatsCard
          title="Total Earnings"
          value={stats.totalEarnings}
          icon={TrendingUp}
          color="orange"
          prefix="₹"
          subtitle={`${stats.totalTrips} total trips`}
        />
        
        <StatsCard
          title="Rating"
          value={stats.rating}
          icon={Star}
          color="yellow"
          suffix="/5"
          subtitle={`${stats.totalTrips} deliveries`}
        />
        
        <StatsCard
          title="Avg per Trip"
          value={stats.avgPerTrip}
          icon={Target}
          color="purple"
          prefix="₹"
        />
      </div>

      {/* Active Order Section */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="px-4 py-3 bg-white/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Truck size={18} />
                Active Order
              </h2>
              {getStatusBadge(activeOrder.deliveryStatus)}
            </div>
          </div>
          <div className="p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg">#{activeOrder.orderId || activeOrder._id?.slice(-8)}</p>
                <p className="text-white/80 text-sm mt-1">
                  {activeOrder.vendor?.name || 'Restaurant'}
                </p>
              </div>
              <p className="font-bold text-xl">₹{activeOrder.totalAmount}</p>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>Deliver to: {activeOrder.address?.city || 'Customer'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Est: {activeOrder.estimatedArrival || '30-40'} mins</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                to={`/delivery/orders/${activeOrder._id}`}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                View Details
              </Link>
              <Link
                to={`/delivery/track/${activeOrder._id}`}
                className="px-4 py-2 bg-orange-400 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Orders */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <Package size={18} />
            Incoming Orders
            {incomingOrders.length > 0 && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs animate-pulse">
                {incomingOrders.length} new
              </span>
            )}
          </h2>
          <button
            onClick={fetchIncomingOrders}
            className="text-xs text-orange-500 hover:underline"
          >
            Refresh
          </button>
        </div>
        
        <div className="divide-y max-h-96 overflow-y-auto">
          {!isOnline ? (
            <div className="p-8 text-center">
              <WifiOff size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">You are offline</p>
              <p className="text-sm text-gray-400">Go online to receive orders</p>
            </div>
          ) : incomingOrders.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No incoming orders</p>
              <p className="text-sm text-gray-400">Orders will appear here when available</p>
            </div>
          ) : (
            incomingOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                variant="incoming"
                onStatusChange={fetchAllData}
              />
            ))
          )}
        </div>
      </div>

      {/* Performance Metrics & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={18} className="text-orange-500" />
            Performance Metrics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{stats.completionRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Acceptance Rate</span>
                <span className="font-medium">{stats.acceptanceRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.acceptanceRate || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Delivery Time</span>
                <span className="font-medium">{stats.avgDeliveryTime?.toFixed(0) || 0} minutes</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                <span>Per delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-orange-500" />
            Recent Deliveries
          </h2>
          <div className="space-y-3">
            {recentHistory.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No recent deliveries</p>
              </div>
            ) : (
              recentHistory.map(order => (
                <div key={order._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">#{order.orderId || order._id?.slice(-8)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-400">Earned: ₹{order.deliveryFee || 40}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentHistory.length > 0 && (
            <Link
              to="/delivery/orders/history"
              className="mt-3 text-center text-sm text-orange-500 hover:underline flex items-center justify-center gap-1"
            >
              View All <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get socket instance
const getSocket = () => {
  // Implement your socket connection here
  return window.socket || null;
};

export default DeliveryDashboard;