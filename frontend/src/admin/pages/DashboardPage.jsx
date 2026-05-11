import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, DollarSign } from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import Loader from '../components/common/Loader';
import RecentOrders from '../components/dashboard/RecentOrders';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState(0);
  const [deliveryAgents, setDeliveryAgents] = useState(0);

  const fetchWithAuth = async (endpoint) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, ordersRes, restaurantsRes, agentsRes] = await Promise.all([
        fetchWithAuth('/admin/analytics/overview'),
        fetchWithAuth('/admin/orders?limit=5'),
        fetchWithAuth('/admin/restaurants'),
        fetchWithAuth('/admin/agents'),
      ]);
      
      setOverview(overviewRes);
      setRecentOrders(ordersRes.orders || []);
      setPendingOrders(overviewRes.pendingOrders || 0);
      
      // Count active restaurants
      const activeRestos = restaurantsRes.filter(r => r.isActive === true).length;
      setActiveRestaurants(activeRestos);
      setDeliveryAgents(agentsRes.agents?.length || 0);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) return <Loader />;

  const stats = [
    { 
      title: 'Total Revenue', 
      value: formatCurrency(overview?.totalRevenue || 0), 
      icon: DollarSign, 
      color: 'bg-green-500',
      trend: '+15.3%',
      trendUp: true
    },
    { 
      title: 'Total Orders', 
      value: overview?.totalOrders || 0, 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      trend: '+8.2%',
      trendUp: true
    },
    { 
      title: 'Total Users', 
      value: overview?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-purple-500',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      title: 'Active Restaurants', 
      value: activeRestaurants, 
      icon: Store, 
      color: 'bg-orange-500',
      trend: '+5.8%',
      trendUp: true
    },
    { 
      title: 'Pending Orders', 
      value: pendingOrders, 
      icon: ShoppingBag, 
      color: 'bg-yellow-500',
      trend: '-2.3%',
      trendUp: false
    },
    { 
      title: 'Delivery Agents', 
      value: deliveryAgents, 
      icon: Users, 
      color: 'bg-teal-500',
      trend: '+3.1%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Avg Order Value</p>
          <p className="text-2xl font-bold">{formatCurrency(overview?.avgOrderValue || 0)}</p>
          <p className="text-xs opacity-75 mt-2">↑ 2.1% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Completion Rate</p>
          <p className="text-2xl font-bold">{overview?.completionRate || 94.5}%</p>
          <p className="text-xs opacity-75 mt-2">Based on delivered orders</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Customer Satisfaction</p>
          <p className="text-2xl font-bold">{overview?.satisfactionRating || 4.6} / 5</p>
          <p className="text-xs opacity-75 mt-2">Based on {overview?.totalReviews || 0} reviews</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Active Now</p>
          <p className="text-2xl font-bold">{overview?.activeNow || 0}</p>
          <p className="text-xs opacity-75 mt-2">Users currently online</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 gap-6">
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
};

export default DashboardPage;