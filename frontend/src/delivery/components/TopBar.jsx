import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Zap, ChevronRight } from "lucide-react";
import { useDelivery } from "../DeliveryContext";
import StatusToggle from "./StatusToggle";

const titles = {
  "/delivery/dashboard":       { label: "Dashboard",       sub: "Welcome back"        },
  "/delivery/orders/incoming": { label: "Incoming Orders",  sub: "Available for you"   },
  "/delivery/orders/active":   { label: "Active Delivery",  sub: "Currently delivering"},
  "/delivery/orders/history":  { label: "Order History",    sub: "Past deliveries"     },
  "/delivery/earnings":        { label: "Earnings",         sub: "Your income overview"},
  "/delivery/wallet":          { label: "Wallet",           sub: "Balance & withdrawals"},
  "/delivery/performance":     { label: "Performance",      sub: "Stats & ratings"     },
  "/delivery/notifications":   { label: "Notifications",    sub: "Updates & alerts"    },
  "/delivery/support":         { label: "Support",          sub: "Help & tickets"      },
  "/delivery/profile":         { label: "Profile",          sub: "Account settings"    },
};

export default function TopBar({ onMenuToggle }) {
  const { pathname } = useLocation();
  const { partner }  = useDelivery();
  const navigate     = useNavigate();
  const page = titles[pathname] || { label: "QuickBite", sub: "Delivery" };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Left ── */}
          <div className="flex items-center gap-4">
            {/* Mobile: hamburger + logo */}
            <button
              onClick={onMenuToggle}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <Zap size={13} className="text-white" fill="white" />
              </div>
              <span className="text-sm font-black text-gray-900">QuickBite</span>
            </div>

            {/* Desktop: breadcrumb-style title */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-0.5">
                  <span>QuickBite</span>
                  <ChevronRight size={11} />
                  <span className="text-orange-500 font-semibold">{page.label}</span>
                </div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                  {page.label}
                </h1>
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2">

            {/* Status toggle — desktop only, synced with sidebar via context */}
            <div className="hidden md:block">
              <StatusToggle />
            </div>

            {/* Notifications */}
            <button
              onClick={() => navigate("/delivery/notifications")}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Profile avatar — navigates to /delivery/profile */}
            <button
              onClick={() => navigate("/delivery/profile")}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-200 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-orange-400 transition-colors">
                {partner?.avatar
                  ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs font-black text-orange-500">
                      {partner?.name?.[0]?.toUpperCase() || "D"}
                    </span>
                }
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-none">
                  {partner?.name?.split(" ")[0] || "Partner"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none">View profile</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}