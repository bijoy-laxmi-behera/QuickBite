import {
  FaHome,
  FaUtensils,
  FaShoppingCart,
  FaClipboardList,
  FaHeart,
  FaCreditCard,
  FaUser,
  FaStar,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

const navItems = [
  { icon: FaHome,          label: "Home",          page: "home" },
  { icon: FaUtensils,      label: "Restaurant",    page: "restaurant" },
  { icon: FaShoppingCart,  label: "Cart",          page: "cart" },
  { icon: FaClipboardList, label: "Orders",        page: "orders" },
  { icon: FaHeart,         label: "Favourites",    page: "favourites" },
  { icon: FaCreditCard,    label: "Payments",      page: "payments" },
  { icon: FaUser,          label: "Profile",       page: "profile" },
  { icon: FaStar,          label: "Reviews",       page: "reviews" },
  { icon: FaMapMarkerAlt,  label: "Addresses",     page: "addresses" },
  { icon: FaBell,          label: "Notifications", page: "notifications" },
];

function Sidebar({ setPage, sidebarOpen, setSidebarOpen, activePage }) {

  const handleNav = (page) => {
    setPage(page);
    if (setSidebarOpen) setSidebarOpen(false); // auto-close on mobile
  };

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 h-full w-64 shrink-0
        bg-gradient-to-b from-[#1a0a04] to-[#2c1506]
        text-white flex flex-col
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* ── LOGO ── */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-lg font-extrabold shadow-lg">
          Q
        </div>
        <h1 className="text-xl font-extrabold text-orange-400 tracking-tight">QuickBite</h1>
      </div>

      {/* ── NAV ITEMS ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {navItems.map(({ icon: Icon, label, page }) => {
          const isActive = activePage === page;
          return (
            <button
              key={page}
              onClick={() => handleNav(page)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                transition-all duration-200 text-left
                ${isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Icon className={`text-base shrink-0 ${isActive ? "text-white" : "text-white/50"}`} />
              {label}
              {/* CART BADGE */}
              {page === "cart" && isActive && (
                <span className="ml-auto bg-white text-orange-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  •
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── USER CARD ── */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 mb-3">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0">
            U
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">My Account</p>
            <p className="text-[10px] text-white/40 truncate">customer</p>
          </div>
        </div>
        <button
          onClick={() => handleNav("home")}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 transition text-sm font-bold shadow-lg shadow-orange-500/30"
        >
          <FaSignOutAlt className="text-xs" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
