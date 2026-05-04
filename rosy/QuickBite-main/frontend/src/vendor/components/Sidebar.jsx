import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUtensils,
  FaBox,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

function Sidebar({ sidebarOpen, setSidebarOpen, setPage, activePage }) {
  const navigate = useNavigate();

  // 🔥 Store status state
  const [isOpen, setIsOpen] = useState(true);

  // 🔥 Menu config (scalable)
  const menuItems = [
    { name: "dashboard", label: "Dashboard", icon: FaThLarge },
    { name: "menu", label: "Menu Management", icon: FaUtensils },
    { name: "inventory", label: "Inventory & Batch", icon: FaBox },
    { name: "orders", label: "Subscription Orders", icon: FaClipboardList },
    { name: "analytics", label: "Analytics", icon: FaChartBar },
    { name: "subscribers", label: "Subscriber List", icon: FaUsers },
  ];

  const baseStyle =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer";

  const getClass = (page) =>
    `${baseStyle} ${
      activePage === page
        ? "bg-orange-500 text-white shadow-md"
        : "hover:bg-orange-500 text-gray-300"
    }`;

  const handleClick = (page) => {
    setPage(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-[#1E0F0A] text-white flex flex-col justify-between
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-all duration-300 z-50`}
      >
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
            <div className="bg-orange-500 w-9 h-9 flex items-center justify-center rounded-md font-bold">
              Q
            </div>

            <div>
              <h1 className="font-semibold text-lg">QuickBite</h1>
              <p className="text-xs text-orange-400">Vendor Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col mt-6 space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleClick(item.name)}
                  className={getClass(item.name)}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-4 pb-6">

          {/* STORE STATUS */}
          <div className="bg-[#2A1510] p-4 rounded-xl mb-4">
            <p className="text-xs text-gray-300 mb-2">STORE STATUS</p>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                isOpen
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              ● {isOpen ? "Open for Orders" : "Closed"}
            </button>
          </div>

          {/* SUPPORT */}
          <button className="flex items-center gap-3 text-gray-300 hover:text-white mb-3 transition">
            <FaQuestionCircle />
            Support
          </button>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-300 hover:text-red-400 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;