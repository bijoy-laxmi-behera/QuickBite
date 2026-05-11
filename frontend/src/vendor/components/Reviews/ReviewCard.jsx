// vendor/components/Reviews/ReviewCard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Star,
  Star as StarOutline,
  User,
  Calendar,
  MessageSquare,
  Edit2,
  Check,
  X,
  ThumbsUp,
  Flag,
  Reply
} from 'lucide-react';

const ReviewCard = ({ review, onReply, onEditReply, onDeleteReply, onUpdate }) => {
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState(review.reply?.text || '');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return reviewDate.toLocaleDateString();
  };

  const handleSaveEditReply = async () => {
    if (!editReplyText.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/vendor/reviews/${review._id}/reply`, { reply: editReplyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditingReply(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving reply:', error);
      alert('Failed to save reply');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!confirm('Are you sure you want to delete your reply?')) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vendor/reviews/${review._id}/reply`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    } finally {
      setSaving(false);
    }
  };

  const getSentiment = (rating) => {
    if (rating >= 4) return { label: 'Positive', color: 'text-green-600', bg: 'bg-green-100' };
    if (rating >= 3) return { label: 'Neutral', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Negative', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const sentiment = getSentiment(review.rating);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="p-5 border-b bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
              {review.customer?.name?.[0] || 'U'}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-800">
                  {review.customer?.name || 'Anonymous Customer'}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${sentiment.bg} ${sentiment.color}`}>
                  {sentiment.label}
                </span>
              </div>
              
              {/* Rating Stars */}
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= review.rating ? (
                    <Star key={star} size={14} className="fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOutline key={star} size={14} className="text-gray-300" />
                  )
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Item Tag */}
          {review.orderItem && (
            <div className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
              {review.orderItem.name}
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="p-5">
        {/* Review Comment */}
        {review.comment ? (
          <p className={`text-gray-700 ${!expanded && review.comment.length > 200 ? 'line-clamp-3' : ''}`}>
            {review.comment}
          </p>
        ) : (
          <p className="text-gray-400 italic">No comment provided</p>
        )}
        
        {review.comment && review.comment.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-orange-500 text-sm mt-2 hover:text-orange-600"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {review.images.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Review ${idx + 1}`}
                className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
            {review.images.length > 3 && (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                +{review.images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Helpful Count */}
        {review.helpfulCount > 0 && (
          <div className="flex items-center space-x-1 mt-3 text-xs text-gray-400">
            <ThumbsUp size={12} />
            <span>{review.helpfulCount} people found this helpful</span>
          </div>
        )}
      </div>

      {/* Reply Section */}
      <div className="px-5 pb-5">
        {review.reply ? (
          <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2 mb-2">
                <Reply size={14} className="text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Your Reply</span>
                <span className="text-xs text-gray-400">
                  {new Date(review.reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditReplyText(review.reply.text);
                    setIsEditingReply(true);
                  }}
                  className="p-1 text-gray-400 hover:text-orange-600 rounded"
                  title="Edit reply"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={handleDeleteReply}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete reply"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {isEditingReply ? (
              <div className="mt-2">
                <textarea
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Write your reply..."
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleSaveEditReply}
                    disabled={saving}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 flex items-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditingReply(false)}
                    className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm mt-1">{review.reply.text}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => onReply(review)}
            className="text-orange-500 text-sm hover:text-orange-600 flex items-center space-x-1"
          >
            <MessageSquare size={14} />
            <span>Reply to this review</span>
          </button>
        )}
      </div>

      {/* Footer - Report */}
      <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center">
        <button
          onClick={() => {
            if (confirm('Report this review as inappropriate?')) {
              // API call to report review
              alert('Review reported to admin');
            }
          }}
          className="text-gray-400 text-xs hover:text-red-500 flex items-center space-x-1"
        >
          <Flag size={12} />
          <span>Report</span>
        </button>
        
        {review.isVerifiedPurchase && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            Verified Purchase
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;