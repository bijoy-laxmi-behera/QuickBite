import React, { useState, useEffect } from 'react';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAdmin(user);
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {admin?.name?.[0] || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Settings size={16} /> Settings
                </button>
                <hr />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;