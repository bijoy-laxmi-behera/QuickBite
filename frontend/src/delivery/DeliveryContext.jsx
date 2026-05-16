import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const DeliveryContext = createContext(null);

export function DeliveryProvider({ children }) {
  const token = localStorage.getItem("token");

  const [partner, setPartner] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });
  const [loading, setLoading]           = useState(!partner);
  const [isOnline, setIsOnline]         = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios
      .get(`${API}/delivery/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const data = r.data?.user || r.data;
        setPartner(data);
        setIsOnline(data?.isOnline || false);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Single shared toggle — used by both Sidebar & TopBar
  const toggleOnlineStatus = async () => {
    setStatusLoading(true);
    try {
      await axios.patch(
        `${API}/delivery/me/status`,
        { isOnline: !isOnline },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline((prev) => !prev);
    } catch {}
    finally { setStatusLoading(false); }
  };

  return (
    <DeliveryContext.Provider
      value={{ partner, setPartner, token, loading, isOnline, statusLoading, toggleOnlineStatus }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used inside DeliveryProvider");
  return ctx;
}