// vendor/components/Orders/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, Download } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Loader from '../common/Loader';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrderHistory();
  }, [currentPage, dateRange]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/order/history', {
        params: { page: currentPage, ...dateRange },
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Items', 'Total', 'Status', 'Payment Method'];
    const csvData = orders.map(order => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.items.length,
      order.totalAmount,
      order.status,
      order.paymentMethod
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={exportToCSV}
            className="text-orange-500 text-sm flex items-center space-x-1 hover:text-orange-600"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Order ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Items</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Total</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.filter(order => 
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-gray-800">#{order.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items.length}</td>
                  <td className="px-6 py-4 font-semibold text-orange-600">₹{order.totalAmount}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">{order.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-600">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;