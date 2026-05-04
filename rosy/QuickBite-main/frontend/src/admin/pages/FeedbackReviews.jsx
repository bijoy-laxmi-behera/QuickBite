import { useState } from "react";

const initialFeedback = [
  { id: 1, user: "Anjali Sharma", meal: "Grilled Chicken Bowl", vendor: "Spice Garden", rating: 5, comment: "Absolutely delicious! Perfectly grilled and super fresh. Will definitely order again.", date: "Jan 13, 2025", status: "published" },
  { id: 2, user: "Sneha Roy", meal: "Fruit & Nut Salad", vendor: "GreenLeaf", rating: 4, comment: "Healthy and tasty. The portion size could be a little bigger for the price.", date: "Jan 13, 2025", status: "published" },
  { id: 3, user: "Ritu Patel", meal: "Egg Fried Rice", vendor: "GreenLeaf", rating: 2, comment: "The rice was cold on arrival. Very disappointed. Expected better quality.", date: "Jan 12, 2025", status: "flagged" },
  { id: 4, user: "Amit Kumar", meal: "Paneer Butter Masala", vendor: "Spice Garden", rating: 5, comment: "Best paneer I've ever had outside of a restaurant. Creamy and rich.", date: "Jan 12, 2025", status: "published" },
  { id: 5, user: "Divya Nair", meal: "Veg Thali Combo", vendor: "Desi Dhaba", rating: 3, comment: "Decent thali but the roti was hard. Overall okay experience.", date: "Jan 11, 2025", status: "published" },
  { id: 6, user: "Rohit Jha", meal: "Grilled Chicken Bowl", vendor: "Spice Garden", rating: 1, comment: "Found a hair in my food. This is absolutely unacceptable!", date: "Jan 11, 2025", status: "flagged" },
];

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
const starColor = (n) => n >= 4 ? "text-green-500" : n === 3 ? "text-yellow-500" : "text-red-500";

const avgRating = (items) =>
  items.length ? (items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1) : "—";

export default function FeedbackReviews() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filtered = feedback.filter((f) => {
    const matchStatus = filter === "all" || f.status === filter;
    const matchRating = ratingFilter === "all" || f.rating === Number(ratingFilter);
    return matchStatus && matchRating;
  });

  const updateStatus = (id, status) => {
    setFeedback((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
  };

  const remove = (id) => setFeedback((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Feedback & Reviews</h2>
        <p className="text-gray-500 text-sm mt-1">
          {feedback.filter(f => f.status === "flagged").length} flagged reviews need attention
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: feedback.length },
          { label: "Avg Rating", value: `⭐ ${avgRating(feedback)}` },
          { label: "Flagged", value: feedback.filter(f => f.status === "flagged").length },
          { label: "Published", value: feedback.filter(f => f.status === "published").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {["all", "published", "flagged"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === s ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "flagged" ? "🚩 Flagged" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none">
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {filtered.map((f) => (
          <div key={f.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
            f.status === "flagged" ? "border-red-200 bg-red-50/30" : "border-gray-100"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {f.user[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.user}</p>
                  <p className="text-xs text-gray-400">{f.meal} · {f.vendor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {f.status === "flagged" && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">🚩 Flagged</span>
                )}
                <span className="text-xs text-gray-400">{f.date}</span>
              </div>
            </div>

            <p className={`text-base font-bold mb-1 ${starColor(f.rating)}`}>{stars(f.rating)}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{f.comment}</p>

            <div className="flex gap-2">
              {f.status === "flagged" && (
                <button onClick={() => updateStatus(f.id, "published")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                  ✓ Approve
                </button>
              )}
              {f.status === "published" && (
                <button onClick={() => updateStatus(f.id, "flagged")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors">
                  🚩 Flag
                </button>
              )}
              <button onClick={() => remove(f.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                🗑 Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No reviews found.</div>
      )}
    </div>
  );
}