import React, { useState } from 'react';
import {
  Search, MoreVertical, Edit, Trash2, Power, Copy,
  ChevronLeft, ChevronRight, Calendar, DollarSign, Percent, Ticket
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const CouponTable = ({
  coupons,
  loading,
  onViewCoupon,
  onEditCoupon,
  onToggleStatus,
  onDeleteCoupon,
  totalCoupons,
  page,
  onPageChange,
  itemsPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showActions, setShowActions] = useState(null);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && coupon.isActive) ||
      (statusFilter === 'inactive' && !coupon.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const getExpiryStatus = (coupon) => {
    if (!coupon.isActive) return 'Inactive';
    if (isExpired(coupon.validUntil)) return 'Expired';
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'Used Up';
    return 'Active';
  };

  const formatDate = (date) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString();
  };

  const totalPages = Math.ceil(totalCoupons / itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by code or description..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="px-3 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredCoupons.map((coupon) => {
          const expiryStatus = getExpiryStatus(coupon);
          const isExpiredStatus = expiryStatus === 'Expired';
          const isUsedUp = expiryStatus === 'Used Up';
          
          return (
            <div
              key={coupon._id}
              className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                isExpiredStatus || !coupon.isActive ? 'opacity-75 bg-gray-50' : ''
              }`}
            >
              {/* Coupon Header */}
              <div className={`p-4 ${coupon.isActive && !isExpiredStatus ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className={coupon.isActive && !isExpiredStatus ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="font-mono font-bold text-lg">{coupon.code}</span>
                    </div>
                    {coupon.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{coupon.description}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === coupon._id ? null : coupon._id)}
                      className="p-1 rounded-lg hover:bg-gray-200"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showActions === coupon._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
                        <button
                          onClick={() => {
                            onViewCoupon(coupon);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Edit size={14} /> View Details
                        </button>
                        <button
                          onClick={() => {
                            onEditCoupon(coupon);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            onToggleStatus(coupon._id);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Power size={14} /> {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <hr />
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${coupon.code}?`)) {
                              onDeleteCoupon(coupon._id);
                            }
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon Body */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {coupon.discountType === 'percentage' ? (
                      <Percent size={14} className="text-green-600" />
                    ) : (
                      <DollarSign size={14} className="text-green-600" />
                    )}
                    <span className="text-xl font-bold text-green-600">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <StatusBadge 
                    status={coupon.isActive && !isExpiredStatus && !isUsedUp ? 'active' : 'blocked'}
                    customLabel={expiryStatus}
                  />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {coupon.minOrderAmount > 0 && (
                    <div>Min Order: ₹{coupon.minOrderAmount}</div>
                  )}
                  {coupon.maxDiscount > 0 && (
                    <div>Max Discount: ₹{coupon.maxDiscount}</div>
                  )}
                  {coupon.usageLimit && (
                    <div>Usage: {coupon.usedCount || 0}/{coupon.usageLimit}</div>
                  )}
                  {(coupon.validFrom || coupon.validUntil) && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'Now'} - 
                        {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : '∞'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    <Copy size={12} /> Copy Code
                  </button>
                  <button
                    onClick={() => onViewCoupon(coupon)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCoupons.length === 0 && (
        <div className="text-center py-12">
          <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No coupons found</p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="mt-2 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, totalCoupons)} of {totalCoupons} coupons
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
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
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg ${
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
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex gap-4 flex-wrap">
          <span>Total Coupons: {totalCoupons}</span>
          <span>Active: {coupons.filter(c => c.isActive).length}</span>
          <span>Inactive: {coupons.filter(c => !c.isActive).length}</span>
          <span>Expired: {coupons.filter(c => c.validUntil && new Date(c.validUntil) < new Date()).length}</span>
        </div>
      </div>
    </div>
  );
};

export default CouponTable;