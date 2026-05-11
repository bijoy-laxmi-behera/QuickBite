// vendor/components/Inventory/IngredientList.jsx
import React from 'react';
import { Edit2, Trash2, Package, AlertCircle } from 'lucide-react';

const IngredientList = ({ ingredients, onEdit, onDelete, onRestock }) => {
  if (ingredients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <Package className="mx-auto h-12 w-12 text-gray-300" />
        <p className="text-gray-500 mt-2">No ingredients found</p>
      </div>
    );
  }

  const getStockStatus = (current, threshold) => {
    if (current <= threshold) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
    if (current <= threshold * 2) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Low' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Ingredient</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Unit</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Current Stock</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Threshold</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ingredients.map((ing) => {
              const status = getStockStatus(ing.currentStock, ing.threshold);
              return (
                <tr key={ing._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{ing.name}</p>
                      {ing.category && (
                        <p className="text-xs text-gray-500">{ing.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ing.unit}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{ing.currentStock}</span>
                    <span className="text-gray-500 ml-1">{ing.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ing.threshold} {ing.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                      <AlertCircle size={12} className="mr-1" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onRestock(ing._id, 10)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => onEdit(ing)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(ing._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngredientList;