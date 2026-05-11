// vendor/components/Menu/MenuList.jsx
import React from 'react';
import { Edit2, Trash2, Eye, EyeOff, Clock } from 'lucide-react';

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f3f4f6"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

const API_BASE_URL = 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  
  // Already has full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Data URL (base64)
  if (imagePath.startsWith('data:image')) return imagePath;
  
  // Path starts with /uploads
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Path starts with uploads (no leading slash)
  if (imagePath.startsWith('uploads')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  // Just filename
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

const MenuList = ({ items, onEdit, onDelete, onToggleAvailability }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-500">No menu items found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const imageUrl = getImageUrl(item.image);
        console.log(`Image for ${item.name}:`, { original: item.image, converted: imageUrl });
        
        return (
          <div
            key={item._id}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            {/* Image Section */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load image for ${item.name}:`, imageUrl);
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              {!item.isAvailable && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                  Unavailable
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {typeof item.category === 'object' ? item.category?.name : item.category || 'Uncategorized'}
                  </p>
                </div>
                <p className="font-bold text-orange-600">₹{item.price}</p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                {item.preparationTime && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>{item.preparationTime} mins</span>
                  </div>
                )}
                
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.isveg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.isveg ? 'Pure Veg' : 'Non-Veg'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => onToggleAvailability(item._id, item.isAvailable)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm flex items-center justify-center space-x-1 transition ${
                    item.isAvailable
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <EyeOff size={14} />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Enable</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="flex-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm hover:bg-orange-100 transition flex items-center justify-center space-x-1"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="flex-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition flex items-center justify-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;