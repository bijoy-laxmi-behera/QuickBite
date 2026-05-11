// delivery/pages/DeliveryEarnings.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Loader, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import EarningsChart from '../components/EarningsChart';

const DeliveryEarnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalTrips: 0,
    avgPerTrip: 0,
    totalTips: 0,
    totalBonuses: 0
  });
  const [todayEarnings, setTodayEarnings] = useState([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    dailyAverage: 0,
    weeklyAverage: 0,
    monthlyAverage: 0,
    bestDay: { amount: 0, date: null },
    totalPayouts: 0
  });

  useEffect(() => {
    fetchAllEarnings();
  }, []);

  const fetchAllEarnings = async () => {
    try {
      setLoading(true);
      
      // Fetch each endpoint separately with proper error handling
      const [summaryRes, todayRes, weeklyRes, monthlyRes, payoutsRes, transactionsRes] = await Promise.all([
        API.get('/delivery/earnings/summary').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/today').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/weekly').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/monthly').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/payouts').catch(() => ({ data: {} })),
        API.get('/delivery/earnings/transactions').catch(() => ({ data: {} }))
      ]);
      
      // Extract data from responses
      const summaryData = summaryRes.data?.data || summaryRes.data || {};
      const todayData = todayRes.data?.earnings || todayRes.data?.data || todayRes.data || [];
      const weeklyData = weeklyRes.data?.data || weeklyRes.data || [];
      const monthlyData = monthlyRes.data?.data || monthlyRes.data || [];
      const payoutsData = payoutsRes.data?.payouts || payoutsRes.data?.data || payoutsRes.data || [];
      const transactionsData = transactionsRes.data?.transactions || transactionsRes.data?.data || transactionsRes.data || [];
      
      // Ensure all are arrays
      setTodayEarnings(Array.isArray(todayData) ? todayData : []);
      setWeeklyEarnings(Array.isArray(weeklyData) ? weeklyData : []);
      setMonthlyEarnings(Array.isArray(monthlyData) ? monthlyData : []);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      
      // Set earnings summary
      setEarnings({
        totalEarnings: summaryData.totalEarnings || 0,
        totalTrips: summaryData.totalTrips || 0,
        avgPerTrip: summaryData.avgPerTrip || 0,
        totalTips: summaryData.totalTips || 0,
        totalBonuses: summaryData.totalBonuses || 0
      });
      
      // Calculate statistics
      calculateStats(todayData, weeklyData, monthlyData, payoutsData);
      
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (todayData, weeklyData, monthlyData, payoutsData) => {
    // Calculate daily average
    const dailyTotal = Array.isArray(todayData) 
      ? todayData.reduce((sum, t) => sum + (t.amount || 0), 0) 
      : 0;
    const dailyCount = Array.isArray(todayData) ? todayData.length : 1;
    
    // Calculate weekly average
    const weeklyTotal = Array.isArray(weeklyData)
      ? weeklyData.reduce((sum, w) => sum + (w.total || 0), 0)
      : 0;
    const weeklyCount = Array.isArray(weeklyData) ? weeklyData.length : 1;
    
    // Calculate monthly average
    const monthlyTotal = Array.isArray(monthlyData)
      ? monthlyData.reduce((sum, m) => sum + (m.total || 0), 0)
      : 0;
    const monthlyCount = Array.isArray(monthlyData) ? monthlyData.length : 1;
    
    // Find best day
    let bestDay = { amount: 0, date: null };
    if (Array.isArray(todayData)) {
      todayData.forEach(t => {
        if ((t.amount || 0) > bestDay.amount) {
          bestDay = { amount: t.amount, date: t.createdAt };
        }
      });
    }
    
    // Calculate total payouts
    const totalPayouts = Array.isArray(payoutsData)
      ? payoutsData.reduce((sum, p) => sum + (p.amount || 0), 0)
      : 0;
    
    setStats({
      dailyAverage: dailyCount > 0 ? dailyTotal / dailyCount : 0,
      weeklyAverage: weeklyCount > 0 ? weeklyTotal / weeklyCount : 0,
      monthlyAverage: monthlyCount > 0 ? monthlyTotal / monthlyCount : 0,
      bestDay,
      totalPayouts
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllEarnings();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const exportData = () => {
    const data = {
      earnings,
      transactions,
      payouts,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
    };
    const cfg = config[status?.toLowerCase()] || config.pending;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  // Pagination
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your delivery earnings and payouts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Earnings"
          value={earnings.totalEarnings}
          icon={DollarSign}
          color="green"
          prefix="₹"
          subtitle={`${earnings.totalTrips} deliveries completed`}
        />
        
        <StatsCard
          title="Average per Trip"
          value={Math.round(earnings.avgPerTrip)}
          icon={TrendingUp}
          color="orange"
          prefix="₹"
        />
        
        <StatsCard
          title="Total Trips"
          value={earnings.totalTrips}
          icon={Package}
          color="blue"
        />
        
        <StatsCard
          title="Total Payouts"
          value={stats.totalPayouts}
          icon={Wallet}
          color="purple"
          prefix="₹"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Daily Average</p>
          <p className="text-xl font-bold text-gray-800">₹{Math.round(stats.dailyAverage)}</p>
          <p className="text-xs text-gray-400">Per day</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Best Day</p>
          <p className="text-xl font-bold text-green-600">₹{stats.bestDay.amount}</p>
          {stats.bestDay.date && (
            <p className="text-xs text-gray-400">
              {new Date(stats.bestDay.date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Tips & Bonuses</p>
          <p className="text-xl font-bold text-orange-600">₹{earnings.totalTips + earnings.totalBonuses}</p>
          <div className="flex gap-3 text-xs mt-1">
            <span className="text-gray-400">Tips: ₹{earnings.totalTips}</span>
            <span className="text-gray-400">Bonuses: ₹{earnings.totalBonuses}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {weeklyEarnings.length > 0 && (
        <div className="mb-6">
          <EarningsChart 
            data={weeklyEarnings}
            title="Weekly Earnings Trend"
            type="line"
            height={250}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b mb-4">
        {['summary', 'transactions', 'payouts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize transition ${
              activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Weekly Summary */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Earnings */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp size={18} />
                Weekly Overview
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {weeklyEarnings.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
                    No weekly data available
                  </div>
                ) : (
                  weeklyEarnings.map((week, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-gray-600">
                        {week._id?.day 
                          ? `Day ${week._id.day}` 
                          : week._id?.month 
                            ? getMonthName(week._id.month)
                            : week._id?.year 
                              ? `Week ${idx + 1}`
                              : `Period ${idx + 1}`
                        }
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-orange-600">₹{week.total || 0}</span>
                        {week.count && (
                          <p className="text-xs text-gray-400">{week.count} deliveries</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar size={18} />
                Monthly Overview
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {monthlyEarnings.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
                    No monthly data available
                  </div>
                ) : (
                  monthlyEarnings.map((month, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-gray-600">
                        {month._id?.month ? getMonthName(month._id.month) : `Month ${idx + 1}`}
                        {month._id?.year && ` ${month._id.year}`}
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-orange-600">₹{month.total || 0}</span>
                        {month.count && (
                          <p className="text-xs text-gray-400">{month.count} deliveries</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText size={18} />
              Transaction History
            </h2>
            <span className="text-sm text-gray-500">{transactions.length} transactions</span>
          </div>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No transactions</p>
                <p className="text-sm">Complete deliveries to see earnings</p>
              </div>
            ) : (
              paginatedTransactions.map((transaction, idx) => (
                <div key={transaction._id || idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.type === 'delivery_earning' ? 'Delivery Earning' : transaction.type || 'Order Payment'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                    {transaction.order?.orderId && (
                      <p className="text-xs text-gray-400">Order #{transaction.order.orderId}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(transaction.amount || 0) > 0 ? '+' : ''}₹{Math.abs(transaction.amount || 0)}
                    </p>
                    {transaction.status && getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {transactions.length > itemsPerPage && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payouts */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Wallet size={18} />
              Payout History
            </h2>
          </div>
          <div className="divide-y">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No payouts yet</p>
                <p className="text-sm">Payouts will appear when processed</p>
              </div>
            ) : (
              payouts.map((payout, idx) => (
                <div key={payout._id || idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">
                      Payout {payout.payoutId || `#${payout._id?.slice(-8) || idx + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payout.payoutDate || payout.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">Method: {payout.paymentMethod || 'Bank'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 text-lg">₹{payout.amount || 0}</p>
                    {payout.status && getStatusBadge(payout.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryEarnings;