// delivery/pages/DeliveryPerformance.jsx
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Crown, 
  Zap, 
  Medal, 
  Loader, 
  CheckCircle, 
  Clock, 
  Target, 
  Sparkles, 
  Trophy,
  User,
  Calendar,
  ChevronRight,
  BarChart3,
  LineChart
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import EarningsChart from '../components/EarningsChart';

const DeliveryPerformance = () => {
  const [stats, setStats] = useState({
    rating: 0,
    completionRate: 0,
    acceptanceRate: 0,
    avgDeliveryTime: 0,
    totalRating: 0,
    reviewCount: 0
  });
  const [reviews, setReviews] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [weeklyPerformance, setWeeklyPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [statsRes, reviewsRes, badgesRes, leaderboardRes, weeklyRes] = await Promise.all([
        API.get('/delivery/performance/stats').catch(() => ({ data: {} })),
        API.get('/delivery/performance/ratings').catch(() => ({ data: {} })),
        API.get('/delivery/performance/badges').catch(() => ({ data: {} })),
        API.get('/delivery/performance/leaderboard').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/weekly').catch(() => ({ data: {} }))
      ]);

      // Extract stats
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        rating: statsData.rating || 0,
        completionRate: statsData.completionRate || 0,
        acceptanceRate: statsData.acceptanceRate || 0,
        avgDeliveryTime: statsData.avgDeliveryTime || 0,
        totalRating: statsData.totalRating || 0,
        reviewCount: statsData.reviewCount || 0
      });

      // Extract reviews
      const reviewsData = reviewsRes.data?.reviews || reviewsRes.data?.data || reviewsRes.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      // Extract badges
      let badgesData = badgesRes.data?.badges || badgesRes.data?.data || badgesRes.data || [];
      if (Array.isArray(badgesData)) {
        if (badgesData.length > 0 && typeof badgesData[0] === 'string') {
          badgesData = badgesData.map((badge, i) => ({
            id: i,
            name: badge,
            earned: true,
            description: getBadgeDescription(badge),
            earnedDate: new Date()
          }));
        }
      }
      setBadges(badgesData);
      setTotalDeliveries(badgesRes.data?.totalDeliveries || 0);

      // Extract leaderboard
      const leaderboardData = leaderboardRes.data?.data || leaderboardRes.data || [];
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      
      // Extract weekly performance
      const weeklyData = weeklyRes.data?.data || weeklyRes.data || [];
      setWeeklyPerformance(Array.isArray(weeklyData) ? weeklyData : []);
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeDescription = (badgeName) => {
    const descriptions = {
      'Rookie Rider': 'Started your journey as a delivery partner',
      'Pro Rider': 'Experienced delivery partner with 50+ deliveries',
      'Elite Rider': 'Top performing delivery partner with 100+ deliveries',
      'Gold Star': 'Maintained 4.8+ rating',
      'Speed Star': 'Fastest delivery times',
      'Perfect Delivery': '100% on-time delivery',
      'Legend': '200+ deliveries completed',
      'Early Bird': 'Completed deliveries before schedule',
      'Night Owl': 'Successfully delivered late night orders',
      'Customer Favorite': 'Received 50+ 5-star ratings'
    };
    return descriptions[badgeName] || 'Achievement unlocked';
  };

  const getBadgeIcon = (badgeName) => {
    const name = String(badgeName || '').toLowerCase();
    
    if (name.includes('rookie')) return <Zap size={20} />;
    if (name.includes('pro')) return <Award size={20} />;
    if (name.includes('elite')) return <Crown size={20} />;
    if (name.includes('gold')) return <Star size={20} />;
    if (name.includes('speed')) return <Trophy size={20} />;
    if (name.includes('perfect')) return <CheckCircle size={20} />;
    if (name.includes('legend')) return <Sparkles size={20} />;
    if (name.includes('early')) return <Calendar size={20} />;
    if (name.includes('night')) return <Clock size={20} />;
    if (name.includes('favorite')) return <Medal size={20} />;
    return <Medal size={20} />;
  };

  const getBadgeColor = (badgeName) => {
    const name = String(badgeName || '').toLowerCase();
    
    if (name.includes('rookie')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('pro')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (name.includes('elite')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (name.includes('gold')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (name.includes('speed')) return 'bg-red-100 text-red-700 border-red-200';
    if (name.includes('perfect')) return 'bg-green-100 text-green-700 border-green-200';
    if (name.includes('legend')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (name.includes('early')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (name.includes('night')) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (name.includes('favorite')) return 'bg-pink-100 text-pink-700 border-pink-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getBadgeProgress = (badgeName) => {
    const name = String(badgeName || '').toLowerCase();
    
    if (name.includes('rookie')) return Math.min(100, (totalDeliveries / 10) * 100);
    if (name.includes('pro')) return Math.min(100, (totalDeliveries / 50) * 100);
    if (name.includes('elite')) return Math.min(100, (totalDeliveries / 100) * 100);
    if (name.includes('legend')) return Math.min(100, (totalDeliveries / 200) * 100);
    return 0;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (distribution[rating]) distribution[rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
        <p className="text-sm text-gray-500 mt-1">Track your delivery performance and achievements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {['overview', 'badges', 'reviews', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize transition ${
              activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Rating"
              value={stats.rating.toFixed(1)}
              icon={Star}
              color="yellow"
              suffix="/5"
              subtitle={`${stats.reviewCount} reviews`}
            />
            
            <StatsCard
              title="Completion Rate"
              value={Math.round(stats.completionRate)}
              icon={CheckCircle}
              color="green"
              suffix="%"
            />
            
            <StatsCard
              title="Acceptance Rate"
              value={Math.round(stats.acceptanceRate)}
              icon={Target}
              color="blue"
              suffix="%"
            />
            
            <StatsCard
              title="Avg Delivery Time"
              value={Math.round(stats.avgDeliveryTime)}
              icon={Clock}
              color="orange"
              suffix=" min"
            />
          </div>

          {/* Weekly Performance Chart */}
          {weeklyPerformance.length > 0 && (
            <div className="mb-8">
              <EarningsChart 
                data={weeklyPerformance}
                title="Weekly Performance Trend"
                type="line"
                height={250}
              />
            </div>
          )}

          {/* Badges Preview */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2">
                <Award size={18} />
                Recent Badges
              </h2>
              <button
                onClick={() => setActiveTab('badges')}
                className="text-sm text-orange-500 hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-4">
              {badges.length === 0 ? (
                <div className="text-center py-6">
                  <Award size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No badges earned yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {badges.slice(0, 6).map((badge, idx) => {
                    const badgeName = typeof badge === 'string' ? badge : badge.name;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getBadgeColor(badgeName)}`}
                      >
                        {getBadgeIcon(badgeName)}
                        <span className="text-sm font-medium">{badgeName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Award size={18} />
              All Badges
              <span className="text-sm text-gray-500 ml-2">
                ({badges.length} earned / 10 total)
              </span>
            </h2>
            {totalDeliveries > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {totalDeliveries} total deliveries completed
              </p>
            )}
          </div>
          <div className="p-4">
            {badges.length === 0 ? (
              <div className="text-center py-12">
                <Award size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No badges earned yet</p>
                <p className="text-sm text-gray-400 mt-1">Complete deliveries to earn badges</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, idx) => {
                  const badgeName = typeof badge === 'string' ? badge : badge.name;
                  const isEarned = typeof badge === 'string' ? true : (badge.earned !== false);
                  const progress = !isEarned ? getBadgeProgress(badgeName) : 100;
                  const earnedDate = badge.earnedDate;
                  
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 transition-all hover:shadow-md ${getBadgeColor(badgeName)} ${!isEarned ? 'opacity-75' : ''}`}
                      onClick={() => setSelectedBadge({ name: badgeName, description: getBadgeDescription(badgeName), earned: isEarned, progress })}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                          {getBadgeIcon(badgeName)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{badgeName}</h3>
                          {earnedDate && (
                            <p className="text-xs opacity-75">
                              Earned {new Date(earnedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs">{getBadgeDescription(badgeName)}</p>
                      {!isEarned && progress > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-current rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="mb-4">
              <div className="text-5xl font-bold text-gray-800">{stats.rating.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 mt-2">
                {renderStars(stats.rating)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Based on {totalReviews} reviews</p>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-2 text-left">
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingDistribution[star];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <div className="w-12 text-sm text-gray-600">{star} ★</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Star size={18} />
                Customer Reviews
                <span className="text-sm text-gray-500">({reviews.length})</span>
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {reviews.length === 0 ? (
                <div className="p-8 text-center">
                  <Star size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">Complete deliveries to get feedback</p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <div key={review._id || idx} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.user?.name || 'Customer'}</p>
                          <div className="flex gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mt-2">{review.comment || 'No comment provided'}</p>
                    {review.orderId && (
                      <p className="text-xs text-gray-400 mt-2">Order #{review.orderId}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp size={18} />
              Top Performers
            </h2>
          </div>
          <div className="divide-y">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No data available</p>
                <p className="text-sm text-gray-400 mt-1">Complete deliveries to see rankings</p>
              </div>
            ) : (
              leaderboard.map((agent, idx) => (
                <div key={agent._id || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{agent.agent?.name || agent.name || 'Delivery Partner'}</p>
                      {idx === 0 && <Crown size={16} className="text-yellow-500" />}
                    </div>
                    <p className="text-sm text-gray-500">
                      {agent.totalDeliveries || agent.deliveries || 0} deliveries completed
                    </p>
                  </div>
                  {agent.rating && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{agent.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPerformance;