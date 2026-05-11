// vendor/pages/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/axios';
import { Star, Filter, Search, MessageSquare } from 'lucide-react';
import ReviewCard from '../components/Reviews/ReviewCard';
import ReviewSummary from '../components/Reviews/ReviewSummary';
import ReplyModal from '../components/Reviews/ReplyModal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, average: 0, responded: 0 });

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get('/vendor/reviews');
      
      console.log('Reviews API Response:', response.data);
      
      // Fix: Ensure reviews is an array
      let reviewsData = [];
      if (response.data && Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        reviewsData = response.data.data;
      } else if (response.data && response.data.reviews && Array.isArray(response.data.reviews)) {
        reviewsData = response.data.reviews;
      }
      
      setReviews(reviewsData);
      setStats({
        total: reviewsData.length,
        average: reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / (reviewsData.length || 1),
        responded: reviewsData.filter(r => r.reply).length
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await API.get('/vendor/reviews/summary');
      setSummary(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fix: Ensure reviews is an array before filtering
  const reviewsList = Array.isArray(reviews) ? reviews : [];

  const filteredReviews = reviewsList.filter(review => {
    if (filter === 'positive' && review.rating < 4) return false;
    if (filter === 'neutral' && review.rating !== 3) return false;
    if (filter === 'negative' && review.rating > 2) return false;
    if (filter === 'with_reply' && !review.reply) return false;
    if (filter === 'without_reply' && review.reply) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.comment?.toLowerCase().includes(searchLower) ||
        review.customer?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const filters = [
    { value: 'all', label: 'All Reviews' },
    { value: 'positive', label: 'Positive (4-5★)' },
    { value: 'neutral', label: 'Neutral (3★)' },
    { value: 'negative', label: 'Negative (1-2★)' },
    { value: 'with_reply', label: 'Replied' },
    { value: 'without_reply', label: 'Pending Reply' }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
        <p className="text-gray-500 mt-1">Read and respond to customer feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <MessageSquare size={24} className="text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-gray-800">{stats.average.toFixed(1)}</p>
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <MessageSquare size={24} className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Responded</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.responded}/{stats.total}
              </p>
            </div>
            <MessageSquare size={24} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Review Summary Component */}
      {summary && <ReviewSummary summary={summary} />}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
          <p className="text-gray-500 mt-2">No reviews found</p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-2 text-orange-500 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onReply={(review) => {
                setSelectedReview(review);
                setShowReplyModal(true);
              }}
              onUpdate={() => {
                fetchReviews();
                fetchSummary();
              }}
            />
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <ReplyModal
          review={selectedReview}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          onUpdate={() => {
            fetchReviews();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
};

export default ReviewsPage;