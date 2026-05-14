import { NavLink } from "react-router-dom";
import { useDelivery } from "../DeliveryContext";
import StatusToggle from "./StatusToggle";
import {
  LayoutDashboard, Package, Bike, TrendingUp,
  Wallet, User, Bell, HelpCircle, Award,
  History, ChevronLeft, ChevronRight, Zap
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

export default function Sidebar({ open, onToggle }) {
  const { partner } = useDelivery();

  return (
    <aside
      className={`relative h-screen bg-[#0D0D14] border-r border-white/5 flex flex-col transition-all duration-300 ${
        open ? "w-60" : "w-16"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${!open && "justify-center px-0"}`}>
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" fill="white" />
        </div>
        {open && (
          <div>
            <p className="text-sm font-black text-white tracking-tight">QuickBite</p>
            <p className="text-[10px] text-zinc-500 font-medium">Delivery Partner</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#0D0D14] border border-white/10 rounded-full flex items-center justify-center z-10 hover:border-orange-500/50 transition-colors"
      >
        {open
          ? <ChevronLeft size={12} className="text-zinc-400" />
          : <ChevronRight size={12} className="text-zinc-400" />
        }
      </button>

      {/* Status toggle */}
      <div className={`px-3 py-3 border-b border-white/5 ${!open && "flex justify-center"}`}>
        <StatusToggle compact={!open} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={!open ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              } ${!open ? "justify-center px-0 w-10 mx-auto" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                {open && <span className="truncate">{label}</span>}
                {/* Tooltip when collapsed */}
                {!open && (
                  <div className="absolute left-14 bg-zinc-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 transition-opacity">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Partner info at bottom */}
      {open && partner && (
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {partner.avatar
                ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                : <User size={15} className="text-orange-400" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{partner.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{partner.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
