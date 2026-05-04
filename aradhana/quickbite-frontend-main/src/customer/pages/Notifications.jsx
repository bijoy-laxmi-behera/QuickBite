// ============================================================
// COPY EACH SECTION INTO ITS OWN FILE
// ============================================================

// ── Notifications.jsx ────────────────────────────────────────
import { useState } from "react";
import { FaBell, FaTag, FaMotorcycle, FaStar } from "react-icons/fa";

const mockNotifications = [
  { id: 1, icon: <FaMotorcycle className="text-blue-500" />,  bg: "bg-blue-50",  title: "Order Delivered!",         body: "Your order from Spice Kitchen has been delivered 🎉",        time: "2 min ago",  unread: true },
  { id: 2, icon: <FaTag className="text-orange-500" />,       bg: "bg-orange-50", title: "🔥 50% OFF Today Only",    body: "Subscribe now and save big on your monthly meal plan",         time: "1 hr ago",   unread: true },
  { id: 3, icon: <FaStar className="text-yellow-500" />,      bg: "bg-yellow-50", title: "Rate your last order",    body: "How was your Biryani Hub experience? Leave a review!",         time: "Yesterday",  unread: false },
  { id: 4, icon: <FaBell className="text-purple-500" />,      bg: "bg-purple-50", title: "New restaurant near you", body: "Chinese Wok just opened in your area — check it out!",         time: "2 days ago", unread: false },
];

function Notifications() {
  const [notifs, setNotifs] = useState(mockNotifications);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaBell className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Notifications</h2>
            {notifs.filter((n) => n.unread).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notifs.filter((n) => n.unread).length}
              </span>
            )}
          </div>
          <button onClick={markAllRead} className="text-xs text-orange-500 font-semibold hover:underline">
            Mark all read
          </button>
        </div>

        <div className="space-y-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 cursor-pointer transition hover:shadow-md ${n.unread ? "border-orange-100" : "border-gray-100"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.unread ? "text-gray-800" : "text-gray-500"}`}>{n.title}</p>
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