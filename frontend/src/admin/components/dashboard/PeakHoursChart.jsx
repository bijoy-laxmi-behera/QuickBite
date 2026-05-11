import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Clock, TrendingUp, Award, Eye, Download, RefreshCw, Star } from 'lucide-react';

const PeakHoursChart = ({ data, loading, onRefresh }) => {
  const [chartView, setChartView] = useState('bar');
  const [dayType, setDayType] = useState('all');

  const formatHour = (hour) => {
    if (hour === 0 || hour === 24) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const getPeakClassification = (orders) => {
    if (!data || data.length === 0) return { peak: 0, offPeak: 0, moderate: 0 };
    const maxOrders = Math.max(...data.map(d => d.totalOrders || 0));
    const threshold = maxOrders * 0.7;
    const moderateThreshold = maxOrders * 0.4;
    
    return data.reduce((acc, item) => {
      if ((item.totalOrders || 0) >= threshold) acc.peak++;
      else if ((item.totalOrders || 0) >= moderateThreshold) acc.moderate++;
      else acc.offPeak++;
      return acc;
    }, { peak: 0, moderate: 0, offPeak: 0 });
  };

  const classification = getPeakClassification();

  const chartColors = {
    orders: '#3B82F6',
    peak: '#EF4444',
    moderate: '#F59E0B',
    offPeak: '#10B981',
    gradientStart: '#3B82F6',
    gradientEnd: '#60A5FA',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-700">{formatHour(label)}</p>
          <p className="text-2xl font-bold text-blue-600">{data.totalOrders || 0}</p>
          <p className="text-xs text-gray-500">orders</p>
          {data.percentage && (
            <p className="text-xs text-gray-500 mt-1">{data.percentage}% of daily orders</p>
          )}
          {data.avgValue && (
            <p className="text-xs text-gray-500">Avg Order: ₹{data.avgValue}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Prepare chart data with percentages
  const totalOrders = data?.reduce((sum, item) => sum + (item.totalOrders || 0), 0) || 0;
  const chartData = data?.map(item => ({
    ...item,
    hour: item._id?.hour || item.hour,
    formattedHour: formatHour(item._id?.hour || item.hour),
    percentage: totalOrders > 0 ? ((item.totalOrders || 0) / totalOrders * 100).toFixed(1) : 0,
  })) || [];

  // Find peak hours
  const maxOrders = Math.max(...chartData.map(d => d.totalOrders || 0), 0);
  const peakHours = chartData.filter(d => d.totalOrders === maxOrders);
  const secondPeakHours = chartData.filter(d => d.totalOrders === maxOrders - 1);

  // Calculate recommendations
  const getRecommendations = () => {
    const peakHourData = chartData.find(d => d.totalOrders === maxOrders);
    const lowHourData = chartData.find(d => d.totalOrders === Math.min(...chartData.map(d => d.totalOrders || 0)));
    
    return [
      {
        title: 'Increase Staff During Peak',
        description: `${formatHour(peakHourData?.hour)} sees highest order volume (${peakHourData?.totalOrders} orders)`,
        action: 'Schedule additional staff during this time',
        icon: TrendingUp,
      },
      {
        title: 'Off-Peak Promotions',
        description: `${formatHour(lowHourData?.hour)} has lowest activity (${lowHourData?.totalOrders} orders)`,
        action: 'Run special offers to boost orders',
        icon: Award,
      },
      {
        title: 'Delivery Capacity',
        description: `${classification.peak} peak hours require maximum delivery capacity`,
        action: 'Ensure enough delivery partners available',
        icon: Clock,
      },
    ];
  };

  const recommendations = getRecommendations();

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
            <h3 className="text-lg font-semibold text-gray-800">Peak Hours Analysis</h3>
            <p className="text-sm text-gray-500">Order distribution across the day</p>
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
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Data"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Peak Hours</p>
            <p className="text-xl font-bold text-red-600">
              {peakHours.map(h => formatHour(h.hour)).join(', ')}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Peak Hour Orders</p>
            <p className="text-xl font-bold text-orange-600">{maxOrders} orders</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Total Daily Orders</p>
            <p className="text-xl font-bold text-blue-600">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Active Hours</p>
            <p className="text-xl font-bold text-green-600">{chartData.filter(d => (d.totalOrders || 0) > 0).length}</p>
          </div>
        </div>

        {/* Classification Labels */}
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Peak Hours ({classification.peak})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600">Moderate ({classification.moderate})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Off-Peak ({classification.offPeak})</span>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="px-6 py-3 border-b bg-white flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setChartView('bar')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              chartView === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartView('area')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              chartView === 'area'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Area Chart
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          {chartView === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="formattedHour" 
                tick={{ fontSize: 11 }}
                interval={2}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="totalOrders" 
                name="Number of Orders" 
                fill={chartColors.orders}
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => {
                  let color = chartColors.orders;
                  const maxOrdersVal = Math.max(...chartData.map(d => d.totalOrders || 0));
                  if (entry.totalOrders >= maxOrdersVal * 0.7) color = chartColors.peak;
                  else if (entry.totalOrders >= maxOrdersVal * 0.4) color = chartColors.moderate;
                  else color = chartColors.offPeak;
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.orders} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.orders} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="formattedHour" 
                tick={{ fontSize: 11 }}
                interval={2}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalOrders"
                name="Number of Orders"
                stroke={chartColors.orders}
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Hourly Distribution Table */}
      <div className="px-6 py-3 border-t bg-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs text-gray-500">Time Slot</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500">Orders</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500">% of Day</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, idx) => {
                let status = 'Off-Peak';
                let statusColor = 'text-green-600';
                const maxOrdersVal = Math.max(...chartData.map(d => d.totalOrders || 0));
                if (item.totalOrders >= maxOrdersVal * 0.7) {
                  status = 'Peak Hour';
                  statusColor = 'text-red-600';
                } else if (item.totalOrders >= maxOrdersVal * 0.4) {
                  status = 'Moderate';
                  statusColor = 'text-yellow-600';
                }
                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">{item.formattedHour}</td>
                    <td className="py-2 px-3">{item.totalOrders || 0}</td>
                    <td className="py-2 px-3">{item.percentage}%</td>
                    <td className={`py-2 px-3 ${statusColor}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-6 py-4 border-t bg-white">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Award size={16} /> Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-blue-600" />
                  <h5 className="text-sm font-medium text-blue-800">{rec.title}</h5>
                </div>
                <p className="text-xs text-blue-700 mb-1">{rec.description}</p>
                <p className="text-xs text-blue-600 font-medium">→ {rec.action}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PeakHoursChart;