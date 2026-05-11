import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, Clock, DollarSign, Truck, Image as ImageIcon } from 'lucide-react';

const RestaurantModal = ({ isOpen, onClose, restaurant, onSave, onDelete, onToggleStatus }) => {
  const [isEditing, setIsEditing] = useState(!restaurant);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    cuisine: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    minOrderAmount: '',
    deliveryFee: '',
    openingTime: '09:00',
    closingTime: '22:00',
    isActive: true,
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        state: restaurant.state || '',
        pincode: restaurant.pincode || '',
        minOrderAmount: restaurant.minOrderAmount || '',
        deliveryFee: restaurant.deliveryFee || '',
        openingTime: restaurant.openingTime || '09:00',
        closingTime: restaurant.closingTime || '22:00',
        isActive: restaurant.isActive !== false,
        image: restaurant.image || '',
      });
      setImagePreview(restaurant.image || '');
    }
  }, [restaurant]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // In production, upload to server and get URL
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(restaurant?._id, formData);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error saving restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${restaurant?.name}?`)) {
      setLoading(true);
      try {
        await onDelete(restaurant._id);
        onClose();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await onToggleStatus(restaurant._id);
      setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              {restaurant ? (isEditing ? 'Edit Restaurant' : 'Restaurant Details') : 'Add New Restaurant'}
            </h2>
            <p className="text-sm text-gray-500">
              {restaurant ? 'Manage restaurant information' : 'Create a new restaurant profile'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header with Image and Basic Info - View Mode Only */}
          {!isEditing && restaurant && (
            <div className="mb-6 pb-6 border-b">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">{restaurant.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold">{restaurant.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {restaurant.cuisine || 'Multi-Cuisine'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={14} /> {restaurant.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone size={14} /> {restaurant.phone}</span>
                  </div>
                  {restaurant.description && (
                    <p className="text-sm text-gray-600 mt-2">{restaurant.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold mb-3 pb-2 border-b">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <input
                      type="text"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      placeholder="e.g., North Indian, Chinese, Italian"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Restaurant description, specialities, etc."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Image</label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      )}
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <ImageIcon size={18} />
                        Upload Image
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-md font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                  <MapPin size={18} /> Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Settings */}
              <div>
                <h4 className="text-md font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                  <DollarSign size={18} /> Business Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
                    <input
                      type="number"
                      name="deliveryFee"
                      value={formData.deliveryFee}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Restaurant Status</p>
                  <p className="text-sm text-gray-500">Active restaurants are visible to customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (restaurant) {
                      setIsEditing(false);
                    } else {
                      onClose();
                    }
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (restaurant ? 'Save Changes' : 'Create Restaurant')}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Restaurant Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Contact Information</p>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2"><Mail size={14} /> {restaurant.email}</p>
                    <p className="text-sm flex items-center gap-2"><Phone size={14} /> {restaurant.phone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm">{restaurant.address}, {restaurant.city}, {restaurant.state} - {restaurant.pincode}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Business Hours</p>
                  <p className="text-sm flex items-center gap-2"><Clock size={14} /> {restaurant.openingTime} - {restaurant.closingTime}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Pricing</p>
                  <p className="text-sm flex items-center gap-2"><DollarSign size={14} /> Min Order: ₹{restaurant.minOrderAmount || 99}</p>
                  <p className="text-sm flex items-center gap-2"><Truck size={14} /> Delivery Fee: ₹{restaurant.deliveryFee || 29}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Restaurant
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    restaurant.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {restaurant.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Restaurant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal;