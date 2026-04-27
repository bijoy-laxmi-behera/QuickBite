import { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // 🔁 Load notifications
  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(saved.reverse());
  }, []);

  // 🧹 Clear all
  const clearAll = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Notifications</h2>

        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">
          No notifications
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white p-3 mb-2 rounded shadow"
          >
            <p>{n.message}</p>
            <span className="text-xs text-gray-400">
              {new Date(n.date).toLocaleString()}
            </span>
          </div>
        ))
      )}

    </div>
  );
}

export default Notifications;