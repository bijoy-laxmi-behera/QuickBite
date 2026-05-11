// vendor/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/axios'; // Use configured axios instead of default
import NotificationList from '../Notifications/NotificationList';

const Header = ({ sidebarOpen, setSidebarOpen, vendor }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [vendorData, setVendorData] = useState(vendor);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchVendorProfile();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update vendor data when prop changes
  useEffect(() => {
    setVendorData(vendor);
  }, [vendor]);

  const fetchVendorProfile = async () => {
    try {
      const response = await API.get('/vendor/profile');
      console.log('Vendor profile for header:', response.data);
      
      // Extract logo from response
      const logo = response.data?.data?.restaurantInfo?.logo || 
                   response.data?.restaurantInfo?.logo || 
                   response.data?.logo ||
                   response.data?.data?.logo ||
                   vendorData?.logo;
      
      setVendorData(prev => ({ ...prev, logo: logo }));
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/vendor/notifications');
      
      // Fix: Check if response.data is an array or has notifications property
      const notificationsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.notifications || []);
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead && !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/vendor/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:4000${imagePath}`;
    if (imagePath.startsWith('uploads')) return `http://localhost:4000/${imagePath}`;
    return imagePath;
  };

  const logoUrl = getImageUrl(vendorData?.logo || vendorData?.restaurantInfo?.logo);
  const restaurantName = vendorData?.restaurantName || vendorData?.restaurantInfo?.restaurantName || 'Vendor';
  const firstLetter = restaurantName?.charAt(0)?.toUpperCase() || 'V';

  console.log('Header logo URL:', logoUrl);
  console.log('Vendor data:', vendorData);

  return (
    <header className="bg-white shadow-sm border-b z-10">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders, items..."
              className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Vendor" 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Logo failed to load:', logoUrl);
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">${firstLetter}</div>`;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                  {firstLetter}
                </div>
              )}
              <ChevronDown size={16} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
                <button
                  onClick={() => navigate('/vendor/profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => navigate('/vendor/settings')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Restaurant Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                >
                  <LogOut size={14} className="inline mr-2" />
                  Logout
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