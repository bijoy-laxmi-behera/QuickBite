// src/vendor/pages/Notifications.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaBell, FaSpinner, FaCheckDouble } from "react-icons/fa";

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const { data } = await API.get("/vendor/notifications");
      setNotifs(data.data || []);
    } catch {} setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/vendor/notifications/${id}/read`);
      setNotifs(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">Notifications</h1>
          {unread > 0 && <p className="text-xs text-orange-500 font-semibold mt-0.5">{unread} unread</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-orange-500 text-2xl" /></div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FaBell className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map(n => (
            <div key={n._id}
              className={`bg-white rounded-2xl border p-4 shadow-sm flex gap-4 cursor-pointer transition ${
                n.isRead ? "border-gray-100" : "border-orange-200 bg-orange-50/30"
              }`}
              onClick={() => !n.isRead && markRead(n._id)}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.type === "order"   ? "bg-blue-100 text-blue-500" :
                n.type === "payment"? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500"
              }`}>
                <FaBell className="text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-gray-300 mt-1.5">
                  {new Date(n.createdAt).toLocaleString("en-IN", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" })}
                </p>
              </div>
              {!n.isRead && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
