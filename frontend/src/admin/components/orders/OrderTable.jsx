import React, { useState, useEffect } from 'react';
import {
  Eye, Search, Filter, ChevronLeft, ChevronRight,
  Clock, CheckCircle, XCircle, Truck, Coffee, Package,
  Calendar, Download, X
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const OrderTable = ({
  orders = [],
  loading = false,
  onViewOrder,
  onUpdateStatus,
  totalOrders = 0,
  page = 1,
  onPageChange,
  itemsPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(order =>
        new Date(order.createdAt).toDateString() === filterDate
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={14} className="text-blue-500" />;
      case 'preparing': return <Coffee size={14} className="text-purple-500" />;
      case 'out_for_delivery': return <Truck size={14} className="text-orange-500" />;
      case 'delivered': return <Package size={14} className="text-green-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || dateFilter;

  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading orders...</p>
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
                placeholder="Search by order ID or customer..."
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
            <option value="pending">⏳ Pending</option>
            <option value="accepted">✓ Accepted</option>
            <option value="preparing">☕ Preparing</option>
            <option value="out_for_delivery">🚚 Out for Delivery</option>
            <option value="delivered">✅ Delivered</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm flex items-center gap-1"
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Results Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter size={14} />
            <span>Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={clearFilters} className="text-blue-600 hover:underline text-xs">
            Show all {totalOrders} orders
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-600">#{order._id?.slice(-8)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{order.user?.name || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{order.user?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.name}
                        {idx < Math.min(order.items.length, 2) - 1 && ', '}
                      </span>
                    ))}
                    {order.items?.length > 2 && (
                      <span className="text-xs text-gray-500">+{order.items.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold">{formatCurrency(order.totalAmount)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    <StatusBadge status={order.status} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onViewOrder?.(order)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {displayOrders.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No orders found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalOrders)} of {totalOrders} orders
            {hasActiveFilters && filteredOrders.length !== totalOrders && (
              <span className="text-gray-400 ml-1">(filtered: {filteredOrders.length})</span>
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
          <span>📦 Total: {totalOrders}</span>
          <span>⏳ Pending: {orders.filter(o => o.status === 'pending').length}</span>
          <span>✅ Delivered: {orders.filter(o => o.status === 'delivered').length}</span>
          <span>❌ Cancelled: {orders.filter(o => o.status === 'cancelled').length}</span>
          <span>💰 Revenue: {formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}</span>
          {hasActiveFilters && filteredOrders.length !== totalOrders && (
            <span className="text-blue-600">
              📊 Showing {filteredOrders.length} of {totalOrders} orders
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTable;