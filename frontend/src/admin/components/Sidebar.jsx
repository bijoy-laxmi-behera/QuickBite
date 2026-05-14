import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, ShoppingBag,
  Truck, BarChart2, Settings, LogOut, ChevronLeft,
  ChevronRight, Tag, CreditCard, Star, User
} from "lucide-react";

const navItems = [
  { id: "dashboard",    label: "Dashboard",       icon: LayoutDashboard },
  { id: "users",        label: "Users",            icon: Users },
  { id: "vendors",      label: "Vendors",          icon: Store },
  { id: "orders",       label: "Orders",           icon: ShoppingBag },
  { id: "delivery",     label: "Delivery",         icon: Truck },
  { id: "analytics",    label: "Analytics",        icon: BarChart2 },
  { id: "coupons",      label: "Coupons",          icon: Tag },
  { id: "payments",     label: "Payments",         icon: CreditCard },
  { id: "reviews",      label: "Reviews",          icon: Star },
  { id: "settings",     label: "Settings",         icon: Settings },
];

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <aside className={`flex flex-col bg-gray-950 text-white transition-all duration-300 min-h-screen flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-base font-black">Q</div>
            <span className="text-lg font-black text-white tracking-tight">Quick<span className="text-orange-400">Bite</span></span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-orange-400 transition ml-auto p-1 rounded-lg hover:bg-gray-800">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-[10px] text-orange-400 font-bold tracking-widest uppercase">Admin Panel</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setPage(id)}
            title={collapsed ? label : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && page === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        
        {/* Profile Button - Opens Settings */}
        <button 
          onClick={() => setPage("settings")}
          className="w-full flex items-center gap-2.5 hover:bg-gray-800 rounded-xl p-2 transition"
          title={collapsed ? "Profile" : ""}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}