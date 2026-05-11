// vendor/components/Notifications/NotificationList.jsx
import React from 'react';
import { Bell, Package, AlertCircle, CheckCircle, X } from 'lucide-react';

const NotificationList = ({ notifications, onMarkAsRead, onClose }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'order':
        return <Package size={18} className="text-blue-500" />;
      case 'alert':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return <Bell size={18} className="text-orange-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-10 w-10 text-gray-300" />
            <p className="text-gray-500 mt-2">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-orange-50' : ''}`}
              onClick={() => onMarkAsRead(notif._id)}
            >
              <div className="flex items-start space-x-3">
                {getIcon(notif.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;