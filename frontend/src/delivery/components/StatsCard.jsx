// delivery/components/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'orange', 
  subtitle, 
  trend, 
  suffix = '',
  prefix = '₹',
  loading = false,
  onClick,
  tooltip,
  target,
  progress
}) => {
  const colorClasses = {
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      hover: 'hover:border-green-300'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      hover: 'hover:border-yellow-300'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
      hover: 'hover:border-red-300'
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300'
    },
    teal: {
      bg: 'bg-teal-100',
      text: 'text-teal-600',
      border: 'border-teal-200',
      hover: 'hover:border-teal-300'
    }
  };

  const colors = colorClasses[color] || colorClasses.orange;

  // Format value with prefix and suffix
  const formattedValue = () => {
    if (loading) return '---';
    if (value === undefined || value === null) return '0';
    
    let formatted = value;
    
    // Add prefix (₹ for currency)
    if (prefix && typeof value === 'number') {
      formatted = `${prefix}${value.toLocaleString()}`;
    } else if (typeof value === 'number') {
      formatted = value.toLocaleString();
    }
    
    // Add suffix (% for percentages)
    if (suffix) {
      formatted = `${formatted}${suffix}`;
    }
    
    return formatted;
  };

  // Calculate progress percentage
  const progressPercentage = progress ? (value / target) * 100 : 0;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border} ${colors.hover} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } relative group`}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <Info size={14} className="text-gray-400" />
            <div className="absolute right-0 top-5 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 z-10 hidden group-hover:block">
              {tooltip}
              <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          
          {loading ? (
            <div className="mt-1">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {formattedValue()}
            </p>
          )}
          
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          
          {/* Trend indicator */}
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span>{Math.abs(trend)}% from last period</span>
            </div>
          )}
          
          {/* Progress bar */}
          {progress !== undefined && target && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </div>
  );
};

// Mini Stats Card Component
export const MiniStatsCard = ({ title, value, icon: Icon, color = 'orange' }) => {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
};

// Stats Grid Component
export const StatsGrid = ({ children, columns = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Earnings Breakdown Component
export const EarningsBreakdown = ({ earnings, total }) => {
  const items = [
    { label: 'Delivery Fees', key: 'delivery', color: 'bg-orange-500' },
    { label: 'Tips', key: 'tips', color: 'bg-green-500' },
    { label: 'Bonuses', key: 'bonuses', color: 'bg-purple-500' },
    { label: 'Adjustments', key: 'adjustments', color: 'bg-blue-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Earnings Breakdown</h3>
      <div className="space-y-3">
        {items.map(item => {
          const amount = earnings[item.key] || 0;
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          
          return (
            <div key={item.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">₹{amount.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCard;