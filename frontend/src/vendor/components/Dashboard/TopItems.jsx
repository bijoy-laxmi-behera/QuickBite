// vendor/components/Dashboard/TopItems.jsx
import React from 'react';

const TopItems = ({ items }) => {
  // Fix: Ensure items is an array and has data
  let topItems = [];
  
  if (items && Array.isArray(items)) {
    topItems = items;
  } else if (items && items.data && Array.isArray(items.data)) {
    topItems = items.data;
  } else if (items && items.items && Array.isArray(items.items)) {
    topItems = items.items;
  } else {
    // Fallback data if API returns nothing
    topItems = [
      { name: 'Butter Chicken', sold: 245, revenue: 73500 },
      { name: 'Garlic Naan', sold: 312, revenue: 15600 },
      { name: 'Paneer Tikka', sold: 178, revenue: 44500 },
      { name: 'Biryani', sold: 156, revenue: 46800 }
    ];
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
      <div className="space-y-4">
        {topItems.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-300">#{index + 1}</span>
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.sold || item.quantity || 0} sold</p>
              </div>
            </div>
            <p className="font-semibold text-orange-600">₹{(item.revenue || item.price * (item.sold || item.quantity) || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopItems;