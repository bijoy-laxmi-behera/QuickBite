import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Truck,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  UserCircle,
  PackageSearch,
} from 'lucide-react';

const menuItems = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', name: 'Users', icon: Users },
  { path: '/admin/restaurants', name: 'Restaurants', icon: Store },
  { path: '/admin/orders', name: 'Orders', icon: ShoppingBag },
  { path: '/admin/live-orders', name: 'Live Orders', icon: PackageSearch },
  { path: '/admin/agents', name: 'Delivery Agents', icon: Truck },
  { path: '/admin/coupons', name: 'Coupons', icon: Ticket },
  { path: '/admin/payments', name: 'Payments', icon: CreditCard },
  { path: '/admin/analytics', name: 'Analytics', icon: BarChart3 },
  { path: '/admin/settings', name: 'Settings', icon: Settings },
  { path: '/admin/profile', name: 'Profile', icon: UserCircle },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className={`font-bold text-xl ${!isOpen && 'hidden'}`}>
          Admin Panel
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg hover:bg-gray-800"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon size={20} />
            <span className={`${!isOpen && 'hidden'}`}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;