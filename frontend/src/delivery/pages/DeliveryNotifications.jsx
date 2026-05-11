// delivery/pages/DeliveryNotifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Package, 
  DollarSign, 
  Star, 
  CheckCheck, 
  Loader, 
  Trash2,
  Filter,
  X,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Award
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliveryNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'order', label: 'Orders', icon: Package },
    { value: 'payment', label: 'Payments', icon: DollarSign },
    { value: 'rating', label: 'Ratings', icon: Star },
    { value: 'system', label: 'System', icon: AlertCircle }
  ];

  useEffect(() => {
    fetchNotifications();
    setupSocket();
    setupAudio();
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter]);

  const setupAudio = () => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
      
      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        playNotificationSound();
        showToastNotification(notification);
      });
      
      setSocketConnected(socket.connected);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const showToastNotification = (notification) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/delivery/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await fetchNotifications();
    toast.success('Notifications refreshed');
  };

  const filterNotifications = () => {
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === activeFilter));
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/delivery/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await API.patch('/delivery/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    
    setDeletingId(id);
    try {
      await API.delete(`/delivery/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    
    const readNotifications = notifications.filter(n => n.isRead);
    if (readNotifications.length === 0) {
      toast.error('No read notifications to delete');
      return;
    }
    
    try {
      await Promise.all(readNotifications.map(n => API.delete(`/delivery/notifications/${n._id}`)));
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success('Read notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <Package size={18} className="text-orange-500" />;
      case 'payment': return <DollarSign size={18} className="text-green-500" />;
      case 'rating': return <Star size={18} className="text-yellow-500" />;
      case 'system': return <AlertCircle size={18} className="text-blue-500" />;
      case 'earnings': return <TrendingUp size={18} className="text-purple-500" />;
      case 'delivery': return <UserCheck size={18} className="text-indigo-500" />;
      case 'achievement': return <Award size={18} className="text-amber-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell size={24} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-sm px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {notifications.length} total notifications • {readCount} read
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Connection Status */}
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${socketConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {socketConnected ? 'Live' : 'Polling'}
          </div>
          
          <button
            onClick={refreshNotifications}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition ${showFilters ? 'bg-orange-100 text-orange-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Filter size={18} />
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 rounded-lg flex items-center gap-2 transition"
            >
              {markingAll ? <Loader size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Mark all read
            </button>
          )}
          
          {readCount > 0 && (
            <button
              onClick={deleteAllRead}
              className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
            >
              <Trash2 size={14} />
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                activeFilter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <option.icon size={14} />
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400">
              {activeFilter !== 'all' 
                ? `No ${activeFilter} notifications found`
                : 'You\'ll see notifications here when they arrive'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`group bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
                !notification.isRead 
                  ? 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-white' 
                  : 'border-gray-100'
              }`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'order' ? 'bg-orange-100' :
                    notification.type === 'payment' ? 'bg-green-100' :
                    notification.type === 'rating' ? 'bg-yellow-100' :
                    notification.type === 'earnings' ? 'bg-purple-100' :
                    'bg-blue-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(notification.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        disabled={deletingId === notification._id}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                      >
                        {deletingId === notification._id ? (
                          <Loader size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  
                  {/* Action hint for unread */}
                  {!notification.isRead && (
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                      <CheckCircle size={10} />
                      Click to mark as read
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {notifications.length > 0 && (
        <div className="mt-4 text-center text-xs text-gray-400">
          {unreadCount > 0 && (
            <span>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
          )}
          {unreadCount > 0 && readCount > 0 && <span className="mx-2">•</span>}
          {readCount > 0 && (
            <span>{readCount} read notification{readCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get socket instance
const getSocket = () => {
  // Implement your socket connection here
  return window.socket || null;
};

export default DeliveryNotifications;