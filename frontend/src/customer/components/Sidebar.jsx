import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";
import {
  FaHome, FaThLarge, FaShoppingCart, FaClipboardList,
  FaHeart, FaBell, FaCog, FaSignOutAlt,
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, activePage }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Main Navigation (Primary)
  const mainNavItems = [
    { icon: FaHome, label: "Dashboard", page: "home", badge: false },
    { icon: FaThLarge, label: "Categories", page: "categories", badge: false },
  ];

  // Shopping & Orders (Secondary)
  const shoppingNavItems = [
    { icon: FaShoppingCart, label: "Cart", page: "cart", badge: "cart" },
    { icon: FaClipboardList, label: "Orders", page: "orders", badge: false },
    { icon: FaHeart, label: "Favorites", page: "favourites", badge: false },
  ];

  // Account & Settings (Tertiary) - Only Settings, NO Profile button
  const accountNavItems = [
    { icon: FaBell, label: "Notifications", page: "notifications", badge: "notification" },
    // { icon: FaUser, label: "Profile", page: "profile", badge: false }, // REMOVED
    { icon: FaCog, label: "Settings", page: "settings", badge: false },
  ];

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profileRes = await API.get("/customer/me");
        if (profileRes.data.success) {
          setUser(profileRes.data.data);
        }

        const cartRes = await API.get("/customer/me/cart");
        if (cartRes.data.success) {
          const items = cartRes.data.data?.items || [];
          const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
          setCartCount(totalItems);
        }

        const notifRes = await API.get("/customer/me/notifications");
        if (notifRes.data.success) {
          const unread = notifRes.data.data.filter(n => !n.isRead).length;
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const token = localStorage.getItem("token");
    if (token && user?._id) {
      const socket = getSocket();
      if (socket) {
        socket.on('newNotification', (data) => {
          if (data.userId === user._id) {
            setUnreadNotifications(prev => prev + 1);
          }
        });
        
        socket.on('cartUpdated', (data) => {
          if (data.userId === user._id) {
            setCartCount(data.totalItems || 0);
          }
        });
      }
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('newNotification');
        socket.off('cartUpdated');
      }
    };
  }, [user?._id]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const fetchCartCount = async () => {
        try {
          const cartRes = await API.get("/customer/me/cart");
          if (cartRes.data.success) {
            const items = cartRes.data.data?.items || [];
            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setCartCount(totalItems);
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      };
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleNav = (page) => {
    const currentPath = location.pathname;
    const expectedPath = `/customer/${page}`;
    
    if (currentPath === expectedPath) {
      if (setSidebarOpen) setSidebarOpen(false);
      return;
    }
    
    // Route mapping
    if (page === "categories") {
      navigate("/customer/categories");
    } else if (page === "settings") {
      navigate("/customer/profile"); // Settings goes to Profile page
    } else {
      navigate(`/customer/${page}`);
    }
    
    if (setSidebarOpen) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await API.post("/auth/logout").catch(() => {});
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = () => {
    if (user?.role === "admin") return "admin";
    if (user?.role === "vendor") return "partner";
    return "customer";
  };

  // Render nav items group
  const renderNavItems = (items) => {
    return items.map(({ icon: Icon, label, page, badge }) => {
      // For settings, check if activePage is "profile" since it opens profile page
      const isActive = page === "settings" ? activePage === "profile" : activePage === page;
      
      let badgeCount = 0;
      if (badge === "cart") badgeCount = cartCount;
      if (badge === "notification") badgeCount = unreadNotifications;
      
      const showBadge = badgeCount > 0;
      
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
          
          {showBadge && (
            <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </button>
      );
    });
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
      {/* LOGO */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-lg font-extrabold shadow-lg">
          Q
        </div>
        <h1 className="text-xl font-extrabold text-orange-400 tracking-tight">QuickBite</h1>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        
        {/* Main Section */}
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Main</p>
          <div className="space-y-1">
            {renderNavItems(mainNavItems)}
          </div>
        </div>

        {/* Shopping Section */}
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Shopping</p>
          <div className="space-y-1">
            {renderNavItems(shoppingNavItems)}
          </div>
        </div>

        {/* Account Section */}
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider px-3 mb-2">Account</p>
          <div className="space-y-1">
            {renderNavItems(accountNavItems)}
          </div>
        </div>
      </nav>

      {/* USER CARD */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 mb-3">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0">
            {loading ? "..." : getUserInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {loading ? "Loading..." : (user?.name || "My Account")}
            </p>
            <p className="text-[10px] text-white/40 truncate">
              {loading ? "customer" : getUserRole()}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 transition text-sm font-bold"
        >
          <FaSignOutAlt className="text-xs" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;