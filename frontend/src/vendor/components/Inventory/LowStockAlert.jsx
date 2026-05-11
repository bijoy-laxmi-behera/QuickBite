// vendor/components/Inventory/LowStockAlert.jsx
import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

const LowStockAlert = ({ items, onRestock }) => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-yellow-800">Low Stock Alert</h3>
          <p className="text-sm text-yellow-700 mt-1">
            The following ingredients are running low:
          </p>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between bg-white rounded-lg p-2">
                <div className="flex items-center space-x-3">
                  <Package size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Current: {item.currentStock} {item.unit} | 
                      Threshold: {item.threshold} {item.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRestock(item._id, item.threshold * 2)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;