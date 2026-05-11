// vendor/pages/PayoutPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/axios';
import { Wallet, Calendar, Download, ChevronRight, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const PayoutPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await API.get('/vendor/payout-history');
      console.log('Payouts API Response:', response.data);
      
      // Fix: Ensure payouts is an array
      let payoutsData = [];
      if (response.data && Array.isArray(response.data)) {
        payoutsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        payoutsData = response.data.data;
      } else if (response.data && response.data.payouts && Array.isArray(response.data.payouts)) {
        payoutsData = response.data.payouts;
      }
      
      console.log('Processed payouts:', payoutsData);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payout history');
      setPayouts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayouts();
  };

  const fetchPayoutDetail = async (payoutId) => {
    try {
      const [detailRes, txnsRes] = await Promise.all([
        API.get(`/vendor/payout-history/${payoutId}`),
        API.get(`/vendor/payout-history/${payoutId}/transactions`)
      ]);
      setSelectedPayout(detailRes.data?.data || detailRes.data);
      setTransactions(txnsRes.data?.data || txnsRes.data || []);
    } catch (error) {
      console.error('Error fetching payout detail:', error);
      toast.error('Failed to load payout details');
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <span className="flex items-center text-green-600 text-sm"><CheckCircle size={14} className="mr-1" /> Completed</span>;
      case 'pending':
        return <span className="flex items-center text-yellow-600 text-sm"><Clock size={14} className="mr-1" /> Pending</span>;
      case 'processing':
        return <span className="flex items-center text-blue-600 text-sm"><Clock size={14} className="mr-1" /> Processing</span>;
      default:
        return <span className="text-gray-600 text-sm">{status || 'Unknown'}</span>;
    }
  };

  // Fix: Ensure payouts is an array before using reduce
  const payoutsList = Array.isArray(payouts) ? payouts : [];
  
  const completedTotal = payoutsList
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
    
  const pendingTotal = payoutsList
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
    
  const totalPaid = payoutsList
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payouts</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payment history</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-orange-500 transition"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-5 text-white">
          <p className="text-sm opacity-90">Available Balance</p>
          <p className="text-3xl font-bold mt-1">₹{completedTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Pending Payout</p>
          <p className="text-2xl font-bold text-gray-800">₹{pendingTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Payout History</h2>
        </div>
        <div className="divide-y">
          {payoutsList.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-gray-500 mt-2">No payouts yet</p>
              <p className="text-sm text-gray-400 mt-1">Payouts will appear here once processed</p>
            </div>
          ) : (
            payoutsList.map((payout) => (
              <div 
                key={payout._id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => fetchPayoutDetail(payout._id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">₹{(payout.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'Date not available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(payout.status)}
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
                {payout.period && (
                  <p className="text-xs text-gray-400 mt-2">
                    Period: {payout.period.start ? new Date(payout.period.start).toLocaleDateString() : 'N/A'} - 
                    {payout.period.end ? new Date(payout.period.end).toLocaleDateString() : 'N/A'}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Payout Details</h2>
              <button 
                onClick={() => setSelectedPayout(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-3xl font-bold text-orange-600">₹{(selectedPayout.amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedPayout.status)}
                  </div>
                </div>
                {selectedPayout.paymentDate && (
                  <p className="text-sm text-gray-500 mt-3">
                    Payment Date: {new Date(selectedPayout.paymentDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <h3 className="font-semibold text-gray-800 mb-3">Transaction Breakdown</h3>
              <div className="space-y-2 mb-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transaction details available
                  </div>
                ) : (
                  transactions.map((txn, idx) => (
                    <div key={txn._id || idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{txn.description || 'Transaction'}</p>
                        <p className="text-xs text-gray-500">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                      <p className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'} ₹{(txn.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition"
              >
                <Download size={16} />
                <span>Download Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutPage;