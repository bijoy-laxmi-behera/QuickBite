import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Wallet, Calendar, Search, Filter,
  Download, Eye, RefreshCw, CheckCircle, XCircle, Clock,
  TrendingUp, Users, ShoppingBag, AlertCircle, FileText,
  ChevronLeft, ChevronRight, Printer, Copy
} from 'lucide-react';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

const PaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentSummary();
  }, [page, filterStatus, dateRange]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('page', page);
      params.append('limit', 20);
      
      const data = await fetchWithAuth(`/admin/payments?${params.toString()}`);
      setPayments(data.payments || []);
      setTotalPages(Math.ceil((data.total || 0) / 20));
    } catch (error) {
      console.error('Error fetching payments:', error);
      showToast('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const data = await fetchWithAuth('/admin/payments/summary');
      setSummary(data);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      showToast('Please provide a refund reason', 'error');
      return;
    }
    
    setProcessingRefund(true);
    try {
      await fetchWithAuth(`/admin/payments/${selectedPayment._id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundReason }),
      });
      showToast('Refund processed successfully');
      setShowRefundModal(false);
      setRefundReason('');
      fetchPayments();
      fetchPaymentSummary();
    } catch (error) {
      console.error('Error processing refund:', error);
      showToast('Failed to process refund', 'error');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleExportData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`${API_BASE}/admin/payments/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export started successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'refunded': return <RefreshCw size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    },
    {
      title: 'Total Transactions',
      value: summary?.totalTransactions || 0,
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8.2%',
    },
    {
      title: 'Successful Payments',
      value: summary?.successfulPayments || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      trend: '+5.3%',
    },
    {
      title: 'Refunded Amount',
      value: formatCurrency(summary?.refundedAmount || 0),
      icon: RefreshCw,
      color: 'bg-red-100 text-red-600',
      trend: '-2.1%',
    },
  ];

  const filteredPayments = payments.filter(payment =>
    payment.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments Management</h1>
          <p className="text-gray-500">Track and manage all financial transactions</p>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {card.trend && (
                    <p className={`text-xs mt-2 ${card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend} from last month
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order ID, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <input
            type="date"
            placeholder="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="date"
            placeholder="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={() => {
              setFilterStatus('');
              setDateRange({ start: '', end: '' });
              setSearchTerm('');
            }}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-sm font-mono">{payment.paymentId?.slice(-12) || payment._id?.slice(-12)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    #{payment.order?._id?.slice(-8) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{payment.user?.name || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{payment.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-gray-400" />
                      <span className="text-sm capitalize">{payment.paymentMethod || 'Online'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleString()}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {payment.status === 'success' && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRefundModal(true);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Refund"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(payment.paymentId || payment._id);
                          showToast('Transaction ID copied to clipboard');
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy ID"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, filteredPayments.length)} of {filteredPayments.length} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedPayment.paymentId || selectedPayment._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-4xl font-bold text-gray-800">{formatCurrency(selectedPayment.amount)}</p>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedPayment.order?._id?.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(selectedPayment.order?.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedPayment.user?.name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedPayment.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedPayment.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{selectedPayment.paymentMethod || 'Online'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Date</p>
                    <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedPayment.razorpayPaymentId && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Razorpay Payment ID</p>
                      <p className="font-mono text-sm">{selectedPayment.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Information (if refunded) */}
              {selectedPayment.status === 'refunded' && selectedPayment.refundDetails && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">Refund Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Refund Amount:</span> {formatCurrency(selectedPayment.refundDetails.amount)}</p>
                    <p><span className="text-gray-600">Refund Date:</span> {new Date(selectedPayment.refundDetails.date).toLocaleString()}</p>
                    <p><span className="text-gray-600">Reason:</span> {selectedPayment.refundDetails.reason}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Printer size={18} /> Print Receipt
                </button>
                {selectedPayment.status === 'success' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRefundModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <RefreshCw size={18} /> Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Process Refund</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-medium">Refund Information</span>
                </div>
                <p className="text-sm text-yellow-700">
                  You are about to refund {formatCurrency(selectedPayment.amount)} to {selectedPayment.user?.name}.
                  This action cannot be undone.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Refund Reason *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide a reason for this refund..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={processingRefund}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processingRefund ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Confirm Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
    </div>
  );
};

export default PaymentsPage;