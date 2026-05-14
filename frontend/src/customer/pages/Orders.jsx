// src/customer/pages/Orders.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag, FaMotorcycle, FaTimes, FaRedo, FaSpinner,
  FaStar, FaEdit, FaTrash, FaFilter, FaBell
} from "react-icons/fa";
import { MdRestaurant, MdRefresh } from "react-icons/md";
import API from "../../services/axios";
import { triggerCartUpdate } from "../../services/helpers";
import { getSocket } from "../../services/axios";

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  delivered:        { color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500",  icon: "✅", display: "Delivered"        },
  pending:          { color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200", dot: "bg-yellow-400", icon: "⏳", display: "Pending"           },
  confirmed:        { color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",   icon: "✓",  display: "Confirmed"         },
  preparing:        { color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500", icon: "🍳", display: "Preparing"         },
  "on-the-way":     { color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500", icon: "🚚", display: "On the Way"        },
  on_the_way:       { color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500", icon: "🚚", display: "On the Way"        },
  out_for_delivery: { color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200", dot: "bg-indigo-500", icon: "🛵", display: "Out for Delivery"  },
  cancelled:        { color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500",    icon: "❌", display: "Cancelled"         },
};

const FILTERS = ["All", "Active", "Delivered", "Cancelled"];
const RATING_LABELS = { 1: "Terrible 😤", 2: "Poor 😕", 3: "Okay 😐", 4: "Good 😊", 5: "Excellent 🤩" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeStatus = (s) => s?.toLowerCase().replace(/ /g, "_").replace(/-/g, "_") || "pending";
const getStatusCfg    = (s) => STATUS_CONFIG[normalizeStatus(s)] || STATUS_CONFIG[s?.toLowerCase()] || STATUS_CONFIG.pending;
const isLiveStatus    = (s) => ["confirmed","preparing","on-the-way","on_the_way","out_for_delivery"].includes(normalizeStatus(s));

function formatDate(dateString) {
  const d = new Date(dateString), now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today)     return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (d >= yesterday) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString();
}

// ─── Live status badge (pulses when active) ───────────────────────────────────
function StatusBadge({ status, live }) {
  const s = getStatusCfg(status);
  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
      {live
        ? <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${s.dot}`} />
          </span>
        : <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      }
      {s.display}
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ order, isEditing, existing, onSubmit, onDelete, onClose, submitting }) {
  const [rating,  setRating]  = useState(existing?.rating  || 5);
  const [comment, setComment] = useState(existing?.comment || "");
  const [hover,   setHover]   = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white font-extrabold text-lg">{isEditing ? "Edit Your Review" : "Write a Review"}</h2>
            <p className="text-white/80 text-xs mt-0.5">{order.restaurant}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5">
          {/* Stars */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Rating</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  className="focus:outline-none"
                >
                  <FaStar className={`text-3xl transition-all duration-150 ${s <= (hover || rating) ? "text-yellow-400 scale-110" : "text-gray-200"}`} />
                </button>
              ))}
            </div>
            <p className="text-xs text-orange-500 font-semibold mt-1.5">{RATING_LABELS[rating]}</p>
          </div>

          {/* Comment */}
          <textarea
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this restaurant..."
            className="w-full border border-gray-200 rounded-2xl p-3 text-sm outline-none focus:border-orange-400 transition resize-none mb-3"
          />

          {/* Items preview */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-1.5">Order items:</p>
            {order.items.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-gray-600">· {item.name} × {item.quantity}</p>
            ))}
            {order.items.length > 3 && <p className="text-xs text-gray-400 mt-0.5">+{order.items.length - 3} more</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onSubmit(rating, comment)}
              disabled={submitting || !comment.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : null}
              {submitting ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Update" : "Submit")}
            </button>
            {isEditing && existing && (
              <button
                onClick={() => onDelete(existing.id || existing._id)}
                className="px-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Orders({ setPage }) {
  const navigate = useNavigate();
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [cancellingId,   setCancellingId]   = useState(null);
  const [reorderId,      setReorderId]      = useState(null);
  const [filter,         setFilter]         = useState("All");
  const [notification,   setNotification]   = useState(null);
  const [socketConnected,setSocketConnected]= useState(false);

  // Review state
  const [reviewModal,      setReviewModal]      = useState(null); // { order, isEditing, existing }
  const [submittingReview, setSubmittingReview] = useState(false);

  const socketRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await API.get("/customer/me/orders");
      if (res.data.success) {
        setOrders(res.data.data.map(o => ({
          id: o._id,
          orderId: o.orderId,
          restaurant: o.vendor?.name || "Restaurant",
          restaurantId: o.vendor?._id,
          items: (o.items || []).map(i => ({
            id: i.menuItem?._id,
            name: i.menuItem?.name || "Item",
            quantity: i.quantity,
            price: i.price,
          })),
          total: o.totalAmount,
          status: o.deliveryStatus || o.status,
          date: formatDate(o.createdAt),
          rawDate: o.createdAt,
          address: o.address,
          paymentMethod: o.paymentMethod,
          deliveryPartner: o.deliveryPartner,
          review: o.review || null,
          otp: o.otp,
        })));
      }
    } catch (err) {
      console.error("fetchOrders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onStatusUpdate = (data) => {
      setOrders(prev => prev.map(o => {
        if (o.id !== data.orderId) return o;
        // Toast notification
        const msgs = {
          confirmed:        "✅ Order confirmed!",
          preparing:        "🍳 Restaurant is preparing your food!",
          "on-the-way":     "🚚 Rider is picking up your order!",
          out_for_delivery: "🛵 Your order is out for delivery!",
          delivered:        "🎉 Your order has been delivered!",
        };
        const key = data.status?.toLowerCase().replace(/ /g, "_");
        if (msgs[key] || msgs[data.status?.toLowerCase()]) {
          setNotification(msgs[key] || msgs[data.status?.toLowerCase()]);
          setTimeout(() => setNotification(null), 4000);
        }
        return { ...o, status: data.status };
      }));
    };

    socket.on("connect",           onConnect);
    socket.on("disconnect",        onDisconnect);
    socket.on("orderStatusUpdate", onStatusUpdate);
    setSocketConnected(socket.connected);

    return () => {
      socket.off("connect",           onConnect);
      socket.off("disconnect",        onDisconnect);
      socket.off("orderStatusUpdate", onStatusUpdate);
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const res = await API.post(`/customer/me/orders/${orderId}/cancel`);
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (orderId) => {
    setReorderId(orderId);
    try {
      const res = await API.post(`/customer/me/orders/${orderId}/reorder`);
      if (res.data.success) {
        triggerCartUpdate();
        if (setPage) setPage("cart");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reorder");
    } finally {
      setReorderId(null);
    }
  };

  const handleTrack = (orderId) => {
    navigate(`/customer/order-tracking/${orderId}`);
  };

  // ── Review ────────────────────────────────────────────────────────────────
  const openReview = async (order) => {
    let existing = null;
    try {
      const res = await API.get("/customer/me/reviews");
      if (res.data.success) existing = res.data.data.find(r => r.order === order.id) || null;
    } catch {}
    setReviewModal({ order, isEditing: !!existing, existing });
  };

  const submitReview = async (rating, comment) => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      const { order, isEditing, existing } = reviewModal;
      let res;
      if (isEditing && existing) {
        res = await API.put(`/customer/me/reviews/${existing.id || existing._id}`, { rating, comment });
      } else {
        res = await API.post(`/customer/me/orders/${order.id}/review`, {
          rating, comment,
          restaurantId: order.restaurantId,
          orderId: order.id,
        });
      }
      if (res.data.success) {
        setReviewModal(null);
        fetchOrders(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await API.delete(`/customer/me/reviews/${reviewId}`);
      if (res.data.success) { setReviewModal(null); fetchOrders(true); }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    if (filter === "All")       return true;
    if (filter === "Active")    return isLiveStatus(o.status);
    if (filter === "Delivered") return normalizeStatus(o.status) === "delivered";
    if (filter === "Cancelled") return normalizeStatus(o.status) === "cancelled";
    return true;
  });

  const activeCount = orders.filter(o => isLiveStatus(o.status)).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8 relative">
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 max-w-xs text-center">
          <FaBell className="text-orange-400 shrink-0" />
          {notification}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <FaShoppingBag className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">My Orders</h2>
            {orders.length > 0 && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
            {activeCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping inline-block" />
                {activeCount} live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${socketConnected ? "bg-green-50 text-green-500" : "bg-gray-100 text-gray-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-green-400" : "bg-gray-400"}`} />
              {socketConnected ? "Live" : "Offline"}
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <MdRefresh className={`text-base ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"}`}
              >
                {f}
                {f === "Active" && activeCount > 0 && (
                  <span className="ml-1 bg-white text-orange-500 rounded-full px-1 font-bold">{activeCount}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Empty ────────────────────────────────────────────────────────── */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <FaShoppingBag className="text-5xl text-gray-200 mb-4" />
            <p className="font-semibold text-gray-500">
              {orders.length === 0 ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => setPage && setPage("home")}
                className="mt-4 text-orange-500 text-sm font-semibold hover:underline"
              >
                Browse Restaurants →
              </button>
            )}
          </div>
        )}

        {/* ── Order Cards ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const live         = isLiveStatus(order.status);
            const isCancellable= ["pending","confirmed","preparing"].includes(normalizeStatus(order.status));
            const isTrackable  = ["confirmed","preparing","on-the-way","on_the_way","out_for_delivery"].includes(normalizeStatus(order.status));
            const canReview    = normalizeStatus(order.status) === "delivered" && !order.review;
            const hasReview    = !!order.review;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 ${live ? "border-orange-200 shadow-orange-100 shadow-md" : "border-gray-100"}`}
              >
                {/* Live indicator stripe */}
                {live && <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-yellow-400" />}

                {/* Top row */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <MdRestaurant className="text-orange-500 text-base" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{order.restaurant}</p>
                      <p className="text-[11px] text-gray-400">{order.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} live={live} />
                </div>

                {/* Items + total */}
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Order #{order.orderId || order.id?.slice(-8)}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {order.items.slice(0, 2).map(i => i.name).join(", ")}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-extrabold text-base text-gray-800">₹{order.total}</p>
                    {order.paymentMethod && (
                      <span className="text-xs text-gray-400">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* OTP display for active orders */}
                  {order.otp && isTrackable && (
                    <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center justify-between">
                      <p className="text-xs text-orange-600 font-medium">Delivery OTP</p>
                      <p className="text-base font-black text-orange-600 tracking-widest">{order.otp}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-4 pb-4 flex-wrap">
                  {isTrackable && (
                    <button
                      onClick={() => handleTrack(order.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-100 transition"
                    >
                      <FaMotorcycle /> Track Order
                    </button>
                  )}

                  {isCancellable && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {cancellingId === order.id ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                      Cancel
                    </button>
                  )}

                  {canReview && (
                    <button
                      onClick={() => openReview(order)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-yellow-500 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-xl hover:bg-yellow-100 transition"
                    >
                      <FaStar className="text-[10px]" /> Write a Review
                    </button>
                  )}

                  {hasReview && (
                    <button
                      onClick={() => openReview(order)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-500 bg-green-50 border border-green-200 px-3 py-2 rounded-xl hover:bg-green-100 transition"
                    >
                      <FaEdit className="text-[10px]" /> Edit Review
                    </button>
                  )}

                  <button
                    onClick={() => handleReorder(order.id)}
                    disabled={reorderId === order.id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl hover:bg-orange-100 transition ml-auto disabled:opacity-50"
                  >
                    {reorderId === order.id ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                    Reorder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Review Modal ──────────────────────────────────────────────────── */}
      {reviewModal && (
        <ReviewModal
          order={reviewModal.order}
          isEditing={reviewModal.isEditing}
          existing={reviewModal.existing}
          submitting={submittingReview}
          onSubmit={submitReview}
          onDelete={deleteReview}
          onClose={() => setReviewModal(null)}
        />
      )}
    </div>
  );
}

export default Orders;
