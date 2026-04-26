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
  FaSignOutAlt
} from "react-icons/fa";

function Sidebar({ setPage, handleLogout, sidebarOpen }) {
  return (
    <div
      className={`
        fixed md:static top-0 left-0 h-full w-64
        bg-gradient-to-b from-[#1a0f0a] to-[#2b140c]
        text-white flex flex-col justify-between
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition duration-300 z-50
      `}
    >

      {/* TOP */}
      <div>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-orange-400">QuickBite</h1>
        </div>

        {/* MENU */}
        <div className="p-4 space-y-2">

          <SidebarItem icon={<FaHome />} label="Home" onClick={() => setPage("home")} />
          <SidebarItem icon={<FaUtensils />}label="Restaurant"onClick={() => setPage("home")}/>
          <SidebarItem icon={<FaShoppingCart />} label="Cart" onClick={() => setPage("cart")} />
          <SidebarItem icon={<FaClipboardList />} label="Orders" onClick={() => setPage("orders")} />
        <SidebarItem icon={<FaHeart />} label="Favourites" onClick={() => setPage("favourites")} />
        <SidebarItem icon={<FaCreditCard />} label="Payments"onClick={() => setPage("payments")}/>
          <SidebarItem icon={<FaUser />} label="Profile" onClick={() => setPage("profile")} />
          <SidebarItem icon={<FaStar />} label="Reviews"onClick={() => setPage("reviews")}/>
          <SidebarItem icon={<FaMapMarkerAlt />} label="Addresses" onClick={() => setPage("addresses")} />

        </div>
      </div>

      {/* BOTTOM */}
      <div className="p-4 border-t border-white/10">

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </div>
  );
}

function SidebarItem({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-orange-500 transition"
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default Sidebar;