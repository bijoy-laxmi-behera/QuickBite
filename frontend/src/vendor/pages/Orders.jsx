// src/vendor/pages/Orders.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaCheck, FaTimes, FaClock, FaSpinner, FaSearch, FaMotorcycle } from "react-icons/fa";

const STATUS_TABS = ["all","pending","confirmed","preparing","ready","delivered","cancelled"];

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100   text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready:     "bg-green-100  text-green-700",
  delivered: "bg-gray-100   text-gray-600",
  cancelled: "bg-red-100    text-red-600",
};

export default function Orders({ isCloudKitchen }) {
  const [orders,   setOrders]   = useState([]);
  const [tab,      setTab]      = useState("pending");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/vendor/orders");
      setOrders(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 20000);
    return () => clearInterval(t);
  }, []);

  const act = async (orderId, action) => {
    setActing(orderId + action);
    try {
      if (action === "accept")  await API.patch(`/vendor/orders/${orderId}/accept`);
      if (action === "reject")  await API.patch(`/vendor/orders/${orderId}/reject`);
      if (action === "ready")   await API.patch(`/vendor/orders/${orderId}/ready`);
      if (action === "pickup")  await API.patch(`/vendor/orders/${orderId}/ready-for-pickup`);
      await fetchOrders();
      if (selected?._id === orderId) {
        const { data } = await API.get(`/vendor/orders/${orderId}`);
        setSelected(data.data);
      }
    } catch (e) { alert(e.response?.data?.message || "Action failed"); }
    setActing(null);
  };

  const filtered = orders.filter(o => {
    const matchTab    = tab === "all" || o.status === tab;
    const matchSearch = !search || o.orderId?.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="flex h-full overflow-hidden">

      {/* Left: orders list */}
      <div className="w-full md:w-96 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order or customer..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                tab === t ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== "all" && <span className="ml-1 text-[10px] opacity-70">
                ({orders.filter(o => o.status === t).length})
              </span>}
            </button>
          ))}
        </div>

        {/* Order list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-orange-500 text-2xl" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No orders found</p>
            </div>
          ) : filtered.map(order => (
            <div key={order._id}
              onClick={() => setSelected(order)}
              className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition ${selected?._id === order._id ? "bg-orange-50 border-l-2 border-orange-500" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-gray-800">#{order.orderId || order._id?.slice(-6)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.user?.name || "Customer"}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {(order.status || "").toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                <p className="text-sm font-bold text-gray-700">₹{order.pricing?.totalAmount || 0}</p>
              </div>
              <p className="text-[10px] text-gray-300 mt-1">
                {new Date(order.createdAt).toLocaleString("en-IN", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: order detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <span className="text-5xl mb-3">📋</span>
            <h3 className="text-lg font-black text-gray-700">Select an order</h3>
            <p className="text-gray-400 text-sm mt-1">Click any order from the list to see details</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Order ID</p>
                  <h2 className="text-xl font-black text-gray-800">#{selected.orderId || selected._id?.slice(-6)}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(selected.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-600"}`}>
                  {(selected.status || "").toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {selected.status === "pending" && (
                  <>
                    <button onClick={() => act(selected._id, "accept")} disabled={!!acting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50">
                      {acting === selected._id + "accept" ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                      Accept
                    </button>
                    <button onClick={() => act(selected._id, "reject")} disabled={!!acting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50">
                      {acting === selected._id + "reject" ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                      Reject
                    </button>
                  </>
                )}
                {selected.status === "confirmed" && (
                  <button onClick={() => act(selected._id, "ready")} disabled={!!acting}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50">
                    {acting === selected._id + "ready" ? <FaSpinner className="animate-spin" /> : <FaClock />}
                    Mark Ready
                  </button>
                )}
                {selected.status === "preparing" && (
                  <button onClick={() => act(selected._id, "pickup")} disabled={!!acting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50">
                    {acting === selected._id + "pickup" ? <FaSpinner className="animate-spin" /> : <FaMotorcycle />}
                    Ready for Pickup
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">Order Items</h3>
              <div className="space-y-3">
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                      item.menuItem?.isVeg !== false ? "border-green-600" : "border-red-600"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${item.menuItem?.isVeg !== false ? "bg-green-600" : "bg-red-600"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.name || item.menuItem?.name}</p>
                      {item.customization && Object.keys(item.customization).length > 0 && (
                        <p className="text-xs text-gray-400">{JSON.stringify(item.customization)}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                    <span className="text-sm font-bold text-gray-700">₹{(item.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
                {[
                  ["Items Total",    `₹${selected.pricing?.itemsTotal || 0}`],
                  ["Delivery Fee",   `₹${selected.pricing?.deliveryFee || 0}`],
                  ["Tax",            `₹${selected.pricing?.tax || 0}`],
                  ["Platform Fee",   `₹${selected.pricing?.platformFee || 0}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm text-gray-500">
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-black text-gray-800 border-t border-gray-100 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-orange-500">₹{selected.pricing?.totalAmount || 0}</span>
                </div>
              </div>
            </div>

            {/* Customer + Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">Customer & Delivery</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Name",    selected.user?.name     || selected.address?.fullName || "—"],
                  ["Phone",   selected.user?.phone    || selected.address?.phone    || "—"],
                  ["Address", `${selected.address?.street || ""} ${selected.address?.city || ""} ${selected.address?.pincode || ""}`],
                  ["Payment", selected.paymentMethod || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-4">
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-700 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
