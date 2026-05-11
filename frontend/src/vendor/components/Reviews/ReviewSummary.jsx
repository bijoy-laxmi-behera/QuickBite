// vendor/components/Reviews/ReviewSummary.jsx
import React from 'react';
import { Star, Star as StarOutline, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ReviewSummary = ({ summary }) => {
  // Handle null/undefined summary
  if (!summary) return null;

  // Safely extract values with fallbacks
  const averageRating = typeof summary.averageRating === 'number' 
    ? summary.averageRating 
    : (typeof summary.avgRating === 'number' ? summary.avgRating : 0);
  
  const totalReviews = typeof summary.totalReviews === 'number' 
    ? summary.totalReviews 
    : (typeof summary.total === 'number' ? summary.total : 0);
  
  const ratingBreakdown = summary.distribution || summary.ratingBreakdown || {};
  const withComment = summary.withComment || 0;
  const withImages = summary.withImages || 0;
  const ratingChange = summary.ratingChange || 0;

  // If no reviews, show empty state
  if (totalReviews === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Review Summary</h3>
          <p className="text-sm text-gray-500">Customer feedback overview</p>
        </div>
        <div className="p-12 text-center">
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Reviews will appear here once customers leave feedback</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp size={14} className="text-green-500" />;
    if (change < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const ratingDistribution = [
    { stars: 5, label: 'Excellent', color: 'bg-green-500' },
    { stars: 4, label: 'Good', color: 'bg-blue-500' },
    { stars: 3, label: 'Average', color: 'bg-yellow-500' },
    { stars: 2, label: 'Poor', color: 'bg-orange-500' },
    { stars: 1, label: 'Terrible', color: 'bg-red-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Review Summary</h3>
        <p className="text-sm text-gray-500">Customer feedback overview</p>
      </div>

      <div className="p-5">
        {/* Overall Rating */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                star <= Math.round(averageRating) ? (
                  <Star key={star} size={18} className="fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOutline key={star} size={18} className="text-gray-300" />
                )
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="space-y-2">
              {ratingDistribution.map((rating) => {
                const count = ratingBreakdown[rating.stars] || 0;
                const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating.stars} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600">{rating.label}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${rating.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{totalReviews}</p>
            <p className="text-xs text-gray-500">Total Reviews</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{withComment}</p>
            <p className="text-xs text-gray-500">With Comments</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{withImages}</p>
            <p className="text-xs text-gray-500">With Images</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              {getTrendIcon(ratingChange)}
              <p className="text-2xl font-bold text-gray-800">
                {ratingChange > 0 ? '+' : ''}{ratingChange}%
              </p>
            </div>
            <p className="text-xs text-gray-500">vs Last Month</p>
          </div>
        </div>

        {/* Sentiment Analysis - only if data exists */}
        {summary.sentiment && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Sentiment Analysis</h4>
            <div className="flex space-x-2">
              <div className="flex-1 bg-green-100 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-600">{summary.sentiment.positive || 0}%</p>
                <p className="text-xs text-green-600">Positive</p>
              </div>
              <div className="flex-1 bg-yellow-100 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-yellow-600">{summary.sentiment.neutral || 0}%</p>
                <p className="text-xs text-yellow-600">Neutral</p>
              </div>
              <div className="flex-1 bg-red-100 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-red-600">{summary.sentiment.negative || 0}%</p>
                <p className="text-xs text-red-600">Negative</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSummary;