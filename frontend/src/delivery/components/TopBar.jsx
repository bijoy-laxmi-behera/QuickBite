import { useLocation, Link } from "react-router-dom";
import { Bell, Menu, Zap } from "lucide-react";
import { useDelivery } from "../DeliveryContext";
import StatusToggle from "./StatusToggle";

const titles = {
  "/delivery/dashboard":       { label: "Dashboard",       sub: "Welcome back" },
  "/delivery/orders/incoming": { label: "Incoming Orders",  sub: "Available for you" },
  "/delivery/orders/active":   { label: "Active Delivery",  sub: "Currently delivering" },
  "/delivery/orders/history":  { label: "Order History",    sub: "Past deliveries" },
  "/delivery/earnings":        { label: "Earnings",         sub: "Your income overview" },
  "/delivery/wallet":          { label: "Wallet",           sub: "Balance & withdrawals" },
  "/delivery/performance":     { label: "Performance",      sub: "Stats & ratings" },
  "/delivery/notifications":   { label: "Notifications",    sub: "Updates & alerts" },
  "/delivery/support":         { label: "Support",          sub: "Help & tickets" },
  "/delivery/profile":         { label: "Profile",          sub: "Account settings" },
};

export default function TopBar({ onMenuToggle }) {
  const { pathname } = useLocation();
  const { partner } = useDelivery();
  const page = titles[pathname] || { label: "QuickBite", sub: "Delivery" };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left — mobile logo + menu, desktop title */}
          <div className="flex items-center gap-3">
            {/* Mobile: hamburger + logo */}
            <button
              onClick={onMenuToggle}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-400"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                <Zap size={11} className="text-white" fill="white" />
              </div>
              <span className="text-sm font-black text-white">QuickBite</span>
            </div>

            {/* Desktop: page title */}
            <div className="hidden md:block">
              <h1 className="text-base font-black text-white tracking-tight">{page.label}</h1>
              <p className="text-[11px] text-zinc-500 font-medium leading-none mt-0.5">{page.sub}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Status toggle — desktop only in topbar */}
            <div className="hidden md:block">
              <StatusToggle />
            </div>

            <Link
              to="/delivery/notifications"
              className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 overflow-hidden flex items-center justify-center">
              {partner?.avatar
                ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-orange-400">
                    {partner?.name?.[0]?.toUpperCase() || "D"}
                  </span>
              }
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
