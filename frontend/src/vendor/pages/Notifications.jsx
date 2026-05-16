// src/vendor/pages/Notifications.jsx — FIXED: broken finally block corrected
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaBell, FaSpinner, FaCheckDouble, FaShoppingBag, FaCreditCard, FaInfoCircle } from "react-icons/fa";

const TYPE_STYLES = {
  order:   { bg: "bg-blue-100",   text: "text-blue-500",   Icon: FaShoppingBag },
  payment: { bg: "bg-green-100",  text: "text-green-500",  Icon: FaCreditCard  },
  default: { bg: "bg-orange-100", text: "text-orange-500", Icon: FaBell        },
};

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    // ✅ FIX: finally was outside the try/catch block before (missing braces caused
    //    setLoading(false) to run synchronously before the await resolved)
    try {
      const { data } = await API.get("/vendor/notifications");
      setNotifs(data.data || []);
    } catch (e) {
      console.error("Notifications fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/vendor/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/vendor/notifications/read-all");
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const unread = notifs.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <FaSpinner className="animate-spin text-orange-500 text-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">Notifications</h1>
          {unread > 0
            ? <p className="text-xs text-orange-500 font-semibold mt-0.5">{unread} unread</p>
            : <p className="text-xs text-gray-400 mt-0.5">All caught up</p>
          }
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition">
            <FaCheckDouble className="text-orange-400" /> Mark all read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FaBell className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">You'll see order alerts, payments, and updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.default;
            const Icon  = style.Icon;

            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex gap-4 transition cursor-pointer hover:shadow-md ${
                  n.isRead ? "border-gray-100" : "border-orange-200 bg-orange-50/40"
                }`}>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text}`}>
                  <Icon className="text-sm" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-300 mt-1.5">
                    {new Date(n.createdAt).toLocaleString("en-IN", {
                      hour: "2-digit", minute: "2-digit",
                      day:  "2-digit", month: "short",
                    })}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}