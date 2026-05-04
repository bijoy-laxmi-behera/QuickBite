import { useState } from "react";

const pageTitles = {
  dashboard: "Dashboard",
  active:    "Active Delivery",
  history:   "Delivery History",
  earnings:  "Earnings",
  summary:   "Daily Summary",
  profile:   "My Profile",
};

export default function Topbar({ page, notifications, isOnline }) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications?.length || 0;

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm relative">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{pageTitles[page] || "Dashboard"}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">

        {/* Online Status Pill */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {isOnline ? "Online" : "Offline"}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-orange-50 transition">
            <span className="text-lg">🔔</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-800 text-sm">Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-2xl mb-1">🔔</p>
                    <p className="text-xs">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {JSON.parse(localStorage.getItem("user") || "{}")?.name?.[0]?.toUpperCase() || "D"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {JSON.parse(localStorage.getItem("user") || "{}")?.name?.split(" ")[0] || "Delivery"}
          </span>
        </div>
      </div>
    </header>
  );
}