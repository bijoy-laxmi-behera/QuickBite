// vendor/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/axios';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import IngredientList from '../components/Inventory/IngredientList';
import AddIngredient from '../components/Inventory/AddIngredient';
import LowStockAlert from '../components/Inventory/LowStockAlert';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await API.get('/vendor/inventory');
      
      console.log('Inventory API Response:', response.data);
      
      // Fix: Ensure ingredients is an array
      let ingredientsData = [];
      if (response.data && Array.isArray(response.data)) {
        ingredientsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        ingredientsData = response.data.data;
      } else if (response.data && response.data.ingredients && Array.isArray(response.data.ingredients)) {
        ingredientsData = response.data.ingredients;
      }
      
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setIngredients([]);
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await API.get('/vendor/inventory/low-stock');
      
      // Fix: Ensure lowStockItems is an array
      let lowStockData = [];
      if (response.data && Array.isArray(response.data)) {
        lowStockData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        lowStockData = response.data.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        lowStockData = response.data.items;
      }
      
      setLowStockItems(lowStockData);
    } catch (error) {
      console.error('Error fetching low stock:', error);
      setLowStockItems([]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await API.delete(`/vendor/inventory/${id}`);
      toast.success('Ingredient deleted successfully');
      fetchInventory();
      fetchLowStock();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  const handleRestock = async (id, quantity) => {
    try {
      await API.patch(`/vendor/inventory/${id}/restock`, { quantity });
      toast.success(`Added ${quantity} units successfully`);
      fetchInventory();
      fetchLowStock();
    } catch (error) {
      console.error('Error restocking:', error);
      toast.error('Failed to restock ingredient');
    }
  };

  // Fix: Ensure ingredients is an array before filtering
  const ingredientsList = Array.isArray(ingredients) ? ingredients : [];
  const lowStockList = Array.isArray(lowStockItems) ? lowStockItems : [];

  const filteredIngredients = ingredientsList.filter(ing =>
    ing.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track and manage your ingredients stock</p>
        </div>
        <button
          onClick={() => {
            setEditingIngredient(null);
            setShowAddModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockList.length > 0 && (
        <LowStockAlert items={lowStockList} onRestock={handleRestock} />
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Ingredient List */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'No matching ingredients found' : 'No ingredients added yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingIngredient(null);
                setShowAddModal(true);
              }}
              className="mt-3 text-orange-500 text-sm hover:text-orange-600"
            >
              + Add your first ingredient
            </button>
          )}
        </div>
      ) : (
        <IngredientList
          ingredients={filteredIngredients}
          onEdit={(ing) => {
            setEditingIngredient(ing);
            setShowAddModal(true);
          }}
          onDelete={handleDelete}
          onRestock={handleRestock}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddIngredient
          ingredient={editingIngredient}
          onClose={() => {
            setShowAddModal(false);
            setEditingIngredient(null);
          }}
          onSave={() => {
            fetchInventory();
            fetchLowStock();
            setShowAddModal(false);
            setEditingIngredient(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryPage;