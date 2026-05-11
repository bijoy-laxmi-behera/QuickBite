// vendor/components/Menu/CategoryManager.jsx
import React, { useState } from 'react';
import API from '../../../services/axios';
import { X, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryManager = ({ categories, onClose, onUpdate }) => {
  const [categoryList, setCategoryList] = useState(categories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    toast.loading('Adding category...', { id: 'addCategory' });
    
    try {
      const response = await API.post('/vendor/categories', {
        name: formData.name.trim(),
        description: formData.description || ''
      });
      
      if (response.data.success) {
        toast.success('Category added successfully!', { id: 'addCategory' });
        onUpdate();
        setShowAddForm(false);
        setFormData({ name: '', description: '' });
      } else {
        throw new Error(response.data.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add category';
      toast.error(errorMessage, { id: 'addCategory' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    toast.loading('Updating category...', { id: 'updateCategory' });
    
    try {
      const response = await API.put(`/vendor/categories/${editingCategory._id}`, {
        name: formData.name.trim(),
        description: formData.description || ''
      });
      
      if (response.data.success) {
        toast.success('Category updated successfully!', { id: 'updateCategory' });
        onUpdate();
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update category';
      toast.error(errorMessage, { id: 'updateCategory' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, categoryName) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm">Delete "{categoryName}"?</p>
        <p className="text-xs text-gray-500">This action cannot be undone.</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDeleteCategory(id);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const confirmDeleteCategory = async (id) => {
    toast.loading('Deleting category...', { id: 'deleteCategory' });
    
    try {
      const response = await API.delete(`/vendor/categories/${id}`);
      
      if (response.data.success) {
        toast.success('Category deleted successfully!', { id: 'deleteCategory' });
        onUpdate();
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category';
      
      if (error.response?.status === 400) {
        toast.error('Cannot delete category with menu items. Please reassign items first.', { 
          id: 'deleteCategory',
          duration: 4000
        });
      } else {
        toast.error(errorMessage, { id: 'deleteCategory' });
      }
    }
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    toast.loading(`${newStatus ? 'Showing' : 'Hiding'} category...`, { id: 'toggleCategory' });
    
    try {
      const response = await API.patch(`/vendor/categories/${id}/visibility`, {
        isActive: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Category ${newStatus ? 'shown' : 'hidden'} successfully!`, { id: 'toggleCategory' });
        onUpdate();
      } else {
        throw new Error(response.data.message || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update visibility', { id: 'toggleCategory' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center space-x-2"
          >
            <Plus size={18} />
            <span>Add New Category</span>
          </button>

          {categoryList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories yet</p>
              <p className="text-sm mt-1">Click "Add New Category" to create one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryList.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleToggleVisibility(cat._id, cat.isActive)}
                      className="p-1.5 hover:bg-gray-200 rounded"
                      title={cat.isActive ? 'Hide' : 'Show'}
                    >
                      {cat.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setFormData({ 
                          name: cat.name, 
                          description: cat.description || '' 
                        });
                        setError('');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingCategory) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-sm w-full p-5">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCategory(null);
                      setFormData({ name: '', description: '' });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;