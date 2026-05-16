import { useEffect, useState } from "react";
import axios from "axios";
import {
  Package, MapPin, IndianRupee, Clock, RefreshCw,
  CheckCircle, Bike, Store
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function IncomingOrders() {
  const [orders, setOrders]         = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId]     = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await axios.get(`${API}/delivery/orders/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = data?.orders || data?.data || [];
      setOrders(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 15000);
    return () => clearInterval(iv);
  }, [token]);

  const handle = async (id, action) => {
    setActionId(id);
    try {
      await axios.patch(`${API}/delivery/orders/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const next = orders.filter(o => o._id !== id);
      setOrders(next);
      setSelected(next[0] || null);
    } catch {}
    finally { setActionId(null); }
  };

  const earnings = (o) => Math.round((o?.pricing?.deliveryFee || 40) * 0.85);

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">

      {/* Left: Order List */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Available Orders</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[11px] text-gray-400">Auto-refreshing</span>
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
              <RefreshCw size={13} className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bike size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm font-semibold">No orders right now</p>
              <p className="text-gray-400 text-xs mt-1">New orders will appear automatically</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {orders.map(order => (
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
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1 truncate">
                        {order.items?.map(i => i.name).join(", ") || "Food items"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={9} />
                        {order.address?.street || "Customer address"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-emerald-500">₹{earnings(order)}</p>
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

      {/* Right: Order Detail */}
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
              {/* Earnings hero */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">Your Earnings</p>
                  <p className="text-3xl font-black text-orange-500 mt-1">₹{earnings(selected)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Delivery fee: ₹{selected.pricing?.deliveryFee || 40} · {selected.estimatedArrival || "30–40"} min
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <IndianRupee size={24} className="text-orange-500" />
                </div>
              </div>

              {/* Route info */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Route</h4>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    <div className="w-0.5 h-10 bg-gray-300 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">Pickup</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                        <Store size={13} className="text-orange-500" />
                        Restaurant / Vendor
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">Drop-off</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {selected.address?.street || "Customer address"}
                      </p>
                      <p className="text-xs text-gray-400">{selected.address?.city}, {selected.address?.pincode}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Estimated distance</span>
                  <span className="text-xs font-bold text-gray-900">~{selected.distanceToCustomer?.toFixed(1) || "2.3"} km</span>
                </div>
              </div>

              {/* Order items */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Items</h4>
                <div className="space-y-2">
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-orange-50 text-orange-500 text-[10px] font-black rounded-md flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">₹{item.price}</span>
                    </div>
                  ))}
                  {!selected.items?.length && <p className="text-xs text-gray-400">No item details</p>}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Order total</span>
                  <span className="text-sm font-bold text-gray-900">₹{selected.pricing?.totalAmount || "—"}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => handle(selected._id, "reject")}
                disabled={actionId === selected._id}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handle(selected._id, "accept")}
                disabled={actionId === selected._id}
                className="flex-[2] py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {actionId === selected._id ? "Processing..." : "Accept Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
