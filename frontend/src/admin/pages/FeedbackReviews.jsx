// FeedbackReviews.jsx
import { useEffect, useState } from "react";
import API from "../../services/axios";
import { Star } from "lucide-react";

export default function FeedbackReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/admin/restaurants");
        setReviews(res.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
        <p className="text-sm text-orange-700 font-medium">
          📝 Reviews are linked to individual restaurants. Select a restaurant to view its reviews. This section shows all restaurants with their ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-gray-500">No restaurants to show</p>
          </div>
        ) : reviews.map(r => (
          <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                {r.name?.[0]?.toUpperCase() || "R"}
              </div>
              <div>
                <p className="font-bold text-gray-800">{r.name || "Restaurant"}</p>
                <p className="text-xs text-gray-400">{Array.isArray(r.cuisine) ? r.cuisine.join(", ") : r.cuisine}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {renderStars(Math.round(r.rating || 0))}
              <span className="text-sm font-bold text-gray-700">{r.rating?.toFixed(1) || "0.0"}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
              {r.reviewCount || 0} reviews
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
