import React, { useState, useEffect } from 'react';
import { Eye, Package, Truck, Coffee, CheckCircle, XCircle, Clock } from 'lucide-react';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

const statusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: Coffee,
  out_for_delivery: Truck,
  delivered: Package,
  cancelled: XCircle,
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
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
    fetchOrders();
  }, [statusFilter, dateFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      const data = await fetchWithAuth(`/admin/orders?${params.toString()}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await fetchWithAuth(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const getOrderItemsTotal = (items) => {
    return items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-500">View and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          onClick={() => {
            setStatusFilter('');
            setDateFilter('');
          }}
          className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusIcons[order.status] || Package;
          return (
            <div key={order._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">Order #{order._id?.slice(-8)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-medium">{order.user?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">₹{order.totalAmount || getOrderItemsTotal(order.items)}</p>
                  <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mt-3 text-sm text-gray-500">
                {order.items?.slice(0, 2).map((item, idx) => (
                  <span key={idx}>
                    {item.quantity}x {item.name}
                    {idx < Math.min(order.items.length, 2) - 1 && ', '}
                  </span>
                ))}
                {order.items?.length > 2 && ` +${order.items.length - 2} more`}
              </div>

              <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon size={18} className={order.status === 'delivered' ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm capitalize">{order.status?.replace('_', ' ')}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Eye size={16} /> View Details
                  </button>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateStatus(order._id, e.target.value);
                        }
                      }}
                      defaultValue=""
                      className="px-3 py-1 border rounded-lg text-sm"
                    >
                      <option value="" disabled>Update Status</option>
                      {statusOptions.map(opt => {
                        if (opt.value === order.status) return null;
                        if (order.status === 'pending' && opt.value === 'cancelled') return (
                          <option key={opt.value} value={opt.value}>Cancel Order</option>
                        );
                        if (order.status === 'pending' && opt.value === 'accepted') return (
                          <option key={opt.value} value={opt.value}>Accept Order</option>
                        );
                        if (order.status === 'accepted' && opt.value === 'preparing') return (
                          <option key={opt.value} value={opt.value}>Start Preparing</option>
                        );
                        if (order.status === 'preparing' && opt.value === 'out_for_delivery') return (
                          <option key={opt.value} value={opt.value}>Out for Delivery</option>
                        );
                        if (order.status === 'out_for_delivery' && opt.value === 'delivered') return (
                          <option key={opt.value} value={opt.value}>Mark Delivered</option>
                        );
                        return null;
                      })}
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs">Item</th>
                        <th className="px-4 py-2 text-left text-xs">Qty</th>
                        <th className="px-4 py-2 text-left text-xs">Price</th>
                        <th className="px-4 py-2 text-right text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">₹{item.price}</td>
                          <td className="px-4 py-2 text-sm text-right">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium">Total:</td>
                        <td className="px-4 py-2 text-right font-bold">
                          ₹{selectedOrder.totalAmount || getOrderItemsTotal(selectedOrder.items)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.address && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                  <p className="text-sm">{selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                </div>
              )}

              {selectedOrder.deliveryAgent && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Agent</p>
                  <p className="text-sm">{selectedOrder.deliveryAgent}</p>
                </div>
              )}
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

export default OrdersPage;