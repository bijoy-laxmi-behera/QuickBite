// src/vendor/components/Sidebar.jsx
import { useNavigate } from "react-router-dom";
import API from "../../services/axios";
import {
  FaTachometerAlt, FaClipboardList, FaUtensils, FaBoxOpen,
  FaChartBar, FaStar, FaUser, FaBell, FaCog, FaSignOutAlt,
  FaCrown, FaCalendarAlt,
} from "react-icons/fa";

const NAV_RESTAURANT = [
  { section: "MAIN" },
  { icon: FaTachometerAlt, label: "Dashboard",      page: "dashboard"     },
  { icon: FaClipboardList,  label: "Orders",          page: "orders"        },
  { section: "MENU" },
  { icon: FaUtensils,       label: "Menu Items",      page: "menu"          },
  { icon: FaBoxOpen,        label: "Inventory",       page: "inventory"     },
  { section: "BUSINESS" },
  { icon: FaChartBar,       label: "Earnings",        page: "earnings"      },
  { icon: FaStar,           label: "Reviews",         page: "reviews"       },
  { section: "ACCOUNT" },
  { icon: FaUser,           label: "Profile",         page: "profile"       },
  { icon: FaBell,           label: "Notifications",   page: "notifications" },
  { icon: FaCog,            label: "Settings",        page: "settings"      },
];

const NAV_CLOUD_KITCHEN = [
  { section: "MAIN" },
  { icon: FaTachometerAlt, label: "Dashboard",         page: "dashboard"        },
  { icon: FaClipboardList,  label: "Orders",            page: "orders"           },
  { section: "SUBSCRIPTION" },
  { icon: FaCrown,          label: "Subscribers",       page: "subscriptions"    },
  { icon: FaCalendarAlt,    label: "Delivery Schedule", page: "delivery-schedule"},
  { section: "MENU" },
  { icon: FaUtensils,       label: "Menu Items",        page: "menu"             },
  { icon: FaBoxOpen,        label: "Inventory",         page: "inventory"        },
  { section: "BUSINESS" },
  { icon: FaChartBar,       label: "Earnings",          page: "earnings"         },
  { icon: FaStar,           label: "Reviews",           page: "reviews"          },
  { section: "ACCOUNT" },
  { icon: FaUser,           label: "Profile",           page: "profile"          },
  { icon: FaBell,           label: "Notifications",     page: "notifications"    },
  { icon: FaCog,            label: "Settings",          page: "settings"         },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, activePage, isCloudKitchen, navigate }) {
  const nav = isCloudKitchen ? NAV_CLOUD_KITCHEN : NAV_RESTAURANT;

  const handleLogout = async () => {
    try { await API.post("/auth/logout").catch(() => {}); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goTo = (page) => {
    navigate(`/vendor/${page}`);
    setSidebarOpen(false);
  };

  return (
    <aside className={`
      fixed md:static top-0 left-0 h-full w-64 shrink-0 z-50
      bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${
          isCloudKitchen ? "bg-purple-500" : "bg-orange-500"
        }`}>
          {isCloudKitchen ? "☁" : "Q"}
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white leading-tight">QuickBite</h1>
          <p className={`text-[10px] font-bold ${isCloudKitchen ? "text-purple-400" : "text-orange-400"}`}>
            {isCloudKitchen ? "Cloud Kitchen" : "Restaurant"} Portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {nav.map((item, i) => {
          if (item.section) return (
            <p key={i} className="text-[10px] text-white/30 uppercase tracking-widest px-3 pt-4 pb-1 first:pt-1">
              {item.section}
            </p>
          );

          const isActive = activePage === item.page;
          const Icon = item.icon;
          return (
            <button key={item.page} onClick={() => goTo(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left ${
                isActive
                  ? isCloudKitchen
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-orange-500 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}>
              <Icon className={`text-sm flex-shrink-0 ${isActive ? "text-white" : "text-white/40"}`} />
              {item.label}
              {item.page === "orders" && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  Live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 transition text-sm font-bold">
          <FaSignOutAlt className="text-xs" /> Logout
        </button>
      </div>
    </aside>
  );
}
