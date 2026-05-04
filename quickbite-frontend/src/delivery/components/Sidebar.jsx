import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaMotorcycle, FaHistory,
  FaWallet, FaUser, FaBars, FaTimes,
  FaSignOutAlt, FaChartBar
} from "react-icons/fa";

const navItems = [
  { id: "dashboard", label: "Dashboard",       icon: <FaTachometerAlt /> },
  { id: "active",    label: "Active Delivery", icon: <FaMotorcycle /> },
  { id: "history",   label: "History",         icon: <FaHistory /> },
  { id: "earnings",  label: "Earnings",        icon: <FaWallet /> },
  { id: "summary",   label: "Daily Summary",   icon: <FaChartBar /> },
  { id: "profile",   label: "Profile",         icon: <FaUser /> },
];

export default function Sidebar({ page, setPage, collapsed, setCollapsed, isOnline, setIsOnline }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/delivery/login");
  };

  return (
    <aside className={`flex flex-col bg-gray-950 text-white transition-all duration-300 min-h-screen ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚴</span>
            <span className="text-xl font-bold text-orange-400">QuickBite</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-orange-400 transition ml-auto">
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Online/Offline Toggle */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-2">
          <button onClick={() => setIsOnline(!isOnline)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
              isOnline
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-gray-800 border-gray-700 text-gray-400"
            }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs font-bold">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${isOnline ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isOnline ? "left-5" : "left-0.5"}`} />
            </div>
          </button>
        </div>
      )}

      {/* Collapsed online dot */}
      {collapsed && (
        <div className="flex justify-center mt-4 mb-2">
          <button onClick={() => setIsOnline(!isOnline)}>
            <span className={`w-3 h-3 rounded-full block ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
          </button>
        </div>
      )}

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-4 mb-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-xs text-orange-400 font-semibold tracking-widest uppercase">Delivery Panel</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              page === item.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && page === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "D"}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Delivery Partner"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          )}
        </div>

        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${collapsed ? "justify-center" : ""}`}>
          <span className="text-base flex-shrink-0"><FaSignOutAlt /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}