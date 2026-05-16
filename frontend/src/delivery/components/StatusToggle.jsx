import { useDelivery } from "../DeliveryContext";

// No local state — reads from DeliveryContext so Sidebar & TopBar are always in sync
export default function StatusToggle({ compact = false }) {
  const { isOnline, statusLoading, toggleOnlineStatus } = useDelivery();

  if (compact) {
    return (
      <button
        onClick={toggleOnlineStatus}
        title={isOnline ? "Go Offline" : "Go Online"}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
          isOnline ? "bg-emerald-50 border-emerald-200" : "bg-gray-100 border-gray-200"
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full transition-all ${
          statusLoading ? "bg-amber-400 animate-pulse" :
          isOnline      ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.7)]" : "bg-gray-400"
        }`} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleOnlineStatus}
      disabled={statusLoading}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-bold tracking-wider transition-all duration-200 ${
        isOnline
          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
        statusLoading ? "bg-amber-400 animate-pulse" :
        isOnline      ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-gray-400"
      }`} />
      {statusLoading ? "Updating…" : isOnline ? "ONLINE" : "OFFLINE"}
    </button>
  );
}