import { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaCog,
  FaSearch,
  FaBars,
  FaMoon
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import API from "@/services/axios";

function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // 🌙 DARK MODE
  const toggleDark = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // 🔁 LOAD THEME + USER + NOTIFICATIONS
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }

    const fetchData = async () => {
      try {
        const [userRes, notifRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/notifications"),
        ]);

        setUser(userRes.data);
        setNotifications(notifRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  // 🔐 LOGOUT
  const logout = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 border border-gray-500 rounded text-sm text-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              toast.dismiss(t.id);
              toast.success("Logged out successfully");
              navigate("/login");
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    ));
  };

  // 🔁 CLICK OUTSIDE + ESC CLOSE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="h-16 bg-[#1E0F0A] text-white border-b border-[#2A1510] shadow-sm flex items-center justify-between px-3 sm:px-6 relative">

      {/* LEFT */}
      <div className="flex items-center gap-3 w-full sm:w-auto">

        {/* MOBILE MENU */}
        <button
          className="lg:hidden text-gray-300 hover:text-orange-500 transition"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars size={20} />
        </button>

        {/* SEARCH */}
        <div className="hidden sm:flex items-center bg-[#2A1510] px-3 py-2 rounded-lg w-48 md:w-80">

          <FaSearch className="text-gray-400 mr-2" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm text-gray-200 placeholder-gray-500"
          />
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* DARK MODE */}
        <button
          onClick={toggleDark}
          className="text-gray-300 hover:text-orange-500 transition"
        >
          <FaMoon />
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-300 hover:text-orange-500 transition relative"
          >
            <FaBell />

            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-64 bg-[#2A1510] border border-gray-700 rounded-xl shadow-lg p-4 z-50">

              <p className="text-sm font-semibold mb-2 text-white">
                Notifications
              </p>

              <div className="space-y-2 text-xs text-gray-300 max-h-40 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((note, index) => (
                    <p key={index}>{note.message || note}</p>
                  ))
                ) : (
                  <p>No notifications</p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* SETTINGS */}
        <button
          onClick={() => toast("Settings coming soon")}
          className="text-gray-300 hover:text-orange-500 transition"
        >
          <FaCog />
        </button>

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>

          <div
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/40"}
              className="w-8 h-8 rounded-full"
              alt="profile"
            />

            <div className="hidden sm:block text-sm">
              <p className="font-medium text-white">
                {user?.name || "User"}
              </p>
              <p className="text-gray-400 text-xs">
                {user?.role || "Vendor"}
              </p>
            </div>
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-40 bg-[#2A1510] border border-gray-700 rounded-xl shadow-lg z-50">

              <button className="block w-full text-left px-4 py-2 hover:bg-[#3A1F18] text-gray-300 hover:text-white">
                Profile
              </button>

              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 hover:bg-[#3A1F18] text-gray-300 hover:text-white"
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Topbar;