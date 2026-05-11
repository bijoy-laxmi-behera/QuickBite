import React from 'react';
import {
  X, Clock, CheckCircle, XCircle, Truck, Coffee, Package,
  MapPin, Phone, User, Calendar, DollarSign, Printer, Copy
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const OrderDetailModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={20} className="text-blue-500" />;
      case 'preparing': return <Coffee size={20} className="text-purple-500" />;
      case 'out_for_delivery': return <Truck size={20} className="text-orange-500" />;
      case 'delivered': return <Package size={20} className="text-green-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes ago`;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order._id);
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Coffee },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Package },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Order Details</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 font-mono">#{order._id}</span>
              <button
                onClick={handleCopyId}
                className="p-0.5 text-gray-400 hover:text-gray-600"
                title="Copy Order ID"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Timeline */}
          {!isCancelled && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Status Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                <div className="space-y-4">
                  {statusSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="relative flex items-start gap-3">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-gray-500 mt-0.5">Current status</p>
                          )}
                          {step.key === 'delivered' && order.deliveredAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.deliveredAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Notice */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle size={20} className="text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Order Cancelled</p>
                <p className="text-sm text-red-700">
                  This order was cancelled on {new Date(order.updatedAt).toLocaleString()}
                </p>
                {order.cancellationReason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {order.cancellationReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Order Information</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Date:</span>
                  <span className="text-sm">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Elapsed:</span>
                  <span className="text-sm">{getTimeElapsed(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm capitalize">{order.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span className={`text-sm ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Customer Information</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-sm">{order.user?.name || 'Guest'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-sm">{order.user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-sm">{order.user?.email || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <MapPin size={14} /> Delivery Address
              </p>
              <p className="text-sm">{order.address.street}</p>
              <p className="text-sm">{order.address.city}, {order.address.state}</p>
              <p className="text-sm">Pincode: {order.address.pincode}</p>
              {order.address.landmark && (
                <p className="text-sm text-gray-500">Landmark: {order.address.landmark}</p>
              )}
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">₹{item.price}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium">Subtotal:</td>
                    <td className="px-4 py-3 text-right">₹{order.subtotal || order.totalAmount}</td>
                  </tr>
                  {order.deliveryFee > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-sm text-gray-500">Delivery Fee:</td>
                      <td className="px-4 py-2 text-right text-sm">₹{order.deliveryFee}</td>
                    </tr>
                  )}
                  {order.tax > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-sm text-gray-500">Tax:</td>
                      <td className="px-4 py-2 text-right text-sm">₹{order.tax}</td>
                    </tr>
                  )}
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-sm text-green-600">Discount:</td>
                      <td className="px-4 py-2 text-right text-sm text-green-600">-₹{order.discount}</td>
                    </tr>
                  )}
                  <tr className="border-t">
                    <td colSpan="3" className="px-4 py-3 text-right font-bold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-lg">₹{order.totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="flex gap-3 pt-4 border-t">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(order._id, 'accepted')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CheckCircle size={18} /> Accept Order
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order._id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle size={18} /> Cancel Order
                  </button>
                </>
              )}
              
              {order.status === 'accepted' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'preparing')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Coffee size={18} /> Start Preparing
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'out_for_delivery')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <Truck size={18} /> Mark Out for Delivery
                </button>
              )}
              
              {order.status === 'out_for_delivery' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'delivered')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Package size={18} /> Mark Delivered
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;