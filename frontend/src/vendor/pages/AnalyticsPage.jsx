// vendor/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/axios';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users,
  Calendar, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('week');
  const [earnings, setEarnings] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [earningsRes, revenueRes, statsRes, itemsRes] = await Promise.all([
        API.get('/vendor/earnings-summary'),
        API.get(`/vendor/revenue-trend?period=${dateRange}`),
        API.get('/vendor/order-stats'),
        API.get('/vendor/top-items')
      ]);
      
      let topItemsData = [];
      if (itemsRes.data && Array.isArray(itemsRes.data)) {
        topItemsData = itemsRes.data;
      } else if (itemsRes.data && itemsRes.data.items && Array.isArray(itemsRes.data.items)) {
        topItemsData = itemsRes.data.items;
      } else if (itemsRes.data && itemsRes.data.data && Array.isArray(itemsRes.data.data)) {
        topItemsData = itemsRes.data.data;
      }
      
      setEarnings(earningsRes.data?.data || earningsRes.data);
      setRevenueTrend(Array.isArray(revenueRes.data?.data) ? revenueRes.data.data : 
                     Array.isArray(revenueRes.data) ? revenueRes.data : []);
      setOrderStats(statsRes.data?.stats || statsRes.data);
      setTopItems(topItemsData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      setEarnings({});
      setRevenueTrend([]);
      setOrderStats({});
      setTopItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    setExporting(true);
    try {
      // Prepare data for export
      const exportData = [];
      
      // Add summary row
      exportData.push(['QUICKBITE - ANALYTICS REPORT']);
      exportData.push([`Generated on: ${new Date().toLocaleString()}`]);
      exportData.push([`Period: ${dateRange.toUpperCase()}`]);
      exportData.push([]); // Empty row
      
      // Key Metrics
      exportData.push(['KEY METRICS']);
      exportData.push(['Metric', 'Value']);
      exportData.push(['Total Revenue', `₹${(earnings?.totalRevenue || earnings?.totalEarnings || 0).toLocaleString()}`]);
      exportData.push(['Total Orders', earnings?.totalOrders || 0]);
      exportData.push(['Average Order Value', `₹${earnings?.avgOrderValue || 0}`]);
      exportData.push(['Customer Rating', `${earnings?.rating || 0} ★`]);
      exportData.push([]); // Empty row
      
      // Revenue Trend
      if (revenueTrend.length > 0) {
        exportData.push(['REVENUE TREND']);
        exportData.push(['Period', 'Revenue (₹)', 'Orders']);
        revenueTrend.forEach(item => {
          exportData.push([item.label || item.date || item._id, item.revenue || 0, item.orders || 0]);
        });
        exportData.push([]);
      }
      
      // Top Items
      const topItemsList = Array.isArray(topItems) ? topItems.slice(0, 10) : [];
      if (topItemsList.length > 0) {
        exportData.push(['TOP SELLING ITEMS']);
        exportData.push(['Rank', 'Item Name', 'Quantity Sold', 'Revenue (₹)']);
        topItemsList.forEach((item, index) => {
          exportData.push([
            index + 1,
            item.name || item._id,
            item.totalSold || item.sold || 0,
            item.revenue || item.totalRevenue || 0
          ]);
        });
        exportData.push([]);
      }
      
      // Order Status
      if (orderStats && Object.keys(orderStats).length > 0) {
        exportData.push(['ORDER STATUS BREAKDOWN']);
        exportData.push(['Status', 'Count']);
        exportData.push(['Delivered', orderStats.delivered || orderStats.completed || 0]);
        exportData.push(['Processing', orderStats.processing || orderStats.pending || 0]);
        exportData.push(['Cancelled', orderStats.cancelled || orderStats.rejected || 0]);
      }
      
      // Create CSV content
      const csvContent = exportData.map(row => 
        row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ).join('\n');
      
      // Add BOM for UTF-8 encoding to support special characters
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF (using window.print)
  const handleExportPDF = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Analytics Report - QuickBite</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #f97316; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f97316; color: white; }
            .metric { display: inline-block; width: 200px; margin: 10px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #f97316; }
            .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>QuickBite - Analytics Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Period: ${dateRange.toUpperCase()}</p>
          
          <h2>Key Metrics</h2>
          <div>
            <div class="metric">Total Revenue<br/><span class="metric-value">₹${(earnings?.totalRevenue || earnings?.totalEarnings || 0).toLocaleString()}</span></div>
            <div class="metric">Total Orders<br/><span class="metric-value">${earnings?.totalOrders || 0}</span></div>
            <div class="metric">Avg Order Value<br/><span class="metric-value">₹${earnings?.avgOrderValue || 0}</span></div>
            <div class="metric">Rating<br/><span class="metric-value">${earnings?.rating || 0} ★</span></div>
          </div>
          
          <h2>Revenue Trend</h2>
          <table>
            <tr><th>Period</th><th>Revenue (₹)</th><th>Orders</th></tr>
            ${revenueTrend.map(item => `
              <tr><td>${item.label || item.date || item._id}</td><td>${item.revenue || 0}</td><td>${item.orders || 0}</td></tr>
            `).join('')}
          </table>
          
          <h2>Top Selling Items</h2>
          <table>
            <tr><th>Rank</th><th>Item Name</th><th>Quantity Sold</th><th>Revenue (₹)</th></tr>
            ${(Array.isArray(topItems) ? topItems.slice(0, 10) : []).map((item, index) => `
              <tr><td>${index + 1}</td><td>${item.name || item._id}</td><td>${item.totalSold || item.sold || 0}</td><td>${item.revenue || item.totalRevenue || 0}</td></tr>
            `).join('')}
          </table>
          
          <div class="footer">
            <p>QuickBite Vendor Portal - Analytics Report</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
  const topItemsList = Array.isArray(topItems) ? topItems : [];
  const displayTopItems = topItemsList.slice(0, 5).map((item, index) => ({
    id: index,
    name: item.name || item._id || `Item ${index + 1}`,
    sold: item.totalSold || item.sold || item.count || 0,
    revenue: item.revenue || item.totalRevenue || (item.price * (item.totalSold || 0)) || 0
  }));

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your restaurant performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button 
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              disabled={exporting}
            >
              <Download size={16} />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                📊 Export as CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg"
              >
                📄 Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your existing JSX for KPI Cards, Charts, etc. */}
      {/* ... keep your existing JSX here ... */}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{(earnings?.totalRevenue || earnings?.totalEarnings || 0).toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {(earnings?.revenueChange || 0) > 0 ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (earnings?.revenueChange || 0) < 0 ? (
                  <TrendingDown size={14} className="text-red-500" />
                ) : null}
                <span className={`text-xs ${(earnings?.revenueChange || 0) > 0 ? 'text-green-600' : (earnings?.revenueChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'} ml-1`}>
                  {Math.abs(earnings?.revenueChange || 0)}%
                </span>
                <span className="text-xs text-gray-400 ml-1">vs last period</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{earnings?.totalOrders || 0}</p>
              <div className="flex items-center mt-1">
                {(earnings?.ordersChange || 0) > 0 ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (earnings?.ordersChange || 0) < 0 ? (
                  <TrendingDown size={14} className="text-red-500" />
                ) : null}
                <span className={`text-xs ${(earnings?.ordersChange || 0) > 0 ? 'text-green-600' : (earnings?.ordersChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'} ml-1`}>
                  {Math.abs(earnings?.ordersChange || 0)}%
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-800">₹{earnings?.avgOrderValue || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customer Rating</p>
              <p className="text-2xl font-bold text-gray-800">{earnings?.rating || 0} ★</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Users size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        {revenueTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#888" />
              <YAxis stroke="#888" tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                formatter={(value) => [`₹${value?.toLocaleString() || 0}`, 'Revenue']}
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Order Stats & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
          {orderStats && Object.keys(orderStats).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Delivered', value: orderStats.delivered || orderStats.completed || 0 },
                    { name: 'Processing', value: orderStats.processing || orderStats.pending || 0 },
                    { name: 'Cancelled', value: orderStats.cancelled || orderStats.rejected || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
          <div className="space-y-4">
            {displayTopItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sales data available yet
              </div>
            ) : (
              displayTopItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-300">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.sold} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-orange-600">₹{item.revenue.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;