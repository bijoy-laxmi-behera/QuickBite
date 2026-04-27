const pageTitles = {
  dashboard: "Dashboard",
  active:    "Active Delivery",
  history:   "Delivery History",
  earnings:  "Earnings",
  profile:   "My Profile",
};

export default function Topbar({ page }) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{pageTitles[page] || "Dashboard"}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-orange-50 transition">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            D
          </div>
          <span className="text-sm font-medium text-gray-700">Delivery</span>
        </div>
      </div>
    </header>
  );
}
