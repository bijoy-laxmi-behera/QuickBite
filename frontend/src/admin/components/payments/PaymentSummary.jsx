import React from 'react';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Calendar, Download, RefreshCw } from 'lucide-react';

const PaymentSummary = ({ summary, onRefresh, onExport, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Transactions',
      value: summary?.totalTransactions || 0,
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Successful Payments',
      value: summary?.successfulPayments || 0,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
      trend: '+5.3%',
      trendUp: true,
    },
    {
      title: 'Failed Payments',
      value: summary?.failedPayments || 0,
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600',
      trend: '-2.1%',
      trendUp: false,
    },
    {
      title: 'Refunded Amount',
      value: formatCurrency(summary?.refundedAmount || 0),
      icon: RefreshCw,
      color: 'bg-orange-100 text-orange-600',
      trend: '+3.4%',
      trendUp: false,
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(summary?.averageTransaction || 0),
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
      trend: '+1.8%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Payment Overview</h3>
          <p className="text-sm text-gray-500">Summary of all financial transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-full ${card.color}`}>
                  <Icon size={18} />
                </div>
                {card.trend && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mt-3">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Today's Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.todayRevenue || 0)}</p>
          <p className="text-xs opacity-75 mt-1">{summary?.todayOrders || 0} orders today</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">This Week</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.weekRevenue || 0)}</p>
          <p className="text-xs opacity-75 mt-1">{summary?.weekOrders || 0} orders this week</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.monthRevenue || 0)}</p>
          <p className="text-xs opacity-75 mt-1">{summary?.monthOrders || 0} orders this month</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Completion Rate</p>
          <p className="text-2xl font-bold">{summary?.completionRate || 0}%</p>
          <p className="text-xs opacity-75 mt-1">Successful transactions</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default PaymentSummary;