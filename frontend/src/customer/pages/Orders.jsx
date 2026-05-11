import { useState, useEffect } from "react";
import { FaShoppingBag, FaMotorcycle, FaTimes, FaRedo, FaSpinner, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import API from "../../services/axios";
import { triggerCartUpdate } from "../../services/helpers";
import { getSocket } from "../../services/axios";

const statusConfig = {
  delivered:  { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500",  icon: "✅", display: "Delivered" },
  pending:    { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500", icon: "⏳", display: "Pending" },
  confirmed:  { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   icon: "✓", display: "Confirmed" },
  preparing:  { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", icon: "🍳", display: "Preparing" },
  "on-the-way": { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500", icon: "🚚", display: "On the Way" },
  out_for_delivery: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500", icon: "🛵", display: "Out for Delivery" },
  cancelled:  { color: "text-red-500",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    icon: "❌", display: "Cancelled" },
};

function Orders({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [reorderId, setReorderId] = useState(null);
  
  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get("/customer/me/orders");
      
      if (response.data.success) {
        const transformedOrders = response.data.data.map((order) => ({
          id: order._id,
          orderId: order.orderId,
          restaurant: order.vendor?.name || "Restaurant",
          restaurantId: order.vendor?._id,
          items: order.items.map(item => ({
            id: item.menuItem?._id,
            name: item.menuItem?.name || "Item",
            quantity: item.quantity,
            price: item.price
          })),
          total: order.totalAmount,
          status: order.deliveryStatus || order.status,
          date: formatDate(order.createdAt),
          rawDate: order.createdAt,
          address: order.address,
          paymentMethod: order.paymentMethod,
          deliveryPartner: order.deliveryPartner,
          review: order.review || null // Check if already reviewed
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString();
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingId(orderId);
    try {
      const response = await API.post(`/customer/me/orders/${orderId}/cancel`);
      
      if (response.data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: "cancelled" }
            : order
        ));
        alert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to reorder");
      window.location.href = "/login";
      return;
    }

    setReorderId(orderId);
    try {
      const response = await API.post(`/customer/me/orders/${orderId}/reorder`);
      
      if (response.data.success) {
        alert("Items added to cart! 🛒");
        triggerCartUpdate();
        if (setPage) setPage("cart");
      }
    } catch (error) {
      console.error("Error reordering:", error);
      alert(error.response?.data?.message || "Failed to add items to cart");
    } finally {
      setReorderId(null);
    }
  };

  const handleTrackOrder = (orderId) => {
    if (setPage) {
      setPage("tracking");
      localStorage.setItem("trackingOrderId", orderId);
    }
  };

  // Open review modal for an order
  const openReviewModal = async (order) => {
    setSelectedOrder(order);
    setReviewRating(5);
    setReviewComment("");
    setIsEditingReview(false);
    
    // Check if already reviewed
    try {
      const response = await API.get("/customer/me/reviews");
      if (response.data.success) {
        const existing = response.data.data.find(r => r.order === order.id);
        if (existing) {
          setExistingReview(existing);
          setReviewRating(existing.rating);
          setReviewComment(existing.comment);
          setIsEditingReview(true);
        } else {
          setExistingReview(null);
        }
      }
    } catch (error) {
      console.error("Error checking existing review:", error);
    }
    
    setShowReviewModal(true);
  };

  // Submit or update review
  const submitReview = async () => {
    if (!reviewComment.trim()) {
      alert("Please write a review comment");
      return;
    }

    setSubmittingReview(true);
    
    try {
      let response;
      if (isEditingReview && existingReview) {
        // Update existing review
        response = await API.put(`/customer/me/reviews/${existingReview.id}`, {
          rating: reviewRating,
          comment: reviewComment
        });
      } else {
        // Create new review
        response = await API.post(`/customer/me/orders/${selectedOrder.id}/review`, {
          rating: reviewRating,
          comment: reviewComment,
          restaurantId: selectedOrder.restaurantId,
          orderId: selectedOrder.id
        });
      }
      
      if (response.data.success) {
        alert(isEditingReview ? "Review updated successfully!" : "Review submitted successfully!");
        setShowReviewModal(false);
        fetchOrders(); // Refresh orders to show review status
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const response = await API.delete(`/customer/me/reviews/${reviewId}`);
      if (response.data.success) {
        alert("Review deleted successfully");
        setShowReviewModal(false);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Failed to delete review");
    }
  };

  const ratingLabels = { 1: "Terrible 😤", 2: "Poor 😕", 3: "Okay 😐", 4: "Good 😊", 5: "Excellent 🤩" };

  const getStatusConfig = (status) => {
    const key = status?.toLowerCase().replace(/ /g, '_');
    return statusConfig[key] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 mb-5">
            <FaShoppingBag className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">My Orders</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            <span className="ml-2 text-gray-500">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-4">

        <div className="flex items-center gap-2 mb-5">
          <FaShoppingBag className="text-orange-500" />
          <h2 className="text-xl font-extrabold text-gray-800">My Orders</h2>
          {orders.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <FaShoppingBag className="text-5xl text-gray-200 mb-4" />
            <p className="font-semibold text-gray-500">No orders yet</p>
            <button 
              onClick={() => setPage && setPage("home")}
              className="mt-4 text-orange-500 text-sm font-semibold hover:underline"
            >
              Browse Restaurants →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = getStatusConfig(order.status);
              const isCancellable = ["pending", "confirmed", "preparing"].includes(order.status?.toLowerCase());
              const isTrackable = ["confirmed", "preparing", "on-the-way", "out_for_delivery"].includes(order.status?.toLowerCase());
              const canReview = order.status?.toLowerCase() === "delivered" && !order.review;
              const hasReview = order.review;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* TOP */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <MdRestaurant className="text-orange-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{order.restaurant}</p>
                        <p className="text-[11px] text-gray-400">{order.date}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.display}
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Order #{order.orderId || order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.slice(0, 2).map(i => i.name).join(", ")}
                      {order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                    <p className="font-extrabold text-base text-gray-800 mt-1">₹{order.total}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 px-4 pb-4 flex-wrap">
                    {isTrackable && (
                      <button 
                        onClick={() => handleTrackOrder(order.id)}
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
                        {cancellingId === order.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Cancel
                      </button>
                    )}

                    {/* REVIEW BUTTON - Only for delivered orders without review */}
                    {canReview && (
                      <button 
                        onClick={() => openReviewModal(order)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-yellow-500 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-xl hover:bg-yellow-100 transition"
                      >
                        <FaStar className="text-[10px]" /> Write a Review
                      </button>
                    )}

                    {/* EDIT REVIEW BUTTON - If already reviewed */}
                    {hasReview && (
                      <button 
                        onClick={() => openReviewModal(order)}
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
                      {reorderId === order.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaRedo />
                      )}
                      Reorder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditingReview ? "Edit Your Review" : "Write a Review"}
              </h2>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {selectedOrder.restaurant}
            </p>

            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <FaStar 
                      className={`text-2xl transition ${
                        star <= (reviewHover || reviewRating) 
                          ? "text-yellow-400" 
                          : "text-gray-200"
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{ratingLabels[reviewRating]}</p>
            </div>

            {/* Review Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this restaurant..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition resize-none"
              />
            </div>

            {/* Order Items Preview */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">Order Items:</p>
              <div className="space-y-1">
                {selectedOrder.items.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    • {item.name} × {item.quantity}
                  </p>
                ))}
                {selectedOrder.items.length > 3 && (
                  <p className="text-xs text-gray-400">+{selectedOrder.items.length - 3} more items</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? <FaSpinner className="animate-spin" /> : null}
                {submittingReview ? (isEditingReview ? "Updating..." : "Submitting...") : (isEditingReview ? "Update Review" : "Submit Review")}
              </button>
              
              {isEditingReview && existingReview && (
                <button
                  onClick={() => deleteReview(existingReview.id)}
                  className="px-4 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <FaTrash className="text-xs" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;