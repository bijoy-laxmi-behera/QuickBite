// vendor/components/Reviews/ReviewsList.jsx
import React from 'react';
import { Star, Star as StarOutline, MessageSquare, Edit2 } from 'lucide-react';

const ReviewsList = ({ reviews, onReply, onEditReply }) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
        <p className="text-gray-500 mt-2">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {review.customer?.name?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.customer?.name || 'Anonymous'}
                  </p>
                  <div className="flex items-center mt-1">
                    {[1,2,3,4,5].map(star => (
                      star <= review.rating ? (
                        <Star key={star} size={14} className="fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOutline key={star} size={14} className="text-gray-300" />
                      )
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {review.orderItem && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {review.orderItem.name}
              </span>
            )}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-3 text-gray-700">{review.comment}</p>
          )}

          {/* Reply Section */}
          {review.reply ? (
            <div className="mt-4 pl-4 border-l-2 border-orange-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-orange-600">Your Reply</p>
                  <p className="text-sm text-gray-600 mt-1">{review.reply.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.reply.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onEditReply(review._id, review.reply.text)}
                  className="p-1 text-gray-400 hover:text-orange-600"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onReply(review)}
              className="mt-4 text-orange-500 text-sm hover:text-orange-600 flex items-center space-x-1"
            >
              <MessageSquare size={14} />
              <span>Reply to Review</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;