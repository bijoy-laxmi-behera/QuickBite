// vendor/components/Analytics/EarningsSummary.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const EarningsSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/earnings-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-32 flex items-center justify-center">Loading...</div>;
  }

  const cards = [
    {
      title: 'Net Earnings',
      value: `₹${summary?.netEarnings?.toLocaleString() || 0}`,
      change: summary?.earningsChange || 0,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Platform Fees',
      value: `₹${summary?.platformFees?.toLocaleString() || 0}`,
      change: -summary?.feeChange || 0,
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      title: 'Total Sales',
      value: `₹${summary?.totalSales?.toLocaleString() || 0}`,
      change: summary?.salesChange || 0,
      icon: TrendingUp,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              {card.change !== undefined && (
                <div className="flex items-center mt-2">
                  {card.change > 0 ? (
                    <TrendingUp size={14} className="text-green-500" />
                  ) : card.change < 0 ? (
                    <TrendingDown size={14} className="text-red-500" />
                  ) : null}
                  <span className={`text-xs ${card.change > 0 ? 'text-green-600' : card.change < 0 ? 'text-red-600' : 'text-gray-500'} ml-1`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                </div>
              )}
            </div>
            <div className={`${card.color} p-3 rounded-full`}>
              <card.icon size={20} className="text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EarningsSummary;