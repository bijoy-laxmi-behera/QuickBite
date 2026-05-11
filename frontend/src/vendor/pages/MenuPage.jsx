// vendor/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/axios';
import { Plus, Search, Filter } from 'lucide-react';
import MenuList from '../components/Menu/MenuList';
import AddEditMenuItem from '../components/Menu/AddEditMenuItem';
import CategoryManager from '../components/Menu/CategoryManager';
import Loader from '../components/common/Loader';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await API.get('/vendor/menu');
      
      let menuData = [];
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        menuData = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        menuData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        menuData = response.data.data;
      }
      
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/vendor/categories');
      
      let categoriesData = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/vendor/menu/${id}`);
      fetchMenu();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await API.patch(`/vendor/menu/${id}/availability`, {
        isAvailable: !currentStatus
      });
      fetchMenu();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability');
    }
  };

  const menuItemsList = Array.isArray(menuItems) ? menuItems : [];
  const categoriesList = Array.isArray(categories) ? categories : [];

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    // If it's already a string name, return it
    if (typeof categoryId === 'string' && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return categoryId;
    }
    // Find category by ID
    const category = categoriesList.find(cat => cat._id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Filter items based on selected category and search term
  const filteredItems = menuItemsList.filter(item => {
    const itemCategoryName = getCategoryName(item.category);
    
    if (selectedCategory !== 'all' && itemCategoryName !== selectedCategory) return false;
    if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Debug logging
  console.log('Categories:', categoriesList.map(c => ({ id: c._id, name: c.name })));
  console.log('Menu items:', menuItemsList.map(item => ({ 
    name: item.name, 
    categoryId: item.category, 
    categoryName: getCategoryName(item.category) 
  })));
  console.log('Selected category:', selectedCategory);
  console.log('Filtered items count:', filteredItems.length);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant menu items</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
          >
            <Filter size={18} />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({menuItemsList.length})
            </button>
            
            {categoriesList.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({menuItemsList.filter(item => getCategoryName(item.category) === cat.name).length})
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500">No menu items found in this category</p>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')}
              className="mt-2 text-orange-500 text-sm"
            >
              View all items
            </button>
          )}
        </div>
      ) : (
        <MenuList
          items={filteredItems}
          onEdit={(item) => {
            setEditingItem(item);
            setShowAddModal(true);
          }}
          onDelete={handleDelete}
          onToggleAvailability={handleToggleAvailability}
        />
      )}

      {showAddModal && (
        <AddEditMenuItem
          item={editingItem}
          categories={categoriesList}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            fetchMenu();
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryManager
          categories={categoriesList}
          onClose={() => setShowCategoryModal(false)}
          onUpdate={() => {
            fetchCategories();
            fetchMenu();
          }}
        />
      )}
    </div>
  );
};

export default MenuPage;