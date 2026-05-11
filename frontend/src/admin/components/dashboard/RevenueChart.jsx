import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react';

const RevenueChart = ({ data, loading, onRefresh, onDateRangeChange }) => {
  const [chartType, setChartType] = useState('area');
  const [timeRange, setTimeRange] = useState('weekly');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date.day && date.month) {
      return `${date.day}/${date.month}`;
    }
    if (date.month) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[date.month - 1];
    }
    return date;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-700 mb-1">{formatDate(label)}</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(payload[0]?.value || 0)}
          </p>
          {payload[0]?.payload?.orders && (
            <p className="text-xs text-gray-500">{payload[0].payload.orders} orders</p>
          )}
          {payload[0]?.payload?.growth && (
            <p className={`text-xs ${payload[0].payload.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {payload[0].payload.growth >= 0 ? '↑' : '↓'} {Math.abs(payload[0].payload.growth)}% from previous
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const chartColors = {
    revenue: '#3B82F6',
    orders: '#10B981',
    average: '#8B5CF6',
    gradientStart: '#3B82F6',
    gradientEnd: '#60A5FA',
  };

  // Calculate totals and averages
  const totalRevenue = data?.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) || 0;
  const totalOrders = data?.reduce((sum, item) => sum + (item.totalOrders || 0), 0) || 0;
  const averageRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxRevenue = Math.max(...(data?.map(item => item.totalRevenue || 0) || [0]));
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const timeRangeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const chartTypeOptions = [
    { value: 'area', label: 'Area', icon: '📊' },
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'bar', label: 'Bar', icon: '📊' },
  ];

  // Prepare chart data with additional metrics
  const chartData = data?.map((item, index) => ({
    ...item,
    name: formatDate(item._id),
    growth: index > 0 && item.totalRevenue && data[index - 1]?.totalRevenue
      ? ((item.totalRevenue - data[index - 1].totalRevenue) / data[index - 1].totalRevenue * 100).toFixed(1)
      : null,
  })) || [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Track your earnings and order trends</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => onDateRangeChange?.()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Change Date Range"
            >
              <Calendar size={18} />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download Report"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-green-600">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Average Order Value</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Highest Revenue</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(maxRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="px-6 py-3 border-b bg-white flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setTimeRange(option.value);
                onDateRangeChange?.(option.value);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {chartTypeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setChartType(option.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                chartType === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' && (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.revenue} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.revenue} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `₹${value / 1000}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                name="Revenue"
                stroke={chartColors.revenue}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          )}

          {chartType === 'line' && (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `₹${value / 1000}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                name="Revenue"
                stroke={chartColors.revenue}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.revenue }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="averageOrderValue"
                name="Avg Order Value"
                stroke={chartColors.average}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: chartColors.average }}
              />
            </LineChart>
          )}

          {chartType === 'bar' && (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `₹${value / 1000}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="totalRevenue" name="Revenue" fill={chartColors.revenue} radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors.revenue} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      {chartData.length > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Revenue Trend</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{((chartData[chartData.length - 1]?.totalRevenue - chartData[0]?.totalRevenue) / chartData[0]?.totalRevenue * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">over period</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Best Day</p>
              <p className="text-sm font-medium">
                {chartData.reduce((max, item) => (item.totalRevenue > (max?.totalRevenue || 0) ? item : max), {})?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Peak Revenue</p>
              <p className="text-sm font-medium">{formatCurrency(maxRevenue)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;