// src/vendor/components/TopBar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axios";
import { FaBars, FaBell, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function TopBar({ setSidebarOpen, restaurant, isCloudKitchen, loading }) {
  const navigate  = useNavigate();
  const [isOpen,  setIsOpen]  = useState(true);
  const [toggling, setToggling] = useState(false);
  const [unread,  setUnread]  = useState(0);

  useEffect(() => {
    if (restaurant) setIsOpen(restaurant.isOpen ?? true);
  }, [restaurant]);

  useEffect(() => {
    API.get("/vendor/notifications").then(({ data }) => {
      if (data.success) setUnread(data.data?.filter(n => !n.isRead).length || 0);
    }).catch(() => {});
  }, []);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      const { data } = await API.patch("/vendor/profile/status");
      if (data.success) setIsOpen(data.data?.isOpen ?? !isOpen);
    } catch {}
    setToggling(false);
  };

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm shrink-0">
      <div className="flex items-center justify-between px-4 py-3 gap-4">

        {/* Hamburger (mobile) */}
        <button onClick={() => setSidebarOpen(true)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
          <FaBars />
        </button>

        {/* Restaurant name */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <h2 className="text-sm font-black text-gray-800 truncate">
                {restaurant?.name || "Your Restaurant"}
              </h2>
              <p className="text-xs text-gray-400">{isCloudKitchen ? "Cloud Kitchen Portal" : "Restaurant Portal"}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">

          {/* Open/Close toggle */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-xs font-semibold text-gray-600">{isOpen ? "Open" : "Closed"}</span>
            <button onClick={toggleStatus} disabled={toggling} className="ml-1 transition">
              {isOpen
                ? <FaToggleOn  className="text-green-500 text-xl" />
                : <FaToggleOff className="text-gray-400 text-xl" />
              }
            </button>
          </div>

          {/* Notifications */}
          <button onClick={() => navigate("/vendor/notifications")}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
            <FaBell />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
