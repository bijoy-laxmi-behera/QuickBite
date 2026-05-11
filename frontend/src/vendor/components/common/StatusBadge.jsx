// vendor/components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
    preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
    ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
    picked_up: { label: 'Picked Up', color: 'bg-gray-100 text-gray-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;