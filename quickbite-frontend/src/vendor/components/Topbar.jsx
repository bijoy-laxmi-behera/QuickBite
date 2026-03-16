import { useState, useRef, useEffect } from "react";
import { FaBell, FaCog, FaSearch, FaBars, FaMoon } from "react-icons/fa";

function Topbar({ setSidebarOpen }) {

const [showNotifications, setShowNotifications] = useState(false);
const [showProfile, setShowProfile] = useState(false);
const [darkMode, setDarkMode] = useState(false);

const notificationRef = useRef(null);
const profileRef = useRef(null);

const toggleDark = () => {
  const html = document.documentElement;

  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
  } else {
    html.classList.add("dark");
  }
};

const logout = () => {
const confirmLogout = window.confirm("Are you sure you want to logout?");
if (confirmLogout) {
alert("Logged out successfully");
}
};

/* Close dropdown when clicking outside */
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

document.addEventListener("mousedown", handleClickOutside);

return () => {
  document.removeEventListener("mousedown", handleClickOutside);
};


}, []);

return ( <div className="h-16 bg-white shadow flex items-center justify-between px-6 relative">


  {/* Left Section */}
  <div className="flex items-center gap-4">

    {/* Mobile Menu */}
    <button
      className="lg:hidden text-gray-600"
      onClick={() => setSidebarOpen(true)}
    >
      <FaBars size={20} />
    </button>

    {/* Search */}
    <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-64 md:w-96">

      <FaSearch className="text-gray-400 mr-2" />

      <input
        type="text"
        placeholder="Search orders, subscribers, or dishes..."
        className="bg-transparent outline-none w-full text-sm"
      />

    </div>

  </div>


  {/* Right Section */}
  <div className="flex items-center gap-6">

    {/* Dark Mode */}
    <button
      onClick={toggleDark}
      className="text-gray-500 hover:text-orange-500 transition"
    >
      <FaMoon />
    </button>


    {/* Notifications */}
    <div className="relative" ref={notificationRef}>

      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-gray-500 hover:text-orange-500 transition relative"
      >
        <FaBell />

        {/* Notification Badge */}
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
          3
        </span>

      </button>


      {showNotifications && (
        <div className="absolute right-0 mt-3 w-64 bg-white border rounded-lg shadow-md p-4 animate-fadeIn">

          <p className="text-sm font-semibold mb-2">
            Notifications
          </p>

          <div className="space-y-2 text-xs text-gray-600">

            <p>📦 New order received</p>
            <p>⚠ Inventory low for Paneer</p>
            <p>👥 5 new subscribers today</p>

          </div>

        </div>
      )}

    </div>


    {/* Settings */}
    <button
      onClick={() => alert("Settings page coming soon")}
      className="text-gray-500 hover:text-orange-500 transition"
    >
      <FaCog />
    </button>



    {/* Profile */}
    <div className="relative" ref={profileRef}>

      <div
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center gap-2 cursor-pointer"
      >

        <img
          src="https://i.pravatar.cc/40"
          className="w-8 h-8 rounded-full"
        />

        <div className="text-sm hidden sm:block">
          <p className="font-medium">Chef Marcella</p>
          <p className="text-gray-400 text-xs">
            Kitchen Manager
          </p>
        </div>

      </div>


      {showProfile && (
        <div className="absolute right-0 mt-3 w-40 bg-white border rounded-lg shadow-md animate-fadeIn">

          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Profile
          </button>

          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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
