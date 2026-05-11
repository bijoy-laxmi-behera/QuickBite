import React, { useState, useEffect } from 'react';
import {
  Eye, RefreshCw, Copy, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, Wallet, CreditCard, FileText, AlertCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const PaymentTable = ({
  payments = [],
  loading = false,
  onViewPayment,
  onRefund,
  totalPayments = 0,
  page = 1,
  onPageChange,
  itemsPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter) {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= start && paymentDate <= end;
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter, dateRange]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="text-green-500" />;
      case 'failed': return <XCircle size={14} className="text-red-500" />;
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'refunded': return <RefreshCw size={14} className="text-blue-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
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

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': return <CreditCard size={14} className="text-blue-500" />;
      case 'upi': return <Wallet size={14} className="text-purple-500" />;
      case 'netbanking': return <CreditCard size={14} className="text-green-500" />;
      case 'cod': return <Wallet size={14} className="text-orange-500" />;
      default: return <CreditCard size={14} className="text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setMethodFilter('');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchTerm || statusFilter || methodFilter || dateRange.start || dateRange.end;

  // Calculate stats for filtered payments
  const filteredStats = {
    total: filteredPayments.length,
    success: filteredPayments.filter(p => p.status === 'success').length,
    failed: filteredPayments.filter(p => p.status === 'failed').length,
    pending: filteredPayments.filter(p => p.status === 'pending').length,
    refunded: filteredPayments.filter(p => p.status === 'refunded').length,
    totalAmount: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const totalPages = Math.ceil(totalPayments / itemsPerPage);

  // Get display payments with pagination
  const startIndex = (page - 1) * itemsPerPage;
  const displayPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by transaction ID, order ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="success">✅ Success</option>
            <option value="pending">⏳ Pending</option>
            <option value="failed">❌ Failed</option>
            <option value="refunded">🔄 Refunded</option>
          </select>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Methods</option>
            <option value="card">💳 Card</option>
            <option value="upi">📱 UPI</option>
            <option value="netbanking">🏦 Net Banking</option>
            <option value="cod">💵 Cash on Delivery</option>
            <option value="wallet">👛 Wallet</option>
          </select>
          
          <input
            type="date"
            placeholder="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          <span className="self-center text-gray-400">to</span>
          
          <input
            type="date"
            placeholder="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm flex items-center gap-1"
            >
              <XCircle size={16} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Results Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter size={14} />
            <span>Found {filteredStats.total} transaction{filteredStats.total !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={clearAllFilters} className="text-blue-600 hover:underline text-xs">
            Show all
          </button>
        </div>
      )}

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayPayments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-sm font-mono">
                      {payment.paymentId?.slice(-12) || payment._id?.slice(-12)}
                    </span>
                    <button
                      onClick={() => handleCopyId(payment.paymentId || payment._id)}
                      className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === (payment.paymentId || payment._id) ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm">
                    #{payment.orderId?.slice(-8) || payment.order?._id?.slice(-8) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{payment.user?.name || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{payment.user?.email || 'No email'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold">{formatCurrency(payment.amount)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getMethodIcon(payment.paymentMethod)}
                    <span className="text-sm capitalize">{payment.paymentMethod || 'Online'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(payment.status)}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onViewPayment?.(payment)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {payment.status === 'success' && onRefund && (
                      <button
                        onClick={() => onRefund(payment)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Process Refund"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {displayPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No payments found</p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalPayments)} of {totalPayments} transactions
            {hasActiveFilters && filteredStats.total !== totalPayments && (
              <span className="text-gray-400"> (filtered: {filteredStats.total})</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex gap-4 flex-wrap">
          <span className="font-medium">Summary:</span>
          <span>💰 Total: {formatCurrency(filteredStats.totalAmount)}</span>
          <span>✅ Success: {filteredStats.success}</span>
          <span>❌ Failed: {filteredStats.failed}</span>
          <span>⏳ Pending: {filteredStats.pending}</span>
          <span>🔄 Refunded: {filteredStats.refunded}</span>
          {hasActiveFilters && filteredStats.total !== totalPayments && (
            <span className="text-blue-600">
              📊 Showing {filteredStats.total} of {totalPayments} total
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTable;