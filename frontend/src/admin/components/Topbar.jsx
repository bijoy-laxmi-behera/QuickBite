import { Bell, Search, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const pageTitles = {
  dashboard: { title: "Dashboard",       sub: "Welcome back, Admin" },
  users:     { title: "User Management", sub: "Manage all registered users" },
  vendors:   { title: "Vendor Management", sub: "Approve and manage restaurants" },
  orders:    { title: "Order Management", sub: "Track and manage all orders" },
  delivery:  { title: "Delivery Agents",  sub: "Manage delivery partners" },
  analytics: { title: "Analytics",        sub: "Platform insights and reports" },
  coupons:   { title: "Coupons",          sub: "Create and manage discount codes" },
  payments:  { title: "Payments",         sub: "Transaction history and refunds" },
  reviews:   { title: "Reviews",          sub: "Customer feedback management" },
  settings:  { title: "Settings",         sub: "Platform configuration" },
};

export default function Topbar({ page, setPage }) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const info = pageTitles[page] || pageTitles.dashboard;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  // Mock notifications (replace with real data)
  const notifications = [
    { id: 1, text: "New vendor registration pending", time: "2 min ago", unread: true },
    { id: 2, text: "Order #749ACD delivered", time: "15 min ago", unread: true },
    { id: 3, text: "Payment refund processed", time: "1 hour ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{info.title}</h1>
        <p className="text-xs text-gray-400">{info.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Quick search..."
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:bg-orange-50 transition">
            <Bell size={16} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${notif.unread ? 'bg-orange-50/30' : ''}`}>
                      <div className="flex items-start gap-2">
                        {notif.unread && <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="text-xs text-orange-500 font-semibold hover:text-orange-600">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-100 transition">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || "Admin"}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
              </div>
              <div className="py-2">
                <button 
                  onClick={() => { setShowProfile(false); setPage("settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                  <Settings size={16} className="text-gray-400" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}