// vendor/components/Reviews/ReplyModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const ReplyModal = ({ review, onClose, onReply }) => {
  const [replyText, setReplyText] = useState(review.reply?.text || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/vendor/reviews/${review._id}/reply`, { reply: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onReply();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold">Reply to Review</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* Original Review */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-1">
              Rating: {review.rating} ★
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="4"
              placeholder="Thank you for your feedback..."
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="flex space-x-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;