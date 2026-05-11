// delivery/pages/DeliveryWallet.jsx
import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, XCircle, Loader, Copy, 
  Check, Eye, ChevronRight, CreditCard, Banknote,
  AlertCircle, Calendar, Filter, Download
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliveryWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolderName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transactionsRes, withdrawalsRes] = await Promise.all([
        API.get('/delivery/wallet'),
        API.get('/delivery/wallet/transactions'),
        API.get('/delivery/wallet/withdrawals')
      ]);
      
      setWallet(walletRes.data?.data);
      setTransactions(transactionsRes.data?.data || []);
      setWithdrawalRequests(withdrawalsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 50) {
      toast.error('Minimum withdrawal amount is ₹50');
      return;
    }
    
    if (amount > wallet?.balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        amount,
        paymentMethod
      };
      
      if (paymentMethod === 'upi') {
        if (!upiId) {
          toast.error('Please enter UPI ID');
          setSubmitting(false);
          return;
        }
        payload.upiId = upiId;
      } else {
        if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolderName) {
          toast.error('Please fill all bank details');
          setSubmitting(false);
          return;
        }
        payload.bankDetails = bankDetails;
      }
      
      await API.post('/delivery/wallet/withdraw', payload);
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setUpiId('');
      setBankDetails({ accountNumber: '', ifsc: '', accountHolderName: '' });
      fetchWalletData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Loader },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle }
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.color}`}>
        <Icon size={10} />
        {cfg.label}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Delivery Wallet</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your earnings and withdrawals</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-orange-100 text-sm">Available Balance</p>
            <p className="text-4xl font-bold mt-1">₹{wallet?.balance?.toLocaleString() || 0}</p>
            <p className="text-orange-100 text-xs mt-2">
              Total Earned: ₹{wallet?.totalEarned?.toLocaleString() || 0}
            </p>
          </div>
          <div className="text-right">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <p className="text-xs text-orange-100 mt-2">
              Pending: ₹{wallet?.pendingBalance?.toLocaleString() || 0}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={!wallet?.balance || wallet.balance < 50}
          className="mt-4 w-full bg-white text-orange-600 py-2 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Withdraw Funds
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Total Withdrawn</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₹{wallet?.totalWithdrawn?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500">Last Transaction</span>
          </div>
          <p className="text-sm font-medium text-gray-800">
            {wallet?.lastTransactionAt ? new Date(wallet.lastTransactionAt).toLocaleDateString() : 'No transactions'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-4">
        {['transactions', 'withdrawals'].map((tab) => (
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

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Wallet size={32} className="mx-auto text-gray-300 mb-2" />
                <p>No transactions yet</p>
                <p className="text-sm">Complete deliveries to see earnings</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div key={tx._id || idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft size={18} className="text-green-600" />
                      ) : (
                        <ArrowUpRight size={18} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description || (tx.type === 'credit' ? 'Delivery Earning' : 'Withdrawal')}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                      {tx.order?.orderId && (
                        <p className="text-xs text-gray-400">Order #{tx.order.orderId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{tx.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Withdrawal Requests</h2>
          </div>
          <div className="divide-y">
            {withdrawalRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Banknote size={32} className="mx-auto text-gray-300 mb-2" />
                <p>No withdrawal requests yet</p>
                <p className="text-sm">Request a withdrawal to see history</p>
              </div>
            ) : (
              withdrawalRequests.map((req, idx) => (
                <div key={req._id || idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">₹{req.amount}</p>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      Method: {req.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}
                    </p>
                  </div>
                  {req.status === 'completed' && req.transactionId && (
                    <button
                      onClick={() => copyToClipboard(req.transactionId)}
                      className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      TXN ID
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleWithdrawal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (min ₹50)"
                    className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Available balance: ₹{wallet?.balance || 0}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      paymentMethod === 'upi'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      paymentMethod === 'bank'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>
              
              {paymentMethod === 'upi' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={bankDetails.ifsc}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Banknote size={16} />}
                  Request Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryWallet;