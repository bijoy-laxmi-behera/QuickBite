import React from 'react';

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Blocked' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Preparing' },
  out_for_delivery: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Out for Delivery' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  online: { bg: 'bg-green-100', text: 'text-green-800', label: 'Online' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Offline' },
};

const StatusBadge = ({ status, customLabel, customColors }) => {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${customColors || `${config.bg} ${config.text}`}`}>
      {customLabel || config.label}
    </span>
  );
};

export default StatusBadge;