import { NavLink, useNavigate } from "react-router-dom";
import { useDelivery } from "../DeliveryContext";
import StatusToggle from "./StatusToggle";
import {
  LayoutDashboard, Package, Bike, TrendingUp,
  Wallet, User, Bell, HelpCircle, Award,
  History, Zap, LogOut
} from "lucide-react";

const navItems = [
  { label: "Dashboard",      to: "/delivery/dashboard",       icon: LayoutDashboard },
  { label: "Incoming Orders",to: "/delivery/orders/incoming", icon: Package         },
  { label: "Active Delivery",to: "/delivery/orders/active",   icon: Bike            },
  { label: "Order History",  to: "/delivery/orders/history",  icon: History         },
  { label: "Earnings",       to: "/delivery/earnings",        icon: TrendingUp      },
  { label: "Wallet",         to: "/delivery/wallet",          icon: Wallet          },
  { label: "Performance",    to: "/delivery/performance",     icon: Award           },
  { label: "Notifications",  to: "/delivery/notifications",   icon: Bell            },
  { label: "Support",        to: "/delivery/support",         icon: HelpCircle      },
  { label: "Profile",        to: "/delivery/profile",         icon: User            },
];

export default function Sidebar() {
  const { partner } = useDelivery();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm flex-shrink-0">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 tracking-tight leading-none">QuickBite</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Delivery Partner</p>
        </div>
      </div>

      {/* ── Online Status Toggle ── */}
      <div className="px-4 py-3 border-b border-gray-100">
        <StatusToggle />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Profile + Logout ── */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        {/* Profile card — clicks to profile page */}
        <NavLink
          to="/delivery/profile"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {partner?.avatar
              ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
              : <User size={14} className="text-orange-500" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate leading-none">
              {partner?.name || "Partner"}
            </p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{partner?.email}</p>
          </div>
        </NavLink>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={17} strokeWidth={1.8} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}