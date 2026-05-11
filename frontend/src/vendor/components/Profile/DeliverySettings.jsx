// vendor/components/Profile/DeliverySettings.jsx
import React, { useState } from 'react';
import API from '../../../services/axios'; // Use configured axios
import { Truck, MapPin, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const DeliverySettings = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    deliveryEnabled: profile?.deliverySettings?.enabled !== false,
    deliveryRadius: profile?.deliverySettings?.radius || 5,
    minOrderAmount: profile?.deliverySettings?.minOrderAmount || 0,
    deliveryFee: profile?.deliverySettings?.deliveryFee || 0,
    freeDeliveryThreshold: profile?.deliverySettings?.freeDeliveryThreshold || 0,
    estimatedDeliveryTime: profile?.deliverySettings?.estimatedTime || 30,
    pickupEnabled: profile?.pickupEnabled !== false,
    prepTime: profile?.prepTime || 20
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Updating delivery settings...');
    
    try {
      const payload = {
        deliverySettings: {
          enabled: formData.deliveryEnabled,
          radius: parseFloat(formData.deliveryRadius),
          minOrderAmount: parseFloat(formData.minOrderAmount),
          deliveryFee: parseFloat(formData.deliveryFee),
          freeDeliveryThreshold: parseFloat(formData.freeDeliveryThreshold),
          estimatedTime: parseInt(formData.estimatedDeliveryTime)
        },
        pickupEnabled: formData.pickupEnabled,
        prepTime: parseInt(formData.prepTime)
      };
      
      console.log('Sending payload:', payload);
      
      await API.patch('/vendor/profile/delivery-settings', payload);
      
      toast.success('Delivery settings updated successfully!', { id: loadingToast });
      onUpdate();
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update settings', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Truck size={20} className="text-orange-500" />
          <div>
            <p className="font-medium text-gray-800">Enable Delivery</p>
            <p className="text-sm text-gray-500">Allow customers to order for delivery</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="deliveryEnabled"
            checked={formData.deliveryEnabled}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      {/* Pickup Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <MapPin size={20} className="text-orange-500" />
          <div>
            <p className="font-medium text-gray-800">Enable Pickup</p>
            <p className="text-sm text-gray-500">Allow customers to pick up orders</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="pickupEnabled"
            checked={formData.pickupEnabled}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      {formData.deliveryEnabled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                name="deliveryRadius"
                value={formData.deliveryRadius}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Time (mins)
              </label>
              <input
                type="number"
                name="estimatedDeliveryTime"
                value={formData.estimatedDeliveryTime}
                onChange={handleChange}
                min="10"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                name="freeDeliveryThreshold"
                value={formData.freeDeliveryThreshold}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Set 0 to disable free delivery</p>
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Preparation Time (mins)
        </label>
        <input
          type="number"
          name="prepTime"
          value={formData.prepTime}
          onChange={handleChange}
          min="5"
          className="w-full md:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">Estimated time for order preparation</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <AlertCircle size={18} className="text-blue-500 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Delivery settings affect how customers see your restaurant. 
              Changes will be reflected immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </form>
  );
};

export default DeliverySettings;