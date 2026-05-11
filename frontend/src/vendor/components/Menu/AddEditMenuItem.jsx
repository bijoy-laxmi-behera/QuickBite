// vendor/components/Menu/AddEditMenuItem.jsx
import React, { useState } from 'react';
import API from '../../../services/axios';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const AddEditMenuItem = ({ item, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category?._id || item?.category || (categories[0]?._id || ''),
    isveg: item?.isveg !== undefined ? item.isveg : true,
    preparationTime: item?.preparationTime || 30,
    isAvailable: item?.isAvailable !== undefined ? item.isAvailable : true,
    image: null
  });
  
  // Fix: Handle existing image URL properly
  const getInitialImagePreview = () => {
    if (item?.image) {
      if (item.image.startsWith('http')) return item.image;
      if (item.image.startsWith('/uploads')) return `http://localhost:4000${item.image}`;
      return item.image;
    }
    return null;
  };
  
  const [imagePreview, setImagePreview] = useState(getInitialImagePreview());
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WEBP)');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading(item ? 'Updating item...' : 'Adding item...');
    
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description || '');
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isveg', formData.isveg);
      data.append('preparationTime', formData.preparationTime);
      data.append('isAvailable', formData.isAvailable);
      
      if (formData.image && formData.image instanceof File) {
        data.append('image', formData.image);
      }
      
      let response;
      if (item) {
        response = await API.put(`/vendor/menu/${item._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await API.post('/vendor/menu', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      if (response.data.success) {
        toast.success(item ? 'Item updated successfully!' : 'Item added successfully!', {
          id: loadingToast
        });
        onSave();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save item');
      }
      
    } catch (error) {
      console.error('Error saving item:', error);
      
      let errorMessage = 'Failed to save item';
      if (error.response) {
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Please check all required fields';
        } else if (error.response.status === 401) {
          errorMessage = 'You are not authorized';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage, { id: loadingToast, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">
            {item ? 'Edit Menu Item' : 'Add New Item'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-600">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-400">
                    JPEG, PNG, WEBP (Max 2MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Butter Chicken"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe your dish..."
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="199"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prep Time & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prep Time (mins)
              </label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                min="5"
                step="5"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Type
              </label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isveg"
                    value="true"
                    checked={formData.isveg === true}
                    onChange={() => setFormData({ ...formData, isveg: true })}
                    className="mr-2"
                  />
                  <span className="text-green-600">Pure Veg</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isveg"
                    value="false"
                    checked={formData.isveg === false}
                    onChange={() => setFormData({ ...formData, isveg: false })}
                    className="mr-2"
                  />
                  <span className="text-red-600">Non-Veg</span>
                </label>
              </div>
            </div>
          </div>

          {/* Availability */}
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Available for ordering</span>
          </label>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                item ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMenuItem;