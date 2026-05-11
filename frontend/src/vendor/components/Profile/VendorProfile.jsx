// vendor/components/Profile/VendorProfile.jsx
import React, { useState, useEffect } from 'react';
import API from '../../../services/axios';
import { Camera, Save, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorProfile = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    restaurantName: profile?.restaurantInfo?.restaurantName || profile?.restaurantName || '',
    email: profile?.basicInfo?.email || profile?.email || '',
    phone: profile?.basicInfo?.phone || profile?.phone || '',
    address: profile?.restaurantInfo?.address || profile?.address || '',
    city: profile?.restaurantInfo?.city || profile?.city || '',
    pincode: profile?.restaurantInfo?.pincode || profile?.pincode || '',
    description: profile?.restaurantInfo?.description || profile?.description || '',
    cuisine: profile?.restaurantInfo?.cuisine?.join(', ') || profile?.cuisine?.join(', ') || '',
    isOpen: profile?.restaurantInfo?.isOpen || profile?.isOpen || false
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Fix: Get logo from correct path in profile object
  const [logoPreview, setLogoPreview] = useState(() => {
    const logo = profile?.restaurantInfo?.logo || profile?.logo || profile?.data?.logo || null;
    console.log('Initial logo preview:', logo);
    return logo;
  });

  // Update logo preview when profile changes
  useEffect(() => {
    const newLogo = profile?.restaurantInfo?.logo || profile?.logo || profile?.data?.logo || null;
    console.log('Profile updated, new logo:', newLogo);
    if (newLogo) {
      setLogoPreview(newLogo);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    const loadingToast = toast.loading('Uploading logo...');

    try {
      const formDataLogo = new FormData();
      formDataLogo.append('logo', file);

      const response = await API.patch('/vendor/profile/logo', formDataLogo, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Logo upload response:', response.data);
      
      // Get the new logo URL from response
      const newLogoUrl = response.data?.data?.logo || 
                         response.data?.logo || 
                         response.data?.imageUrl ||
                         response.data?.url;
      
      console.log('New logo URL:', newLogoUrl);
      
      if (newLogoUrl) {
        // Update local preview immediately
        setLogoPreview(newLogoUrl);
        toast.success('Logo uploaded successfully!', { id: loadingToast });
        
        // Refresh profile data to get the updated logo
        await onUpdate();
        
        // Force a small delay to ensure profile is updated
        setTimeout(() => {
          // Try to get the updated logo from the refreshed profile prop
          const updatedLogo = profile?.restaurantInfo?.logo || profile?.logo || newLogoUrl;
          setLogoPreview(updatedLogo);
        }, 500);
      } else {
        throw new Error('No logo URL returned from server');
      }
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo', { id: loadingToast });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Updating profile...');
    
    try {
      const data = {
        restaurantName: formData.restaurantName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        description: formData.description,
        cuisine: formData.cuisine.split(',').map(c => c.trim()),
        isOpen: formData.isOpen
      };
      
      await API.put('/vendor/profile', data);
      toast.success('Profile updated successfully!', { id: loadingToast });
      await onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await API.patch('/vendor/profile/status');
      toast.success(response.data.message || `Restaurant is now ${!formData.isOpen ? 'Open' : 'Closed'}`);
      await onUpdate();
      setFormData({ ...formData, isOpen: !formData.isOpen });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:4000${imagePath}`;
    if (imagePath.startsWith('uploads')) return `http://localhost:4000/${imagePath}`;
    return imagePath;
  };

  const displayLogo = getImageUrl(logoPreview);
  console.log('Display logo URL:', displayLogo);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
            {displayLogo ? (
              <img 
                src={displayLogo} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Logo failed to load:', displayLogo);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/96?text=Logo';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Store size={40} />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-1 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-600 transition">
            <Camera size={14} className="text-white" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange} 
              className="hidden" 
              disabled={uploadingLogo}
            />
          </label>
          {uploadingLogo && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold">Restaurant Logo</h3>
          <p className="text-sm text-gray-500">Click the camera icon to upload</p>
          {uploadingLogo && <p className="text-xs text-orange-500 mt-1">Uploading...</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant Name *
          </label>
          <input
            type="text"
            name="restaurantName"
            value={formData.restaurantName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine (comma separated)
          </label>
          <input
            type="text"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            placeholder="North Indian, Chinese, Italian"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Restaurant Status:</span>
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              formData.isOpen
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {formData.isOpen ? 'Open Now' : 'Closed'}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default VendorProfile;