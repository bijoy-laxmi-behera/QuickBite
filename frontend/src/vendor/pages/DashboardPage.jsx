// vendor/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OverviewStats from '../components/Dashboard/OverviewStats';
import RevenueChart from '../components/Dashboard/RevenueChart';
import TopItems from '../components/Dashboard/TopItems';
import LiveOrders from '../components/Dashboard/LiveOrders';
import Loader from '../components/common/Loader';

const DashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchLiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [overviewRes, revenueRes, topItemsRes, ordersRes] = await Promise.all([
        axios.get('/api/vendor/overview', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/vendor/weekly-revenue', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/vendor/top-items', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/vendor/live-orders', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOverview(overviewRes.data);
      setRevenueData(revenueRes.data);
      setTopItems(topItemsRes.data);
      setLiveOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/live-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveOrders(response.data);
    } catch (error) {
      console.error('Error fetching live orders:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Overview */}
      <OverviewStats data={overview} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <TopItems items={topItems} />
        </div>
      </div>

      {/* Live Orders */}
      <LiveOrders orders={liveOrders} onOrderUpdate={fetchLiveOrders} />
    </div>
  );
};

export default DashboardPage;