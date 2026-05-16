import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Bike, Wallet, User } from "lucide-react";

const tabs = [
  { to: "/delivery/dashboard",       icon: LayoutDashboard, label: "Home"    },
  { to: "/delivery/orders/incoming", icon: Package,         label: "Orders"  },
  { to: "/delivery/orders/active",   icon: Bike,            label: "Active"  },
  { to: "/delivery/wallet",          icon: Wallet,          label: "Wallet"  },
  { to: "/delivery/profile",         icon: User,            label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[52px] ${
                isActive ? "text-orange-500" : "text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-orange-50" : ""}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
