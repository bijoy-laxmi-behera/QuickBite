// vendor/components/common/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp size={14} className="text-green-500 mr-1" />
              ) : isNegative ? (
                <TrendingDown size={14} className="text-red-500 mr-1" />
              ) : null}
              <span className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;