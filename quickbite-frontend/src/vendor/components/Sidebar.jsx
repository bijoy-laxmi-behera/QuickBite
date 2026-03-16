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

function Sidebar({ sidebarOpen, setSidebarOpen, setPage, activePage }) {
  const menuItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-500 transition cursor-pointer";

  const activeItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500 text-white shadow-md cursor-pointer";

  const handleClick = (page) => {
    setPage(page);
    setSidebarOpen(false); // close sidebar on mobile
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
        className={`
      fixed top-0 left-0 h-screen w-64 bg-[#1E0F0A] text-white flex flex-col justify-between
      transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 transition-all duration-300 ease-in-out z-50
    `}
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
            <button
              onClick={() => handleClick("dashboard")}
              className={activePage === "dashboard" ? activeItem : menuItem}
            >
              <FaThLarge />
              Dashboard
            </button>

            <button
              onClick={() => handleClick("menu")}
              className={activePage === "menu" ? activeItem : menuItem}
            >
              <FaUtensils />
              Menu Management
            </button>

            <button
              onClick={() => handleClick("inventory")}
              className={activePage === "inventory" ? activeItem : menuItem}
            >
              <FaBox /> Inventory & Batch
            </button>

            <button
              onClick={() => handleClick("orders")}
              className={activePage === "orders" ? activeItem : menuItem}
            >
              <FaClipboardList /> Subscription Orders
            </button>

            <button
              onClick={() => handleClick("analytics")}
              className={activePage === "analytics" ? activeItem : menuItem}
            >
              <FaChartBar /> Analytics
            </button>

            <button
              onClick={() => handleClick("subscribers")}
              className={activePage === "subscribers" ? activeItem : menuItem}
            >
              <FaUsers /> Subscriber List
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-4 pb-6">
          {/* Store Status */}
          <div className="bg-[#2A1510] p-4 rounded-xl mb-4">
            <p className="text-xs text-gray-300 mb-2">STORE STATUS</p>

            <button className="w-full bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-sm font-medium">
              ● Open for Orders
            </button>
          </div>

          {/* Support */}
          <button className="flex items-center gap-3 text-gray-300 hover:text-white mb-3">
            <FaQuestionCircle />
            Support
          </button>

          {/* Logout */}
          <button className="flex items-center gap-3 text-gray-300 hover:text-white">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
