// ============================================================
// Notifications.jsx - Connected to Backend API
// ============================================================

import { useState, useEffect } from "react";
import { FaBell, FaTag, FaMotorcycle, FaStar, FaSpinner } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config
import { getSocket } from "../../services/axios"; // ADDED: For real-time notifications

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  // ADDED: Fetch notifications from backend
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get("/customer/me/notifications");
      
      if (response.data.success) {
        const transformedNotifs = response.data.data.map((notif) => ({
          id: notif._id,
          _id: notif._id,
          title: notif.title,
          body: notif.message,
          time: formatTime(notif.createdAt),
          unread: !notif.isRead,
          type: notif.type,
          bg: getIconBg(notif.type),
          icon: getIcon(notif.type),
          createdAt: notif.createdAt
        }));
        setNotifications(transformedNotifs);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Helper to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // ADDED: Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <FaMotorcycle className="text-blue-500" />;
      case "offer":
      case "promotion":
        return <FaTag className="text-orange-500" />;
      case "review":
        return <FaStar className="text-yellow-500" />;
      default:
        return <FaBell className="text-purple-500" />;
    }
  };

  // ADDED: Get background color based on notification type
  const getIconBg = (type) => {
    switch (type) {
      case "order":
        return "bg-blue-50";
      case "offer":
      case "promotion":
        return "bg-orange-50";
      case "review":
        return "bg-yellow-50";
      default:
        return "bg-purple-50";
    }
  };

  // ADDED: Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await API.patch(`/customer/me/notifications/${id}/read`);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id || n._id === id ? { ...n, unread: false } : n
        )
      );
      
      // Update notification count in sidebar (dispatch event)
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ADDED: Mark all as read
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await API.patch("/customer/me/notifications/read-all");
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false }))
      );
      
      // Update notification count in sidebar
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  // ADDED: Real-time notification via Socket.io
  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (data) => {
        // Add new notification to the list
        const newNotif = {
          id: data._id,
          _id: data._id,
          title: data.title,
          body: data.message,
          time: "Just now",
          unread: true,
          type: data.type,
          bg: getIconBg(data.type),
          icon: getIcon(data.type),
          createdAt: new Date()
        };
        
        setNotifications((prev) => [newNotif, ...prev]);
        
        // Update notification count in sidebar
        const event = new CustomEvent('newNotification');
        window.dispatchEvent(event);
      };

      socket.on('newNotification', handleNewNotification);
      
      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, []);

  // ADDED: Refresh notifications when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaBell className="text-orange-500" />
              <h2 className="text-xl font-extrabold text-gray-800">Notifications</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaBell className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              disabled={markingAll}
              className="text-xs text-orange-500 font-semibold hover:underline disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-300 mt-1">When you receive notifications, they'll appear here</p>
          </div>
        )}

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id || n._id}
              onClick={() => n.unread && markAsRead(n.id || n._id)}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 cursor-pointer transition hover:shadow-md ${
                n.unread ? "border-orange-100 bg-orange-50/30" : "border-gray-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.unread ? "text-gray-800" : "text-gray-500"}`}>
                    {n.title}
                  </p>
                  {n.unread && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Notifications as default };