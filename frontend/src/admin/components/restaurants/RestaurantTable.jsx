import React, { useState, useEffect } from 'react';
import {
  Search, MoreVertical, Eye, Edit, Power, Trash2, Phone, Mail,
  ChevronLeft, ChevronRight, Truck, MapPin, Star, Filter, X,
  Store, DollarSign, Clock
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const RestaurantTable = ({
  restaurants = [],
  loading = false,
  onViewRestaurant,
  onEditRestaurant,
  onToggleStatus,
  onDeleteRestaurant,
  onViewMenu,
  onViewOrders,
  totalRestaurants = 0,
  page = 1,
  onPageChange,
  itemsPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showActions, setShowActions] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  // Apply filters
  useEffect(() => {
    let filtered = [...restaurants];

    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(restaurant =>
        statusFilter === 'active' ? restaurant.isActive : !restaurant.isActive
      );
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter]);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
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
  };

  const hasActiveFilters = searchTerm || statusFilter;

  const totalPages = Math.ceil(totalRestaurants / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);
  const filteredStats = {
    total: filteredRestaurants.length,
    active: filteredRestaurants.filter(r => r.isActive).length,
    inactive: filteredRestaurants.filter(r => !r.isActive).length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, cuisine or city..."
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
            <option value="active">🟢 Active</option>
            <option value="inactive">🔴 Inactive</option>
          </select>
          
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
            <span>Found {filteredStats.total} restaurant{filteredStats.total !== 1 ? 's' : ''}</span>
            <span className="text-xs">({filteredStats.active} active, {filteredStats.inactive} inactive)</span>
          </div>
          <button onClick={clearFilters} className="text-blue-600 hover:underline text-xs">
            Show all {totalRestaurants} restaurants
          </button>
        </div>
      )}

      {/* Restaurants Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuisine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayRestaurants.map((restaurant) => (
              <tr key={restaurant._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {restaurant.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{restaurant.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{restaurant.openingTime || '09:00'} - {restaurant.closingTime || '22:00'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone size={12} className="text-gray-400" />
                      <span>{restaurant.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={12} className="text-gray-400" />
                      <span className="truncate max-w-[150px]">{restaurant.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate max-w-[120px]">{restaurant.city}, {restaurant.state}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {restaurant.cuisine || 'Multi-Cuisine'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Star size={14} className={`fill-current ${getRatingColor(restaurant.rating || 4.5)}`} />
                    <span className="text-sm font-medium">{restaurant.rating || '4.5'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-gray-400" />
                    <span className="text-sm">{formatCurrency(restaurant.minOrderAmount || 99)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={restaurant.isActive ? 'active' : 'blocked'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setShowActions(showActions === restaurant._id ? null : restaurant._id)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {showActions === restaurant._id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-20">
                        <button
                          onClick={() => {
                            onViewRestaurant?.(restaurant);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={() => {
                            onEditRestaurant?.(restaurant);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Edit size={14} /> Edit Restaurant
                        </button>
                        <button
                          onClick={() => {
                            onViewMenu?.(restaurant);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Store size={14} /> View Menu
                        </button>
                        <button
                          onClick={() => {
                            onViewOrders?.(restaurant);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Truck size={14} /> View Orders
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            onToggleStatus?.(restaurant._id);
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
                        >
                          <Power size={14} />
                          {restaurant.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${restaurant.name}? This action cannot be undone.`)) {
                              onDeleteRestaurant?.(restaurant._id);
                            }
                            setShowActions(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} /> Delete Restaurant
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {displayRestaurants.length === 0 && (
        <div className="text-center py-12">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No restaurants found</p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-600 hover:underline flex items-center gap-1 mx-auto"
            >
              <Filter size={14} /> Clear filters
            </button>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Click "Add Restaurant" to get started</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants
            {hasActiveFilters && filteredStats.total !== totalRestaurants && (
              <span className="text-gray-400 ml-1">(filtered: {filteredStats.total})</span>
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
          <span>🏪 Total: {totalRestaurants}</span>
          <span>🟢 Active: {restaurants.filter(r => r.isActive).length}</span>
          <span>🔴 Inactive: {restaurants.filter(r => !r.isActive).length}</span>
          <span>⭐ Avg Rating: {(restaurants.reduce((sum, r) => sum + (r.rating || 4.5), 0) / (restaurants.length || 1)).toFixed(1)} / 5</span>
          {hasActiveFilters && filteredStats.total !== totalRestaurants && (
            <span className="text-blue-600">
              📊 Showing {filteredStats.total} of {totalRestaurants} restaurants
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantTable;