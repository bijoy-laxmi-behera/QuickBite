import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Package, MapPin, IndianRupee, Clock, RefreshCw,
  CheckCircle, Bike, Store, Wifi, WifiOff
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Read token once from localStorage
  const token = localStorage.getItem("token");

  // Decode userId from JWT (payload is base64, index 1)
  const getUserId = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload._id || payload.userId || null;
    } catch {
      return null;
    }
  };

  // ── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      // ✅ FIX 1: Register as delivery partner so server knows who this is
      const userId = getUserId();
      if (userId) {
        socket.emit("register", { userId, role: "delivery" });
        console.log("Registered delivery partner:", userId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // New order pushed from server
    socket.on("newOrderAvailable", (order) => {
      console.log("New order received:", order);
      setOrders((prev) => {
        if (prev.some((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });

      // ✅ FIX 2: Audio().play() returns a Promise — handle it properly
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {}); // silently ignore if blocked
    });

    // Order was taken by another partner
    socket.on("orderTaken", ({ orderId }) => {
      console.log("Order taken by another partner:", orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSelected((prev) => (prev?._id === orderId ? null : prev));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // token is stable; re-run only if it changes

  // ── REST polling (fallback) ────────────────────────────────────────────────
  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const { data } = await axios.get(`${API}/delivery/orders/incoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = data?.orders || data?.data || [];
        setOrders(list);
        // Auto-select first order only if nothing is selected yet
        setSelected((prev) => (prev ? prev : list[0] || null));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // ✅ FIX 3: added fetchOrders to dependency array (via useCallback it's stable)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Accept / Reject ───────────────────────────────────────────────────────
  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await axios.patch(
        `${API}/delivery/orders/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => {
        const updated = prev.filter((o) => o._id !== id);
        setSelected(updated[0] || null);
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept order");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await axios.patch(
        `${API}/delivery/orders/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => {
        const remaining = prev.filter((o) => o._id !== id);
        setSelected(remaining[0] || null);
        return remaining;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject order");
    } finally {
      setActionId(null);
    }
  };

  const earnings = (o) => Math.round((o?.pricing?.deliveryFee || 40) * 0.85);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Connection status badge */}
      <div
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
          isConnected ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
        }`}
      >
        {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isConnected ? "Live" : "Polling"}
      </div>

      {/* ── Left: Order List ─────────────────────────────────────────────────── */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Incoming Orders</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isConnected ? "bg-emerald-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-[11px] text-gray-400">
                {isConnected ? "Live" : "Auto-refreshing"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <span className="bg-orange-50 text-orange-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-200">
                {orders.length}
              </span>
            )}
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <RefreshCw
                size={13}
                className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bike size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm font-semibold">No incoming orders</p>
              <p className="text-gray-400 text-xs mt-1">
                New orders will appear automatically
              </p>
              <button
                onClick={() => fetchOrders(true)}
                className="mt-4 text-xs text-orange-500 font-medium"
              >
                Refresh manually
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {orders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => setSelected(order)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 ${
                    selected?._id === order._id
                      ? "bg-orange-50 border border-orange-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-orange-500">
                          {order.orderId || "QB-" + order._id?.slice(-6)}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={9} />
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1 truncate">
                        {order.items?.map((i) => i.name).join(", ") || "Food items"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={9} />
                        {order.address?.street ||
                          order.vendor?.address ||
                          "Customer address"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-emerald-500">
                        ₹{earnings(order)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ~{order.distanceToCustomer?.toFixed(1) || "2.3"} km
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Order Detail ──────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">Select an order to view details</p>
            <p className="text-gray-400 text-sm mt-1">Click any order from the list</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-orange-500 tracking-widest">
                  {selected.orderId || "QB-" + selected._id?.slice(-6)}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selected.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                Available
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Earnings */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">
                    Your Earnings
                  </p>
                  <p className="text-3xl font-black text-orange-500 mt-1">
                    ₹{earnings(selected)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Delivery fee: ₹{selected.pricing?.deliveryFee || 40}
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <IndianRupee size={24} className="text-orange-500" />
                </div>
              </div>

              {/* Pickup */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Pickup Location
                </h4>
                <div className="flex items-start gap-3">
                  <Store size={18} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected.vendorName || selected.vendor?.name || "Restaurant"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selected.pickupAddress?.address ||
                        selected.vendor?.address ||
                        "Restaurant address"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dropoff */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Delivery Location
                </h4>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected.address?.fullName || selected.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selected.address?.street}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selected.address?.city}, {selected.address?.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📞 {selected.address?.phone || selected.user?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Order Items
                </h4>
                <div className="space-y-2">
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-orange-50 text-orange-500 text-[10px] font-black rounded-md flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Items Total</span>
                    <span>₹{selected.pricing?.itemsTotal || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery Fee</span>
                    <span>₹{selected.pricing?.deliveryFee || 40}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100 mt-1">
                    <span>Total</span>
                    <span className="text-orange-500">
                      ₹{selected.pricing?.totalAmount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => handleReject(selected._id)}
                disabled={actionId === selected._id}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {actionId === selected._id ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() => handleAccept(selected._id)}
                disabled={actionId === selected._id}
                className="flex-[2] py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {actionId === selected._id ? "Accepting..." : "Accept Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}