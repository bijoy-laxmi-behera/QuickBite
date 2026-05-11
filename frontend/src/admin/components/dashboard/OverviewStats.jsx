import React from 'react';
import { 
  ShoppingBag, Users, Store, DollarSign, TrendingUp, TrendingDown,
  Package, Clock, CheckCircle, AlertCircle, Star, Truck
} from 'lucide-react';

const OverviewStats = ({ data, loading }) => {
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue || 0),
      change: '+15.3%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Total Users',
      value: data?.totalUsers || 0,
      change: '+12.5%',
      isPositive: true,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Active Restaurants',
      value: data?.activeRestaurants || data?.totalRestaurants || 0,
      change: '+5.8%',
      isPositive: true,
      icon: Store,
      color: 'bg-orange-100 text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Pending Orders',
      value: data?.pendingOrders || 0,
      change: '-2.3%',
      isPositive: false,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Delivery Agents',
      value: data?.totalAgents || 0,
      change: '+3.1%',
      isPositive: true,
      icon: Truck,
      color: 'bg-teal-100 text-teal-600',
      borderColor: 'border-teal-200',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-bold mt-1 text-gray-800">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.isPositive ? (
                      <TrendingUp size={12} className="text-green-500" />
                    ) : (
                      <TrendingDown size={12} className="text-red-500" />
                    )}
                    <span className={`text-xs ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs opacity-90">Avg Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(data?.avgOrderValue || 0)}</p>
            </div>
            <Package size={24} className="opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">↑ 2.1% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs opacity-90">Completion Rate</p>
              <p className="text-2xl font-bold">{data?.completionRate || 94.5}%</p>
            </div>
            <CheckCircle size={24} className="opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">↑ 3.2% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs opacity-90">Customer Satisfaction</p>
              <p className="text-2xl font-bold">{data?.satisfactionRating || 4.6} / 5</p>
            </div>
            <Star size={24} className="opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">Based on {data?.totalReviews || 0} reviews</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs opacity-90">Active Now</p>
              <p className="text-2xl font-bold">{data?.activeNow || 0}</p>
            </div>
            <AlertCircle size={24} className="opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">Users currently online</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;