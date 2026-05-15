// src/vendor/pages/Reviews.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaStar, FaSpinner, FaReply } from "react-icons/fa";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    try {
      const [r, s] = await Promise.all([API.get("/vendor/reviews"), API.get("/vendor/reviews/summary")]);
      setReviews(r.data.data || []);
      setSummary(s.data.data || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const sendReply = async (id) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await API.post(`/vendor/reviews/${id}/reply`, { reply: replyText });
      setReplyId(null); setReplyText("");
      fetchAll();
    } catch (e) { alert(e.response?.data?.message || "Failed to reply"); }
    setSending(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-black text-gray-800">Reviews</h1>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-black text-gray-800">{summary.avgRating?.toFixed(1) || "—"}</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-sm ${s <= Math.round(summary.avgRating||0) ? "text-yellow-400" : "text-gray-200"}`} />)}
            </div>
            <p className="text-xs text-gray-400 mt-1">{summary.totalReviews || 0} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(star => {
              const count = summary.distribution?.[star] || 0;
              const pct   = summary.totalReviews ? Math.round(count/summary.totalReviews*100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-gray-500 font-semibold">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width:`${pct}%` }} />
                  </div>
                  <span className="w-8 text-gray-400 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-orange-500 text-2xl" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-gray-400 font-medium">No reviews yet</p>
        </div>
      ) : reviews.map(r => (
        <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-500">
                {(r.user?.name || "C")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{r.user?.name || "Customer"}</p>
                <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-sm ${s<=r.rating?"text-yellow-400":"text-gray-200"}`} />)}
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>

          {/* Existing reply */}
          {r.reply && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-xs font-bold text-orange-600 mb-1">Your Reply</p>
              <p className="text-sm text-gray-600">{r.reply}</p>
            </div>
          )}

          {/* Reply box */}
          {replyId === r._id ? (
            <div className="space-y-2">
              <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
              <div className="flex gap-2">
                <button onClick={() => sendReply(r._id)} disabled={sending}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1">
                  {sending ? <FaSpinner className="animate-spin" /> : null} Send
                </button>
                <button onClick={() => { setReplyId(null); setReplyText(""); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setReplyId(r._id); setReplyText(r.reply || ""); }}
              className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold hover:underline">
              <FaReply className="text-[10px]" /> {r.reply ? "Edit Reply" : "Reply"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
