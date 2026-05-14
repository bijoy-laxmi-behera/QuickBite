import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function StatusToggle({ compact = false }) {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading]   = useState(false);
  const token = localStorage.getItem("token");

  const toggle = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `${API}/delivery/me/status`,
        { isOnline: !isOnline },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline(p => !p);
    } catch {}
    finally { setLoading(false); }
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isOnline ? "Online" : "Offline"}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isOnline ? "bg-emerald-500/20" : "bg-zinc-800"
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${
          loading ? "bg-amber-400 animate-pulse" :
          isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-zinc-600"
        }`} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider transition-all duration-200 ${
        isOnline
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-zinc-800/80 border-zinc-700 text-zinc-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        loading ? "bg-amber-400 animate-pulse" :
        isOnline ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" : "bg-zinc-600"
      }`} />
      {loading ? "..." : isOnline ? "ONLINE" : "OFFLINE"}
    </button>
  );
}
