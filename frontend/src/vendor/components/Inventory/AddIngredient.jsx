// vendor/components/Inventory/AddIngredient.jsx
import React, { useState } from 'react';
import API from '../../../services/axios'; // Use configured axios, not default axios
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AddIngredient = ({ ingredient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || '',
    unit: ingredient?.unit || 'kg',
    currentStock: ingredient?.currentStock || 0,
    threshold: ingredient?.threshold || 10,
    costPerUnit: ingredient?.costPerUnit || 0
  });
  const [loading, setLoading] = useState(false);

  const units = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      toast.error('Ingredient name is required');
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading(ingredient ? 'Updating...' : 'Adding ingredient...');
    
    try {
      let response;
      if (ingredient) {
        response = await API.put(`/vendor/inventory/${ingredient._id}`, formData);
      } else {
        response = await API.post('/vendor/inventory', formData);
      }
      
      if (response.data.success) {
        toast.success(ingredient ? 'Ingredient updated!' : 'Ingredient added!', {
          id: loadingToast
        });
        onSave();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
      
      let errorMessage = 'Failed to save ingredient';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        if (error.response.status === 400) {
          errorMessage = 'Please check all required fields';
        } else if (error.response.status === 401) {
          errorMessage = 'You are not authorized';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check server connection.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Make sure backend server is running on port 4000';
      }
      
      toast.error(errorMessage, { id: loadingToast, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold">
            {ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Vegetables, Dairy, Meat"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold *
              </label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost per Unit (₹)
              </label>
              <input
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

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
                ingredient ? 'Update' : 'Add Ingredient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredient;