import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";
import {
  FaHome, FaThLarge, FaShoppingCart, FaClipboardList,
  FaHeart, FaBell, FaCog, FaSignOutAlt, FaCrown,
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, activePage }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user,                 setUser]                 = useState(null);
  const [cartCount,            setCartCount]            = useState(0);
  const [unreadNotifications,  setUnreadNotifications]  = useState(0);
  const [loading,              setLoading]              = useState(true);
  const [hasSubscription,      setHasSubscription]      = useState(false);

  const mainNavItems = [
    { icon: FaHome,        label: "Dashboard",    page: "home",        badge: false },
    { icon: FaThLarge,     label: "Categories",   page: "categories",  badge: false },
  ];

  const shoppingNavItems = [
    { icon: FaShoppingCart, label: "Cart",       page: "cart",        badge: "cart"         },
    { icon: FaClipboardList,label: "Orders",     page: "orders",      badge: false          },
    { icon: FaHeart,        label: "Favorites",  page: "favourites",  badge: false          },
    { icon: FaCrown,        label: "Subscription",page: "subscription",badge: "subscription" },
  ];

  const accountNavItems = [
    { icon: FaBell, label: "Notifications", page: "notifications", badge: "notification" },
    { icon: FaCog,  label: "Settings",      page: "settings",      badge: false          },
  ];

  // ── Fetch user + cart + notifications + subscription status ────────────────
  useEffect(() => {
    // Check localStorage first for instant update after payment
    if (localStorage.getItem("hasSubscription") === "true") {
      setHasSubscription(true);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }

      try {
        const [profileRes, cartRes, notifRes, subRes] = await Promise.allSettled([
          API.get("/customer/me"),
          API.get("/customer/me/cart"),
          API.get("/customer/me/notifications"),
          API.get("/customer/subscription/status"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data.success)
          setUser(profileRes.value.data.data);

        if (cartRes.status === "fulfilled" && cartRes.value.data.success) {
          const items = cartRes.value.data.data?.items || [];
          setCartCount(items.reduce((s, i) => s + (i.quantity || 0), 0));
        }

        if (notifRes.status === "fulfilled" && notifRes.value.data.success) {
          setUnreadNotifications(
            notifRes.value.data.data.filter(n => !n.isRead).length
          );
        }

        if (subRes.status === "fulfilled" && subRes.value.data.success) {
          const isActive = !!subRes.value.data.data?.active;
          setHasSubscription(isActive);
          // Keep localStorage in sync
          if (isActive) localStorage.setItem("hasSubscription", "true");
          else localStorage.removeItem("hasSubscription");
        }

      } catch {}
      finally { setLoading(false); }
    };

    fetchUserData();

    // Socket events
    const token = localStorage.getItem("token");
    if (token && user?._id) {
      const socket = getSocket();
      if (socket) {
        socket.on("newNotification", (d) => {
          if (d.userId === user._id) setUnreadNotifications(p => p + 1);
        });
        socket.on("cartUpdated", (d) => {
          if (d.userId === user._id) setCartCount(d.totalItems || 0);
        });
      }
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("newNotification");
        socket.off("cartUpdated");
      }
    };
  }, [user?._id, location.pathname]);

  // Cart update event
  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await API.get("/customer/me/cart");
        if (data.success) {
          const items = data.data?.items || [];
          setCartCount(items.reduce((s, i) => s + (i.quantity || 0), 0));
        }
      } catch {}
    };
    window.addEventListener("cartUpdated", refresh);
    return () => window.removeEventListener("cartUpdated", refresh);
  }, []);

  // ── Navigation handler ─────────────────────────────────────────────────────
  const handleNav = (page) => {
    if (page === "subscription") {
      navigate(hasSubscription
        ? "/customer/subscription-dashboard"
        : "/customer/subscription-landing"
      );
    } else if (page === "categories") {
      navigate("/customer/categories");
    } else if (page === "settings") {
      navigate("/customer/profile");
    } else {
      navigate(`/customer/${page}`);
    }
    if (setSidebarOpen) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try { await API.post("/auth/logout").catch(() => {}); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserRole = () => {
    if (user?.role === "admin")  return "admin";
    if (user?.role === "vendor") return "partner";
    return "customer";
  };

  // ── Render nav group ───────────────────────────────────────────────────────
  const renderNavItems = (items) =>
    items.map(({ icon: Icon, label, page, badge }) => {
      const isActive =
        page === "settings"      ? activePage === "profile" :
        page === "subscription"  ? ["subscription-landing","subscription-dashboard","subscription-checkout","subscription-success"].includes(activePage) :
        activePage === page;

      let badgeCount = 0;
      if (badge === "cart")         badgeCount = cartCount;
      if (badge === "notification") badgeCount = unreadNotifications;

      // Subscription badge: crown glow when subscribed
      const isSubBadge = badge === "subscription";

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
          <Icon className={`text-base shrink-0 ${
            isActive ? "text-white" :
            page === "subscription" && hasSubscription ? "text-yellow-400" :
            "text-white/50"
          }`} />

          <span className="flex-1">{label}</span>

          {/* Subscribed crown badge */}
          {isSubBadge && hasSubscription && !isActive && (
            <span className="ml-auto bg-yellow-400/20 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-400/30">
              ACTIVE
            </span>
          )}

          {/* Normal number badge */}
          {!isSubBadge && badgeCount > 0 && (
            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              isActive ? "bg-white/30 text-white" : "bg-orange-500 text-white"
            }`}>
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </button>
      );
    });

  return (
    <aside className={`
      fixed md:static top-0 left-0 h-full w-64 shrink-0
      bg-gradient-to-b from-[#1a0a04] to-[#2c1506]
      text-white flex flex-col
      transform transition-transform duration-300 ease-in-out z-50
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
    `}>

      {/* LOGO */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-lg font-extrabold shadow-lg">Q</div>
        <h1 className="text-xl font-extrabold text-orange-400 tracking-tight">QuickBite</h1>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Main</p>
          <div className="space-y-1">{renderNavItems(mainNavItems)}</div>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Shopping</p>
          <div className="space-y-1">{renderNavItems(shoppingNavItems)}</div>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Account</p>
          <div className="space-y-1">{renderNavItems(accountNavItems)}</div>
        </div>
      </nav>

      {/* USER CARD */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 mb-3">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0">
            {loading ? "…" : getUserInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {loading ? "Loading…" : (user?.name || "My Account")}
            </p>
            <p className="text-[10px] text-white/40 truncate">
              {loading ? "customer" : getUserRole()}
            </p>
          </div>
          {hasSubscription && (
            <FaCrown className="text-yellow-400 text-xs flex-shrink-0" title="Active Subscription" />
          )}
        </div>
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 transition text-sm font-bold">
          <FaSignOutAlt className="text-xs" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;