import { useState, useEffect } from "react";
import { FaStar, FaTrash, FaEdit, FaCheck, FaSpinner } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button 
          key={s} 
          type="button"
          onMouseEnter={() => setHover(s)} 
          onMouseLeave={() => setHover(0)} 
          onClick={() => onChange(s)}
        >
          <FaStar className={`text-xl transition ${s <= (hover || value) ? "text-yellow-400" : "text-gray-200"}`} />
        </button>
      ))}
    </div>
  );
}

const ratingLabel = { 1: "Terrible 😤", 2: "Poor 😕", 3: "Okay 😐", 4: "Good 😊", 5: "Excellent 🤩" };

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // ADDED: Fetch user's reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get("/customer/me/reviews");
        
        if (response.data.success) {
          const transformedReviews = response.data.data.map((review) => ({
            id: review._id,
            _id: review._id,
            restaurant: review.restaurant?.name || "Restaurant",
            restaurantId: review.restaurant?._id,
            text: review.comment || "",
            rating: review.rating,
            date: formatDate(review.createdAt),
            orderId: review.order,
            menuItem: review.menuItem?.name,
            isAnonymous: review.isAnonymous
          }));
          setReviews(transformedReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // ADDED: Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // ADDED: Add review to backend
  const addReview = async () => {
    if (!text.trim()) {
      alert("Please write a review");
      return;
    }
    if (!restaurant.trim()) {
      alert("Please enter restaurant name");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to submit a review");
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post("/customer/me/reviews", {
        rating: rating,
        comment: text,
        restaurantName: restaurant,
        isAnonymous: false
      });

      if (response.data.success) {
        const newReview = {
          id: response.data.data._id,
          _id: response.data.data._id,
          restaurant: restaurant,
          text: text,
          rating: rating,
          date: "Today",
          orderId: response.data.data.order
        };
        setReviews([newReview, ...reviews]);
        setText("");
        setRestaurant("");
        setRating(5);
        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // ADDED: Delete review from backend
  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(id);
    try {
      const response = await API.delete(`/customer/me/reviews/${id}`);
      
      if (response.data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id && r._id !== id));
        alert("Review deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  // ADDED: Update review in backend
  const updateReview = async (id, updatedText, updatedRating) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setEditingId(id);
    try {
      const response = await API.put(`/customer/me/reviews/${id}`, {
        rating: updatedRating,
        comment: updatedText
      });

      if (response.data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id || r._id === id
              ? { ...r, text: updatedText, rating: updatedRating }
              : r
          )
        );
        alert("Review updated successfully");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert(error.response?.data?.message || "Failed to update review");
    } finally {
      setEditingId(null);
    }
  };

  // ADDED: Start edit mode
  const startEdit = (review) => {
    setEditId(review.id || review._id);
    setEditText(review.text);
    setEditRating(review.rating);
  };

  // ADDED: Save edit
  const saveEdit = (id) => {
    updateReview(id, editText, editRating);
    setEditId(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 mb-5">
            <FaStar className="text-yellow-400" />
            <h2 className="text-xl font-extrabold text-gray-800">My Reviews</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            <span className="ml-2 text-gray-500">Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        <div className="flex items-center gap-2 mb-5">
          <FaStar className="text-yellow-400" />
          <h2 className="text-xl font-extrabold text-gray-800">My Reviews</h2>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {reviews.length}
          </span>
        </div>

        {/* ADD REVIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Write a Review</h3>
          <input 
            placeholder="Restaurant name" 
            value={restaurant} 
            onChange={(e) => setRestaurant(e.target.value)}
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition mb-2" 
          />
          <textarea 
            rows={3} 
            placeholder="Share your experience..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none mb-3" 
          />
          <div className="flex items-center justify-between">
            <div>
              <StarPicker value={rating} onChange={setRating} />
              <p className="text-xs text-gray-400 mt-1">{ratingLabel[rating]}</p>
            </div>
            <button 
              onClick={addReview}
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <FaStar className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-300 mt-1">Share your experience with restaurants</p>
          </div>
        )}

        {/* REVIEWS LIST */}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id || r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {editId === (r.id || r._id) ? (
                <>
                  <textarea 
                    rows={2} 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-orange-300 p-2.5 rounded-xl text-sm outline-none resize-none mb-2" 
                  />
                  <div className="flex items-center justify-between">
                    <StarPicker value={editRating} onChange={setEditRating} />
                    <button 
                      onClick={() => saveEdit(r.id || r._id)}
                      disabled={editingId === (r.id || r._id)}
                      className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold disabled:opacity-50"
                    >
                      {editingId === (r.id || r._id) ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck className="text-[10px]" />
                      )}
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{r.restaurant}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <FaStar key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.text}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(r)}
                      className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-semibold"
                    >
                      <FaEdit className="text-[10px]" /> Edit
                    </button>
                    <button 
                      onClick={() => deleteReview(r.id || r._id)}
                      disabled={deletingId === (r.id || r._id)}
                      className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold disabled:opacity-50"
                    >
                      {deletingId === (r.id || r._id) ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash className="text-[10px]" />
                      )}
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reviews;