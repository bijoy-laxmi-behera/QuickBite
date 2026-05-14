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
  const [loading, setLoading] = useState(!partner);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios
      .get(`${API}/delivery/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const data = r.data?.user || r.data;
        setPartner(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DeliveryContext.Provider value={{ partner, setPartner, token, loading }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used inside DeliveryProvider");
  return ctx;
}