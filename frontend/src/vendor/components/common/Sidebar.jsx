// vendor/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Package,
  Star,
  User,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, vendor }) => {
  const menuItems = [
    { path: '/vendor/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/vendor/orders', name: 'Live Orders', icon: ShoppingBag },
    { path: '/vendor/menu', name: 'Menu Management', icon: Utensils },
    { path: '/vendor/inventory', name: 'Inventory', icon: Package },
    { path: '/vendor/reviews', name: 'Reviews', icon: Star },
    { path: '/vendor/profile', name: 'Profile', icon: User },
    { path: '/vendor/analytics', name: 'Analytics', icon: BarChart3 },
    { path: '/vendor/payouts', name: 'Payouts', icon: Wallet },
    { path: '/vendor/settings', name: 'Settings', icon: Settings },
  ];

  return (
  <div
    className={`
      ${isOpen ? "w-64" : "w-20"}
      bg-[#0f0f11]/90 backdrop-blur-xl
      border-r border-white/10
      shadow-[0_8px_40px_rgba(0,0,0,0.6)]
      transition-all duration-300 ease-in-out
      flex flex-col h-screen sticky top-0
    `}
    style={{ transform: "perspective(1200px)" }}
  >
    {/* Logo Section */}
    <div className="p-4 border-b border-white/10 flex items-center justify-between">
      <div
        className={`flex items-center space-x-2 transition-all duration-300 ${
          !isOpen && "justify-center w-full"
        }`}
      >
        <Store className="h-8 w-8 text-orange-500 drop-shadow-[0_0_10px_rgba(255,115,0,0.6)] transform hover:scale-110 transition duration-300" />

        {isOpen && (
          <span className="font-bold text-xl bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            Vendor Portal
          </span>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>

    {/* Restaurant Info */}
    {isOpen && vendor && (
      <div
        className="
          p-4 border-b border-white/10
          bg-white/5 backdrop-blur-lg
          rounded-xl m-2
          shadow-inner
          transition duration-300 hover:scale-[1.02]
        "
      >
        <p className="font-semibold text-sm text-white">
          {vendor.restaurantName}
        </p>
        <p className="text-xs text-gray-400 mt-1">{vendor.email}</p>

        <span
          className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium
          transition-all duration-300
          ${
            vendor.isOpen
              ? "bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              : "bg-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          }`}
        >
          {vendor.isOpen ? "Open Now" : "Closed"}
        </span>
      </div>
    )}

    {/* Navigation */}
    <nav className="flex-1 py-4 space-y-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/vendor/dashboard"}
          className={({ isActive }) =>
            `
            flex items-center px-4 py-3 mx-2 rounded-xl
            transition-all duration-300 group relative overflow-hidden
            ${
              isActive
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-[0_0_20px_rgba(255,115,0,0.5)] scale-[1.03]"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }
            ${!isOpen && "justify-center"}
          `
          }
        >
          {/* Glow Hover Layer */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 blur-xl"></span>

          {/* Icon */}
          <div className="relative z-10 transform group-hover:scale-110 transition duration-300">
            <item.icon size={20} />
          </div>

          {/* Text */}
          {isOpen && (
            <span className="ml-3 relative z-10 font-medium tracking-wide">
              {item.name}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  </div>
);
};

export default Sidebar;