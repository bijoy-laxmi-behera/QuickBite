// vendor/components/Analytics/RevenueTrend.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const RevenueTrend = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vendor/revenue-trend?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Track your earnings over time</p>
        </div>
        <div className="flex space-x-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                period === p.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" stroke="#888" />
          <YAxis stroke="#888" tickFormatter={(value) => `₹${value}`} />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none' }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueTrend;