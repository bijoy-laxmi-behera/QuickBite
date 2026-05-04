import { useState } from "react";

const navItems = [
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "users", label: "User Management", icon: "👥" },
  { id: "orders", label: "Order Management", icon: "📦" },
  { id: "vendors", label: "Vendor Management", icon: "🏪" },
  { id: "mealplans", label: "Meal Plans", icon: "🍽️" },
  { id: "delivery", label: "Delivery", icon: "🚴" },
  { id: "feedback", label: "Feedback & Reviews", icon: "💬" },
];

export default function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-gray-950 text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-bold tracking-tight text-orange-400">
              QuickBite
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-orange-400 transition-colors ml-auto"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-xs text-orange-400 font-semibold tracking-widest uppercase">
            Admin Panel
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
              active === item.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && active === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom user info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@quickbite.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}