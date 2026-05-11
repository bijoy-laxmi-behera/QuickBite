import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Clock, CheckCircle, XCircle, Truck, Coffee, Package,
  TrendingUp, TrendingDown, Eye
} from 'lucide-react';

const OrdersByStatus = ({ data, loading, onStatusClick }) => {
  const [chartType, setChartType] = useState('pie');

  const statusConfig = {
    pending: { label: 'Pending', color: '#EAB308', icon: Clock, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    accepted: { label: 'Accepted', color: '#3B82F6', icon: CheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    preparing: { label: 'Preparing', color: '#8B5CF6', icon: Coffee, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    out_for_delivery: { label: 'Out for Delivery', color: '#F97316', icon: Truck, bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    delivered: { label: 'Delivered', color: '#10B981', icon: Package, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    cancelled: { label: 'Cancelled', color: '#EF4444', icon: XCircle, bgColor: 'bg-red-50', textColor: 'text-red-600' },
  };

  const formatData = () => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      name: statusConfig[item._id]?.label || item._id,
      value: item.count,
      status: item._id,
      color: statusConfig[item._id]?.color || '#9CA3AF',
      percentage: ((item.count / totalOrders) * 100).toFixed(1),
    }));
  };

  const totalOrders = data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const chartData = formatData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-700">{data.name}</p>
          <p className="text-2xl font-bold" style={{ color: data.color }}>{data.value}</p>
          <p className="text-xs text-gray-500">{data.percentage}% of total orders</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-3 mt-3">
        {payload?.map((entry, index) => {
          const status = chartData.find(d => d.name === entry.value)?.status;
          const config = statusConfig[status];
          const Icon = config?.icon;
          return (
            <button
              key={index}
              onClick={() => onStatusClick?.(status)}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${config?.bgColor} ${config?.textColor} hover:opacity-80 transition-opacity`}
            >
              {Icon && <Icon size={12} />}
              <span>{entry.value}</span>
              <span className="font-bold">{chartData.find(d => d.name === entry.value)?.value}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">No order data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Orders by Status</h3>
            <p className="text-sm text-gray-500">Distribution of order statuses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                chartType === 'pie'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Orders" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {chartData.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config?.icon;
            return (
              <button
                key={item.status}
                onClick={() => onStatusClick?.(item.status)}
                className={`p-3 rounded-lg text-center transition-all hover:shadow ${config?.bgColor}`}
              >
                {Icon && <Icon size={20} className={`mx-auto mb-1 ${config?.textColor}`} />}
                <p className="text-xl font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-500">{config?.label}</p>
                <p className="text-xs font-medium mt-1" style={{ color: item.color }}>
                  {item.percentage}%
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Row */}
      <div className="px-6 py-3 bg-white border-t text-xs text-gray-500 flex justify-between">
        <span>Total Orders: {totalOrders}</span>
        <span>Completed: {chartData.find(d => d.status === 'delivered')?.value || 0}</span>
        <span>Cancellation Rate: {((chartData.find(d => d.status === 'cancelled')?.value || 0) / totalOrders * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default OrdersByStatus;