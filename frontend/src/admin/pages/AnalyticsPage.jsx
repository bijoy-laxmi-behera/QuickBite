import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Store,
  Calendar, Download, Filter, BarChart3, PieChart, LineChart,
  Clock, Star, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  Line,
  BarChart as RechartsBar,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const [overviewRes, revenueRes, orderStatsRes, topRestaurantsRes, peakHoursRes] = await Promise.all([
        fetchWithAuth('/admin/analytics/overview'),
        fetchWithAuth(`/admin/analytics/revenue?${params.toString()}`),
        fetchWithAuth('/admin/analytics/orders'),
        fetchWithAuth('/admin/analytics/restaurants'),
        fetchWithAuth('/admin/analytics/peak-hours'),
      ]);
      
      setOverview(overviewRes);
      setRevenueData(revenueRes || []);
      setOrderStats(orderStatsRes || []);
      setTopRestaurants(topRestaurantsRes || []);
      setPeakHours(peakHoursRes || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleExportData = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`${API_BASE}/admin/analytics/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export started successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'error');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) return <Loader />;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'restaurants', name: 'Restaurants', icon: Store },
    { id: 'peak-hours', name: 'Peak Hours', icon: Clock },
  ];

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: DollarSign,
      change: '+15.3%',
      isPositive: true,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: ShoppingBag,
      change: '+8.2%',
      isPositive: true,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      change: '+12.5%',
      isPositive: true,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Active Restaurants',
      value: overview?.totalRestaurants || 0,
      icon: Store,
      change: '+5.8%',
      isPositive: true,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(overview?.avgOrderValue || 0),
      icon: TrendingUp,
      change: '+2.1%',
      isPositive: true,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      title: 'Conversion Rate',
      value: `${overview?.conversionRate || 0}%`,
      icon: PieChart,
      change: '-0.5%',
      isPositive: false,
      color: 'bg-pink-100 text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="self-center">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white rounded-t-lg">
        <nav className="flex gap-1 px-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Summary Cards - Overview Tab Only */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-full ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-xs font-medium ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.title}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tickFormatter={(value) => {
                  if (value?.day) return `${value.day}/${value.month}`;
                  return value;
                }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={orderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Peak Order Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalOrders" fill="#3B82F6" name="Orders" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Restaurants */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Top Performing Restaurants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topRestaurants.map((restaurant, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {index === 0 && <Award size={20} className="text-yellow-500" />}
                        {index === 1 && <Award size={20} className="text-gray-400" />}
                        {index === 2 && <Award size={20} className="text-orange-400" />}
                        {index > 2 && <span className="text-sm">{index + 1}</span>}
                      </td>
                      <td className="px-6 py-4 font-medium">{restaurant.restaurant?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">{restaurant.totalOrders}</td>
                      <td className="px-6 py-4">{formatCurrency(restaurant.revenue)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{restaurant.rating || '4.5'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Revenue Tab Content */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsLine data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
              </RechartsLine>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(overview?.totalRevenue || 0)}</p>
              <p className="text-sm text-gray-500 mt-1">Year to Date</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Average Order Value</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(overview?.avgOrderValue || 0)}</p>
              <p className="text-sm text-gray-500 mt-1">Per transaction</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{overview?.totalOrders || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Completed Orders</p>
              <p className="text-2xl font-bold text-green-600">{orderStats.find(s => s._id === 'delivered')?.count || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Cancelled Orders</p>
              <p className="text-2xl font-bold text-red-600">{orderStats.find(s => s._id === 'cancelled')?.count || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsPieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {orderStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Restaurants Tab Content */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Restaurant Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Avg Order Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topRestaurants.map((restaurant, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {index === 0 && <Award size={20} className="text-yellow-500" />}
                      {index === 1 && <Award size={20} className="text-gray-400" />}
                      {index === 2 && <Award size={20} className="text-orange-400" />}
                      {index > 2 && <span className="text-sm">{index + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-medium">{restaurant.restaurant?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{restaurant.totalOrders}</td>
                    <td className="px-6 py-4">{formatCurrency(restaurant.revenue)}</td>
                    <td className="px-6 py-4">{formatCurrency(restaurant.revenue / restaurant.totalOrders)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Peak Hours Tab Content */}
      {activeTab === 'peak-hours' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Order Distribution by Hour</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBar data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id.hour" label={{ value: 'Hour of Day', position: 'bottom' }} />
                <YAxis label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="totalOrders" fill="#3B82F6" name="Orders" radius={[8, 8, 0, 0]} />
              </RechartsBar>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Peak Hours Summary</h3>
              {peakHours.length > 0 && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Highest Order Volume</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.max(...peakHours.map(h => h.totalOrders))} orders
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Best Performing Hour</p>
                  <p className="text-lg font-medium">
                    {peakHours.reduce((max, curr) => curr.totalOrders > max.totalOrders ? curr : max, peakHours[0])?._id?.hour}:00
                  </p>
                </>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock size={16} className="text-blue-500 mt-0.5" />
                  <span>Increase staff during peak hours for faster service</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp size={16} className="text-green-500 mt-0.5" />
                  <span>Run promotions during off-peak hours to balance load</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award size={16} className="text-yellow-500 mt-0.5" />
                  <span>Offer special discounts for early bird orders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
    </div>
  );
};

export default AnalyticsPage;