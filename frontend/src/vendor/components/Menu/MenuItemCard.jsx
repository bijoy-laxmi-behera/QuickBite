// vendor/components/Menu/MenuItemCategory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GripVertical, Edit2, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const MenuItemCategory = ({ category, onUpdate, onDelete, onToggleVisibility, index, totalCategories, onMoveUp, onMoveDown }) => {
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoryItems();
  }, [category._id]);

  const fetchCategoryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vendor/menu?category=${category.name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching category items:', error);
    }
  };

  const handleToggleItemAvailability = async (itemId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/vendor/menu/${itemId}/availability`, {
        isAvailable: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategoryItems();
    } catch (error) {
      console.error('Error toggling item availability:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vendor/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategoryItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Category Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            >
              ↑
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalCategories - 1}
              className={`p-1 rounded ${index === totalCategories - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            >
              ↓
            </button>
            <GripVertical size={16} className="text-gray-400 cursor-move" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{category.name}</h3>
            {category.description && (
              <p className="text-xs text-gray-500">{category.description}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
            {items.length} items
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(category._id, category.isVisible); }}
            className={`p-1.5 rounded transition ${
              category.isVisible 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-200'
            }`}
            title={category.isVisible ? 'Visible to customers' : 'Hidden'}
          >
            {category.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(category._id); }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
          >
            <Trash2 size={16} />
          </button>
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {/* Category Items */}
      {expanded && (
        <div className="divide-y">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No items in this category</p>
              <button className="mt-2 text-orange-500 text-sm hover:text-orange-600">
                + Add Item
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {/* Item Image */}
                  {item.image ? (
                    // vendor/components/Menu/MenuList.jsx
// Fix image URL construction

<img 
  src={item.image?.startsWith('http') ? item.image : `http://localhost:4000${item.image}`} 
  alt={item.name} 
  className="w-full h-48 object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
  }}
/>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No img</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.isveg !== undefined && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${item.isveg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.isveg ? 'Veg' : 'Non-Veg'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-orange-600 font-semibold">₹{item.price}</p>
                    {item.preparationTime && (
                      <p className="text-xs text-gray-400">{item.preparationTime} mins</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleItemAvailability(item._id, item.isAvailable)}
                    className={`px-2 py-1 rounded text-xs ${
                      item.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-gray-400 hover:text-orange-600"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MenuItemCategory;