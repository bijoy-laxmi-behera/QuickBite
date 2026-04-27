import {
  FaHome,
  FaShoppingCart,
  FaClipboardList,
  FaHeart,
  FaCreditCard,
  FaUser,
  FaStar,
  FaMapMarkerAlt,
  FaSignOutAlt
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const Item = ({ icon, label, path }) => {
    const active = location.pathname === path;

    return (
      <div
        onClick={() => navigate(path)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
          ${active 
            ? "bg-orange-100 text-orange-600 font-semibold" 
            : "hover:bg-gray-100"}
        `}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="w-60 bg-white border-r min-h-screen flex flex-col justify-between">

      {/* Logo */}
      <div>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-orange-500">
            QuickBite
          </h1>
        </div>

        {/* Menu */}
        <div className="p-4 space-y-2">
          <Item icon={<FaHome />} label="Home" path="/customer/home" />
          <Item icon={<FaShoppingCart />} label="Cart" path="/customer/cart" />
          <Item icon={<FaClipboardList />} label="Orders" path="/customer/orders" />
          <Item icon={<FaHeart />} label="Favourites" path="/customer/favourites" />
          <Item icon={<FaCreditCard />} label="Payments" path="/customer/payments" />
          <Item icon={<FaUser />} label="Profile" path="/customer/profile" />
          <Item icon={<FaStar />} label="Reviews" path="/customer/reviews" />
          <Item icon={<FaMapMarkerAlt />} label="Addresses" path="/customer/addresses" />
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;