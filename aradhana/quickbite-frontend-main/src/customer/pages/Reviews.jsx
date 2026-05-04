import { useState } from "react";
import { FaStar, FaTrash, FaEdit, FaCheck } from "react-icons/fa";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}>
          <FaStar className={`text-xl transition ${s <= (hover || value) ? "text-yellow-400" : "text-gray-200"}`} />
        </button>
      ))}
    </div>
  );
}

const ratingLabel = { 1: "Terrible 😤", 2: "Poor 😕", 3: "Okay 😐", 4: "Good 😊", 5: "Excellent 🤩" };

function Reviews() {
  const [reviews, setReviews] = useState([
    { id: 1, restaurant: "Spice Kitchen", text: "Amazing paneer dishes! The dal makhani was superb.", rating: 5, date: "Apr 28, 2026" },
    { id: 2, restaurant: "Biryani Hub",   text: "Good biryani but delivery was a bit late.",          rating: 3, date: "Apr 25, 2026" },
  ]);
  const [restaurant, setRestaurant] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  const addReview = () => {
    if (!text.trim()) return;
    setReviews([{ id: Date.now(), restaurant: restaurant || "Restaurant", text, rating, date: "Today" }, ...reviews]);
    setText(""); setRestaurant(""); setRating(5);
  };

  const deleteReview = (id) => setReviews((prev) => prev.filter((r) => r.id !== id));
  const startEdit = (r) => { setEditId(r.id); setEditText(r.text); setEditRating(r.rating); };
  const saveEdit = (id) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, text: editText, rating: editRating } : r));
    setEditId(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        <div className="flex items-center gap-2 mb-5">
          <FaStar className="text-yellow-400" />
          <h2 className="text-xl font-extrabold text-gray-800">My Reviews</h2>
        </div>

        {/* ADD REVIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Write a Review</h3>
          <input placeholder="Restaurant name" value={restaurant} onChange={(e) => setRestaurant(e.target.value)}
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition mb-2" />
          <textarea rows={3} placeholder="Share your experience..." value={text} onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <StarPicker value={rating} onChange={setRating} />
              <p className="text-xs text-gray-400 mt-1">{ratingLabel[rating]}</p>
            </div>
            <button onClick={addReview}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
              Submit
            </button>
          </div>
        </div>

        {/* REVIEWS LIST */}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {editId === r.id ? (
                <>
                  <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-orange-300 p-2.5 rounded-xl text-sm outline-none resize-none mb-2" />
                  <div className="flex items-center justify-between">
                    <StarPicker value={editRating} onChange={setEditRating} />
                    <button onClick={() => saveEdit(r.id)}
                      className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold">
                      <FaCheck className="text-[10px]" /> Save
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
                    <button onClick={() => startEdit(r)}
                      className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-semibold">
                      <FaEdit className="text-[10px]" /> Edit
                    </button>
                    <button onClick={() => deleteReview(r.id)}
                      className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold">
                      <FaTrash className="text-[10px]" /> Delete
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