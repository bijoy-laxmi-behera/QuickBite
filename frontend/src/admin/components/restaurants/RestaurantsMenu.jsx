import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, Search, Filter,
  DollarSign, Package, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, Power
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Loader from '../common/Loader';
import Toast from '../common/Toast';

const RestaurantsMenu = ({ restaurantId, restaurantName }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    isAvailable: true,
    image: '',
  });

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
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, [restaurantId]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/admin/restaurants/${restaurantId}/menu`);
      setMenuItems(data.items || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      showToast('Failed to fetch menu items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth('/admin/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetchWithAuth(`/admin/menu/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showToast('Menu item updated successfully');
      } else {
        await fetchWithAuth('/admin/menu', {
          method: 'POST',
          body: JSON.stringify({ ...formData, restaurant: restaurantId }),
        });
        showToast('Menu item added successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchMenu();
    } catch (error) {
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete "${item.name}" from menu?`)) {
      try {
        await fetchWithAuth(`/admin/menu/${item._id}`, { method: 'DELETE' });
        showToast('Menu item deleted successfully');
        fetchMenu();
      } catch (error) {
        showToast('Failed to delete item', 'error');
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await fetchWithAuth(`/admin/menu/${item._id}/availability`, { method: 'PATCH' });
      showToast(`${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}`);
      fetchMenu();
    } catch (error) {
      showToast('Failed to update availability', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      isAvailable: true,
      image: '',
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category?._id || item.category,
      description: item.description || '',
      isAvailable: item.isAvailable,
      image: item.image || '',
    });
    setShowModal(true);
  };

  const filteredItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!categoryFilter || item.category?._id === categoryFilter || item.category === categoryFilter)
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">Menu Items</h3>
          <p className="text-sm text-gray-500">Manage restaurant menu and pricing</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Menu Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

           {/* Menu Grid */}
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([categoryName, items]) => (
          <div key={categoryName}>
            <h4 className="text-md font-semibold mb-3 pb-2 border-b flex items-center gap-2">
              <Package size={18} className="text-gray-500" />
              {categoryName}
              <span className="text-xs text-gray-400 ml-2">({items.length} items)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Item Image */}
                  <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`p-1 rounded-lg shadow ${
                          item.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                        title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        <Power size={14} className="text-white" />
                      </button>
                    </div>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Unavailable</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-800">{item.name}</h5>
                      <StatusBadge status={item.isAvailable ? 'active' : 'blocked'} />
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t">
                      <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                        <DollarSign size={16} />
                        {item.price}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No menu items found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Add your first menu item
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Menu Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Item description, ingredients, etc."
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Available for Order</p>
                  <p className="text-xs text-gray-500">Show this item to customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isAvailable ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
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

export default RestaurantsMenu;